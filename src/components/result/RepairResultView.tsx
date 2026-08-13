"use client";

import { CopyButton } from "@/components/shared/ui";
import { SafetyNote } from "@/components/studio/States";
import { Prose, Reveal, ResultSection } from "./primitives";
import { ShareInsight } from "./ShareInsight";
import type { RepairResult } from "@/lib/schemas/result";

const SECTIONS: Array<{ key: keyof RepairResult; label: string }> = [
  { key: "dontArgueFirst", label: "What not to argue about first" },
  { key: "acknowledge", label: "What to acknowledge" },
  { key: "own", label: "What to own" },
  { key: "dontOverApologize", label: "What not to over-apologise for" },
];

export function RepairResultView({
  result,
  actions,
}: {
  result: RepairResult;
  actions?: React.ReactNode;
}) {
  return (
    <div className="pb-24">
      <SafetyNote note={result.safetyNote} />

      <Reveal index={0}>
        <p className="eyebrow">What needs repairing</p>
        <p className="serif mt-4 max-w-[44rem] text-[clamp(1.35rem,3.4vw,2rem)] leading-[1.28] text-ink">
          {result.needsRepairing}
        </p>
      </Reveal>

      <div className="mt-16 space-y-16">
        {SECTIONS.map((section, i) => (
          <ResultSection key={section.key} eyebrow={section.label} index={i + 1}>
            <Prose>{result[section.key] as string}</Prose>
          </ResultSection>
        ))}
      </div>

      <div className="mt-16">
        <Reveal index={5} className="border-t border-line pt-10">
          <div className="flex items-baseline justify-between gap-4">
            <p className="eyebrow">A repair message</p>
            <CopyButton text={result.repairMessage} />
          </div>
          <p className="mt-5 max-w-[42rem] whitespace-pre-wrap text-[15px] leading-[1.75] text-ink">
            {result.repairMessage}
          </p>
        </Reveal>
      </div>

      <div className="mt-14">
        <Reveal index={6} className="border-t border-line pt-10">
          <div className="flex items-baseline justify-between gap-4">
            <p className="eyebrow">A shorter version</p>
            <CopyButton text={result.shortVersion} />
          </div>
          <p className="serif mt-5 max-w-[38rem] text-[clamp(1.2rem,3vw,1.6rem)] leading-[1.34] text-ink">
            {result.shortVersion}
          </p>
        </Reveal>
      </div>

      <div className="mt-16">
        <ResultSection eyebrow="If they aren't ready to talk" index={7}>
          <Prose>{result.ifNotReady}</Prose>
        </ResultSection>
      </div>

      <Reveal
        index={8}
        className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-line pt-8"
      >
        <ShareInsight
          mode="repair"
          lines={[
            { label: "What needs repairing", body: result.needsRepairing },
            { label: "What to own", body: result.own },
            { label: "Where to start", body: result.shortVersion, accent: true },
          ]}
        />
        {actions}
      </Reveal>
    </div>
  );
}
