"use client";

import { PRIVACY_HINT } from "@/lib/config";

export function StudioFrame({
  eyebrow,
  headline,
  children,
  aside,
}: {
  eyebrow: string;
  headline: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 py-10 sm:px-10 sm:py-14 lg:py-16">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-14">
        <div className="min-w-0">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display mt-4 max-w-[18ch] text-balance text-[clamp(2rem,6vw,3.4rem)] text-ink">
            {headline}
          </h1>
          <div className="mt-12 sm:mt-14">{children}</div>
        </div>

        {aside && (
          <aside className="mt-16 border-t border-line pt-8 lg:mt-0 lg:border-0 lg:pt-2">
            {aside}
          </aside>
        )}
      </div>
    </div>
  );
}

export function PrivacyHint() {
  return <p className="text-[11px] leading-[1.6] text-faint">{PRIVACY_HINT}</p>;
}
