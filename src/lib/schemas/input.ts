import { z } from "zod";

export const RELATIONSHIPS = [
  "Partner",
  "Spouse",
  "Dating",
  "Friend",
  "Family",
  "Work",
  "Other",
] as const;

export const OUTCOMES = [
  "Be understood",
  "Set a boundary",
  "Repair things",
  "Ask for something",
  "De-escalate",
  "Be more direct",
  "Say no",
  "Express affection",
  "Other",
] as const;

export const DIFFICULTIES = [
  "Calm",
  "Awkward",
  "Defensive",
  "High tension",
] as const;

export const LIMITS = {
  context: 700,
  message: 2000,
  short: 400,
  long: 1200,
  turn: 1200,
  transcript: 40,
} as const;

const relationship = z.enum(RELATIONSHIPS);
const outcome = z.enum(OUTCOMES);

const trimmed = (max: number) => z.string().trim().max(max);
const required = (max: number, label: string) =>
  z.string().trim().min(1, `${label} is required`).max(max);

export const checkInputSchema = z.object({
  mode: z.literal("check"),
  relationship,
  context: trimmed(LIMITS.context).default(""),
  message: required(LIMITS.message, "Your message"),
  outcome: outcome.optional(),
});

export const mapInputSchema = z.object({
  mode: z.literal("map"),
  relationship,
  whatHappened: required(LIMITS.long, "What happened"),
  wantUnderstood: trimmed(LIMITS.short).default(""),
  theirWant: trimmed(LIMITS.short).default(""),
  extra: trimmed(LIMITS.short).default(""),
});

export const repairInputSchema = z.object({
  mode: z.literal("repair"),
  relationship,
  whatHappened: required(LIMITS.long, "What happened"),
  youSaid: trimmed(LIMITS.short).default(""),
  theySaid: trimmed(LIMITS.short).default(""),
  regret: trimmed(LIMITS.short).default(""),
  wantNow: trimmed(LIMITS.short).default(""),
});

export const analyzeInputSchema = z.discriminatedUnion("mode", [
  checkInputSchema,
  mapInputSchema,
  repairInputSchema,
]);

export const rehearsalSetupSchema = z.object({
  relationship,
  situation: required(LIMITS.long, "The situation"),
  person: trimmed(LIMITS.short).default(""),
  goal: required(LIMITS.short, "Your goal"),
  difficulty: z.enum(DIFFICULTIES),
});

export const rehearsalTurnSchema = z.object({
  role: z.enum(["user", "other"]),
  content: z.string().trim().max(LIMITS.turn),
});

export const rehearseInputSchema = z.object({
  action: z.enum(["start", "reply", "coach", "debrief"]),
  setup: rehearsalSetupSchema,
  transcript: z.array(rehearsalTurnSchema).max(LIMITS.transcript).default([]),
});

export type Relationship = (typeof RELATIONSHIPS)[number];
export type Outcome = (typeof OUTCOMES)[number];
export type Difficulty = (typeof DIFFICULTIES)[number];

export type CheckInput = z.infer<typeof checkInputSchema>;
export type MapInput = z.infer<typeof mapInputSchema>;
export type RepairInput = z.infer<typeof repairInputSchema>;
export type AnalyzeInput = z.infer<typeof analyzeInputSchema>;
export type RehearsalSetup = z.infer<typeof rehearsalSetupSchema>;
export type RehearsalTurn = z.infer<typeof rehearsalTurnSchema>;
export type RehearseInput = z.infer<typeof rehearseInputSchema>;

/** Loose client-side drafts: every field optional while the user is typing. */
export type CheckDraft = {
  relationship: Relationship;
  context: string;
  message: string;
  outcome: Outcome | "";
};

export type MapDraft = {
  relationship: Relationship;
  whatHappened: string;
  wantUnderstood: string;
  theirWant: string;
  extra: string;
};

export type RepairDraft = {
  relationship: Relationship;
  whatHappened: string;
  youSaid: string;
  theySaid: string;
  regret: string;
  wantNow: string;
};

export type RehearseDraft = {
  relationship: Relationship;
  situation: string;
  person: string;
  goal: string;
  difficulty: Difficulty;
};
