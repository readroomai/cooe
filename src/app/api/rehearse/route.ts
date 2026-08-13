import { NextResponse } from "next/server";
import { rehearseInputSchema } from "@/lib/schemas/input";
import {
  runRehearsalCoach,
  runRehearsalDebrief,
  runRehearsalReply,
} from "@/lib/ai/run";
import { apiError, handleRouteError } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BODY_BYTES = 60_000;

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return apiError("invalid_request", 413, {
        form: "This rehearsal has run long. End it to get your debrief.",
      });
    }

    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      return apiError("bad_json", 400);
    }

    const { action, setup, transcript } = rehearseInputSchema.parse(json);

    switch (action) {
      case "start":
      case "reply": {
        const reply = await runRehearsalReply(setup, transcript);
        return NextResponse.json(
          { action, reply },
          { headers: { "Cache-Control": "no-store" } },
        );
      }
      case "coach": {
        if (!transcript.some((t) => t.role === "user")) {
          return apiError("invalid_request", 400, {
            transcript: "Say something first — there's nothing to coach yet.",
          });
        }
        const coach = await runRehearsalCoach(setup, transcript);
        return NextResponse.json(
          { action, coach },
          { headers: { "Cache-Control": "no-store" } },
        );
      }
      case "debrief": {
        if (!transcript.some((t) => t.role === "user")) {
          return apiError("invalid_request", 400, {
            transcript: "There's no rehearsal to debrief yet.",
          });
        }
        const debrief = await runRehearsalDebrief(setup, transcript);
        return NextResponse.json(
          { action, debrief },
          { headers: { "Cache-Control": "no-store" } },
        );
      }
    }
  } catch (error) {
    return handleRouteError(error, "rehearse");
  }
}
