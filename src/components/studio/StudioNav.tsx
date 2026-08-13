"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Modal } from "@/components/shared/ui";
import { Signal } from "@/components/shared/Signal";
import { Wordmark } from "@/components/shared/Wordmark";
import { cn } from "@/lib/utils";
import { DISCLAIMER } from "@/lib/config";

export const STUDIO_MODES = [
  { href: "/studio/check", label: "Check" },
  { href: "/studio/map", label: "Map" },
  { href: "/studio/rehearse", label: "Rehearse" },
  { href: "/studio/repair", label: "Repair" },
] as const;

function useActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

export function StudioRail() {
  const isActive = useActive();
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <>
      <aside className="sticky top-0 hidden h-svh w-[220px] shrink-0 flex-col justify-between border-r border-line px-7 py-8 lg:flex">
        <div>
          <Wordmark />

          <nav className="mt-12" aria-label="Studio modes">
            <ul className="space-y-1">
              {STUDIO_MODES.map((mode) => {
                const active = isActive(mode.href);
                return (
                  <li key={mode.href}>
                    <Link
                      href={mode.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "-mx-2 flex items-center gap-2.5 rounded-sm px-2 py-1.5 text-[14px] transition-colors",
                        active
                          ? "text-ink"
                          : "text-muted hover:text-ink",
                      )}
                    >
                      <span
                        className={cn(
                          "size-[5px] shrink-0 rounded-full transition-colors",
                          active ? "bg-signal-orange" : "bg-transparent",
                        )}
                      />
                      {mode.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-10 bottom-16"
          >
            <Signal className="h-[170px] w-[170px]" opacity={0.28} sizes="170px" />
          </div>
          <div className="relative space-y-2">
            <p className="text-[11px] text-faint">Free beta</p>
            <button
              type="button"
              onClick={() => setPrivacyOpen(true)}
              className="block text-[11px] text-muted underline underline-offset-4 hover:text-ink"
            >
              Privacy
            </button>
          </div>
        </div>
      </aside>

      <Modal
        open={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        title="Privacy in Cooe"
      >
        <ul className="space-y-3">
          <li>Cooe has no accounts and no sign-in.</li>
          <li>You never need to use real names.</li>
          <li>
            What you submit is sent to the configured AI provider so it can be
            analysed. Avoid entering anything you would not want processed.
          </li>
          <li>
            Recent sessions are kept in this browser&rsquo;s local storage. They
            are not synced anywhere, and clearing them removes them.
          </li>
          <li>Share cards leave out your original message by default.</li>
        </ul>
        <p className="mt-5 border-t border-line pt-4 text-[12px] leading-[1.6] text-faint">
          {DISCLAIMER}{" "}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-ink">
            Full privacy page
          </Link>
        </p>
      </Modal>
    </>
  );
}

export function StudioBottomNav() {
  const isActive = useActive();

  return (
    <nav
      aria-label="Studio modes"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden"
    >
      <ul className="grid grid-cols-4">
        {STUDIO_MODES.map((mode) => {
          const active = isActive(mode.href);
          return (
            <li key={mode.href}>
              <Link
                href={mode.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1.5 py-3.5 text-[12px] transition-colors",
                  active ? "text-ink" : "text-faint",
                )}
              >
                <span
                  className={cn(
                    "size-[5px] rounded-full transition-colors",
                    active ? "bg-signal-orange" : "bg-transparent",
                  )}
                />
                {mode.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
