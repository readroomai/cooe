import { z } from "zod";

/**
 * Result schemas are deliberately lenient on length. The prompts control
 * brevity; validation exists to guarantee shape so the UI can never render a
 * hole. Arrays are sliced rather than rejected.
 */

const sentence = z.string().trim().min(1).max(1200);
const paragraph = z.string().trim().min(1).max(3000);
const score = z.coerce.number().min(0).max(100).catch(50);
const nullableNote = sentence
  .nullable()
  .catch(null)
  .transform((v) => (v && v.trim().length > 2 ? v : null));

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
    .default([])
    .transform((a) => a.slice(0, 3)),
  alternatives: z
    .array(
      z.object({
        tone: z.enum(["clear", "warm", "firm"]),
        message: paragraph,
        explanation: sentence,
      }),
    )
    .min(1)
    .transform((a) => a.slice(0, 3)),
  oneChange: sentence,
  safetyNote: nullableNote,
});

export const mapResultSchema = z.object({
  situation: paragraph,
  yourSide: paragraph,
  theirPossibleSide: paragraph,
  missingEachOther: paragraph,
  negotiating: z
    .array(z.string().trim().min(1).max(160))
    .min(1)
    .transform((a) => a.slice(0, 5)),
  helping: z
    .array(sentence)
    .default([])
    .transform((a) => a.slice(0, 4)),
  harder: z
    .array(sentence)
    .default([])
    .transform((a) => a.slice(0, 4)),
  nextConversation: paragraph,
  openingLine: sentence,
  safetyNote: nullableNote,
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
  safetyNote: nullableNote,
});

export const rehearsalReplySchema = z.object({
  reply: paragraph,
  temperature: z
    .enum(["calm", "guarded", "tense", "warming"])
    .catch("calm"),
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

export const SIGNAL_ORDER: SignalKey[] = [
  "clarity",
  "warmth",
  "pressure",
  "escalationRisk",
];

export const SIGNAL_LABELS: Record<SignalKey, string> = {
  clarity: "Clarity",
  warmth: "Warmth",
  pressure: "Pressure",
  escalationRisk: "Escalation risk",
};

export const TONE_LABELS: Record<"clear" | "warm" | "firm", string> = {
  clear: "Clear",
  warm: "Warm",
  firm: "Firm",
};
