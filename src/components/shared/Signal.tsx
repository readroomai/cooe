import { cn } from "@/lib/utils";

export type SignalState = "idle" | "typing" | "analyzing" | "result";

type SignalProps = {
  state?: SignalState;
  className?: string;
  /** Blur radius in px. Larger orbs need more. */
  blur?: number;
  opacity?: number;
  grain?: boolean;
};

/**
 * "The Signal" — Cooe's one visual object. Three overlapping organic fields
 * plus grain, so it reads as something warm and slightly imperfect rather
 * than a rendered sphere. On `result` the fields separate into two, standing
 * for what you mean and what they hear.
 */
export function Signal({
  state = "idle",
  className,
  blur = 44,
  opacity = 1,
  grain = true,
}: SignalProps) {
  return (
    <div
      className={cn("signal-root", className)}
      data-state={state}
      aria-hidden="true"
      style={
        {
          opacity,
          "--signal-blur": `${blur}px`,
        } as React.CSSProperties
      }
    >
      <div className="signal-field signal-a" />
      <div className="signal-field signal-b" />
      <div className="signal-field signal-c" />
      {grain && <div className="signal-grain" />}
    </div>
  );
}
