"use client";

import { useSyncExternalStore } from "react";
import {
  clearHistory,
  getHistorySnapshot,
  getServerHistorySnapshot,
  removeHistory,
  subscribeToHistory,
  type HistoryEntry,
} from "@/lib/storage/history";
import { formatWhen } from "@/lib/utils";

const MODE_LABEL: Record<HistoryEntry["mode"], string> = {
  check: "Check",
  map: "Map",
  rehearse: "Rehearse",
  repair: "Repair",
};

/** localStorage is an external store, so read it as one. */
export function useHistory(): HistoryEntry[] {
  return useSyncExternalStore(
    subscribeToHistory,
    getHistorySnapshot,
    getServerHistorySnapshot,
  );
}

export function RecentList({
  onOpen,
  className,
}: {
  onOpen: (entry: HistoryEntry) => void;
  className?: string;
}) {
  const entries = useHistory();

  if (entries.length === 0) {
    return (
      <div className={className}>
        <p className="eyebrow">Recent</p>
        <p className="mt-3 text-[12px] leading-[1.6] text-faint">
          Nothing saved on this device yet.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <p className="eyebrow">Recent</p>
      <ul className="mt-3 space-y-2.5">
        {entries.map((entry) => (
          <li key={entry.id} className="group flex items-start gap-2">
            <button
              type="button"
              onClick={() => onOpen(entry)}
              className="min-w-0 flex-1 text-left"
            >
              <span className="block truncate text-[12px] leading-tight text-ink transition-colors group-hover:text-signal-orange">
                {entry.title}
              </span>
              <span className="mt-0.5 block text-[10px] uppercase tracking-[0.14em] text-faint">
                {MODE_LABEL[entry.mode]} · {formatWhen(entry.at)}
              </span>
            </button>
            <button
              type="button"
              onClick={() => removeHistory(entry.id)}
              aria-label={`Delete ${entry.title}`}
              className="shrink-0 pt-0.5 text-[13px] leading-none text-faint opacity-0 transition-opacity hover:text-signal-orange focus-visible:opacity-100 group-hover:opacity-100"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={clearHistory}
        className="mt-4 text-[11px] text-faint underline underline-offset-4 hover:text-ink"
      >
        Clear history
      </button>
      <p className="mt-2 text-[10px] leading-[1.5] text-faint">
        Saved on this device.
      </p>
    </div>
  );
}
