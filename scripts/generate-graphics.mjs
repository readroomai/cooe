/**
 * Generates Cooe's brand imagery with the OpenAI image API.
 *
 *   node scripts/generate-graphics.mjs [name ...]
 *
 * Raw output lands in scripts/raw. Run scripts/process-graphics.mjs afterwards
 * to key out the background and emit the shippable assets in public/graphics.
 * Re-running overwrites, so the set is reproducible. Requires OPENAI_API_KEY.
 *
 * Assets are rendered on Cooe's warm off-white (#fcfbf9) rather than on
 * transparency, and composited in the UI with `mix-blend-mode: multiply`.
 * On a paper-coloured page that drops the background out cleanly and keeps
 * the soft edges intact, which an alpha matte tends to harden.
 */

import fs from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";

const OUT = path.join(process.cwd(), "scripts", "raw");
const MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";

/** Shared aesthetic contract — keeps every asset in one visual system. */
const HOUSE = `Abstract soft-focus colour field. Palette strictly: vivid warm orange #ff5c16, warm coral #ff8a5c, soft pink #ffb7c9, fading to warm off-white #fcfbf9. Heavy gaussian softness, organic irregular edges, subtle analogue film grain. Editorial, restrained, expensive, quiet. Absolutely no text, no letters, no numbers, no logos, no watermark, no objects, no people, no faces, no robots, no hands, no icons, no sparkles, no stars, no lens flare, no 3D rendered sphere, no glossy plastic ball, no hard specular highlight, no neon, no purple, no blue, no green, no dark background, no vignette, no border, no frame.`;

const ASSETS = [
  {
    name: "signal-hero",
    size: "1024x1024",
    prompt: `${HOUSE} A single large organic luminous field, roughly circular but irregular and hand-made, densest and most saturated orange just above centre, bleeding outward through coral into a soft pink lower bloom, dissolving completely to nothing at the edges. It should feel like warm light diffusing through paper, not like a rendered ball. The background is a completely flat, even, solid warm off-white #fcfbf9 filling the entire frame edge to edge, with the colour field floating in it and melting into it.`,
  },
  {
    name: "signal-gap",
    size: "1536x1024",
    prompt: `${HOUSE} Two separate soft luminous fields drifting apart, overlapping slightly in the middle where they mix. The left field is warm orange, the right field is soft pink. The overlap is where they blend into coral. Wide horizontal composition, enormous empty space, both fields dissolving to nothing at the edges. The background is a completely flat, even, solid warm off-white #fcfbf9 filling the entire frame edge to edge, with the colour field floating in it and melting into it.`,
  },
  {
    name: "signal-mark",
    size: "1024x1024",
    prompt: `${HOUSE} A small dense concentrated orb of warm orange light with a soft coral and pink halo falling away quickly. Tighter and more contained than a diffuse cloud, centred, symmetrical enough to read as a mark at small size, but with organic irregular edges and grain. The background is a completely flat, even, solid warm off-white #fcfbf9 filling the entire frame edge to edge, with the colour field floating in it and melting into it.`,
  },
  {
    name: "signal-wash",
    size: "1536x1024",
    prompt: `${HOUSE} An extremely faint wide horizontal wash of warm colour, like the last of the light on a wall. Very low intensity, mostly empty, a slow orange-to-pink drift across the frame, dissolving to nothing top and bottom. Almost subliminal. The background is a completely flat, even, solid warm off-white #fcfbf9 filling the entire frame edge to edge, with the colour field floating in it and melting into it.`,
  },
];

async function main() {
  const only = process.argv.slice(2);
  const targets = only.length
    ? ASSETS.filter((asset) => only.includes(asset.name))
    : ASSETS;

  if (targets.length === 0) {
    console.error(`No matching assets. Available: ${ASSETS.map((a) => a.name).join(", ")}`);
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set.");
    process.exit(1);
  }

  await fs.mkdir(OUT, { recursive: true });
  const client = new OpenAI({ timeout: 300_000 });

  for (const asset of targets) {
    process.stdout.write(`→ ${asset.name} (${asset.size})… `);
    const response = await client.images.generate({
      model: MODEL,
      prompt: asset.prompt,
      size: asset.size,
      output_format: "png",
      quality: "high",
      n: 1,
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) throw new Error(`No image returned for ${asset.name}`);

    const file = path.join(OUT, `${asset.name}.png`);
    await fs.writeFile(file, Buffer.from(b64, "base64"));
    console.log(`saved ${path.relative(process.cwd(), file)}`);
  }
}

main().catch((error) => {
  console.error(error?.message ?? error);
  process.exit(1);
});
