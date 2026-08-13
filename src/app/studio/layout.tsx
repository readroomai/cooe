import Link from "next/link";
import { StudioRail, StudioBottomNav } from "@/components/studio/StudioNav";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col lg:flex-row">
      <StudioRail />

      {/* Compact header for small screens; the rail replaces it from lg up. */}
      <div className="flex items-center justify-between border-b border-line px-5 py-4 lg:hidden">
        <Link
          href="/"
          className="text-[15px] lowercase leading-none tracking-[-0.02em] text-ink"
        >
          cooe
        </Link>
        <span className="text-[11px] text-faint">Free beta</span>
      </div>

      <main
        id="main"
        className="min-w-0 flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0"
      >
        {children}
      </main>

      <StudioBottomNav />
    </div>
  );
}
