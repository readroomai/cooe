"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/** Progressive reveal. Order is index-driven so sections land in sequence. */
export function Reveal({
  index = 0,
  children,
  className,
}: {
  index?: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: Math.min(index * 0.09, 0.7),
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ResultSection({
  eyebrow,
  index = 0,
  children,
  className,
}: {
  eyebrow: string;
  index?: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Reveal index={index} className={cn("border-t border-line pt-8", className)}>
      <p className="eyebrow">{eyebrow}</p>
      <div className="mt-6">{children}</div>
    </Reveal>
  );
}

export function Prose({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "max-w-[46rem] text-pretty text-[15px] leading-[1.72] text-ink-soft",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function LabelledBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}
