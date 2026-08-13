"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Signal } from "@/components/shared/Signal";

const REVEALS = [
  {
    label: "What you may mean",
    body: "I don't feel considered.",
    tone: "text-ink",
  },
  {
    label: "What they may hear",
    body: "I'm shutting down the conversation.",
    tone: "text-ink",
  },
  {
    label: "cooe",
    body: "Try saying the actual concern.",
    tone: "text-signal-orange",
  },
];

export function Demo() {
  const [open, setOpen] = useState(false);

  return (
    <section className="relative overflow-hidden border-t border-line px-5 py-20 sm:px-10 sm:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-1/2 -translate-y-1/2"
      >
        <Signal
          className="h-[380px] w-[380px]"
          state={open ? "result" : "idle"}
          blur={60}
          opacity={0.34}
        />
      </div>

      <div className="relative mx-auto max-w-[1120px]">
        <p className="eyebrow">A quick look</p>

        <div className="mt-12 max-w-[36rem] sm:mt-16">
          <p className="eyebrow">The message</p>
          <p className="serif mt-4 text-[clamp(1.6rem,4.6vw,2.75rem)] leading-[1.2] text-ink">
            &ldquo;Fine. Do whatever you want.&rdquo;
          </p>

          {!open && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="group mt-8 inline-flex items-center gap-2.5 rounded-md border border-line-strong px-5 py-3 text-[13px] leading-none text-ink transition-colors duration-300 hover:border-ink hover:bg-paper-2"
            >
              See what they hear
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </button>
          )}

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-10 divide-y divide-line border-t border-line"
              >
                {REVEALS.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.12 + i * 0.22,
                      duration: 0.7,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="py-6"
                  >
                    <p className="eyebrow">{item.label}</p>
                    <p
                      className={`mt-2.5 text-[15px] leading-[1.55] sm:text-[17px] ${item.tone}`}
                    >
                      {item.body}
                    </p>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                  className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-8"
                >
                  <Link
                    href="/studio/check"
                    className="group inline-flex items-center gap-2.5 rounded-md bg-ink px-6 py-3.5 text-[13px] leading-none text-paper transition-colors duration-300 hover:bg-[#2a2420]"
                  >
                    Check your own message
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-[12px] text-faint underline underline-offset-4 hover:text-ink"
                  >
                    Reset
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
