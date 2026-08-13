"use client";

import { CopyButton } from "@/components/shared/ui";
import { SafetyNote } from "@/components/studio/States";
import { Prose, Reveal, ResultSection } from "./primitives";
import { ShareInsight } from "./ShareInsight";
import type { MapResult } from "@/lib/schemas/result";

export function MapResultView({
  result,
  actions,
}: {
  result: MapResult;
  actions?: React.ReactNode;
}) {
  return (
    <div className="pb-24">
      <SafetyNote note={result.safetyNote} />

      <Reveal index={0}>
        <p className="eyebrow">The situation</p>
        <p className="serif mt-4 max-w-[44rem] text-[clamp(1.3rem,3.2vw,1.85rem)] leading-[1.3] text-ink">
          {result.situation}
        </p>
      </Reveal>

      <Reveal index={1} className="mt-14 grid gap-9 sm:grid-cols-2 sm:gap-10">
        <div>
          <p className="eyebrow">Your side</p>
          <Prose className="mt-3.5">{result.yourSide}</Prose>
        </div>
        <div className="sm:border-l sm:border-line sm:pl-10">
          <p className="eyebrow">Their possible side</p>
          <Prose className="mt-3.5 text-muted">{result.theirPossibleSide}</Prose>
          <p className="mt-3 text-[11px] leading-[1.6] text-faint">
            A hypothesis based on your account — not something Cooe can know.
          </p>
        </div>
      </Reveal>

      <div className="mt-16">
        <ResultSection eyebrow="Where you're missing each other" index={2}>
          <Prose>{result.missingEachOther}</Prose>
        </ResultSection>
      </div>

      <div className="mt-16">
        <ResultSection eyebrow="What's actually being negotiated" index={3}>
          <ul className="flex flex-wrap gap-2">
            {result.negotiating.map((item) => (
              <li
                key={item}
                className="rounded-full border border-line px-3.5 py-2 text-[13px] leading-none text-ink"
              >
                {item}
              </li>
            ))}
          </ul>
        </ResultSection>
      </div>

      {(result.helping.length > 0 || result.harder.length > 0) && (
        <div className="mt-16">
          <Reveal index={4} className="grid gap-10 border-t border-line pt-8 sm:grid-cols-2">
            <div>
              <p className="eyebrow">What is helping</p>
              {result.helping.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {result.helping.map((item, i) => (
                    <li
                      key={i}
                      className="border-l border-signal-orange pl-4 text-[14px] leading-[1.65] text-ink-soft"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-[13px] text-faint">
                  Nothing specific stood out in what you described.
                </p>
              )}
            </div>
            <div>
              <p className="eyebrow">What is making it harder</p>
              {result.harder.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {result.harder.map((item, i) => (
                    <li
                      key={i}
                      className="border-l border-line-strong pl-4 text-[14px] leading-[1.65] text-ink-soft"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-[13px] text-faint">
                  Nothing specific stood out in what you described.
                </p>
              )}
            </div>
          </Reveal>
        </div>
      )}

      <div className="mt-16">
        <ResultSection eyebrow="Best next conversation" index={5}>
          <Prose>{result.nextConversation}</Prose>
        </ResultSection>
      </div>

      <div className="mt-16">
        <Reveal index={6} className="border-t border-line pt-10">
          <div className="flex items-baseline justify-between gap-4">
            <p className="eyebrow">Opening line</p>
            <CopyButton text={result.openingLine} />
          </div>
          <p className="serif mt-5 max-w-[38rem] text-balance text-[clamp(1.4rem,3.8vw,2.2rem)] leading-[1.22] text-ink">
            &ldquo;{result.openingLine}&rdquo;
          </p>
        </Reveal>
      </div>

      <Reveal
        index={7}
        className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-line pt-8"
      >
        <ShareInsight
          mode="map"
          lines={[
            { label: "Where you're missing each other", body: result.missingEachOther },
            { label: "What's being negotiated", body: result.negotiating.join(" · ") },
            { label: "Opening line", body: result.openingLine, accent: true },
          ]}
        />
        {actions}
      </Reveal>
    </div>
  );
}
