import Link from "next/link";

const MODES = [
  { href: "/studio/check", label: "Check", note: "Before you send it." },
  {
    href: "/studio/map",
    label: "Map",
    note: "When the problem is bigger than one message.",
  },
  { href: "/studio/rehearse", label: "Rehearse", note: "Practice the conversation." },
  { href: "/studio/repair", label: "Repair", note: "When it already went wrong." },
];

export function Modes() {
  return (
    <section className="border-t border-line px-5 py-20 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-[1120px]">
        <p className="eyebrow">Four ways in</p>

        <ul className="mt-12 grid gap-px border-t border-line sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {MODES.map((mode) => (
            <li key={mode.href} className="border-b border-line lg:border-b-0">
              <Link
                href={mode.href}
                className="group flex h-full flex-col justify-between gap-8 py-8 pr-6 transition-colors lg:min-h-[15rem] lg:py-10"
              >
                <span className="display text-[clamp(1.8rem,4.4vw,2.5rem)] text-ink transition-colors duration-300 group-hover:text-signal-orange">
                  {mode.label}
                </span>
                <span className="flex items-end justify-between gap-4">
                  <span className="max-w-[15rem] text-[13px] leading-[1.6] text-muted">
                    {mode.note}
                  </span>
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-[13px] text-faint transition-all duration-300 group-hover:translate-x-1 group-hover:text-ink"
                  >
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
