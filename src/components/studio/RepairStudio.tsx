"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { StudioFrame, PrivacyHint } from "./StudioFrame";
import { RecentList } from "./RecentList";
import { AnalyzingState, ErrorState } from "./States";
import { Button, ChoiceGroup, TextArea } from "@/components/shared/ui";
import { RepairResultView } from "@/components/result/RepairResultView";
import { analyze, CooeRequestError } from "@/lib/client-api";
import {
  LIMITS,
  RELATIONSHIPS,
  type RepairDraft,
  type Relationship,
} from "@/lib/schemas/input";
import type { RepairResult } from "@/lib/schemas/result";
import { EXAMPLE_REPAIR } from "@/lib/scenarios";
import { saveHistory, type HistoryEntry } from "@/lib/storage/history";
import { track } from "@/lib/analytics";
import { firstLine } from "@/lib/utils";

const EMPTY: RepairDraft = {
  relationship: "Partner",
  whatHappened: "",
  youSaid: "",
  theySaid: "",
  regret: "",
  wantNow: "",
};

type Phase = "input" | "loading" | "result" | "error";

export function RepairStudio() {
  const [draft, setDraft] = useState<RepairDraft>(EMPTY);
  const [phase, setPhase] = useState<Phase>("input");
  const [result, setResult] = useState<RepairResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const firstFieldRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const set = useCallback(
    <K extends keyof RepairDraft>(key: K, value: RepairDraft[K]) => {
      setDraft((d) => ({ ...d, [key]: value }));
      setFieldErrors((e) => (e[key] ? { ...e, [key]: "" } : e));
    },
    [],
  );

  useEffect(() => () => abortRef.current?.abort(), []);

  const run = useCallback(async (source: RepairDraft) => {
    if (!source.whatHappened.trim()) {
      setFieldErrors({ whatHappened: "Start with what happened." });
      firstFieldRef.current?.focus();
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setFieldErrors({});
    setError(null);
    setPhase("loading");
    track({ name: "analysis_started", mode: "repair" });

    try {
      const response = await analyze(
        { mode: "repair", ...source },
        controller.signal,
      );
      if (response.mode !== "repair") throw new Error("Unexpected response");

      setResult(response.result);
      setPhase("result");
      track({ name: "analysis_completed", mode: "repair" });
      saveHistory({
        mode: "repair",
        title: firstLine(source.whatHappened),
        draft: source,
        result: response.result,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(
        err instanceof CooeRequestError
          ? err.message
          : "Cooe couldn't finish that analysis. Your text is still here — try again in a moment.",
      );
      track({
        name: "analysis_failed",
        mode: "repair",
        code: err instanceof CooeRequestError ? err.code : "unknown",
      });
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    if (phase !== "input") return;
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        void run(draft);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, draft, run]);

  useEffect(() => {
    if (phase === "result") {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [phase]);

  const HEAD = {
    eyebrow: "Repair",
    headline: "The conversation went badly. Start from here.",
  };

  if (phase === "loading") {
    return (
      <StudioFrame {...HEAD}>
        <AnalyzingState />
      </StudioFrame>
    );
  }

  if (phase === "error") {
    return (
      <StudioFrame {...HEAD}>
        <ErrorState
          message={error ?? ""}
          onRetry={() => void run(draft)}
          onEdit={() => setPhase("input")}
          editLabel="Edit what you wrote"
        />
      </StudioFrame>
    );
  }

  if (phase === "result" && result) {
    return (
      <div
        ref={resultRef}
        className="mx-auto w-full max-w-[1180px] px-5 py-10 sm:px-10 sm:py-14"
      >
        <div className="mb-10 flex items-baseline justify-between gap-4 border-b border-line pb-5">
          <p className="eyebrow">A repair attempt</p>
          <button
            type="button"
            onClick={() => setPhase("input")}
            className="text-[12px] text-faint underline underline-offset-4 hover:text-ink"
          >
            Back to input
          </button>
        </div>
        <RepairResultView
          result={result}
          actions={
            <>
              <button
                type="button"
                onClick={() => setPhase("input")}
                className="text-[13px] text-muted underline decoration-line-strong underline-offset-[5px] hover:text-ink"
              >
                Edit and run again
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft(EMPTY);
                  setResult(null);
                  setPhase("input");
                }}
                className="text-[13px] text-muted underline decoration-line-strong underline-offset-[5px] hover:text-ink"
              >
                New conversation
              </button>
            </>
          }
        />
      </div>
    );
  }

  return (
    <StudioFrame
      {...HEAD}
      aside={
        <RecentList
          onOpen={(entry: HistoryEntry) => {
            if (entry.mode === "repair") {
              setDraft(entry.draft);
              setResult(entry.result);
              setPhase("result");
            }
          }}
        />
      }
    >
      <form
        className="space-y-12"
        onSubmit={(event) => {
          event.preventDefault();
          void run(draft);
        }}
      >
        <ChoiceGroup
          name="relationship"
          label="Relationship"
          options={RELATIONSHIPS}
          value={draft.relationship}
          onChange={(value: Relationship) => set("relationship", value)}
        />

        <TextArea
          ref={firstFieldRef}
          label="What happened?"
          rows={4}
          value={draft.whatHappened}
          limit={LIMITS.long}
          showCount
          maxLength={LIMITS.long}
          error={fieldErrors.whatHappened}
          onChange={(e) => set("whatHappened", e.target.value)}
          placeholder="The argument, and roughly how it ended."
        />

        <TextArea
          label="What did you say?"
          rows={2}
          value={draft.youSaid}
          limit={LIMITS.short}
          maxLength={LIMITS.short}
          onChange={(e) => set("youSaid", e.target.value)}
          placeholder="As close to your actual words as you can remember."
        />

        <TextArea
          label="What did they say?"
          rows={2}
          value={draft.theySaid}
          limit={LIMITS.short}
          maxLength={LIMITS.short}
          onChange={(e) => set("theySaid", e.target.value)}
          placeholder="Their side of it, as far as you heard it."
        />

        <TextArea
          label="What do you regret?"
          rows={2}
          value={draft.regret}
          limit={LIMITS.short}
          maxLength={LIMITS.short}
          onChange={(e) => set("regret", e.target.value)}
          placeholder="The part you'd take back."
        />

        <TextArea
          label="What do you actually want now?"
          rows={2}
          value={draft.wantNow}
          limit={LIMITS.short}
          maxLength={LIMITS.short}
          onChange={(e) => set("wantNow", e.target.value)}
          placeholder="Not what you want to prove — what you want to happen."
        />

        <div className="flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-line pt-8">
          <Button type="submit" className="group">
            Build a repair attempt
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Button>
          <button
            type="button"
            onClick={() => {
              setDraft(EXAMPLE_REPAIR);
              setFieldErrors({});
              track({ name: "example_loaded", mode: "repair" });
            }}
            className="text-[13px] text-ink underline decoration-line-strong underline-offset-[5px] hover:decoration-ink"
          >
            Try an example
          </button>
          {draft.whatHappened && (
            <button
              type="button"
              onClick={() => setDraft(EMPTY)}
              className="text-[12px] text-faint underline underline-offset-4 hover:text-ink"
            >
              Clear
            </button>
          )}
          <span className="hidden text-[11px] text-faint sm:inline">⌘ + Enter</span>
        </div>

        <PrivacyHint />
      </form>
    </StudioFrame>
  );
}
