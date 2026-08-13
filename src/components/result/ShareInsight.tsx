"use client";

import { useEffect, useState } from "react";
import { Button, CopyButton, Modal } from "@/components/shared/ui";
import {
  downloadBlob,
  renderShareCard,
  type ShareLine,
  type ShareRatio,
} from "@/lib/share/card";
import { SITE } from "@/lib/config";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export type ShareInsightProps = {
  mode: string;
  lines: ShareLine[];
  /** The user's own words. Never included unless they opt in. */
  originalMessage?: string;
};

export function ShareInsight({ mode, lines, originalMessage }: ShareInsightProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[13px] text-ink underline decoration-line-strong underline-offset-[5px] transition-colors hover:decoration-ink"
      >
        Share insight
      </button>
      {open && (
        <ShareDialog
          mode={mode}
          lines={lines}
          originalMessage={originalMessage}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function ShareDialog({
  mode,
  lines,
  originalMessage,
  onClose,
}: ShareInsightProps & { onClose: () => void }) {
  const [ratio, setRatio] = useState<ShareRatio>("square");
  const [includeOriginal, setIncludeOriginal] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let url: string | null = null;

    (async () => {
      try {
        const blob = await renderShareCard({
          lines,
          ratio,
          originalMessage:
            includeOriginal && originalMessage ? originalMessage : undefined,
        });
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setPreview(url);
        setError(null);
      } catch {
        if (!cancelled) setError("This browser couldn't render the card.");
      }
    })();

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [lines, ratio, includeOriginal, originalMessage]);

  async function download() {
    setBusy(true);
    try {
      const blob = await renderShareCard({
        lines,
        ratio,
        originalMessage:
          includeOriginal && originalMessage ? originalMessage : undefined,
      });
      downloadBlob(blob, `cooe-${mode}-${ratio}.png`);
      track({ name: "share_card_downloaded", mode });
    } catch {
      setError("Couldn't save the image. Try the copy option instead.");
    } finally {
      setBusy(false);
    }
  }

  const shareText = [
    ...lines.map((line) => `${line.label}: ${line.body}`),
    "",
    `${SITE.domain} — ${SITE.tagline}`,
  ].join("\n");

  return (
    <Modal open onClose={onClose} title="Share this insight">
      <p className="text-[13px] leading-[1.65] text-muted">
        Your original message is left out by default. Only the interpretation is
        on the card.
      </p>

      <div className="mt-6">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Preview of the Cooe share card"
            className="w-full rounded-md border border-line"
          />
        ) : (
          <div className="grid h-40 place-items-center rounded-md border border-line text-[12px] text-faint">
            {error ?? "Rendering…"}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(["square", "landscape"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={ratio === option}
            onClick={() => setRatio(option)}
            className={cn(
              "rounded-full border px-3.5 py-2 text-[12px] leading-none transition-colors",
              ratio === option
                ? "border-ink bg-ink text-paper"
                : "border-line text-muted hover:border-line-strong hover:text-ink",
            )}
          >
            {option === "square" ? "1200 × 1200" : "1200 × 675"}
          </button>
        ))}
      </div>

      {originalMessage && (
        <label className="mt-5 flex cursor-pointer items-start gap-3 text-[13px] text-muted">
          <input
            type="checkbox"
            checked={includeOriginal}
            onChange={(event) => setIncludeOriginal(event.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-[#ff5c16]"
          />
          <span>
            Include my original message on the card.
            <span className="mt-0.5 block text-[12px] text-faint">
              Off by default. Only turn this on if you&rsquo;re happy for it to
              be seen.
            </span>
          </span>
        </label>
      )}

      {error && preview && (
        <p className="mt-4 text-[12px] text-signal-orange">{error}</p>
      )}

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <Button onClick={download} disabled={busy || !preview}>
          {busy ? "Saving…" : "Download image"}
        </Button>
        <CopyButton
          text={shareText}
          label="Copy share text"
          onCopied={() => track({ name: "share_text_copied", mode })}
        />
      </div>
    </Modal>
  );
}
