import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers",
  description: "A small studio that stays small on purpose. Craft over output, async by default, no layers between idea and execution. See open roles at Inertia.",
};

const VALUES = [
  { num: "01", title: "Craft over output",    body: "We care about what we ship, not how fast we ship it. Every detail is a decision." },
  { num: "02", title: "Small on purpose",     body: "We stay lean. Fewer people means more ownership, more trust, and better work." },
  { num: "03", title: "Builders first",       body: "Everyone here makes things. No passengers. No layers between idea and execution." },
  { num: "04", title: "Async by default",     body: "We respect each other's time. Work happens in writing, not in meetings." },
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
    <main className="mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] min-h-screen flex flex-col pb-16 sm:pb-20">

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-3 pt-16 sm:pt-24 pb-14 rise">
        <h1 className="text-[clamp(2.4rem,6vw,4rem)] font-normal tracking-[-0.04em] leading-none text-[rgb(var(--fg))] mb-5 max-w-2xl">
          Build things that matter
        </h1>
        <p className="text-[clamp(1rem,1.8vw,1.15rem)] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-md">
          Inertia is a small team. We make Shopify themes, design systems, and digital products that real businesses depend on. We hire rarely and deliberately.
        </p>
      </section>

      <div className="grid-rule" aria-hidden="true" />

      {/* Values */}
      <section className="px-3 pt-16 sm:pt-24 pb-14 rise">
        <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))] mb-3 text-center">How we work together</p>
        <p className="text-[16px] leading-relaxed tracking-tight text-[rgb(var(--muted))] mb-10 text-center" style={{ opacity: 0.6 }}>The things we actually believe in.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {VALUES.map((v, i) => (
            <div key={v.title} className="flex gap-5" style={{ ["--rise-delay" as any]: `${i * 60}ms` }}>
              <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] tabular-nums mt-0.5" style={{ opacity: 0.3 }}>{v.num}</span>
              <div className="flex flex-col gap-1.5">
                <span className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))]">{v.title}</span>
                <span className="text-[14px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">{v.body}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid-rule" aria-hidden="true" />

      {/* Openings */}
      <section className="px-3 pt-16 sm:pt-24 pb-6 rise">
        <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))] mb-3 text-center">Open roles</p>
        <p className="text-[16px] leading-relaxed tracking-tight text-[rgb(var(--muted))] mb-10 text-center" style={{ opacity: 0.6 }}>Right now we're looking for:</p>
      </section>

      {OPENINGS.map((role, i) => (
        <a
          key={role.title}
          href={`mailto:aftertonestudiohelp@gmail.com?subject=Application: ${role.title}`}
          className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-3 py-7 border-t border-[rgb(var(--line))] hover:bg-[rgb(var(--fg)/0.02)] transition-colors rise"
          style={{ ["--rise-delay" as any]: `${i * 60}ms` }}
        >
          <div className="flex flex-col gap-2 max-w-lg">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[16px] font-medium tracking-tight text-[rgb(var(--fg))]">{role.title}</span>
              <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] border border-[rgb(var(--line))] rounded-full px-2.5 pt-[3px] pb-[4px] leading-none">{role.type}</span>
              <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-50">{role.location}</span>
            </div>
            <p className="text-[14px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">{role.desc}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-[13px] tracking-tight text-[rgb(var(--muted))] group-hover:text-[rgb(var(--fg))] transition-colors">
            Apply
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 -translate-x-1 group-hover:translate-x-0 transition-transform duration-200" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </div>
        </a>
      ))}

      <div className="border-t border-[rgb(var(--line))]" />

      {/* Closing */}
      <section className="flex flex-col items-center text-center px-3 py-16 sm:py-24 gap-4 rise">
        <p className="text-[15px] tracking-tight text-[rgb(var(--muted))] max-w-sm leading-relaxed">
          Don't see a fit? If you do exceptional work and think you belong here, send us a note anyway.
        </p>
        <a
          href="mailto:aftertonestudiohelp@gmail.com?subject=General inquiry"
          className="text-[13px] tracking-tight text-[rgb(var(--fg))] hover:text-[rgb(var(--muted))] transition-colors"
        >
          Get in touch &rarr;
        </a>
      </section>

    </main>
  );
}
