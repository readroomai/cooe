import Link from "next/link";
import { Signal } from "@/components/shared/Signal";

const FREE = [
  "Full Cooe experience",
  "No account",
  "No card",
  "Start immediately",
];

const FUTURE = ["No subscription", "USDC / SOL", "Pay per use", "Coming soon"];

export function BetaSection() {
  return (
    <section className="relative overflow-hidden border-t border-line px-5 py-20 sm:px-10 sm:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-[-14%] hidden justify-center sm:flex"
      >
        <Signal
          variant="wash"
          className="h-[420px] w-[1200px]"
          opacity={0.5}
          sizes="1200px"
        />
      </div>

      <div className="relative mx-auto max-w-[1120px]">
        <h2 className="display max-w-[16ch] text-balance text-[clamp(1.9rem,5.2vw,3.5rem)] text-ink">
          Use it now. Pay only when you need it later.
        </h2>

        <div className="mt-14 grid gap-12 border-t border-line pt-10 sm:mt-20 sm:grid-cols-2 sm:gap-16">
          <div>
            <p className="eyebrow">Free beta</p>
            <p className="display mt-4 text-[clamp(2.4rem,6vw,3.6rem)] text-ink">
              $0
            </p>
            <ul className="mt-8 space-y-2.5">
              {FREE.map((item) => (
                <li key={item} className="text-[14px] leading-[1.6] text-ink-soft">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="sm:border-l sm:border-line sm:pl-16">
            <p className="eyebrow">Future</p>
            <p className="display mt-4 text-[clamp(1.7rem,4vw,2.4rem)] text-muted">
              Pay as you go
            </p>
            <ul className="mt-8 space-y-2.5">
              {FUTURE.map((item) => (
                <li key={item} className="text-[14px] leading-[1.6] text-muted">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-[12px] leading-[1.6] text-faint">
              No subscription. Pay for what you use. Crypto checkout is not live
              yet —{" "}
              <Link
                href="/pricing"
                className="underline underline-offset-4 hover:text-ink"
              >
                see the plan
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="mt-14">
          <Link
            href="/studio/check"
            className="group inline-flex items-center gap-2.5 rounded-md bg-ink px-6 py-3.5 text-[13px] leading-none text-paper transition-colors duration-300 hover:bg-[#2a2420]"
          >
            Try Cooe free
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
