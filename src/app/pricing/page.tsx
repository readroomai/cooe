import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/shared/PageShell";
import {
  PRICED_ACTIONS,
  SUPPORTED_CURRENCIES,
  SUPPORTED_NETWORK,
} from "@/lib/payments/provider";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Cooe is free during beta with no account. Afterwards: pay as you go, no subscription. Crypto checkout is not live yet.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <PageShell
      eyebrow="Pricing"
      title="Free during beta."
      lede="No subscription. Pay for what you use — later, when it ships."
    >
      <div className="space-y-16">
        <section>
          <div className="flex items-baseline justify-between gap-4 border-t border-line pt-7">
            <div>
              <p className="eyebrow">Now</p>
              <p className="display mt-3 text-[clamp(1.8rem,5vw,2.6rem)] text-ink">
                Free beta
              </p>
            </div>
            <p className="display text-[clamp(2rem,5vw,3rem)] text-ink">$0</p>
          </div>
          <ul className="mt-7 space-y-2.5 text-[14px] leading-[1.6] text-ink-soft">
            <li>Every mode, unrestricted</li>
            <li>No account, no card, no sign-in</li>
            <li>Nothing to cancel</li>
          </ul>
          <Link
            href="/studio/check"
            className="group mt-8 inline-flex items-center gap-2.5 rounded-md bg-ink px-6 py-3.5 text-[13px] leading-none text-paper transition-colors duration-300 hover:bg-[#2a2420]"
          >
            Start now
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </section>

        <section>
          <div className="border-t border-line pt-7">
            <p className="eyebrow">After beta</p>
            <p className="display mt-3 text-[clamp(1.8rem,5vw,2.6rem)] text-ink">
              Pay as you go
            </p>
            <p className="mt-4 text-[14px] leading-[1.7] text-muted">
              Use Cooe when you need it. No monthly subscription.
            </p>
          </div>

          <ul className="mt-9 divide-y divide-line border-t border-line">
            {PRICED_ACTIONS.map((action) => (
              <li
                key={action.id}
                className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-5"
              >
                <div className="min-w-0">
                  <p className="text-[15px] text-ink">{action.label}</p>
                  <p className="mt-1 text-[13px] text-muted">
                    {action.description}
                  </p>
                </div>
                <span className="shrink-0 text-[13px] text-faint">
                  Coming soon
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-10 border-t border-line pt-7">
            <p className="eyebrow">Payment</p>
            <p className="mt-3 text-[15px] text-ink">
              {SUPPORTED_CURRENCIES.join(" / ")} on {SUPPORTED_NETWORK}
            </p>
            <p className="mt-3 max-w-[34rem] text-[13px] leading-[1.7] text-muted">
              Crypto checkout is not live yet. There is no payment processing in
              Cooe today, no wallet connection, and nothing to pay for. When it
              ships, the terms will be documented here first.
            </p>
          </div>
        </section>

        <section className="border-t border-line pt-7">
          <p className="text-[13px] leading-[1.7] text-faint">
            Cooe has no accounts, so there is nothing to bill against today.
            Read how your input is handled on the{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-ink">
              privacy page
            </Link>
            .
          </p>
        </section>
      </div>
    </PageShell>
  );
}
