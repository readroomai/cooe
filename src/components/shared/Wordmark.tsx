import Link from "next/link";
import { cn } from "@/lib/utils";

export function Wordmark({
  className,
  href = "/",
  as = "link",
}: {
  className?: string;
  href?: string;
  as?: "link" | "text";
}) {
  const classes = cn(
    "inline-block text-[15px] leading-none tracking-[-0.02em] text-ink lowercase",
    className,
  );

  if (as === "text") {
    return <span className={classes}>cooe</span>;
  }

  return (
    <Link href={href} className={cn(classes, "transition-opacity hover:opacity-60")}>
      cooe
      <span className="sr-only"> — home</span>
    </Link>
  );
}
