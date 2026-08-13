/**
 * Analytics seam.
 *
 * Cooe ships with no analytics provider connected and no third-party scripts.
 * Product events are funnelled through `track` so a privacy-friendly,
 * cookieless provider (Plausible, Fathom, Umami…) can be wired up in one place
 * later. Never pass user-written text through here.
 */

export type CooeEvent =
  | { name: "analysis_started"; mode: "check" | "map" | "repair" }
  | { name: "analysis_completed"; mode: "check" | "map" | "repair" }
  | { name: "analysis_failed"; mode: "check" | "map" | "repair"; code: string }
  | { name: "example_loaded"; mode: string }
  | { name: "alternative_copied"; tone: string }
  | { name: "rehearsal_started" }
  | { name: "rehearsal_debriefed"; turns: number }
  | { name: "share_card_downloaded"; mode: string }
  | { name: "share_text_copied"; mode: string };

export function track(event: CooeEvent): void {
  if (process.env.NODE_ENV === "development") {
    console.debug("[cooe:event]", event.name, event);
  }
  // Connect a privacy-friendly analytics provider here.
}
