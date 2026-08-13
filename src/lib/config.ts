/** Public, build-time-safe configuration. Never put secrets here. */

export const SITE = {
  name: "Cooe",
  wordmark: "cooe",
  domain: "cooe.fun",
  tagline: "See what they hear.",
  positioning: "AI rehearsal for conversations that matter.",
  description:
    "AI rehearsal for conversations that matter. Check how a message may land, map difficult conversations and practice what to say before you say it.",
  founder: {
    name: "Gia Macool",
    handle: "@GiaMMacool",
    url: "https://x.com/GiaMMacool",
  },
  contactEmail: "hello@cooe.fun",
} as const;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://cooe.fun";

export const DISCLAIMER =
  "Cooe provides AI-generated communication perspectives, not professional counseling, diagnosis, legal advice or a prediction of another person's behavior.";

export const PRIVACY_HINT =
  "Personal details aren't required. Describe only what you're comfortable sharing.";
