import { SITE } from "@/lib/config";

export function Founder() {
  return (
    <section className="border-t border-line px-5 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-[1120px]">
        <div className="max-w-[36rem]">
          <h2 className="display text-[clamp(1.7rem,4.4vw,2.8rem)] text-ink">
            Built for conversations that matter.
          </h2>
          <p className="mt-6 text-[14px] leading-[1.72] text-muted">
            Cooe is a project by {SITE.founder.name}.
          </p>
          <a
            href={SITE.founder.url}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-3 inline-block text-[14px] text-ink underline decoration-line-strong underline-offset-[5px] transition-colors hover:decoration-ink"
          >
            {SITE.founder.handle} ↗
          </a>
        </div>
      </div>
    </section>
  );
}
