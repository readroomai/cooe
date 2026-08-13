import Image from "next/image";
import { cn } from "@/lib/utils";

export type SignalState = "idle" | "typing" | "analyzing" | "result";
export type SignalVariant = "orb" | "gap" | "wash";

const SOURCES: Record<SignalVariant, { src: string; w: number; h: number }> = {
  orb: { src: "/graphics/signal-hero.webp", w: 1024, h: 1024 },
  gap: { src: "/graphics/signal-gap.webp", w: 1200, h: 800 },
  wash: { src: "/graphics/signal-wash.webp", w: 1200, h: 800 },
};

type SignalProps = {
  state?: SignalState;
  variant?: SignalVariant;
  className?: string;
  opacity?: number;
  /** Only the hero orb should preload; everything else is decoration. */
  priority?: boolean;
  sizes?: string;
};

/**
 * "The Signal" — Cooe's one visual object: a warm colour field moving from
 * emotion into clarity. On `result` it becomes two overlapping fields, one for
 * what you mean and one for what they hear.
 */
export function Signal({
  state = "idle",
  variant = "orb",
  className,
  opacity = 1,
  priority = false,
  sizes = "(max-width: 640px) 60vw, 600px",
}: SignalProps) {
  const source = SOURCES[state === "result" && variant === "orb" ? "gap" : variant];

  return (
    <div
      className={cn("signal-root", className)}
      data-state={state}
      aria-hidden="true"
      style={{ opacity }}
    >
      <Image
        src={source.src}
        alt=""
        width={source.w}
        height={source.h}
        sizes={sizes}
        priority={priority}
        aria-hidden="true"
        className="signal-image"
        draggable={false}
      />
    </div>
  );
}
