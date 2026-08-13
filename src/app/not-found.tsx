import Link from "next/link";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { Signal } from "@/components/shared/Signal";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main
        id="main"
        className="relative flex flex-1 items-center px-5 py-24 sm:px-10"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 hidden lg:block"
        >
          <Signal className="h-[360px] w-[360px]" opacity={0.3} sizes="360px" />
        </div>
        <div className="relative mx-auto w-full max-w-[1120px]">
          <p className="eyebrow">404</p>
          <h1 className="display mt-5 max-w-[16ch] text-balance text-[clamp(2rem,6vw,3.4rem)] text-ink">
            Nothing here to decode.
          </h1>
          <p className="mt-6 max-w-[30rem] text-[14px] leading-[1.7] text-muted">
            That page doesn&rsquo;t exist. The message you were going to check
            probably still does.
          </p>
          <Link
            href="/studio/check"
            className="group mt-9 inline-flex items-center gap-2.5 rounded-md bg-ink px-6 py-3.5 text-[13px] leading-none text-paper transition-colors duration-300 hover:bg-[#2a2420]"
          >
            Check a message
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
