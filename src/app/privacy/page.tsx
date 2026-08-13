import type { Metadata } from "next";
import Link from "next/link";
import { Article, Clause, PageShell } from "@/components/shared/PageShell";
import { DISCLAIMER, SITE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How Cooe handles what you write: no accounts, local-only history, and AI processing by the configured provider.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Privacy"
      title="What happens to what you write."
      lede="Cooe is used for personal conversations, so this page says plainly what is and is not true. It makes no promises the architecture cannot keep."
    >
      <Article>
        <Clause heading="There are no accounts">
          <p>
            Cooe has no sign-up, no sign-in, and no user database. You are not
            asked for an email address, and nothing you submit is attached to an
            identity.
          </p>
        </Clause>

        <Clause heading="You never need to use real names">
          <p>
            Describe only what you are comfortable sharing. Cooe works fine with
            &ldquo;my manager&rdquo; or &ldquo;my sister&rdquo; — real names,
            addresses, workplaces and other identifying detail add nothing to
            the analysis.
          </p>
        </Clause>

        <Clause heading="Your input is sent to an AI provider">
          <p>
            To analyse a message, Cooe sends what you typed from its server to
            the configured AI provider. That is how the product works — the text
            has to reach a model. It is not stored in a Cooe database, but it
            does leave this server, and the provider handles it under their own
            terms.
          </p>
          <p>
            Because of this, avoid submitting information you would not want
            processed by a third party: passwords, financial details, medical
            records, or anything covered by an obligation of confidentiality.
          </p>
        </Clause>

        <Clause heading="Recent sessions stay in your browser">
          <p>
            Up to five recent analyses are kept in this browser&rsquo;s local
            storage so you can reopen them. This is not an account and is not
            synced anywhere. It exists only on the device you used.
          </p>
          <p>
            Use &ldquo;Clear history&rdquo; in the studio, or clear your browser
            storage, and it is gone.
          </p>
        </Clause>

        <Clause heading="Share cards exclude your original text">
          <p>
            When you generate a share card, your original message is left out by
            default. Only the interpretation is included. You can opt in to add
            your own words, and that choice is always explicit.
          </p>
        </Clause>

        <Clause heading="No tracking scripts">
          <p>
            Cooe ships with no third-party analytics, no advertising pixels and
            no cross-site trackers. If privacy-friendly, cookieless analytics
            are added later, this page will say so.
          </p>
        </Clause>

        <Clause heading="No payment data">
          <p>
            Cooe is free during beta. There is no payment processing, no wallet
            connection and no billing information of any kind. If crypto
            payments are enabled later, how they work will be documented before
            they go live.
          </p>
        </Clause>

        <Clause heading="Questions">
          <p>
            Contact {SITE.contactEmail}. See also the{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-ink">
              terms
            </Link>
            .
          </p>
          <p className="text-[12px] text-faint">{DISCLAIMER}</p>
        </Clause>
      </Article>
    </PageShell>
  );
}
