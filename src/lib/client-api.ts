import type { AnalyzeInput, RehearseInput } from "@/lib/schemas/input";
import type {
  CheckResult,
  MapResult,
  RepairResult,
  RehearsalCoach,
  RehearsalDebrief,
  RehearsalReply,
} from "@/lib/schemas/result";

export class CooeRequestError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "CooeRequestError";
  }
}

const NETWORK_MESSAGE =
  "Cooe couldn't reach the server. Your text is still here — try again.";

async function post<T>(url: string, body: unknown, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new CooeRequestError(NETWORK_MESSAGE, "network");
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const err = (payload as { error?: { message?: string; code?: string; fields?: Record<string, string> } } | null)?.error;
    throw new CooeRequestError(
      err?.message ?? "Cooe couldn't finish that analysis. Try again in a moment.",
      err?.code ?? "unknown",
      err?.fields,
    );
  }

  return payload as T;
}

export type AnalyzeResponse =
  | { mode: "check"; result: CheckResult }
  | { mode: "map"; result: MapResult }
  | { mode: "repair"; result: RepairResult };

export function analyze(input: AnalyzeInput, signal?: AbortSignal) {
  return post<AnalyzeResponse>("/api/analyze", input, signal);
}

export function rehearse(
  input: RehearseInput & { action: "start" | "reply" },
  signal?: AbortSignal,
) {
  return post<{ action: string; reply: RehearsalReply }>(
    "/api/rehearse",
    input,
    signal,
  );
}

export function coach(input: RehearseInput & { action: "coach" }, signal?: AbortSignal) {
  return post<{ action: string; coach: RehearsalCoach }>(
    "/api/rehearse",
    input,
    signal,
  );
}

export function debrief(
  input: RehearseInput & { action: "debrief" },
  signal?: AbortSignal,
) {
  return post<{ action: string; debrief: RehearsalDebrief }>(
    "/api/rehearse",
    input,
    signal,
  );
}
