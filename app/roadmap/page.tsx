"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";

type Status = "shipped" | "in-progress" | "planned";

type RoadmapItem = {
  name: string;
  detail: string;
  status: Status;
  date: string;
  href?: string;
  external?: boolean;
  sketch: React.ReactNode;
};

function SketchInertia() {
  return (
    <svg viewBox="0 0 200 120" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <line x1="100" y1="60" x2="10"  y2="110" stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.32" />
      <line x1="100" y1="60" x2="190" y2="110" stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.32" />
      <line x1="100" y1="60" x2="10"  y2="85"  stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.22" />
      <line x1="100" y1="60" x2="190" y2="85"  stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.22" />
      <line x1="37"  y1="110" x2="163" y2="110" stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.32" />
      <line x1="22"  y1="96"  x2="178" y2="96"  stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.22" />
      <line x1="55"  y1="73"  x2="145" y2="73"  stroke="rgb(var(--muted))" strokeWidth="0.5" opacity="0.18" />
      <line x1="37"  y1="110" x2="37"  y2="52"  stroke="rgb(var(--purple))" strokeWidth="0.9" opacity="0.55" />
      <line x1="163" y1="110" x2="163" y2="52"  stroke="rgb(var(--purple))" strokeWidth="0.9" opacity="0.55" />
      <line x1="22"  y1="96"  x2="22"  y2="38"  stroke="rgb(var(--purple))" strokeWidth="0.7" opacity="0.35" />
      <line x1="178" y1="96"  x2="178" y2="38"  stroke="rgb(var(--purple))" strokeWidth="0.7" opacity="0.35" />
      <line x1="100" y1="8"   x2="22"  y2="38"  stroke="rgb(var(--purple))" strokeWidth="0.9" opacity="0.55" />
      <line x1="100" y1="8"   x2="178" y2="38"  stroke="rgb(var(--purple))" strokeWidth="0.9" opacity="0.55" />
      <line x1="22"  y1="38"  x2="178" y2="38"  stroke="rgb(var(--purple))" strokeWidth="0.8" opacity="0.45" />
      <line x1="37"  y1="52"  x2="163" y2="52"  stroke="rgb(var(--purple))" strokeWidth="0.8" opacity="0.45" />
      <line x1="22"  y1="38"  x2="37"  y2="52"  stroke="rgb(var(--purple))" strokeWidth="0.6" opacity="0.35" />
      <line x1="178" y1="38"  x2="163" y2="52"  stroke="rgb(var(--purple))" strokeWidth="0.6" opacity="0.35" />
      <line x1="4"   y1="22"  x2="28"  y2="22"  stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.28" />
      <line x1="4"   y1="28"  x2="22"  y2="28"  stroke="rgb(var(--muted))" strokeWidth="0.5" opacity="0.2" />
      <line x1="4"   y1="34"  x2="18"  y2="34"  stroke="rgb(var(--muted))" strokeWidth="0.4" opacity="0.16" />
      <line x1="172" y1="22"  x2="196" y2="22"  stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.28" />
      <line x1="178" y1="28"  x2="196" y2="28"  stroke="rgb(var(--muted))" strokeWidth="0.5" opacity="0.2" />
      <line x1="182" y1="34"  x2="196" y2="34"  stroke="rgb(var(--muted))" strokeWidth="0.4" opacity="0.16" />
      <line x1="96"  y1="8"   x2="104" y2="8"   stroke="rgb(var(--purple))" strokeWidth="0.6" opacity="0.6" />
      <line x1="100" y1="4"   x2="100" y2="12"  stroke="rgb(var(--purple))" strokeWidth="0.6" opacity="0.6" />
    </svg>
  );
}

function SketchAether() {
  const blue = "rgb(var(--blue))";
  const muted = "rgb(var(--muted))";
  return (
    <svg viewBox="0 0 200 120" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <rect x="8" y="8" width="184" height="104" rx="3" stroke={muted} strokeWidth="0.9" opacity="0.32" />
      <line x1="8" y1="22" x2="192" y2="22" stroke={muted} strokeWidth="0.7" opacity="0.22" />
      <rect x="16" y="13" width="18" height="6" rx="1" stroke={muted} strokeWidth="0.6" opacity="0.32" />
      <line x1="46"  y1="16" x2="62"  y2="16" stroke={muted} strokeWidth="0.6" opacity="0.26" />
      <line x1="68"  y1="16" x2="84"  y2="16" stroke={muted} strokeWidth="0.6" opacity="0.26" />
      <line x1="90"  y1="16" x2="106" y2="16" stroke={muted} strokeWidth="0.6" opacity="0.26" />
      <rect x="162" y="13" width="22" height="6" rx="2" fill={blue} fillOpacity="0.18" stroke={blue} strokeWidth="0.6" opacity="0.65" />
      <rect x="16" y="28" width="168" height="38" rx="2" stroke={muted} strokeWidth="0.7" opacity="0.26" />
      <line x1="30" y1="38" x2="120" y2="38" stroke={muted} strokeWidth="1.2" opacity="0.38" />
      <line x1="30" y1="44" x2="100" y2="44" stroke={muted} strokeWidth="1.2" opacity="0.38" />
      <line x1="30" y1="50" x2="80"  y2="50" stroke={muted} strokeWidth="0.8" opacity="0.26" />
      <rect x="30" y="55" width="32" height="7" rx="2" fill={blue} fillOpacity="0.2" stroke={blue} strokeWidth="0.7" opacity="0.65" />
      <rect x="16"  y="72" width="50" height="34" rx="2" stroke={blue} strokeWidth="0.8" opacity="0.45" fill={blue} fillOpacity="0.04" />
      <rect x="75"  y="72" width="50" height="34" rx="2" stroke={muted} strokeWidth="0.7" opacity="0.26" />
      <rect x="134" y="72" width="50" height="34" rx="2" stroke={muted} strokeWidth="0.7" opacity="0.26" />
      <rect x="20"  y="75" width="42" height="20" rx="1" stroke={blue} strokeWidth="0.5" opacity="0.35" fill={blue} fillOpacity="0.06" />
      <rect x="79"  y="75" width="42" height="20" rx="1" stroke={muted} strokeWidth="0.5" opacity="0.22" />
      <rect x="138" y="75" width="42" height="20" rx="1" stroke={muted} strokeWidth="0.5" opacity="0.22" />
      <line x1="20"  y1="99"  x2="52"  y2="99"  stroke={muted} strokeWidth="0.6" opacity="0.28" />
      <line x1="79"  y1="99"  x2="111" y2="99"  stroke={muted} strokeWidth="0.6" opacity="0.26" />
      <line x1="138" y1="99"  x2="170" y2="99"  stroke={muted} strokeWidth="0.6" opacity="0.26" />
    </svg>
  );
}

function SketchDashboard() {
  const blue = "rgb(var(--blue))";
  const muted = "rgb(var(--muted))";
  return (
    <svg viewBox="0 0 200 120" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <rect x="8" y="8" width="184" height="104" rx="3" stroke={muted} strokeWidth="0.9" opacity="0.32" />
      <line x1="48" y1="8" x2="48" y2="112" stroke={muted} strokeWidth="0.6" opacity="0.22" />
      <rect x="14" y="18" width="26" height="5" rx="1.5" stroke={muted} strokeWidth="0.5" opacity="0.28" />
      {[30,50,60,70].map(y => (
        <line key={y} x1="14" y1={y} x2="40" y2={y} stroke={muted} strokeWidth="0.5" opacity="0.22" />
      ))}
      <rect x="12" y="37.5" width="2.5" height="7" rx="1" fill={blue} opacity="0.7" />
      <line x1="17" y1="41" x2="40" y2="41" stroke={blue} strokeWidth="0.9" opacity="0.65" />
      <rect x="56" y="16" width="38" height="22" rx="2" stroke={blue} strokeWidth="0.7" opacity="0.5" fill={blue} fillOpacity="0.05" />
      <line x1="62" y1="24" x2="84" y2="24" stroke={blue} strokeWidth="1.2" opacity="0.6" />
      <line x1="62" y1="30" x2="76" y2="30" stroke={muted} strokeWidth="0.5" opacity="0.28" />
      {[1,2].map(i => (
        <g key={i}>
          <rect x={56 + i * 44} y="16" width="38" height="22" rx="2" stroke={muted} strokeWidth="0.6" opacity="0.28" />
          <line x1={62 + i * 44} y1="24" x2={84 + i * 44} y2="24" stroke={muted} strokeWidth="1.1" opacity="0.32" />
          <line x1={62 + i * 44} y1="30" x2={76 + i * 44} y2="30" stroke={muted} strokeWidth="0.5" opacity="0.22" />
        </g>
      ))}
      <rect x="56" y="44" width="82" height="36" rx="2" stroke={muted} strokeWidth="0.7" opacity="0.28" />
      <line x1="62" y1="52" x2="108" y2="52" stroke={muted} strokeWidth="0.9" opacity="0.32" />
      <line x1="62" y1="58" x2="96" y2="58" stroke={muted} strokeWidth="0.5" opacity="0.22" />
      <line x1="62" y1="64" x2="100" y2="64" stroke={muted} strokeWidth="0.5" opacity="0.22" />
      <rect x="62" y="70" width="28" height="5" rx="1.5" fill={blue} fillOpacity="0.18" stroke={blue} strokeWidth="0.5" opacity="0.6" />
      <rect x="146" y="44" width="38" height="64" rx="2" stroke={muted} strokeWidth="0.6" opacity="0.26" />
      <line x1="152" y1="52" x2="178" y2="52" stroke={muted} strokeWidth="0.6" opacity="0.26" />
      {[62,72,82,96].map(y => (
        <g key={y}>
          <circle cx="155" cy={y} r="2" stroke={muted} strokeWidth="0.5" opacity="0.26" />
          <line x1="161" y1={y} x2="178" y2={y} stroke={muted} strokeWidth="0.5" opacity="0.26" />
          <line x1="161" y1={y + 4} x2="172" y2={y + 4} stroke={muted} strokeWidth="0.4" opacity="0.2" />
        </g>
      ))}
      <circle cx="184" cy="16" r="2.5" fill={blue} opacity="0.55" />
    </svg>
  );
}

const ITEMS: RoadmapItem[] = [
  {
    name: "Inertia Studio",
    detail: "Taking on client projects across Shopify, iOS, and web. Design through deployment.",
    status: "shipped",
    date: "2022",
    href: "https://www.instagram.com/by.inertia/",
    external: true,
    sketch: <SketchInertia />,
  },
  {
    name: "Aether Theme",
    detail: "A premium Shopify theme built for conversion and craft. Licensing now available.",
    status: "in-progress",
    date: "2025",
    href: "/aether",
    sketch: <SketchAether />,
  },
  {
    name: "Inertia Dashboard",
    detail: "A unified place for clients to track progress, access deliverables, and get support without the back-and-forth.",
    status: "planned",
    date: "2026",
    sketch: <SketchDashboard />,
  },
];

const STATUS_LABEL: Record<Status, string> = {
  "shipped": "Shipped",
  "in-progress": "In progress",
  "planned": "Planned",
};

const STATUS_COLOR: Record<Status, string> = {
  "shipped": "var(--green)",
  "in-progress": "var(--blue)",
  "planned": "var(--muted)",
};

function GridRule() {
  return <div className="grid-rule" aria-hidden="true" />;
}

function TimelineTrack() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const vw = window.innerWidth;
      // How far the track has scrolled left relative to its width
      const scrolled = -rect.left;
      const total = rect.width - vw;
      setProgress(Math.min(1, Math.max(0, scrolled / Math.max(total, 1))));
    };
    const scrollEl = el.closest(".roadmap-scroll") as HTMLElement | null;
    if (scrollEl) scrollEl.addEventListener("scroll", onScroll, { passive: true });
    return () => { if (scrollEl) scrollEl.removeEventListener("scroll", onScroll); };
  }, []);

  return (
    <div ref={trackRef} className="relative flex items-start gap-0 px-8 sm:px-16">
      {/* Horizontal line */}
      <div className="absolute left-0 right-0 top-[88px] h-px bg-[rgb(var(--line))]" aria-hidden="true" />

      {/* Filled progress line */}
      <div
        className="absolute left-0 top-[88px] h-px transition-none"
        style={{
          width: `${progress * 100}%`,
          background: "rgb(var(--fg))",
          opacity: 0.25,
        }}
        aria-hidden="true"
      />

      {ITEMS.map((item, i) => {
        const color = `rgb(${STATUS_COLOR[item.status]})`;
        const isFuture = item.status === "planned";

        const nameEl = item.href ? (
          item.external ? (
            <a
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="group-hover:underline underline-offset-2 decoration-[rgb(var(--line))]"
            >
              {item.name} ↗
            </a>
          ) : (
            <Link
              href={item.href}
              className="group-hover:underline underline-offset-2 decoration-[rgb(var(--line))]"
            >
              {item.name} →
            </Link>
          )
        ) : (
          <span>{item.name}</span>
        );

        return (
          <div
            key={item.name}
            className="group relative flex flex-col shrink-0 rise"
            style={{
              width: "300px",
              paddingRight: i < ITEMS.length - 1 ? "48px" : "0",
              ["--rise-delay" as any]: `${i * 100}ms`,
              opacity: isFuture ? 0.55 : 1,
            }}
          >
            {/* Sketch card */}
            <div
              className="w-full border border-[rgb(var(--line))] mb-8 transition-colors group-hover:border-[rgb(var(--fg)/0.2)]"
              style={{ background: "rgb(var(--bg))" }}
            >
              <div className="p-4">
                {item.sketch}
              </div>
            </div>

            {/* Dot on track */}
            <div className="absolute left-0 top-[82px] flex items-center justify-center w-[13px] h-[13px]" aria-hidden="true">
              <div
                className="w-[13px] h-[13px] rounded-full border-[1.5px]"
                style={{
                  borderColor: color,
                  background: item.status === "shipped" ? color : "rgb(var(--bg))",
                }}
              >
                {item.status === "in-progress" && (
                  <div className="w-full h-full rounded-full flex items-center justify-center">
                    <div className="w-[5px] h-[5px] rounded-full" style={{ background: color }} />
                  </div>
                )}
              </div>
            </div>

            {/* Below track: meta + content */}
            <div className="pt-6 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[12px] tracking-tight font-medium" style={{ color }}>
                  {STATUS_LABEL[item.status]}
                </span>
                <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-50">
                  {item.date}
                </span>
              </div>
              <span className="text-[16px] font-medium tracking-tight text-[rgb(var(--fg))] leading-snug">
                {nameEl}
              </span>
              <p className="text-[12px] tracking-tight text-[rgb(var(--muted))] leading-relaxed">
                {item.detail}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function RoadmapPage() {
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

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 sm:px-8 pt-14 pb-12 rise">
        <h1 className="text-[clamp(2.4rem,7vw,5rem)] font-medium tracking-[-0.04em] leading-none text-[rgb(var(--fg))] mb-5">
          Roadmap
        </h1>
        <p className="text-[1rem] leading-[1.7] tracking-tight text-[rgb(var(--muted))] max-w-sm">
          What we've shipped, what we're actively building, and what's coming next.
        </p>
      </section>

      <GridRule />

      {/* Horizontal timeline — scrollable on mobile, full width on desktop */}
      <div className="roadmap-scroll overflow-x-auto py-10 px-0" style={{ scrollbarWidth: "none" }}>
        <div style={{ minWidth: `${ITEMS.length * 300 + (ITEMS.length - 1) * 48 + 128}px` }}>
          <TimelineTrack />
        </div>
      </div>

      <GridRule />

      {/* Footer */}
      <div className="flex flex-col items-center text-center px-6 sm:px-8 py-12 gap-3 rise">
        <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] max-w-sm">
          Have an idea or want to follow along? We'd love to hear from you.
        </p>
        <Link
          href="/contact"
          className="text-[13px] tracking-tight text-[rgb(var(--fg))] hover:text-[rgb(var(--muted))] transition-colors"
        >
          Get in touch →
        </Link>
      </div>

      <GridRule />

    </main>
  );
}
