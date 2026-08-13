# Cooe — Launch kit

Everything needed to submit or write about Cooe. Copy is final and factual —
nothing here claims users, funding, traction, or partnerships that don't exist.

---

## The essentials

| Field | Value |
| --- | --- |
| Name | Cooe |
| Wordmark | always lowercase — `cooe` |
| URL | https://cooe.fun |
| Tagline | See what they hear. |
| Category | AI · communication · productivity |
| Pricing | Free during beta. No account. |
| Future model | Pay as you go, USDC / SOL on Solana. Not live. |
| Founder | Gia Macool — [@GiaMMacool](https://x.com/GiaMMacool) |
| Status | Public beta |

---

## Descriptions

**One line (60 chars)**
> AI rehearsal for conversations that matter.

**Short (140 chars)**
> You know what you mean. Cooe shows you what they might hear — then gives you
> a better way to say it. Free, no account.

**Medium (280 chars)**
> Cooe is an AI rehearsal studio for real conversations. Paste a message before
> you send it and see how it may land, map a disagreement that keeps looping,
> practise a hard conversation against a plausible counterpart, or build a
> repair after it went wrong. No account, free during beta.

**Long**
> Most communication advice tells you to be clearer. That isn't the hard part.
> The hard part is that you can only hear your own message from inside your own
> intention — you already know what you meant, so the wording always sounds
> fine.
>
> Cooe reads it from the other chair. Paste a message and it shows you what you
> mean, what the other person might hear, and the specific gap between them —
> then quotes the exact phrases causing friction and rewrites the message three
> ways in your own voice. Every analysis ends with the single highest-leverage
> change.
>
> Four modes: **Check** a message before you send it. **Map** a situation that
> has gone in circles. **Rehearse** the conversation against a plausible
> counterpart and get a debrief. **Repair** one that already went wrong.
>
> Cooe never claims to know what another person thinks, never diagnoses anyone,
> and won't help you pressure someone. It's a communication tool, not therapy.
> There are no accounts and nothing to sign up for.

---

## Why it's different

- **It explains before it rewrites.** Most tools hand you a polished paragraph.
  Cooe first shows you *why* your version lands the way it does, quoting your
  actual words.
- **It keeps your voice.** Rewrites are sendable as-is from the same person on
  the same platform. No therapy-speak, no HR language.
- **It's honest about its limits.** Signal scores are labelled AI estimates,
  not measurements. Perspectives are framed as possibilities, never as facts
  about another person.
- **Zero friction.** No sign-up, no card, no onboarding. A reviewer can get a
  real result in about 30 seconds via "Try an example".
- **It's narrow on purpose.** Four modes. No feed, no streaks, no dashboard.

---

## 60-second reviewer path

1. Open **https://cooe.fun** — the hero states the product in one line.
2. Click **Try an example** → lands on `/studio/check` pre-filled with a real
   scenario (a cancelled dinner, a sarcastic reply).
3. Click **See what they hear** → a full Cooe Mirror in ~15 seconds.
4. Read **the gap**, the four signals, the friction phrases, three rewrites,
   and **If you only change one thing**.
5. Click **Share insight** → download a share card. Note the original message
   is excluded by default.
6. Try **Rehearse** → **Try an example** → **Start rehearsal**, send one line,
   then **Coach me** and **End rehearsal** for a debrief.
7. **Pricing**, **Privacy**, **Terms** are all real pages, not placeholders.

No account is required at any step.

---

## Assets

```
orynth/screenshots/
  01-hero-desktop.png     homepage hero, 1440
  02-the-gap.png          the gap section
  03-check-input.png      Check studio, example loaded
  04-loading.png          branded analysing state
  05-check-result.png     full Cooe Mirror result
  06-hero-mobile.png      homepage, 390
  07-rehearse.png         live rehearsal with coaching

public/brand/
  cooe-lockup.svg         mark + wordmark + tagline
  cooe-wordmark.svg       wordmark only
  cooe-mark.svg           mark only (vector)
  cooe-og.png             1200 × 630 social card
  cooe-icon-180.png       app icon
  cooe-icon-64.png        favicon

public/graphics/
  signal-*.webp           the Signal artwork, alpha-keyed
```

Live OG image: `https://cooe.fun/opengraph-image`

---

## Brand

**Colour**

| Token | Hex | Use |
| --- | --- | --- |
| Paper | `#fcfbf9` | Background. Cooe is light-only |
| Ink | `#14110f` | Primary type |
| Muted | `#6f6862` | Secondary type |
| Line | `#e8e2db` | Rules and borders |
| Signal orange | `#ff5c16` | The accent. Used sparingly |
| Signal coral | `#ff8a5c` | Artwork midtone |
| Signal pink | `#ffb7c9` | Artwork falloff |

**Type** — Instrument Serif for editorial statements, Inter for product text.

**The Signal** — the orange-to-pink colour field is Cooe's only visual object.
It stands for communication moving from emotion into clarity, and separates
into two overlapping fields on a result: what you mean, and what they hear.

**Wordmark** — always lowercase `cooe`, never capitalised, never all-caps.

---

## Safety and claims

Cooe states in-product that it provides AI-generated communication
perspectives — **not** counselling, diagnosis, legal advice, or a prediction of
another person's behaviour. The system prompt forbids diagnosing mental health
conditions or attachment styles, labelling people, and assisting with coercion,
manipulation, monitoring or retaliation. When input suggests danger, the model
is instructed to prioritise safety over wording.

Communication signals are presented as *AI estimates*, never as measurements.

---

## Business model

Free during beta, with no account and no card.

The intended model is **pay as you go — no subscription**, priced per AI
action, settled in USDC or SOL on Solana. This is **not live**: there is no
checkout, no wallet connection, and no payment processing in the product. The
codebase carries a `PaymentProvider` interface and a
`CRYPTO_PAYMENTS_ENABLED` flag so it can be enabled without reshaping the
product, and `/pricing` says plainly that checkout is coming soon.

---

## Contact

Gia Macool — [@GiaMMacool](https://x.com/GiaMMacool) · hello@cooe.fun
