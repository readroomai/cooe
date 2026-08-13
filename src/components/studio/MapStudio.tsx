"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { StudioFrame, PrivacyHint } from "./StudioFrame";
import { RecentList } from "./RecentList";
import { AnalyzingState, ErrorState } from "./States";
import { Button, ChoiceGroup, TextArea } from "@/components/shared/ui";
import { MapResultView } from "@/components/result/MapResultView";
import { analyze, CooeRequestError } from "@/lib/client-api";
import {
  LIMITS,
  RELATIONSHIPS,
  type MapDraft,
  type Relationship,
} from "@/lib/schemas/input";
import type { MapResult } from "@/lib/schemas/result";
import { EXAMPLE_MAP } from "@/lib/scenarios";
import { saveHistory, type HistoryEntry } from "@/lib/storage/history";
import { track } from "@/lib/analytics";
import { firstLine } from "@/lib/utils";

const EMPTY: MapDraft = {
  relationship: "Partner",
  whatHappened: "",
  wantUnderstood: "",
  theirWant: "",
  extra: "",
};

type Phase = "input" | "loading" | "result" | "error";

export function MapStudio() {
  const [draft, setDraft] = useState<MapDraft>(EMPTY);
  const [phase, setPhase] = useState<Phase>("input");
  const [result, setResult] = useState<MapResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const firstFieldRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const set = useCallback(
    <K extends keyof MapDraft>(key: K, value: MapDraft[K]) => {
      setDraft((d) => ({ ...d, [key]: value }));
      setFieldErrors((e) => (e[key] ? { ...e, [key]: "" } : e));
    },
    [],
  );

  useEffect(() => () => abortRef.current?.abort(), []);

  const run = useCallback(async (source: MapDraft) => {
    if (!source.whatHappened.trim()) {
      setFieldErrors({ whatHappened: "Describe what happened first." });
      firstFieldRef.current?.focus();
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setFieldErrors({});
    setError(null);
    setPhase("loading");
    track({ name: "analysis_started", mode: "map" });

    try {
      const response = await analyze({ mode: "map", ...source }, controller.signal);
      if (response.mode !== "map") throw new Error("Unexpected response");

      setResult(response.result);
      setPhase("result");
      track({ name: "analysis_completed", mode: "map" });
      saveHistory({
        mode: "map",
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
        mode: "map",
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

  const HEAD = { eyebrow: "Map", headline: "Untangle the conversation." };

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
          <p className="eyebrow">The conversation, mapped</p>
          <button
            type="button"
            onClick={() => setPhase("input")}
            className="text-[12px] text-faint underline underline-offset-4 hover:text-ink"
          >
            Back to input
          </button>
        </div>
        <MapResultView
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
            if (entry.mode === "map") {
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
          placeholder="The disagreement, or the pattern that keeps repeating."
        />

        <TextArea
          label="What do you want them to understand?"
          rows={2}
          value={draft.wantUnderstood}
          limit={LIMITS.short}
          maxLength={LIMITS.short}
          onChange={(e) => set("wantUnderstood", e.target.value)}
          placeholder="The thing that isn't landing."
        />

        <TextArea
          label="What do you think they want?"
          hint="optional"
          rows={2}
          value={draft.theirWant}
          limit={LIMITS.short}
          maxLength={LIMITS.short}
          onChange={(e) => set("theirWant", e.target.value)}
          placeholder="Your best guess. It's fine to be unsure."
        />

        <TextArea
          label="Anything else?"
          hint="optional"
          rows={2}
          value={draft.extra}
          limit={LIMITS.short}
          maxLength={LIMITS.short}
          onChange={(e) => set("extra", e.target.value)}
          placeholder="History, timing, anything that changes the picture."
        />

        <div className="flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-line pt-8">
          <Button type="submit" className="group">
            Map the conversation
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Button>
          <button
            type="button"
            onClick={() => {
              setDraft(EXAMPLE_MAP);
              setFieldErrors({});
              track({ name: "example_loaded", mode: "map" });
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
