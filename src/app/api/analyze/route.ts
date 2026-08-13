import { NextResponse } from "next/server";
import { analyzeInputSchema } from "@/lib/schemas/input";
import { runAnalyze } from "@/lib/ai/run";
import { apiError, handleRouteError } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BODY_BYTES = 24_000;

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return apiError("invalid_request", 413, {
        form: "That's longer than Cooe can take in one pass. Trim it down a little.",
      });
    }

    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      return apiError("bad_json", 400);
    }

    const input = analyzeInputSchema.parse(json);
    const payload = await runAnalyze(input);

    return NextResponse.json(payload, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return handleRouteError(error, "analyze");
  }
}
