import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const DEFAULT_MODEL = "claude-sonnet-5";

let client: Anthropic | null = null;

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

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new CooeAIError(
      "ANTHROPIC_API_KEY is not set.",
      503,
      "unconfigured",
    );
  }
  if (!client) client = new Anthropic({ apiKey, maxRetries: 2 });
  return client;
}

export function getModel(): string {
  return process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL;
}

type JSONSchemaObject = {
  type: "object";
  properties?: Record<string, unknown>;
  required?: string[];
  [key: string]: unknown;
};

function toInputSchema(schema: z.ZodType): JSONSchemaObject {
  const json = z.toJSONSchema(schema, {
    io: "input",
    target: "draft-7",
    unrepresentable: "any",
  }) as Record<string, unknown>;
  delete json.$schema;
  return { ...json, type: "object" } as JSONSchemaObject;
}

export type StructuredCallOptions<T extends z.ZodType> = {
  system: string;
  prompt: string;
  schema: T;
  toolName: string;
  toolDescription: string;
  maxTokens?: number;
  temperature?: number;
};

/**
 * Runs one Anthropic call constrained to a tool, so the model must return an
 * object matching `schema`. Validated with Zod before it ever reaches the UI.
 */
export async function callStructured<T extends z.ZodType>({
  system,
  prompt,
  schema,
  toolName,
  toolDescription,
  maxTokens = 2600,
  temperature = 0.6,
}: StructuredCallOptions<T>): Promise<z.infer<T>> {
  const anthropic = getClient();

  let response: Anthropic.Message;
  try {
    response = await anthropic.messages.create({
      model: getModel(),
      max_tokens: maxTokens,
      temperature,
      system,
      tools: [
        {
          name: toolName,
          description: toolDescription,
          input_schema: toInputSchema(schema) as Anthropic.Tool.InputSchema,
        },
      ],
      tool_choice: { type: "tool", name: toolName },
      messages: [{ role: "user", content: prompt }],
    });
  } catch (error) {
    const status =
      error instanceof Anthropic.APIError && typeof error.status === "number"
        ? error.status
        : 502;
    throw new CooeAIError(
      error instanceof Error ? error.message : "Upstream request failed.",
      status === 429 ? 429 : 502,
      "upstream",
    );
  }

  if (response.stop_reason === "refusal") {
    throw new CooeAIError(
      "The model declined to analyse this input.",
      422,
      "refused",
    );
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

  const parsed = schema.safeParse(toolUse.input);
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

/** True when the server can actually talk to the AI provider. */
export function isAIConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
