import { z } from "zod";

const sentence = z.string().trim().min(1).max(600);
const paragraph = z.string().trim().min(1).max(1400);
const score = z.number().min(0).max(100);

const signal = z.object({
  score,
  explanation: sentence,
});

export const signalsSchema = z.object({
  clarity: signal,
  warmth: signal,
  pressure: signal,
  escalationRisk: signal,
});

export const checkResultSchema = z.object({
  intention: z.object({ summary: paragraph }),
  interpretation: z.object({ summary: paragraph }),
  gap: z.object({ title: sentence, explanation: paragraph }),
  signals: signalsSchema,
  frictionPoints: z
    .array(
      z.object({
        original: sentence,
        issue: paragraph,
        alternative: paragraph,
      }),
    )
    .max(3)
    .default([]),
  alternatives: z
    .array(
      z.object({
        tone: z.enum(["clear", "warm", "firm"]),
        message: paragraph,
        explanation: sentence,
      }),
    )
    .min(1)
    .max(3),
  oneChange: sentence,
  safetyNote: sentence.nullable().default(null),
});

export const mapResultSchema = z.object({
  situation: paragraph,
  yourSide: paragraph,
  theirPossibleSide: paragraph,
  missingEachOther: paragraph,
  negotiating: z.array(z.string().trim().min(1).max(120)).min(1).max(5),
  helping: z.array(sentence).max(4).default([]),
  harder: z.array(sentence).max(4).default([]),
  nextConversation: paragraph,
  openingLine: sentence,
  safetyNote: sentence.nullable().default(null),
});

export const repairResultSchema = z.object({
  needsRepairing: paragraph,
  dontArgueFirst: paragraph,
  acknowledge: paragraph,
  own: paragraph,
  dontOverApologize: paragraph,
  repairMessage: paragraph,
  shortVersion: paragraph,
  ifNotReady: paragraph,
  safetyNote: sentence.nullable().default(null),
});

export const rehearsalReplySchema = z.object({
  reply: paragraph,
  temperature: z.enum(["calm", "guarded", "tense", "warming"]),
});

export const rehearsalCoachSchema = z.object({
  worked: sentence,
  friction: sentence,
  stronger: paragraph,
});

export const rehearsalDebriefSchema = z.object({
  didWell: paragraph,
  pressureIncreased: paragraph,
  avoidedSaying: paragraph,
  strongestMoment: paragraph,
  tryDifferently: paragraph,
  realWorldOpening: sentence,
});

export type CheckResult = z.infer<typeof checkResultSchema>;
export type MapResult = z.infer<typeof mapResultSchema>;
export type RepairResult = z.infer<typeof repairResultSchema>;
export type RehearsalReply = z.infer<typeof rehearsalReplySchema>;
export type RehearsalCoach = z.infer<typeof rehearsalCoachSchema>;
export type RehearsalDebrief = z.infer<typeof rehearsalDebriefSchema>;

export type SignalKey = keyof z.infer<typeof signalsSchema>;

export const SIGNAL_LABELS: Record<SignalKey, string> = {
  clarity: "Clarity",
  warmth: "Warmth",
  pressure: "Pressure",
  escalationRisk: "Escalation risk",
};

/** Result payloads keyed by studio mode. */
export type ResultByMode = {
  check: CheckResult;
  map: MapResult;
  repair: RepairResult;
};
