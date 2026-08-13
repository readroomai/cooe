"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Wordmark } from "./Wordmark";
import { cn } from "@/lib/utils";

const MENU = [
  { href: "/studio/check", label: "Check", note: "Before you send it." },
  { href: "/studio/map", label: "Map", note: "When it's bigger than one message." },
  { href: "/studio/rehearse", label: "Rehearse", note: "Practice the conversation." },
  { href: "/studio/repair", label: "Repair", note: "When it already went wrong." },
];

const SECONDARY = [
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    function onClick(event: MouseEvent) {
      const target = event.target as Node;
      if (
        !panelRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <header className="relative z-40">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-6 sm:px-10 sm:py-8">
        <Wordmark />

        <nav className="flex items-center gap-5 sm:gap-7" aria-label="Primary">
          <span className="hidden text-[12px] text-faint sm:inline">
            Free beta · no account needed
          </span>
          <Link
            href="/studio/check"
            className="text-[13px] text-ink underline decoration-line-strong underline-offset-[5px] transition-colors hover:decoration-ink"
          >
            Try Cooe
          </Link>
          <button
            ref={triggerRef}
            type="button"
            aria-expanded={open}
            aria-haspopup="true"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "grid size-[26px] place-items-center rounded-full border transition-colors duration-300",
              open
                ? "border-ink bg-ink"
                : "border-line-strong hover:border-ink",
            )}
          >
            <span
              className={cn(
                "size-[7px] rounded-full transition-colors duration-300",
                open ? "bg-paper" : "bg-ink",
              )}
            />
          </button>
        </nav>
      </div>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-5 top-[68px] w-[min(320px,calc(100vw-40px))] rounded-lg border border-line bg-paper p-6 shadow-[0_18px_50px_-30px_rgba(20,17,15,0.4)] sm:right-10 sm:top-[84px]"
        >
          <ul className="space-y-4">
            {MENU.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="group block"
                >
                  <span className="serif text-[20px] leading-none text-ink transition-colors group-hover:text-signal-orange">
                    {item.label}
                  </span>
                  <span className="mt-1 block text-[12px] text-faint">
                    {item.note}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <hr className="my-5 border-0 border-t border-line" />
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {SECONDARY.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-[12px] text-muted hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
