"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StudioFrame, PrivacyHint } from "./StudioFrame";
import { RecentList } from "./RecentList";
import { AnalyzingState, ErrorState } from "./States";
import { Button, ChoiceGroup, TextArea } from "@/components/shared/ui";
import { CheckResultView } from "@/components/result/CheckResultView";
import { MapResultView } from "@/components/result/MapResultView";
import { RepairResultView } from "@/components/result/RepairResultView";
import { analyze, CooeRequestError } from "@/lib/client-api";
import {
  LIMITS,
  OUTCOMES,
  RELATIONSHIPS,
  type CheckDraft,
  type Outcome,
  type Relationship,
} from "@/lib/schemas/input";
import type { CheckResult } from "@/lib/schemas/result";
import { EXAMPLE_CHECK, SCENARIOS } from "@/lib/scenarios";
import { saveHistory, type HistoryEntry } from "@/lib/storage/history";
import { track } from "@/lib/analytics";
import { firstLine } from "@/lib/utils";

const EMPTY: CheckDraft = {
  relationship: "Partner",
  context: "",
  message: "",
  outcome: "",
};

type Phase = "input" | "loading" | "result" | "error";

export function CheckStudio() {
  const router = useRouter();
  const params = useSearchParams();

  // `?example=1` from the homepage lands straight in a filled-in form.
  const [draft, setDraft] = useState<CheckDraft>(() =>
    params.get("example") === "1" ? EXAMPLE_CHECK : EMPTY,
  );
  const [phase, setPhase] = useState<Phase>("input");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [analysedMessage, setAnalysedMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [regenerating, setRegenerating] = useState(false);
  const [replay, setReplay] = useState<HistoryEntry | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const set = useCallback(
    <K extends keyof CheckDraft>(key: K, value: CheckDraft[K]) => {
      setDraft((d) => ({ ...d, [key]: value }));
      setFieldErrors((e) => (e[key] ? { ...e, [key]: "" } : e));
    },
    [],
  );

  const loadExample = useCallback(() => {
    setDraft(EXAMPLE_CHECK);
    setFieldErrors({});
    track({ name: "example_loaded", mode: "check" });
  }, []);

  // Drop the query string once it has been consumed, so a refresh is clean.
  useEffect(() => {
    if (params.get("example") === "1") {
      router.replace("/studio/check", { scroll: false });
    }
  }, [params, router]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const run = useCallback(
    async (source: CheckDraft, mode: "full" | "regenerate" = "full") => {
      if (!source.message.trim()) {
        setFieldErrors({ message: "Add the message you're thinking of sending." });
        messageRef.current?.focus();
        return;
      }
      if (source.message.length > LIMITS.message) {
        setFieldErrors({
          message: `That's ${source.message.length - LIMITS.message} characters over the limit.`,
        });
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setFieldErrors({});
      setError(null);
      if (mode === "full") setPhase("loading");
      else setRegenerating(true);

      track({ name: "analysis_started", mode: "check" });

      try {
        const response = await analyze(
          {
            mode: "check",
            relationship: source.relationship,
            context: source.context,
            message: source.message,
            ...(source.outcome ? { outcome: source.outcome as Outcome } : {}),
          },
          controller.signal,
        );

        if (response.mode !== "check") throw new Error("Unexpected response");

        setResult(response.result);
        setAnalysedMessage(source.message);
        setPhase("result");
        setReplay(null);
        track({ name: "analysis_completed", mode: "check" });

        saveHistory({
          mode: "check",
          title: firstLine(source.message),
          draft: source,
          result: response.result,
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message =
          err instanceof CooeRequestError
            ? err.message
            : "Cooe couldn't finish that analysis. Your text is still here — try again in a moment.";
        setError(message);
        track({
          name: "analysis_failed",
          mode: "check",
          code: err instanceof CooeRequestError ? err.code : "unknown",
        });
        if (mode === "full") setPhase("error");
      } finally {
        setRegenerating(false);
      }
    },
    [],
  );

  // Cmd/Ctrl + Enter submits from anywhere in the form.
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

  function openHistory(entry: HistoryEntry) {
    if (entry.mode === "check") {
      setDraft(entry.draft);
      setResult(entry.result);
      setAnalysedMessage(entry.draft.message);
      setPhase("result");
      setReplay(null);
      return;
    }
    setReplay(entry);
    setPhase("result");
  }

  const recent = (
    <RecentList onOpen={openHistory} />
  );

  /* ---------------------------------------------------------- rendering */

  if (phase === "loading") {
    return (
      <StudioFrame eyebrow="Check" headline="Before you send it, check how it lands.">
        <AnalyzingState />
      </StudioFrame>
    );
  }

  if (phase === "error") {
    return (
      <StudioFrame eyebrow="Check" headline="Before you send it, check how it lands.">
        <ErrorState
          message={error ?? ""}
          onRetry={() => void run(draft)}
          onEdit={() => setPhase("input")}
        />
      </StudioFrame>
    );
  }

  if (phase === "result") {
    const actions = (
      <>
        <button
          type="button"
          onClick={() => {
            setPhase("input");
            setReplay(null);
            requestAnimationFrame(() => messageRef.current?.focus());
          }}
          className="text-[13px] text-muted underline decoration-line-strong underline-offset-[5px] hover:text-ink"
        >
          Edit and run again
        </button>
        <button
          type="button"
          onClick={() => {
            setDraft(EMPTY);
            setResult(null);
            setReplay(null);
            setPhase("input");
          }}
          className="text-[13px] text-muted underline decoration-line-strong underline-offset-[5px] hover:text-ink"
        >
          New conversation
        </button>
      </>
    );

    return (
      <div ref={resultRef} className="mx-auto w-full max-w-[1180px] px-5 py-10 sm:px-10 sm:py-14">
        <div className="mb-10 flex items-baseline justify-between gap-4 border-b border-line pb-5">
          <p className="eyebrow">
            {replay ? `${replay.mode} · saved on this device` : "The Cooe mirror"}
          </p>
          <button
            type="button"
            onClick={() => {
              setReplay(null);
              setPhase("input");
            }}
            className="text-[12px] text-faint underline underline-offset-4 hover:text-ink"
          >
            Back to input
          </button>
        </div>

        {replay ? (
          <ReplayView entry={replay} actions={actions} />
        ) : (
          result && (
            <CheckResultView
              result={result}
              originalMessage={analysedMessage}
              onRegenerate={() => void run(draft, "regenerate")}
              regenerating={regenerating}
              actions={actions}
            />
          )
        )}
      </div>
    );
  }

  return (
    <StudioFrame
      eyebrow="Check"
      headline="Before you send it, check how it lands."
      aside={
        <div className="space-y-10">
          <div>
            <p className="eyebrow">Sample scenarios</p>
            <ul className="mt-3 space-y-3">
              {SCENARIOS.map((scenario) => (
                <li key={scenario.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setDraft(scenario.check);
                      setFieldErrors({});
                      track({ name: "example_loaded", mode: scenario.id });
                    }}
                    className="group text-left"
                  >
                    <span className="block text-[12px] leading-tight text-ink transition-colors group-hover:text-signal-orange">
                      {scenario.label}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-[1.5] text-faint">
                      {scenario.blurb}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {recent}
        </div>
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
          label="What are you trying to communicate?"
          hint="optional but it sharpens the read"
          rows={2}
          value={draft.context}
          limit={LIMITS.context}
          showCount={draft.context.length > LIMITS.context * 0.7}
          maxLength={LIMITS.context}
          onChange={(e) => set("context", e.target.value)}
          placeholder="I want him to understand that I'm upset he cancelled again without sounding accusatory."
        />

        <TextArea
          ref={messageRef}
          label="Your message"
          rows={5}
          value={draft.message}
          limit={LIMITS.message}
          showCount
          error={fieldErrors.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder="Paste the message you're thinking of sending."
        />

        <ChoiceGroup
          name="outcome"
          label="Desired outcome"
          optional
          options={OUTCOMES}
          value={draft.outcome}
          onChange={(value: Outcome) =>
            set("outcome", draft.outcome === value ? "" : value)
          }
        />

        <div className="flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-line pt-8">
          <Button type="submit" className="group">
            See what they hear
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Button>
          <button
            type="button"
            onClick={loadExample}
            className="text-[13px] text-ink underline decoration-line-strong underline-offset-[5px] hover:decoration-ink"
          >
            Try an example
          </button>
          {(draft.message || draft.context) && (
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

/** Saved sessions from other modes can be reopened from anywhere. */
function ReplayView({
  entry,
  actions,
}: {
  entry: HistoryEntry;
  actions: React.ReactNode;
}) {
  if (entry.mode === "check") {
    return (
      <CheckResultView
        result={entry.result}
        originalMessage={entry.draft.message}
        actions={actions}
      />
    );
  }
  if (entry.mode === "map") {
    return <MapResultView result={entry.result} actions={actions} />;
  }
  if (entry.mode === "repair") {
    return <RepairResultView result={entry.result} actions={actions} />;
  }
  return (
    <div className="py-10">
      <p className="eyebrow">Rehearsal debrief</p>
      <p className="serif mt-4 text-[22px] leading-tight text-ink">
        {entry.result.strongestMoment}
      </p>
      <p className="mt-4 max-w-[42rem] text-[14px] leading-[1.7] text-muted">
        {entry.result.tryDifferently}
      </p>
      <div className="mt-8 flex flex-wrap gap-6">{actions}</div>
    </div>
  );
}
