/**
 * Turns the raw generated artwork in scripts/raw into shippable assets.
 *
 *   node scripts/process-graphics.mjs
 *
 * The image model renders on Cooe's paper white rather than on transparency,
 * so each asset is un-multiplied against that background to recover a true
 * alpha channel. That makes one file usable on the page, on a share card and
 * inside the OG image without a visible rectangle anywhere. *
 * NOTE: sharp cannot stay in package.json. With Next 16, having sharp
 * installed breaks next/og — every ImageResponse route (icon, apple-icon,
 * opengraph-image) fails with "Input buffer contains unsupported image
 * format". Install it only for the duration of a regeneration:
 *
 *   npm i -D sharp && node scripts/process-graphics.mjs && npm uninstall sharp
 *
 * The processed assets are committed, so this is rarely needed.
 */

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const RAW = path.join(process.cwd(), "scripts", "raw");
const OUT = path.join(process.cwd(), "public", "graphics");

/** The paper the artwork was rendered on. */
const BG = [252, 251, 249];

const TARGETS = [
  { name: "signal-hero", width: 1024, png: 620 },
  { name: "signal-gap", width: 1200 },
  { name: "signal-mark", width: 512, png: 512 },
  { name: "signal-wash", width: 1200 },
];

/**
 * Recovers alpha from an image composited onto a known opaque background.
 * For each pixel, alpha is how far the darkest channel has travelled away
 * from the background; the colour is then un-premultiplied back out.
 */
async function keyOutBackground(file, width) {
  const { data, info } = await sharp(file)
    .resize({ width, withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.alloc(info.width * info.height * 4);
  const cx = info.width / 2;
  const cy = info.height / 2;
  // Feather anything past this fraction of the half-diagonal to nothing, so the
  // asset never shows the edge of its own canvas as a faint rectangle.
  const INNER = 0.84;
  const OUTER = 1.0;

  for (let i = 0; i < data.length; i += 4) {
    const px = (i / 4) % info.width;
    const py = Math.floor(i / 4 / info.width);
    // Normalised so the feather is elliptical and respects the aspect ratio.
    const distance = Math.hypot((px - cx) / cx, (py - cy) / cy);
    const feather =
      distance <= INNER
        ? 1
        : Math.max(0, 1 - (distance - INNER) / (OUTER - INNER));

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // How much darker than the paper is the darkest channel?
    const raw = Math.max(
      0,
      Math.min(
        1,
        Math.max(
          1 - r / BG[0],
          Math.max(1 - g / BG[1], 1 - b / BG[2]),
        ),
      ),
    );

    // Floor out the near-invisible tail — it is what makes the box edge visible.
    const lifted = raw < 0.035 ? 0 : (raw - 0.035) / (1 - 0.035);
    const alpha = lifted * feather;

    if (alpha <= 0.004) {
      out[i] = out[i + 1] = out[i + 2] = out[i + 3] = 0;
      continue;
    }

    // Un-premultiply against the *unfeathered* alpha, so the feather only
    // fades the asset out and never shifts its colour.
    const unmix = (channel, bg) =>
      Math.max(
        0,
        Math.min(255, Math.round((channel - bg * (1 - lifted)) / lifted)),
      );

    out[i] = unmix(r, BG[0]);
    out[i + 1] = unmix(g, BG[1]);
    out[i + 2] = unmix(b, BG[2]);
    out[i + 3] = Math.round(alpha * 255);
  }

  return sharp(out, {
    raw: { width: info.width, height: info.height, channels: 4 },
  });
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });

  for (const target of TARGETS) {
    const source = path.join(RAW, `${target.name}.png`);
    try {
      await fs.access(source);
    } catch {
      console.warn(`skip ${target.name} — no raw file at scripts/raw`);
      continue;
    }

    const keyed = await keyOutBackground(source, target.width);

    const webp = path.join(OUT, `${target.name}.webp`);
    await keyed.clone().webp({ quality: 82, effort: 6, alphaQuality: 90 }).toFile(webp);
    let line = `${target.name}: ${(((await fs.stat(webp)).size / 1024) | 0)}KB webp`;

    // A PNG copy for server-side compositing, where WebP support is patchy.
    if (target.png) {
      const png = path.join(OUT, `${target.name}-flat.png`);
      await keyed
        .clone()
        .resize({ width: target.png, withoutEnlargement: true })
        .png({ compressionLevel: 9, palette: false })
        .toFile(png);
      line += `, ${(((await fs.stat(png)).size / 1024) | 0)}KB png`;
    }

    console.log(line);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
