import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { DISCLAIMER, SITE } from "@/lib/config";

const MODES = [
  { href: "/studio/check", label: "Check" },
  { href: "/studio/map", label: "Map" },
  { href: "/studio/rehearse", label: "Rehearse" },
  { href: "/studio/repair", label: "Repair" },
  { href: "/about", label: "About" },
];

const LEGAL = [
  { href: SITE.founder.url, label: "X", external: true },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-10 sm:py-16">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Wordmark />
            <p className="mt-2 text-[13px] text-muted">{SITE.tagline}</p>
          </div>

          <nav aria-label="Product">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {MODES.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[13px] text-muted transition-colors hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {LEGAL.map((item) => (
                <li key={item.label}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-[13px] text-muted transition-colors hover:text-ink"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-[13px] text-muted transition-colors hover:text-ink"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-14 max-w-[46rem] text-[11px] leading-[1.7] text-faint">
          {DISCLAIMER}
        </p>

        <div className="mt-8 flex flex-wrap items-baseline justify-between gap-3 border-t border-line pt-6">
          <span className="text-[11px] text-faint">© 2026 Cooe</span>
          <span className="text-[11px] text-faint">{SITE.domain}</span>
        </div>
      </div>
    </footer>
  );
}
