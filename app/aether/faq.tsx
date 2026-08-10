import Link from "next/link";

const ESSENTIALS = [
  {
    q: "What is Aether?",
    a: "A Shopify theme for independent brands. 41 sections, editor-native.",
  },
  {
    q: "Core or Forever?",
    a: "$85/year with updates, or $105 once with lifetime updates and priority support.",
  },
  {
    q: "Need to code?",
    a: "No. Everything runs in the theme editor. Clean codebase if you want to go further.",
  },
];

export function AetherFaq() {
  return (
    <section className="px-3 py-16 sm:py-24">
      <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))] mb-10 text-center rise rise--liquid">
        FAQ
      </p>
      <div className="max-w-xl mx-auto flex flex-col gap-8 sm:gap-9">
        {ESSENTIALS.map((item, i) => (
          <div
            key={item.q}
            className="rise rise--liquid flex flex-col gap-1.5 text-left sm:text-center"
            style={{ "--rise-delay": `${i * 60}ms` } as React.CSSProperties}
          >
            <p className="text-[16px] sm:text-[17px] font-medium tracking-tight text-[rgb(var(--fg))]">
              {item.q}
            </p>
            <p className="text-[14px] sm:text-[15px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">
              {item.a}
            </p>
          </div>
        ))}
        <Link
          href="/docs?from=aether"
          className="rise rise--liquid inline-flex items-center gap-1.5 text-[14px] sm:text-[15px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors justify-start sm:justify-center"
          style={{ "--rise-delay": "180ms" } as React.CSSProperties}
        >
          Full FAQ in docs
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
            <line x1="3" y1="8" x2="13" y2="8" />
            <polyline points="9 4 13 8 9 12" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
