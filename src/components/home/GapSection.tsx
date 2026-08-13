import { Signal } from "@/components/shared/Signal";

export function GapSection() {
  return (
    <section className="relative overflow-hidden border-t border-line px-5 py-20 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-[1120px]">
        <p className="eyebrow">The gap</p>

        <h2 className="display mt-6 max-w-[22ch] text-balance text-[clamp(1.9rem,5.2vw,3.5rem)] text-ink">
          The hardest part isn&rsquo;t knowing what you feel. It&rsquo;s getting
          it across.
        </h2>

        <div className="relative mt-16 grid gap-10 sm:mt-24 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-6">
          {/* Two fields, drifting apart — the section's argument, made visible. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[-8%] top-1/2 -z-10 -translate-y-1/2"
          >
            <Signal
              variant="gap"
              className="h-[380px] w-full sm:h-[440px]"
              opacity={0.36}
              sizes="(max-width: 640px) 110vw, 1200px"
            />
          </div>

          <figure className="sm:pr-8">
            <figcaption className="eyebrow">What you mean</figcaption>
            <blockquote className="serif mt-4 text-[clamp(1.3rem,3.4vw,1.9rem)] leading-[1.28] text-ink">
              &ldquo;I&rsquo;m hurt this keeps happening.&rdquo;
            </blockquote>
          </figure>

          <div className="relative flex items-center justify-center py-2 sm:h-full sm:w-[180px] sm:py-0">
            <div className="relative text-center">
              <span className="block text-[13px] lowercase tracking-[-0.02em] text-ink">
                cooe
              </span>
              <span className="mt-1 block text-[12px] text-muted">
                Finds the gap.
              </span>
            </div>
          </div>

          <figure className="sm:border-l sm:border-line sm:pl-8">
            <figcaption className="eyebrow">What they might hear</figcaption>
            <blockquote className="serif mt-4 text-[clamp(1.3rem,3.4vw,1.9rem)] leading-[1.28] text-muted">
              &ldquo;You&rsquo;re failing again.&rdquo;
            </blockquote>
          </figure>
        </div>
      </div>
    </section>
  );
}
