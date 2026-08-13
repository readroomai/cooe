import "server-only";

import { z } from "zod";

type JsonSchema = Record<string, unknown>;

/** Keywords providers reject (or ignore) in strict structured-output mode. */
const STRIP = new Set([
  "minLength",
  "maxLength",
  "minimum",
  "maximum",
  "exclusiveMinimum",
  "exclusiveMaximum",
  "minItems",
  "maxItems",
  "pattern",
  "format",
  "default",
  "$schema",
  "examples",
  "const",
]);

/**
 * Normalises a Zod-generated JSON Schema into the subset accepted by OpenAI
 * strict structured outputs: every property required, no extra properties, no
 * validation keywords. Shape is enforced by the provider; content rules are
 * enforced afterwards by Zod.
 */
function normalise(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(normalise);
  if (!node || typeof node !== "object") return node;

  const input = node as JsonSchema;
  const out: JsonSchema = {};

  for (const [key, value] of Object.entries(input)) {
    if (STRIP.has(key)) continue;
    if (key === "properties" && value && typeof value === "object") {
      const props: JsonSchema = {};
      for (const [name, schema] of Object.entries(value as JsonSchema)) {
        props[name] = normalise(schema);
      }
      out.properties = props;
      continue;
    }
    out[key] = normalise(value);
  }

  if (out.type === "object") {
    out.additionalProperties = false;
    out.required = Object.keys((out.properties as JsonSchema) ?? {});
  }

  return out;
}

export function toStrictJsonSchema(schema: z.ZodType): JsonSchema {
  const raw = z.toJSONSchema(schema, {
    io: "input",
    target: "draft-7",
    unrepresentable: "any",
    override: (ctx) => {
      // `.catch()` and `.transform()` wrappers can surface as unconstrained
      // nodes; keep them representable rather than throwing.
      if (!ctx.jsonSchema.type && !ctx.jsonSchema.anyOf) return;
    },
  }) as JsonSchema;

  return normalise(raw) as JsonSchema;
}
