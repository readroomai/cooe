import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { z } from "zod";
import { toStrictJsonSchema } from "./json-schema";

export const DEFAULT_OPENAI_MODEL = "gpt-5.5";
export const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-5";

export type Provider = "openai" | "anthropic";

export class CooeAIError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: "unconfigured" | "upstream" | "invalid_output" | "refused",
  ) {
    super(message);
    this.name = "CooeAIError";
  }
}

/** Provider is explicit if configured, otherwise inferred from available keys. */
export function getProvider(): Provider | null {
  const explicit = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (explicit === "openai") return process.env.OPENAI_API_KEY ? "openai" : null;
  if (explicit === "anthropic")
    return process.env.ANTHROPIC_API_KEY ? "anthropic" : null;
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return null;
}

export function isAIConfigured(): boolean {
  return getProvider() !== null;
}

export function getModel(provider: Provider): string {
  if (provider === "openai") {
    return process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;
  }
  return process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_ANTHROPIC_MODEL;
}

let openaiClient: OpenAI | null = null;
let anthropicClient: Anthropic | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      maxRetries: 2,
      timeout: 90_000,
    });
  }
  return openaiClient;
}

function getAnthropic(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      maxRetries: 2,
      timeout: 90_000,
    });
  }
  return anthropicClient;
}

export type ReasoningEffort = "low" | "medium" | "high";

export type StructuredCallOptions<T extends z.ZodType> = {
  system: string;
  prompt: string;
  schema: T;
  toolName: string;
  toolDescription: string;
  maxTokens?: number;
  temperature?: number;
  effort?: ReasoningEffort;
};

function upstream(error: unknown): never {
  const status =
    (error instanceof OpenAI.APIError || error instanceof Anthropic.APIError) &&
    typeof error.status === "number"
      ? error.status
      : 502;

  throw new CooeAIError(
    error instanceof Error ? error.message : "Upstream request failed.",
    status === 429 ? 429 : 502,
    "upstream",
  );
}

function validate<T extends z.ZodType>(schema: T, raw: unknown): z.infer<T> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new CooeAIError(
      `Model output failed validation: ${parsed.error.issues
        .slice(0, 4)
        .map((i) => `${i.path.join(".") || "root"} ${i.message}`)
        .join("; ")}`,
      502,
      "invalid_output",
    );
  }
  return parsed.data;
}

/**
 * One structured call, constrained so the model must return an object matching
 * `schema`. Always validated with Zod before it can reach the UI.
 */
export async function callStructured<T extends z.ZodType>(
  options: StructuredCallOptions<T>,
): Promise<z.infer<T>> {
  const provider = getProvider();
  if (!provider) {
    throw new CooeAIError(
      "No AI provider key is configured.",
      503,
      "unconfigured",
    );
  }

  return provider === "openai"
    ? callOpenAI(options, getModel("openai"))
    : callAnthropic(options, getModel("anthropic"));
}

async function callOpenAI<T extends z.ZodType>(
  {
    system,
    prompt,
    schema,
    toolName,
    maxTokens = 2600,
    effort = "low",
  }: StructuredCallOptions<T>,
  model: string,
): Promise<z.infer<T>> {
  let completion: OpenAI.Chat.Completions.ChatCompletion;
  try {
    completion = await getOpenAI().chat.completions.create({
      model,
      reasoning_effort: effort,
      // Reasoning tokens share this budget, so leave generous headroom.
      max_completion_tokens: maxTokens + 1200,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: toolName,
          strict: true,
          schema: toStrictJsonSchema(schema),
        },
      },
    });
  } catch (error) {
    upstream(error);
  }

  const choice = completion.choices[0];

  if (choice?.message?.refusal) {
    throw new CooeAIError(choice.message.refusal, 422, "refused");
  }

  if (choice?.finish_reason === "length") {
    throw new CooeAIError(
      "Model response was cut off before it completed.",
      502,
      "invalid_output",
    );
  }

  const content = choice?.message?.content;
  if (!content) {
    throw new CooeAIError("Model returned no content.", 502, "invalid_output");
  }

  let raw: unknown;
  try {
    raw = JSON.parse(content);
  } catch {
    throw new CooeAIError(
      "Model returned unparseable JSON.",
      502,
      "invalid_output",
    );
  }

  return validate(schema, raw);
}

async function callAnthropic<T extends z.ZodType>(
  {
    system,
    prompt,
    schema,
    toolName,
    toolDescription,
    maxTokens = 2600,
    temperature = 0.6,
  }: StructuredCallOptions<T>,
  model: string,
): Promise<z.infer<T>> {
  let response: Anthropic.Message;
  try {
    response = await getAnthropic().messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system,
      tools: [
        {
          name: toolName,
          description: toolDescription,
          input_schema: toStrictJsonSchema(
            schema,
          ) as unknown as Anthropic.Tool.InputSchema,
        },
      ],
      tool_choice: { type: "tool", name: toolName },
      messages: [{ role: "user", content: prompt }],
    });
  } catch (error) {
    upstream(error);
  }

  const toolUse = response.content.find(
    (part): part is Anthropic.ToolUseBlock =>
      part.type === "tool_use" && part.name === toolName,
  );

  if (!toolUse) {
    throw new CooeAIError(
      `Model returned no ${toolName} tool call.`,
      502,
      "invalid_output",
    );
  }

  return validate(schema, toolUse.input);
}
