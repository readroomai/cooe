"use client";

import { SITE } from "@/lib/config";

export type ShareRatio = "square" | "landscape";

export type ShareLine = { label: string; body: string; accent?: boolean };

export type ShareCardOptions = {
  lines: ShareLine[];
  ratio: ShareRatio;
  /** Only ever set when the user explicitly opts in. */
  originalMessage?: string;
};

const DIMENSIONS: Record<ShareRatio, { w: number; h: number }> = {
  square: { w: 1200, h: 1200 },
  landscape: { w: 1200, h: 675 },
};

const PAPER = "#fcfbf9";
const INK = "#14110f";
const MUTED = "#6f6862";
const FAINT = "#9a938c";
const LINE = "#e8e2db";
const ORANGE = "#ff5c16";

/**
 * next/font mangles family names, so read the real ones off the document
 * rather than guessing. Falls back to generics if the probe fails.
 */
function resolveFonts() {
  if (typeof document === "undefined") {
    return { serif: "Georgia, serif", sans: "system-ui, sans-serif" };
  }
  const probe = document.createElement("span");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  document.body.appendChild(probe);

  probe.className = "serif";
  const serif = getComputedStyle(probe).fontFamily || "Georgia, serif";
  probe.className = "";
  const sans = getComputedStyle(probe).fontFamily || "system-ui, sans-serif";

  probe.remove();
  return { serif, sans };
}

function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

const SIGNAL_SRC = "/graphics/signal-hero.webp";
let signalPromise: Promise<HTMLImageElement | null> | null = null;

/** The real Signal artwork, so a share card looks like the product. */
function loadSignal(): Promise<HTMLImageElement | null> {
  if (!signalPromise) {
    signalPromise = new Promise((resolve) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = SIGNAL_SRC;
    });
  }
  return signalPromise;
}

/** Fallback if the artwork can't load — the card still ships on brand. */
function drawSignalFallback(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
) {
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  gradient.addColorStop(0, "rgba(255,77,5,0.9)");
  gradient.addColorStop(0.45, "rgba(255,138,92,0.45)");
  gradient.addColorStop(0.75, "rgba(255,183,201,0.22)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

export async function renderShareCard(
  options: ShareCardOptions,
): Promise<Blob> {
  const { w, h } = DIMENSIONS[options.ratio];
  const { serif, sans } = resolveFonts();

  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await document.fonts.ready;
    } catch {
      /* fonts are a nicety, not a blocker */
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable in this browser.");

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);

  const pad = options.ratio === "square" ? 96 : 80;
  const contentWidth = w - pad * 2;

  // Signal, bleeding off the top-right corner.
  const signal = await loadSignal();
  const orb = options.ratio === "square" ? 560 : 460;
  const orbX = w - orb * 0.62;
  const orbY = -orb * 0.34;

  ctx.save();
  ctx.globalAlpha = 0.92;
  if (signal) {
    ctx.drawImage(signal, orbX, orbY, orb, orb);
  } else {
    drawSignalFallback(ctx, orbX + orb / 2, orbY + orb / 2, orb / 2);
  }
  ctx.restore();

  // Wordmark
  ctx.fillStyle = INK;
  ctx.font = `400 ${options.ratio === "square" ? 30 : 26}px ${sans}`;
  ctx.textBaseline = "top";
  ctx.fillText("cooe", pad, pad);

  let y = pad + (options.ratio === "square" ? 190 : 130);

  const bodySize = options.ratio === "square" ? 52 : 40;
  const labelSize = options.ratio === "square" ? 19 : 16;

  for (const line of options.lines) {
    ctx.fillStyle = FAINT;
    ctx.font = `500 ${labelSize}px ${sans}`;
    ctx.fillText(line.label.toUpperCase(), pad, y);
    y += labelSize + (options.ratio === "square" ? 24 : 18);

    ctx.fillStyle = line.accent ? ORANGE : INK;
    ctx.font = `400 ${bodySize}px ${serif}`;
    const wrapped = wrap(ctx, line.body, contentWidth);
    const lineHeight = bodySize * 1.22;

    for (const text of wrapped) {
      ctx.fillText(text, pad, y);
      y += lineHeight;
    }

    y += options.ratio === "square" ? 52 : 34;
  }

  if (options.originalMessage) {
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(w - pad, y);
    ctx.stroke();
    y += options.ratio === "square" ? 36 : 26;

    ctx.fillStyle = FAINT;
    ctx.font = `500 ${labelSize}px ${sans}`;
    ctx.fillText("THE ORIGINAL", pad, y);
    y += labelSize + 18;

    ctx.fillStyle = MUTED;
    const quoteSize = options.ratio === "square" ? 28 : 24;
    ctx.font = `400 ${quoteSize}px ${sans}`;
    for (const text of wrap(ctx, `“${options.originalMessage}”`, contentWidth).slice(0, 4)) {
      ctx.fillText(text, pad, y);
      y += quoteSize * 1.45;
    }
  }

  // Footer
  const footerY = h - pad - (options.ratio === "square" ? 46 : 40);
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, footerY - (options.ratio === "square" ? 34 : 26));
  ctx.lineTo(w - pad, footerY - (options.ratio === "square" ? 34 : 26));
  ctx.stroke();

  ctx.fillStyle = INK;
  ctx.font = `400 ${options.ratio === "square" ? 24 : 21}px ${sans}`;
  ctx.fillText(SITE.domain, pad, footerY);

  ctx.fillStyle = FAINT;
  const tagline = SITE.tagline;
  const taglineWidth = ctx.measureText(tagline).width;
  ctx.fillText(tagline, w - pad - taglineWidth, footerY);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Could not render the card.")),
      "image/png",
    );
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
