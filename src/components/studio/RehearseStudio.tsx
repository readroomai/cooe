"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { StudioFrame, PrivacyHint } from "./StudioFrame";
import { RecentList } from "./RecentList";
import { AnalyzingState, ErrorState } from "./States";
import { Button, ChoiceGroup, CopyButton, TextArea } from "@/components/shared/ui";
import { Signal } from "@/components/shared/Signal";
import { Prose, Reveal, ResultSection } from "@/components/result/primitives";
import { ShareInsight } from "@/components/result/ShareInsight";
import { coach, debrief, rehearse, CooeRequestError } from "@/lib/client-api";
import {
  DIFFICULTIES,
  LIMITS,
  RELATIONSHIPS,
  type Difficulty,
  type RehearsalTurn,
  type RehearseDraft,
  type Relationship,
} from "@/lib/schemas/input";
import type { RehearsalCoach, RehearsalDebrief } from "@/lib/schemas/result";
import { EXAMPLE_REHEARSE } from "@/lib/scenarios";
import { saveHistory, type HistoryEntry } from "@/lib/storage/history";
import { track } from "@/lib/analytics";
import { cn, firstLine } from "@/lib/utils";

const EMPTY: RehearseDraft = {
  relationship: "Partner",
  situation: "",
  person: "",
  goal: "",
  difficulty: "Awkward",
};

type Phase = "setup" | "starting" | "live" | "debriefing" | "debrief" | "error";

const HEAD = {
  eyebrow: "Rehearse",
  headline: "Practice it before it becomes real.",
};

export function RehearseStudio() {
  const [draft, setDraft] = useState<RehearseDraft>(EMPTY);
  const [phase, setPhase] = useState<Phase>("setup");
  const [transcript, setTranscript] = useState<RehearsalTurn[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [coaching, setCoaching] = useState<RehearsalCoach | null>(null);
  const [coachBusy, setCoachBusy] = useState(false);
  const [result, setResult] = useState<RehearsalDebrief | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const set = useCallback(
    <K extends keyof RehearseDraft>(key: K, value: RehearseDraft[K]) => {
      setDraft((d) => ({ ...d, [key]: value }));
      setFieldErrors((e) => (e[key] ? { ...e, [key]: "" } : e));
    },
    [],
  );

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    if (phase === "live") {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [transcript, coaching, phase]);

  function newController() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    return controller;
  }

  function failed(err: unknown) {
    if (err instanceof DOMException && err.name === "AbortError") return true;
    setError(
      err instanceof CooeRequestError
        ? err.message
        : "Cooe couldn't continue the rehearsal. Try again in a moment.",
    );
    return false;
  }

  async function start() {
    if (!draft.situation.trim()) {
      setFieldErrors({ situation: "Describe the conversation you're preparing for." });
      return;
    }
    if (!draft.goal.trim()) {
      setFieldErrors({ goal: "What do you want out of this conversation?" });
      return;
    }

    const controller = newController();
    setFieldErrors({});
    setError(null);
    setPhase("starting");
    track({ name: "rehearsal_started" });

    try {
      const response = await rehearse(
        { action: "start", setup: draft, transcript: [] },
        controller.signal,
      );
      setTranscript([{ role: "other", content: response.reply.reply }]);
      setPhase("live");
      requestAnimationFrame(() => inputRef.current?.focus());
    } catch (err) {
      if (!failed(err)) setPhase("error");
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || thinking) return;

    const controller = newController();
    const next: RehearsalTurn[] = [...transcript, { role: "user", content: text }];

    setTranscript(next);
    setInput("");
    setCoaching(null);
    setThinking(true);
    setError(null);

    try {
      const response = await rehearse(
        { action: "reply", setup: draft, transcript: next },
        controller.signal,
      );
      setTranscript([...next, { role: "other", content: response.reply.reply }]);
    } catch (err) {
      failed(err);
    } finally {
      setThinking(false);
    }
  }

  async function askCoach() {
    if (coachBusy) return;
    const controller = newController();
    setCoachBusy(true);
    setError(null);
    try {
      const response = await coach(
        { action: "coach", setup: draft, transcript },
        controller.signal,
      );
      setCoaching(response.coach);
    } catch (err) {
      failed(err);
    } finally {
      setCoachBusy(false);
    }
  }

  async function end() {
    const controller = newController();
    setPhase("debriefing");
    setError(null);
    try {
      const response = await debrief(
        { action: "debrief", setup: draft, transcript },
        controller.signal,
      );
      setResult(response.debrief);
      setPhase("debrief");
      track({
        name: "rehearsal_debriefed",
        turns: transcript.filter((t) => t.role === "user").length,
      });
      saveHistory({
        mode: "rehearse",
        title: firstLine(draft.situation),
        draft,
        transcript,
        result: response.debrief,
      });
    } catch (err) {
      if (!failed(err)) setPhase("error");
      else setPhase("live");
    }
  }

  function reset() {
    abortRef.current?.abort();
    setTranscript([]);
    setCoaching(null);
    setResult(null);
    setInput("");
    setError(null);
    setPhase("setup");
  }

  const hasUserTurn = transcript.some((t) => t.role === "user");

  /* ------------------------------------------------------------ states */

  if (phase === "starting") {
    return (
      <StudioFrame {...HEAD}>
        <AnalyzingState label="Starting the rehearsal" />
      </StudioFrame>
    );
  }

  if (phase === "debriefing") {
    return (
      <StudioFrame {...HEAD}>
        <AnalyzingState label="Writing the debrief" />
      </StudioFrame>
    );
  }

  if (phase === "error") {
    return (
      <StudioFrame {...HEAD}>
        <ErrorState
          message={error ?? ""}
          onRetry={() => void start()}
          onEdit={() => setPhase("setup")}
          editLabel="Edit the setup"
        />
      </StudioFrame>
    );
  }

  if (phase === "debrief" && result) {
    return (
      <div className="mx-auto w-full max-w-[1180px] px-5 py-10 sm:px-10 sm:py-14">
        <div className="mb-10 flex items-baseline justify-between gap-4 border-b border-line pb-5">
          <p className="eyebrow">Rehearsal debrief</p>
          <button
            type="button"
            onClick={reset}
            className="text-[12px] text-faint underline underline-offset-4 hover:text-ink"
          >
            New rehearsal
          </button>
        </div>

        <div className="pb-24">
          <Reveal index={0}>
            <p className="eyebrow">Strongest moment</p>
            <p className="serif mt-4 max-w-[42rem] text-[clamp(1.35rem,3.4vw,2rem)] leading-[1.28] text-ink">
              {result.strongestMoment}
            </p>
          </Reveal>

          <div className="mt-16 space-y-16">
            <ResultSection eyebrow="What you did well" index={1}>
              <Prose>{result.didWell}</Prose>
            </ResultSection>
            <ResultSection eyebrow="Where pressure increased" index={2}>
              <Prose>{result.pressureIncreased}</Prose>
            </ResultSection>
            <ResultSection eyebrow="What you avoided saying" index={3}>
              <Prose>{result.avoidedSaying}</Prose>
            </ResultSection>
            <ResultSection eyebrow="One thing to try differently" index={4}>
              <Prose>{result.tryDifferently}</Prose>
            </ResultSection>
          </div>

          <div className="mt-16">
            <Reveal index={5} className="border-t border-line pt-10">
              <div className="flex items-baseline justify-between gap-4">
                <p className="eyebrow">Suggested real-world opening</p>
                <CopyButton text={result.realWorldOpening} />
              </div>
              <p className="serif mt-5 max-w-[38rem] text-balance text-[clamp(1.4rem,3.8vw,2.2rem)] leading-[1.22] text-ink">
                &ldquo;{result.realWorldOpening}&rdquo;
              </p>
            </Reveal>
          </div>

          <Reveal
            index={6}
            className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-line pt-8"
          >
            <ShareInsight
              mode="rehearse"
              lines={[
                { label: "Strongest moment", body: result.strongestMoment },
                { label: "Try differently", body: result.tryDifferently },
                { label: "Opening", body: result.realWorldOpening, accent: true },
              ]}
            />
            <button
              type="button"
              onClick={reset}
              className="text-[13px] text-muted underline decoration-line-strong underline-offset-[5px] hover:text-ink"
            >
              New rehearsal
            </button>
          </Reveal>
        </div>
      </div>
    );
  }

  if (phase === "live") {
    return (
      <div className="relative mx-auto w-full max-w-[860px] px-5 py-10 sm:px-10 sm:py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 top-10 hidden lg:block"
        >
          <Signal className="h-[320px] w-[320px]" opacity={0.26} sizes="320px" />
        </div>

        <div className="relative">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-5">
            <p className="eyebrow">
              Rehearsal · {draft.relationship} · {draft.difficulty}
            </p>
            <button
              type="button"
              onClick={reset}
              className="text-[12px] text-faint underline underline-offset-4 hover:text-ink"
            >
              Start over
            </button>
          </div>

          <p className="mt-4 text-[11px] leading-[1.6] text-faint">
            This is a rehearsal, not a prediction of how someone will actually
            respond.
          </p>

          <ul className="mt-10 space-y-8">
            <AnimatePresence initial={false}>
              {transcript.map((turn, i) => (
                <motion.li
                  key={`${i}-${turn.role}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    "max-w-[38rem]",
                    turn.role === "user" && "ml-auto text-right",
                  )}
                >
                  <p className="eyebrow">
                    {turn.role === "user" ? "You" : "Them"}
                  </p>
                  <p
                    className={cn(
                      "mt-2 whitespace-pre-wrap text-[15px] leading-[1.7]",
                      turn.role === "user" ? "text-ink" : "text-ink-soft",
                    )}
                  >
                    {turn.content}
                  </p>
                </motion.li>
              ))}
            </AnimatePresence>

            {thinking && (
              <li className="max-w-[38rem]">
                <p className="eyebrow">Them</p>
                <p className="mt-2 text-[15px] text-faint">Thinking…</p>
              </li>
            )}
          </ul>

          <AnimatePresence>
            {coaching && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-10 border-l-2 border-signal-orange bg-paper-2 px-5 py-5"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <p className="eyebrow">Coaching</p>
                  <button
                    type="button"
                    onClick={() => setCoaching(null)}
                    className="text-[12px] text-faint hover:text-ink"
                  >
                    Dismiss
                  </button>
                </div>
                <dl className="mt-4 space-y-3.5 text-[14px] leading-[1.65]">
                  <div>
                    <dt className="eyebrow">What worked</dt>
                    <dd className="mt-1 text-ink-soft">{coaching.worked}</dd>
                  </div>
                  <div>
                    <dt className="eyebrow">What may create friction</dt>
                    <dd className="mt-1 text-ink-soft">{coaching.friction}</dd>
                  </div>
                  <div>
                    <dt className="eyebrow">A stronger approach</dt>
                    <dd className="mt-1 text-ink">{coaching.stronger}</dd>
                  </div>
                </dl>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <p className="mt-8 text-[13px] text-signal-orange" role="alert">
              {error}
            </p>
          )}

          <div ref={endRef} className="h-px" />

          <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] mt-10 border-t border-line bg-paper pt-5 lg:bottom-0">
            <TextArea
              ref={inputRef}
              label="Your turn"
              rows={2}
              value={input}
              limit={LIMITS.turn}
              maxLength={LIMITS.turn}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(event) => {
                if (
                  (event.metaKey || event.ctrlKey) &&
                  event.key === "Enter"
                ) {
                  event.preventDefault();
                  void send();
                }
              }}
              placeholder="Say it the way you would actually say it."
            />

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pb-2">
              <Button onClick={() => void send()} disabled={!input.trim() || thinking}>
                {thinking ? "Waiting…" : "Send"}
              </Button>
              <button
                type="button"
                onClick={() => void askCoach()}
                disabled={!hasUserTurn || coachBusy || thinking}
                className="text-[13px] text-ink underline decoration-line-strong underline-offset-[5px] hover:decoration-ink disabled:opacity-40"
              >
                {coachBusy ? "Reading it back…" : "Coach me"}
              </button>
              <button
                type="button"
                onClick={() => void end()}
                disabled={!hasUserTurn || thinking}
                className="text-[13px] text-muted underline decoration-line-strong underline-offset-[5px] hover:text-ink disabled:opacity-40"
              >
                End rehearsal
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------- setup */

  return (
    <StudioFrame
      {...HEAD}
      aside={
        <RecentList
          onOpen={(entry: HistoryEntry) => {
            if (entry.mode === "rehearse") {
              setDraft(entry.draft);
              setTranscript(entry.transcript);
              setResult(entry.result);
              setPhase("debrief");
            }
          }}
        />
      }
    >
      <form
        className="space-y-12"
        onSubmit={(event) => {
          event.preventDefault();
          void start();
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
          label="What's the situation?"
          rows={3}
          value={draft.situation}
          limit={LIMITS.long}
          showCount
          maxLength={LIMITS.long}
          error={fieldErrors.situation}
          onChange={(e) => set("situation", e.target.value)}
          placeholder="The conversation you're preparing for, and why it's difficult."
        />

        <TextArea
          label="Anything Cooe should know about them?"
          hint="optional"
          rows={2}
          value={draft.person}
          limit={LIMITS.short}
          maxLength={LIMITS.short}
          onChange={(e) => set("person", e.target.value)}
          placeholder="How they usually react. No real names needed."
        />

        <TextArea
          label="What's your goal?"
          rows={2}
          value={draft.goal}
          limit={LIMITS.short}
          maxLength={LIMITS.short}
          error={fieldErrors.goal}
          onChange={(e) => set("goal", e.target.value)}
          placeholder="What you want to be true by the end of the conversation."
        />

        <ChoiceGroup
          name="difficulty"
          label="How difficult do you expect this to be?"
          options={DIFFICULTIES}
          value={draft.difficulty}
          onChange={(value: Difficulty) => set("difficulty", value)}
        />

        <div className="flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-line pt-8">
          <Button type="submit" className="group">
            Start rehearsal
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Button>
          <button
            type="button"
            onClick={() => {
              setDraft(EXAMPLE_REHEARSE);
              setFieldErrors({});
              track({ name: "example_loaded", mode: "rehearse" });
            }}
            className="text-[13px] text-ink underline decoration-line-strong underline-offset-[5px] hover:decoration-ink"
          >
            Try an example
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] leading-[1.6] text-faint">
            Cooe will play a plausible version of the other person. It is a
            rehearsal, not a prediction of how they will actually respond.
          </p>
          <PrivacyHint />
        </div>
      </form>
    </StudioFrame>
  );
}
