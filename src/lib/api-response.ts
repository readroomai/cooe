import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { CooeAIError } from "@/lib/ai/client";

export type ApiError = {
  error: {
    message: string;
    code: string;
    fields?: Record<string, string>;
  };
};

/** Messages here are user-facing. Technical detail stays in the server log. */
const FRIENDLY: Record<string, string> = {
  unconfigured:
    "Cooe isn't connected to an AI provider right now. Nothing you wrote was lost.",
  upstream: "Cooe couldn't finish that analysis. Try again in a moment.",
  invalid_output:
    "Cooe got a response it couldn't read. Try again — it usually works on the second pass.",
  refused:
    "Cooe couldn't work with that input. Try describing the situation in your own words instead.",
  rate_limited: "Cooe is busy right now. Give it a few seconds and try again.",
  invalid_request: "Some of those fields need another look.",
  bad_json: "That request didn't come through properly. Try again.",
  unknown: "Cooe couldn't finish that analysis. Try again in a moment.",
};

export function apiError(
  code: keyof typeof FRIENDLY | string,
  status: number,
  fields?: Record<string, string>,
): NextResponse<ApiError> {
  return NextResponse.json<ApiError>(
    {
      error: {
        message: FRIENDLY[code] ?? FRIENDLY.unknown,
        code,
        ...(fields ? { fields } : {}),
      },
    },
    { status },
  );
}

export function zodFields(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}

/** Single funnel for every route handler failure. */
export function handleRouteError(
  error: unknown,
  scope: string,
): NextResponse<ApiError> {
  if (error instanceof ZodError) {
    return apiError("invalid_request", 400, zodFields(error));
  }

  if (error instanceof CooeAIError) {
    console.error(`[cooe:${scope}] ${error.code}: ${error.message}`);
    if (error.status === 429) return apiError("rate_limited", 429);
    if (error.code === "unconfigured") return apiError("unconfigured", 503);
    if (error.code === "refused") return apiError("refused", 422);
    return apiError(error.code, error.status >= 500 ? 502 : error.status);
  }

  console.error(`[cooe:${scope}] unexpected`, error);
  return apiError("unknown", 500);
}
