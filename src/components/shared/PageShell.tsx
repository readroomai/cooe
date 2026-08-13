import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { Signal } from "./Signal";

export function PageShell({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-24 hidden lg:block"
        >
          <Signal className="h-[380px] w-[380px]" opacity={0.32} sizes="380px" />
        </div>

        <div className="relative mx-auto max-w-[1120px] px-5 py-14 sm:px-10 sm:py-20">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display mt-5 max-w-[18ch] text-balance text-[clamp(2.1rem,6vw,3.6rem)] text-ink">
            {title}
          </h1>
          {lede && (
            <p className="mt-7 max-w-[38rem] text-[15px] leading-[1.72] text-muted">
              {lede}
            </p>
          )}
          <div className="mt-16 max-w-[42rem]">{children}</div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

export function Article({ children }: { children: React.ReactNode }) {
  return <div className="space-y-12">{children}</div>;
}

export function Clause({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line pt-7">
      <h2 className="text-[15px] leading-snug text-ink">{heading}</h2>
      <div className="mt-3.5 space-y-3.5 text-[14px] leading-[1.75] text-muted">
        {children}
      </div>
    </section>
  );
}
