const STEPS = [
  {
    n: "01",
    title: "Say it",
    body: "Paste a message or describe what happened.",
  },
  {
    n: "02",
    title: "See it",
    body: "Understand how your words may land.",
  },
  {
    n: "03",
    title: "Rehearse it",
    body: "Try a clearer way before the real conversation.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-line px-5 py-20 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-[1120px]">
        <p className="eyebrow">How it works</p>

        <ol className="mt-12 divide-y divide-line border-t border-line sm:mt-16">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="grid gap-3 py-10 sm:grid-cols-[6rem_1fr_1.1fr] sm:items-baseline sm:gap-8 sm:py-14"
            >
              <span className="serif text-[clamp(1.6rem,4vw,2.4rem)] leading-none text-signal-orange">
                {step.n}
              </span>
              <h3 className="display text-[clamp(1.6rem,4vw,2.6rem)] text-ink">
                {step.title}
              </h3>
              <p className="max-w-[28rem] text-[14px] leading-[1.7] text-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
