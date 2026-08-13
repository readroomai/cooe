import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The Cooe logo: the two-field mark plus the lowercase wordmark. The mark is
 * the product idea in one object — a defined orange field and a soft, less
 * certain pink one, overlapping.
 */
function Mark({ size = 18 }: { size?: number }) {
  return (
    <Image
      src="/graphics/signal-mark.webp"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      sizes={`${size * 2}px`}
      priority
      className="shrink-0 select-none"
      draggable={false}
    />
  );
}

export function Wordmark({
  className,
  href = "/",
  as = "link",
  showMark = true,
  markSize = 18,
}: {
  className?: string;
  href?: string;
  as?: "link" | "text";
  showMark?: boolean;
  markSize?: number;
}) {
  const content = (
    <>
      {showMark && <Mark size={markSize} />}
      <span>cooe</span>
    </>
  );

  const classes = cn(
    "inline-flex items-center gap-2 text-[15px] lowercase leading-none tracking-[-0.02em] text-ink",
    className,
  );

  if (as === "text") {
    return <span className={classes}>{content}</span>;
  }

  return (
    <Link
      href={href}
      className={cn(classes, "transition-opacity hover:opacity-60")}
    >
      {content}
      <span className="sr-only"> — home</span>
    </Link>
  );
}
