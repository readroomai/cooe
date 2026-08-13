import "server-only";

import { callStructured } from "./client";
import { COOE_SYSTEM } from "@/lib/prompts/system";
import {
  CHECK_INSTRUCTIONS,
  MAP_INSTRUCTIONS,
  REPAIR_INSTRUCTIONS,
  COACH_INSTRUCTIONS,
  DEBRIEF_INSTRUCTIONS,
  buildCheckPrompt,
  buildMapPrompt,
  buildRepairPrompt,
  buildRehearseSystem,
  buildRehearseContext,
} from "@/lib/prompts/modes";
import {
  checkResultSchema,
  mapResultSchema,
  repairResultSchema,
  rehearsalReplySchema,
  rehearsalCoachSchema,
  rehearsalDebriefSchema,
  type CheckResult,
  type MapResult,
  type RepairResult,
  type RehearsalReply,
  type RehearsalCoach,
  type RehearsalDebrief,
} from "@/lib/schemas/result";
import type {
  AnalyzeInput,
  CheckInput,
  MapInput,
  RepairInput,
  RehearsalSetup,
  RehearsalTurn,
} from "@/lib/schemas/input";

const withMode = (instructions: string) => `${COOE_SYSTEM}\n\n${instructions}`;

export function runCheck(input: CheckInput): Promise<CheckResult> {
  return callStructured({
    system: withMode(CHECK_INSTRUCTIONS),
    prompt: buildCheckPrompt(input),
    schema: checkResultSchema,
    toolName: "cooe_check_result",
    toolDescription:
      "Return the complete Cooe Check analysis for the user's message.",
    maxTokens: 3000,
  });
}

export function runMap(input: MapInput): Promise<MapResult> {
  return callStructured({
    system: withMode(MAP_INSTRUCTIONS),
    prompt: buildMapPrompt(input),
    schema: mapResultSchema,
    toolName: "cooe_map_result",
    toolDescription:
      "Return the complete Cooe Map analysis for the user's situation.",
    maxTokens: 2800,
  });
}

export function runRepair(input: RepairInput): Promise<RepairResult> {
  return callStructured({
    system: withMode(REPAIR_INSTRUCTIONS),
    prompt: buildRepairPrompt(input),
    schema: repairResultSchema,
    toolName: "cooe_repair_result",
    toolDescription:
      "Return the complete Cooe Repair plan for the user's situation.",
    maxTokens: 2800,
  });
}

export type AnalyzeResult =
  | { mode: "check"; result: CheckResult }
  | { mode: "map"; result: MapResult }
  | { mode: "repair"; result: RepairResult };

export async function runAnalyze(input: AnalyzeInput): Promise<AnalyzeResult> {
  switch (input.mode) {
    case "check":
      return { mode: "check", result: await runCheck(input) };
    case "map":
      return { mode: "map", result: await runMap(input) };
    case "repair":
      return { mode: "repair", result: await runRepair(input) };
  }
}

/* --------------------------------------------------------------- rehearse */

export function runRehearsalReply(
  setup: RehearsalSetup,
  transcript: RehearsalTurn[],
): Promise<RehearsalReply> {
  const opening =
    transcript.length === 0
      ? "The user has not spoken yet. Open the conversation the way this person plausibly would, in one or two sentences."
      : "Reply to the user's most recent turn, in character.";

  return callStructured({
    system: `${COOE_SYSTEM}\n\n${buildRehearseSystem(setup)}`,
    prompt: `${buildRehearseContext(setup, transcript)}\n\n${opening}`,
    schema: rehearsalReplySchema,
    toolName: "cooe_rehearsal_reply",
    toolDescription: "Return the other person's next line in the rehearsal.",
    maxTokens: 700,
    temperature: 0.85,
  });
}

export function runRehearsalCoach(
  setup: RehearsalSetup,
  transcript: RehearsalTurn[],
): Promise<RehearsalCoach> {
  return callStructured({
    system: withMode(COACH_INSTRUCTIONS),
    prompt: `${buildRehearseContext(setup, transcript)}\n\nCoach the user's most recent turn.`,
    schema: rehearsalCoachSchema,
    toolName: "cooe_rehearsal_coach",
    toolDescription: "Return brief coaching on the user's most recent turn.",
    maxTokens: 800,
    temperature: 0.5,
  });
}

export function runRehearsalDebrief(
  setup: RehearsalSetup,
  transcript: RehearsalTurn[],
): Promise<RehearsalDebrief> {
  return callStructured({
    system: withMode(DEBRIEF_INSTRUCTIONS),
    prompt: `${buildRehearseContext(setup, transcript)}\n\nThe rehearsal has ended. Write the debrief.`,
    schema: rehearsalDebriefSchema,
    toolName: "cooe_rehearsal_debrief",
    toolDescription: "Return the rehearsal debrief.",
    maxTokens: 1600,
    temperature: 0.5,
  });
}
