# Cooe

**See what they hear.** AI rehearsal for conversations that matter.

You know what you mean. Cooe shows you what someone else might hear — the gap
between your intention and the message you're about to send — and gives you
something concrete to say instead.

Live at [cooe.fun](https://cooe.fun). No account, free during beta.

---

## What it does

Four focused modes, all server-side AI, all usable without signing in:

| Mode | Route | For |
| --- | --- | --- |
| **Check** | `/studio/check` | One message, before you send it |
| **Map** | `/studio/map` | A situation that has gone in circles |
| **Rehearse** | `/studio/rehearse` | Practising the conversation, with a debrief |
| **Repair** | `/studio/repair` | After it already went wrong |

The flagship output is **the Cooe Mirror**: what you mean → what they might
hear → the gap → four heuristic communication signals → the exact phrases
causing friction → three rewrites (clear / warm / firm) → the single
highest-leverage change.

### What it deliberately does not do

No accounts, no database, no diagnosis of people, no claims about what another
person actually thinks, and no help pressuring anyone. These are enforced in
the system prompt (`src/lib/prompts/system.ts`) and stated in the product UI.

---

## Stack

- **Next.js 16** (App Router, React 19, Turbopack)
- **TypeScript**, strict
- **Tailwind CSS v4** — design tokens in `src/app/globals.css`
- **Motion** for result reveals
- **Zod v4** for request validation *and* model-output validation
- **OpenAI** or **Anthropic** SDK — provider-agnostic, one key required

No auth library, no ORM, no analytics vendor, no wallet SDK.

---

## Setup

```bash
npm install
cp .env.example .env.local   # add one AI provider key
npm run dev
```

Open http://localhost:3000.

### Environment

| Variable | Required | Notes |
| --- | --- | --- |
| `AI_PROVIDER` | no | `openai` or `anthropic`. If unset, inferred from whichever key is present |
| `OPENAI_API_KEY` | one of | |
| `OPENAI_MODEL` | no | Defaults to `gpt-5.5` |
| `ANTHROPIC_API_KEY` | one of | |
| `ANTHROPIC_MODEL` | no | Defaults to `claude-sonnet-5` |
| `NEXT_PUBLIC_SITE_URL` | no | Canonical/sitemap/OG base. Defaults to `https://cooe.fun` |
| `CRYPTO_PAYMENTS_ENABLED` | no | Feature flag, `false`. Nothing is wired behind it yet |

Provider keys are **server-only**. They are read inside route handlers and
`src/lib/ai/*`, which is marked `server-only` so it can never be pulled into a
client bundle.

### Commands

```bash
npm run dev        # dev server
npm run build      # production build
npm run start      # serve the build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

---

## AI architecture

```
route handler  →  Zod input schema  →  prompt builder  →  provider call
                                                              ↓
UI  ←  Zod result schema (validated)  ←  structured JSON  ←  ─┘
```

- `src/lib/ai/client.ts` — provider dispatch. OpenAI uses strict
  `json_schema` structured outputs; Anthropic uses forced tool use. Both paths
  return the same validated shape.
- `src/lib/ai/json-schema.ts` — converts a Zod schema into the strict-mode
  subset providers accept (every property required, no extra properties, no
  validation keywords). Content rules are re-applied by Zod afterwards.
- `src/lib/prompts/system.ts` — the shared voice and safety contract.
- `src/lib/prompts/modes.ts` — per-mode instructions and prompt builders.
- `src/lib/schemas/` — `input.ts` (what users may send, with size limits) and
  `result.ts` (what the model must return).

Result schemas are lenient on length and slice over-long arrays, so a verbose
model never produces a user-facing error. Shape, however, is guaranteed — the
UI can't render a hole.

### Endpoints

- `POST /api/analyze` — `{ mode: "check" | "map" | "repair", ... }`
- `POST /api/rehearse` — `{ action: "start" | "reply" | "coach" | "debrief", setup, transcript }`

Both cap body size, validate with Zod, and funnel every failure through
`src/lib/api-response.ts` so users see plain language while the server logs the
real error.

---

## Privacy architecture

- **No accounts, no user table, no session cookie.** Nothing to leak.
- **Nothing is persisted server-side.** Requests are analysed and discarded;
  Cooe has no database.
- **Input reaches the AI provider.** It has to — that is how the product
  works. `/privacy` says this plainly rather than claiming false guarantees.
- **Recent sessions live in `localStorage`,** capped at 5
  (`src/lib/storage/history.ts`). Read via `useSyncExternalStore`. It is never
  described to users as an account.
- **Share cards exclude the original message by default.** Including it is an
  explicit opt-in checkbox.
- **No third-party scripts.** `src/lib/analytics.ts` is a typed no-op seam for
  connecting a cookieless provider later.

---

## Payments

Cooe is free during beta and **no payment processing exists**. There is no
wallet dependency, no checkout, and no fake transaction anywhere.

`src/lib/payments/provider.ts` defines a `PaymentProvider` interface and ships
one honest implementation (`DisabledPaymentProvider`) that reports
unavailability. The intended model is pay-as-you-go in USDC/SOL on Solana. To
enable it later: implement the interface, resolve it in `getPaymentProvider()`
behind `CRYPTO_PAYMENTS_ENABLED`, and update `/pricing`.

---

## Brand graphics

The Signal artwork in `public/graphics/` is generated, then keyed to
transparency so one asset works on the page, on a canvas share card, and inside
the OG image.

```bash
npm i -D sharp                       # see the caveat below
node scripts/generate-graphics.mjs   # → scripts/raw/*.png (needs OPENAI_API_KEY)
node scripts/process-graphics.mjs    # → public/graphics/*.webp
npm uninstall sharp
```

> **sharp cannot stay installed.** With Next 16, a resolvable `sharp` breaks
> `next/og`: every `ImageResponse` route (`/icon`, `/apple-icon`,
> `/opengraph-image`) fails with *"Input buffer contains unsupported image
> format"*. Install it only while regenerating. The processed assets are
> committed, so this is rare.

Midjourney or any other source works too — drop a PNG rendered on `#fcfbf9`
into `scripts/raw/` under the matching name and run the process step.

---

## Project structure

```
src/
  app/
    page.tsx                 homepage
    studio/[mode]/           check · map · rehearse · repair
    api/analyze/route.ts     check · map · repair
    api/rehearse/route.ts    roleplay · coaching · debrief
    about|pricing|privacy|terms/
    opengraph-image.tsx      programmatic OG (inlines the Signal)
    icon|apple-icon|manifest|sitemap|robots
  components/
    home/                    hero, gap, how it works, modes, demo, beta, founder
    studio/                  nav, frame, four studios, states, recent list
    result/                  check/map/repair views, share card dialog
    shared/                  Signal, header, footer, page shell, UI primitives
  lib/
    ai/                      provider client, JSON-schema normaliser, runners
    prompts/                 system contract + per-mode instructions
    schemas/                 input and result validation
    storage/                 localStorage history
    payments/                provider abstraction (disabled)
    share/                   canvas share-card renderer
scripts/                     brand graphics generation + processing
orynth/                      launch kit and product screenshots
public/graphics/             the Signal artwork
public/brand/                logo files
```

---

## Deployment

Any Node host running Next 16. Vercel is the path of least resistance:

1. Import the repo.
2. Set `OPENAI_API_KEY` (or `ANTHROPIC_API_KEY`) and `NEXT_PUBLIC_SITE_URL`.
3. Deploy, then point `cooe.fun` at it.

Both API routes run on the Node runtime with `maxDuration = 60`, which suits a
reasoning-model call. Nothing else needs configuring — there is no database,
no queue, and no cron.

---

## Design

Warm off-white paper, near-black type, one orange/coral/pink colour field.
Instrument Serif for editorial statements, Inter for product text. Thin rules
instead of cards, almost no shadow, slow motion, light-only by design. The
reference point is an independent editorial portfolio, not a SaaS template.

---

Built by [Gia Macool](https://x.com/GiaMMacool).
