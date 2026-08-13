"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Signal } from "@/components/shared/Signal";
import { Button } from "@/components/shared/ui";

const LINES = [
  "Reading the words.",
  "Finding the intention.",
  "Looking for the gap.",
  "Reframing the signal.",
];

/** Branded loading. Cycles copy but never fakes a progress bar or a timer. */
export function AnalyzingState({ label = "Analysing" }: { label?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % LINES.length), 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="flex min-h-[46vh] flex-col items-center justify-center py-16 text-center"
      role="status"
      aria-live="polite"
    >
      <Signal
        className="h-[190px] w-[190px] sm:h-[230px] sm:w-[230px]"
        state="analyzing"
        sizes="230px"
      />
      <motion.p
        key={index}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="serif mt-8 text-[19px] text-ink"
      >
        {LINES[index]}
      </motion.p>
      <span className="sr-only">{label} in progress</span>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
  onEdit,
  editLabel = "Edit message",
}: {
  message: string;
  onRetry: () => void;
  onEdit: () => void;
  editLabel?: string;
}) {
  return (
    <div className="max-w-[34rem] py-12" role="alert">
      <p className="eyebrow">Something went wrong</p>
      <h2 className="serif mt-4 text-[26px] leading-tight text-ink">
        Cooe couldn&rsquo;t finish that analysis.
      </h2>
      <p className="mt-3 text-[14px] leading-[1.7] text-muted">{message}</p>
      <div className="mt-7 flex flex-wrap gap-3">
        <Button onClick={onRetry}>Try again</Button>
        <Button variant="ghost" onClick={onEdit}>
          {editLabel}
        </Button>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="py-10">
      <p className="serif text-[20px] text-ink">{title}</p>
      <p className="mt-2 max-w-[26rem] text-[13px] leading-[1.7] text-muted">
        {body}
      </p>
    </div>
  );
}

export function SafetyNote({ note }: { note: string | null }) {
  if (!note) return null;
  return (
    <div className="mt-10 border-l-2 border-signal-orange bg-paper-2 px-5 py-4">
      <p className="eyebrow">Before anything else</p>
      <p className="mt-2 text-[14px] leading-[1.7] text-ink">{note}</p>
    </div>
  );
}
