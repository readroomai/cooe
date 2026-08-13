"use client";

import { CopyButton } from "@/components/shared/ui";
import { Signal } from "@/components/shared/Signal";
import { SafetyNote } from "@/components/studio/States";
import { Prose, Reveal, ResultSection } from "./primitives";
import { ShareInsight } from "./ShareInsight";
import {
  SIGNAL_LABELS,
  SIGNAL_ORDER,
  TONE_LABELS,
  type CheckResult,
} from "@/lib/schemas/result";
import { track } from "@/lib/analytics";
import { clamp } from "@/lib/utils";

export function CheckResultView({
  result,
  originalMessage,
  onRegenerate,
  regenerating,
  actions,
}: {
  result: CheckResult;
  originalMessage: string;
  onRegenerate?: () => void;
  regenerating?: boolean;
  actions?: React.ReactNode;
}) {
  return (
    <div className="pb-24">
      <SafetyNote note={result.safetyNote} />

      {/* ---- The gap: the hero of the whole product --------------------- */}
      <Reveal index={0} className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-72 -top-52 -z-10 hidden xl:block"
        >
          <Signal
            className="h-[360px] w-[560px]"
            state="result"
            opacity={0.3}
            sizes="560px"
          />
        </div>

        <div className="relative grid gap-8 sm:grid-cols-2 sm:gap-10">
          <div>
            <p className="eyebrow">What you mean</p>
            <p className="serif mt-4 text-[clamp(1.4rem,3.6vw,2rem)] leading-[1.26] text-ink">
              {result.intention.summary}
            </p>
          </div>
          <div className="sm:border-l sm:border-line sm:pl-10">
            <p className="eyebrow">What they might hear</p>
            <p className="serif mt-4 text-[clamp(1.4rem,3.6vw,2rem)] leading-[1.26] text-muted">
              {result.interpretation.summary}
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal index={1} className="relative mt-12">
        <div className="border-l-2 border-signal-orange py-1 pl-5">
          <p className="eyebrow">The gap</p>
          <p className="mt-3 text-[clamp(1.05rem,2.6vw,1.3rem)] leading-[1.4] text-ink">
            {result.gap.title}
          </p>
          <Prose className="mt-3 text-[14px]">{result.gap.explanation}</Prose>
        </div>
      </Reveal>

      {/* ---- Signals ---------------------------------------------------- */}
      <div className="mt-16">
        <ResultSection eyebrow="Communication signals · AI estimate" index={2}>
          <ul className="space-y-7">
            {SIGNAL_ORDER.map((key) => {
              const signal = result.signals[key];
              const value = clamp(signal.score);
              return (
                <li key={key}>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-[14px] text-ink">
                      {SIGNAL_LABELS[key]}
                    </span>
                    <span className="text-[13px] tabular-nums text-muted">
                      {value}
                    </span>
                  </div>
                  <div className="mt-2.5 h-px w-full bg-line">
                    <div
                      className="h-px bg-ink transition-[width] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{ width: `${value}%` }}
                      role="meter"
                      aria-valuenow={value}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${SIGNAL_LABELS[key]} estimate`}
                    />
                  </div>
                  <p className="mt-3 max-w-[42rem] text-[13px] leading-[1.65] text-muted">
                    {signal.explanation}
                  </p>
                </li>
              );
            })}
          </ul>
          <p className="mt-8 text-[11px] leading-[1.6] text-faint">
            These are heuristic estimates from a language model, not
            measurements.
          </p>
        </ResultSection>
      </div>

      {/* ---- Friction --------------------------------------------------- */}
      {result.frictionPoints.length > 0 && (
        <div className="mt-16">
          <ResultSection eyebrow="Where it gets lost" index={3}>
            <ul className="divide-y divide-line border-t border-line">
              {result.frictionPoints.map((point, i) => (
                <li key={`${point.original}-${i}`} className="py-8 first:pt-8">
                  <p className="serif text-[clamp(1.15rem,2.8vw,1.5rem)] leading-[1.3] text-ink">
                    &ldquo;{point.original}&rdquo;
                  </p>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2 sm:gap-8">
                    <div>
                      <p className="eyebrow">Why it may create friction</p>
                      <p className="mt-2 text-[13px] leading-[1.68] text-muted">
                        {point.issue}
                      </p>
                    </div>
                    <div>
                      <p className="eyebrow">Better signal</p>
                      <p className="mt-2 text-[13px] leading-[1.68] text-ink">
                        {point.alternative}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </ResultSection>
        </div>
      )}

      {/* ---- Alternatives ----------------------------------------------- */}
      <div className="mt-16">
        <ResultSection eyebrow="Three ways to say it" index={4}>
          <ul className="space-y-px">
            {result.alternatives.map((alt) => (
              <li
                key={alt.tone}
                className="border-t border-line py-8 first:border-t-0 first:pt-0"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[13px] text-signal-orange">
                    {TONE_LABELS[alt.tone]}
                  </span>
                  <CopyButton
                    text={alt.message}
                    onCopied={() =>
                      track({ name: "alternative_copied", tone: alt.tone })
                    }
                  />
                </div>
                <p className="mt-4 max-w-[42rem] whitespace-pre-wrap text-[15px] leading-[1.7] text-ink">
                  {alt.message}
                </p>
                <p className="mt-3 max-w-[42rem] text-[13px] leading-[1.65] text-muted">
                  {alt.explanation}
                </p>
              </li>
            ))}
          </ul>

          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              disabled={regenerating}
              className="mt-6 text-[12px] text-faint underline underline-offset-4 transition-colors hover:text-ink disabled:opacity-50"
            >
              {regenerating ? "Rewriting…" : "Regenerate these"}
            </button>
          )}
        </ResultSection>
      </div>

      {/* ---- One change -------------------------------------------------- */}
      <div className="mt-16">
        <Reveal index={5} className="border-t border-line pt-10">
          <p className="eyebrow">If you only change one thing</p>
          <p className="serif mt-5 max-w-[38rem] text-balance text-[clamp(1.5rem,4vw,2.4rem)] leading-[1.2] text-ink">
            {result.oneChange}
          </p>
        </Reveal>
      </div>

      <Reveal
        index={6}
        className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-line pt-8"
      >
        <ShareInsight
          mode="check"
          originalMessage={originalMessage}
          lines={[
            { label: "What you mean", body: result.intention.summary },
            { label: "What they might hear", body: result.interpretation.summary },
            { label: "The gap", body: result.gap.title, accent: true },
          ]}
        />
        {actions}
      </Reveal>
    </div>
  );
}
