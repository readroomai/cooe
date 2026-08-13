"use client";

import type {
  CheckDraft,
  MapDraft,
  RehearseDraft,
  RepairDraft,
} from "@/lib/schemas/input";
import type {
  CheckResult,
  MapResult,
  RehearsalDebrief,
  RepairResult,
} from "@/lib/schemas/result";
import type { RehearsalTurn } from "@/lib/schemas/input";

/**
 * Local-only history. This is browser storage on one device — it is never an
 * account, never synced, and never leaves the browser.
 */

export const HISTORY_KEY = "cooe.history.v1";
export const HISTORY_LIMIT = 5;
export const HISTORY_EVENT = "cooe:history";

export type HistoryEntry =
  | { id: string; mode: "check"; title: string; at: number; draft: CheckDraft; result: CheckResult }
  | { id: string; mode: "map"; title: string; at: number; draft: MapDraft; result: MapResult }
  | { id: string; mode: "repair"; title: string; at: number; draft: RepairDraft; result: RepairResult }
  | {
      id: string;
      mode: "rehearse";
      title: string;
      at: number;
      draft: RehearseDraft;
      transcript: RehearsalTurn[];
      result: RehearsalDebrief;
    };

export type HistoryMode = HistoryEntry["mode"];

function isBrowser() {
  return typeof window !== "undefined";
}

function announce() {
  if (isBrowser()) window.dispatchEvent(new Event(HISTORY_EVENT));
}

export function readHistory(): HistoryEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e): e is HistoryEntry =>
          !!e &&
          typeof e === "object" &&
          typeof (e as HistoryEntry).id === "string" &&
          typeof (e as HistoryEntry).at === "number" &&
          typeof (e as HistoryEntry).mode === "string",
      )
      .slice(0, HISTORY_LIMIT);
  } catch {
    return [];
  }
}

function write(entries: HistoryEntry[]) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(entries.slice(0, HISTORY_LIMIT)),
    );
  } catch {
    // Storage can be full or blocked (private mode). History is a convenience,
    // never a requirement — failing silently is correct here.
  }
  announce();
}

export function saveHistory(entry: Omit<HistoryEntry, "id" | "at"> & { id?: string }) {
  const id =
    entry.id ??
    (isBrowser() && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.floor(Math.random() * 1e6)}`);

  const next = [
    { ...entry, id, at: Date.now() } as HistoryEntry,
    ...readHistory().filter((e) => e.id !== id),
  ];
  write(next);
  return id;
}

export function removeHistory(id: string) {
  write(readHistory().filter((e) => e.id !== id));
}

export function clearHistory() {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* ignore */
  }
  announce();
}

export function getHistoryEntry(id: string): HistoryEntry | undefined {
  return readHistory().find((e) => e.id === id);
}
