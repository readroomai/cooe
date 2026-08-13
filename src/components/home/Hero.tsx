import Link from "next/link";
import { Signal } from "@/components/shared/Signal";

export function Hero() {
  return (
    <section className="relative flex min-h-[calc(100svh-104px)] flex-col justify-center px-5 pb-16 pt-8 sm:px-10 sm:pb-20 sm:pt-0">
      {/* The Signal sits behind the type, bleeding off the top on small screens. */}
      <div className="pointer-events-none absolute inset-x-0 top-[2%] flex justify-center sm:top-[6%]">
        <Signal
          className="h-[340px] w-[340px] sm:h-[520px] sm:w-[520px] lg:h-[600px] lg:w-[600px]"
          blur={52}
          opacity={0.92}
        />
      </div>

      <div className="relative mx-auto w-full max-w-[1120px]">
        <h1 className="text-balance">
          <span className="block text-[15px] font-normal tracking-[-0.01em] text-ink-soft sm:text-[17px]">
            You know what you mean.
          </span>
          <span className="display mt-2 block text-[clamp(2.75rem,10.5vw,7.25rem)] text-ink sm:mt-3">
            See what they hear.
          </span>
        </h1>

        <p className="mt-7 max-w-[30rem] text-[14px] leading-[1.65] text-ink-soft sm:mt-9 sm:text-[15px]">
          AI rehearsal for conversations that matter.
        </p>

        <p className="mt-3 max-w-[30rem] text-pretty text-[13px] leading-[1.72] text-muted sm:text-[14px]">
          Paste a message, map a difficult conversation or rehearse what comes
          next. Cooe helps you spot the gap between what you intend and what
          someone may hear.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4 sm:mt-11">
          <Link
            href="/studio/check"
            className="group inline-flex items-center gap-2.5 rounded-md bg-ink px-6 py-3.5 text-[13px] leading-none text-paper transition-colors duration-300 hover:bg-[#2a2420]"
          >
            Check a message
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
          <Link
            href="/studio/check?example=1"
            className="text-[13px] text-ink underline decoration-line-strong underline-offset-[5px] transition-colors hover:decoration-ink"
          >
            Try an example
          </Link>
          <span className="text-[12px] text-faint">
            No account · Free during beta
          </span>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-6 hidden justify-center sm:flex"
      >
        <svg
          width="26"
          height="10"
          viewBox="0 0 26 10"
          fill="none"
          className="text-line-strong"
        >
          <path
            d="M1 1L13 9L25 1"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </section>
  );
}
