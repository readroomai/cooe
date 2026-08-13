import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/shared/PageShell";
import { SITE } from "@/lib/config";

export const metadata: Metadata = {
  title: "About",
  description:
    "Cooe closes the distance between what you mean and what someone hears. A project by Gia Macool.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <PageShell eyebrow="About" title="Less distance.">
      <div className="space-y-8">
        <p className="serif text-[clamp(1.3rem,3.4vw,1.9rem)] leading-[1.34] text-ink">
          Better conversations rarely need more words. They need less distance
          between what you mean and what someone hears. Cooe is built to help
          close that gap.
        </p>

        <p className="text-[15px] leading-[1.75] text-muted">
          Most communication advice tells you to be clearer. That is not the
          hard part. The hard part is that you can only ever hear your own
          message from inside your own intention — you already know what you
          meant, so the wording always sounds fine. Cooe reads it from the other
          chair instead, and shows you the specific words doing the damage.
        </p>

        <p className="text-[15px] leading-[1.75] text-muted">
          It is deliberately narrow. Four modes, no accounts, no feed, no
          streaks. Check a message before you send it. Map a situation that has
          gone in circles. Rehearse the conversation you have been putting off.
          Repair one that already went wrong.
        </p>

        <p className="text-[15px] leading-[1.75] text-muted">
          Cooe does not diagnose anyone, does not tell you what another person
          is thinking, and will not help you pressure someone. It gives you a
          reading and something concrete to say. What you do with it is yours.
        </p>

        <div className="border-t border-line pt-8">
          <p className="text-[14px] leading-[1.7] text-muted">
            A project by {SITE.founder.name}.
          </p>
          <a
            href={SITE.founder.url}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-2 inline-block text-[14px] text-ink underline decoration-line-strong underline-offset-[5px] hover:decoration-ink"
          >
            {SITE.founder.handle} ↗
          </a>
        </div>

        <div className="border-t border-line pt-8">
          <Link
            href="/studio/check"
            className="group inline-flex items-center gap-2.5 rounded-md bg-ink px-6 py-3.5 text-[13px] leading-none text-paper transition-colors duration-300 hover:bg-[#2a2420]"
          >
            Check a message
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
