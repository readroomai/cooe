import Image from "next/image";
import { SITE } from "@/lib/config";

export function Founder() {
  return (
    <section className="border-t border-line px-5 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-[1120px]">
        <div className="grid gap-12 sm:grid-cols-[minmax(0,300px)_minmax(0,1fr)] sm:items-end sm:gap-16">
          <figure className="order-2 sm:order-1">
            <Image
              src="/graphics/founder.webp"
              alt={`Illustrated portrait of ${SITE.founder.name}`}
              width={900}
              height={1125}
              sizes="(max-width: 640px) 70vw, 300px"
              className="w-[70%] max-w-[300px] rounded-sm sm:w-full"
            />
          </figure>

          <div className="order-1 max-w-[34rem] sm:order-2">
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
      </div>
    </section>
  );
}
