import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Careers | Inertia",
  description: "We build things that matter. Join us.",
};

function GridRule() {
  return <div className="grid-rule" aria-hidden="true" />;
}

function SketchCraft() {
  return (
    <svg viewBox="0 0 120 72" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Canvas */}
      <rect x="14" y="10" width="92" height="52" rx="2" stroke="rgb(var(--purple))" strokeWidth="0.8" opacity="0.3" />
      {/* Pixel grid detail */}
      {[28, 42, 56, 70, 84].map(x => (
        <line key={x} x1={x} y1="10" x2={x} y2="62" stroke="rgb(var(--muted))" strokeWidth="0.4" opacity="0.12" />
      ))}
      {[24, 38, 52].map(y => (
        <line key={y} x1="14" y1={y} x2="106" y2={y} stroke="rgb(var(--muted))" strokeWidth="0.4" opacity="0.12" />
      ))}
      {/* Precise strokes — accent */}
      <path d="M 28 50 C 36 42 44 30 56 24 C 68 18 80 22 92 18" stroke="rgb(var(--purple))" strokeWidth="1.6" opacity="0.75" />
      <circle cx="56" cy="24" r="3" fill="rgb(var(--purple))" opacity="0.6" />
      <circle cx="92" cy="18" r="2" fill="rgb(var(--purple))" opacity="0.4" />
      {/* Pen tool */}
      <path d="M 88 48 L 98 38 L 102 42 L 92 52 Z" stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.3" />
      <line x1="98" y1="38" x2="104" y2="32" stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.3" />
      <circle cx="104" cy="32" r="1.5" fill="rgb(var(--purple))" opacity="0.5" />
    </svg>
  );
}

function SketchSmall() {
  return (
    <svg viewBox="0 0 120 72" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* 3 people, tight cluster */}
      {[36, 60, 84].map((cx, i) => (
        <g key={cx}>
          <circle cx={cx} cy="26" r={i === 1 ? 8 : 6} stroke="rgb(var(--green))" strokeWidth={i === 1 ? 1.2 : 0.8} opacity={i === 1 ? 0.75 : 0.4} />
          <path d={`M ${cx - (i === 1 ? 16 : 12)} 52 Q ${cx} ${i === 1 ? 42 : 46} ${cx + (i === 1 ? 16 : 12)} 52`} stroke="rgb(var(--green))" strokeWidth={i === 1 ? 1.0 : 0.7} opacity={i === 1 ? 0.6 : 0.3} />
        </g>
      ))}
      {/* Connection lines */}
      <line x1="42" y1="26" x2="52" y2="26" stroke="rgb(var(--green))" strokeWidth="0.5" opacity="0.25" strokeDasharray="2 2" />
      <line x1="68" y1="26" x2="78" y2="26" stroke="rgb(var(--green))" strokeWidth="0.5" opacity="0.25" strokeDasharray="2 2" />
    </svg>
  );
}

function SketchBuilders() {
  return (
    <svg viewBox="0 0 120 72" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Terminal window */}
      <rect x="14" y="12" width="92" height="48" rx="2" stroke="rgb(var(--blue))" strokeWidth="0.8" opacity="0.3" />
      <line x1="14" y1="24" x2="106" y2="24" stroke="rgb(var(--blue))" strokeWidth="0.6" opacity="0.2" />
      <circle cx="24" cy="18" r="2.5" fill="rgb(var(--muted))" opacity="0.2" />
      <circle cx="32" cy="18" r="2.5" fill="rgb(var(--muted))" opacity="0.2" />
      <circle cx="40" cy="18" r="2.5" fill="rgb(var(--muted))" opacity="0.2" />
      {/* Code lines */}
      <line x1="24" y1="34" x2="62" y2="34" stroke="rgb(var(--blue))" strokeWidth="1.1" opacity="0.6" />
      <line x1="24" y1="42" x2="80" y2="42" stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.3" />
      <line x1="24" y1="50" x2="50" y2="50" stroke="rgb(var(--blue))" strokeWidth="0.8" opacity="0.4" />
      {/* Cursor blink */}
      <rect x="52" y="47" width="6" height="8" rx="0.5" fill="rgb(var(--blue))" opacity="0.55" />
    </svg>
  );
}

function SketchAsync() {
  return (
    <svg viewBox="0 0 120 72" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Message bubbles at different times */}
      <rect x="14" y="12" width="52" height="18" rx="3" stroke="rgb(var(--amber))" strokeWidth="0.9" opacity="0.55" fill="rgb(var(--amber))" fillOpacity="0.05" />
      <line x1="22" y1="19" x2="54" y2="19" stroke="rgb(var(--amber))" strokeWidth="0.8" opacity="0.5" />
      <line x1="22" y1="25" x2="44" y2="25" stroke="rgb(var(--amber))" strokeWidth="0.6" opacity="0.35" />
      {/* Reply bubble — offset right + down */}
      <rect x="54" y="38" width="52" height="18" rx="3" stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.35" />
      <line x1="62" y1="45" x2="94" y2="45" stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.3" />
      <line x1="62" y1="51" x2="82" y2="51" stroke="rgb(var(--muted))" strokeWidth="0.5" opacity="0.22" />
      {/* Time axis */}
      <line x1="14" y1="66" x2="106" y2="66" stroke="rgb(var(--muted))" strokeWidth="0.4" opacity="0.2" />
      <line x1="40" y1="64" x2="40" y2="68" stroke="rgb(var(--muted))" strokeWidth="0.5" opacity="0.25" />
      <line x1="80" y1="64" x2="80" y2="68" stroke="rgb(var(--muted))" strokeWidth="0.5" opacity="0.25" />
    </svg>
  );
}

const VALUES = [
  {
    title: "Craft over output",
    body: "We care about what we ship, not how fast we ship it. Every detail is a decision.",
    sketch: <SketchCraft />,
    color: "rgb(var(--purple))",
  },
  {
    title: "Small on purpose",
    body: "We stay lean. Fewer people means more ownership, more trust, and better work.",
    sketch: <SketchSmall />,
    color: "rgb(var(--green))",
  },
  {
    title: "Builders first",
    body: "Everyone here makes things. No passengers. No layers between idea and execution.",
    sketch: <SketchBuilders />,
    color: "rgb(var(--blue))",
  },
  {
    title: "Async by default",
    body: "We respect each other's time. Work happens in writing, not in meetings.",
    sketch: <SketchAsync />,
    color: "rgb(var(--amber))",
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
    <main className="page-container mx-auto w-full max-w-5xl min-h-screen flex flex-col">

      {/* Nav */}
      <div className="px-6 sm:px-8 py-5 rise">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true"><path d="M10 3L5 8l5 5" /></svg>
          back
        </Link>
      </div>

      <GridRule />

      {/* Hero — centered */}
      <section className="flex flex-col items-center text-center px-6 sm:px-8 pt-14 pb-12 rise">
        <h1 className="text-[clamp(2.4rem,7vw,5rem)] font-medium tracking-[-0.04em] leading-none text-[rgb(var(--fg))] mb-5 max-w-2xl">
          Build things<br />that matter.
        </h1>
        <p className="text-[1rem] leading-[1.7] tracking-tight text-[rgb(var(--muted))] max-w-sm">
          Inertia is a small team. We make Shopify themes, design systems, and digital products that real businesses depend on. We hire rarely and deliberately.
        </p>
      </section>

      <GridRule />

      {/* Values label */}
      <div className="flex items-center justify-center gap-3 py-6 rise">
        <span className="text-[19px] tracking-tight text-[rgb(var(--muted))]">How we</span>
        <div className="flex items-center gap-1.5 rounded-full px-3.5 py-2" style={{ background: "rgb(var(--purple)/0.08)", border: "1px solid rgb(var(--purple)/0.25)" }}>
          <span className="text-[17px] font-medium tracking-tight" style={{ color: "rgb(var(--purple))" }}>work</span>
        </div>
        <span className="text-[19px] tracking-tight text-[rgb(var(--muted))]">together</span>
      </div>

      <GridRule />

      {/* Values grid */}
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
            <div className="w-full">{v.sketch}</div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[13.5px] font-medium tracking-tight" style={{ color: v.color }}>{v.title}</span>
              <span className="text-[12px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">{v.body}</span>
            </div>
          </div>
        ))}
      </div>

      <GridRule />

      {/* Roles label */}
      <div className="flex items-center justify-center gap-3 py-6 rise">
        <span className="text-[19px] tracking-tight text-[rgb(var(--muted))]">Open</span>
        <div className="flex items-center gap-1.5 rounded-full px-3.5 py-2" style={{ background: "rgb(var(--green)/0.08)", border: "1px solid rgb(var(--green)/0.25)" }}>
          <span className="text-[17px] font-medium tracking-tight" style={{ color: "rgb(var(--green))" }}>roles</span>
        </div>
        <span className="text-[19px] tracking-tight text-[rgb(var(--muted))]">right now</span>
      </div>

      <GridRule />

      {/* Roles */}
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
                <span className="text-[11px] tracking-tight text-[rgb(var(--muted))]">{role.location}</span>
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

      {/* Closing */}
      <div className="flex flex-col items-center text-center px-6 sm:px-8 py-12 gap-3 rise">
        <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] max-w-sm">
          Don't see a fit? If you do exceptional work and think you belong here, send us a note anyway.
        </p>
        <a
          href="mailto:aftertonestudiohelp@gmail.com?subject=General inquiry"
          className="text-[13px] tracking-tight text-[rgb(var(--fg))] hover:text-[rgb(var(--muted))] transition-colors"
        >
          Get in touch →
        </a>
      </div>

      <GridRule />

    </main>
  );
}
