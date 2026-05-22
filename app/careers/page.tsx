import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Careers",
  description: "We build things that matter. Join us.",
};

function GridRule() {
  return <div className="grid-rule" aria-hidden="true" />;
}

const VALUES = [
  {
    num: "01",
    title: "Craft over output",
    body: "We care about what we ship, not how fast we ship it. Every detail is a decision.",
  },
  {
    num: "02",
    title: "Small on purpose",
    body: "We stay lean. Fewer people means more ownership, more trust, and better work.",
  },
  {
    num: "03",
    title: "Builders first",
    body: "Everyone here makes things. No passengers. No layers between idea and execution.",
  },
  {
    num: "04",
    title: "Async by default",
    body: "We respect each other's time. Work happens in writing, not in meetings.",
  },
];

const OPENINGS = [
  {
    title: "Shopify Developer",
    type: "Contract",
    location: "Remote",
    desc: "You know Liquid inside out. You've shipped real stores and care about performance as much as design. Aether is the product, and you'd be shaping it.",
  },
  {
    title: "Frontend Engineer",
    type: "Full-time",
    location: "Remote",
    desc: "React, TypeScript, and Tailwind are your daily tools. You have strong opinions about UI quality and can translate design into code that feels right.",
  },
];

export default function CareersPage() {
  return (
    <main className="page-container mx-3 sm:mx-auto w-auto sm:w-full max-w-6xl min-h-screen flex flex-col">

      <div className="px-6 sm:px-8 py-5 rise">
        <Link href="/" className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] tracking-tight transition-opacity hover:opacity-70" style={{ border: "1px solid rgb(var(--fg) / 0.25)", color: "rgb(var(--fg))" }}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" aria-hidden="true"><path d="M10 3L5 8l5 5" /></svg>
          Home
        </Link>
      </div>

      <GridRule />

      <section className="flex flex-col items-center text-center px-6 sm:px-8 pt-14 pb-12 rise">
        <h1 className="text-[clamp(2.4rem,7vw,5rem)] font-normal tracking-[-0.04em] leading-none text-[rgb(var(--fg))] mb-5 max-w-2xl">
          Build things that matter.
        </h1>
        <p className="text-[1rem] leading-[1.7] tracking-tight text-[rgb(var(--muted))] max-w-sm">
          Inertia is a small team. We make Shopify themes, design systems, and digital products that real businesses depend on. We hire rarely and deliberately.
        </p>
      </section>

      <GridRule />

      <p className="text-[clamp(2rem,5vw,3rem)] font-normal tracking-tight text-center text-[rgb(var(--muted))] py-6 sm:py-8 px-6 sm:px-8 rise leading-snug">
        How we <span className="inline-block" style={{ background: "rgb(60,100,255)", color: "#fff", padding: "0.05em 0.25em 0.1em", borderRadius: "6px" }}>work</span> together
      </p>

      <GridRule />

      <div className="grid grid-cols-2 sm:grid-cols-4">
        {VALUES.map((v, i) => (
          <div
            key={v.title}
            className="flex flex-col gap-4 px-5 sm:px-8 pt-7 pb-7 rise"
            style={{
              borderLeft: i % 2 !== 0 || i >= 2 ? "1px solid rgb(var(--line))" : undefined,
              borderTop: i >= 2 ? "1px solid rgb(var(--line))" : undefined,
              ["--rise-delay" as any]: `${i * 60}ms`,
            }}
          >
            <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-30 tabular-nums">{v.num}</span>
            <div className="flex flex-col gap-1.5">
              <span className="text-[13.5px] font-medium tracking-tight text-[rgb(var(--fg))]">{v.title}</span>
              <span className="text-[12px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">{v.body}</span>
            </div>
          </div>
        ))}
      </div>

      <GridRule />

      <p className="text-[clamp(2rem,5vw,3rem)] font-normal tracking-tight text-center text-[rgb(var(--muted))] py-6 sm:py-8 px-6 sm:px-8 rise leading-snug">
        Open <span className="inline-block" style={{ background: "rgb(60,100,255)", color: "#fff", padding: "0.05em 0.25em 0.1em", borderRadius: "6px" }}>roles</span> right now
      </p>

      <GridRule />

      {OPENINGS.map((role, i) => (
        <div key={role.title}>
          <a
            href={`mailto:aftertonestudiohelp@gmail.com?subject=Application: ${role.title}`}
            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 sm:px-8 py-7 hover:bg-[rgb(var(--line))/0.15] transition-colors rise"
            style={{ ["--rise-delay" as any]: `${i * 60}ms` }}
          >
            <div className="flex flex-col gap-2 max-w-lg">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[16px] font-medium tracking-tight text-[rgb(var(--fg))]">{role.title}</span>
                <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] border border-[rgb(var(--line))] rounded-full px-2.5 pt-[3px] pb-[4px] leading-none">{role.type}</span>
                <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-50">{role.location}</span>
              </div>
              <p className="text-[13px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">{role.desc}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 text-[12px] tracking-tight text-[rgb(var(--muted))] group-hover:text-[rgb(var(--fg))] transition-colors">
              Apply
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 -translate-x-1 group-hover:translate-x-0 transition-transform duration-200" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </div>
          </a>
          <GridRule />
        </div>
      ))}

      <div className="flex flex-col items-center text-center px-6 sm:px-8 py-12 gap-3 rise">
        <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] max-w-sm">
          Don't see a fit? If you do exceptional work and think you belong here, send us a note anyway.
        </p>
        <a
          href="mailto:aftertonestudiohelp@gmail.com?subject=General inquiry"
          className="text-[13px] tracking-tight text-[rgb(var(--fg))] hover:text-[rgb(var(--muted))] transition-colors"
        >
          Get in touch &rarr;
        </a>
      </div>

      <GridRule />

    </main>
  );
}
