"use client";

import React, { useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { SiShopify, SiTypescript, SiTailwindcss, SiSwift, SiMeta, SiFramer, SiVercel, SiApple, SiNextdotjs, SiReact, SiSupabase, SiFigma } from "react-icons/si";
import { useEffect, useLayoutEffect, useState } from "react";
import { TooltipPill } from "./tooltip-pill";
import { PastWork } from "./past-work";
import { SoundwaveHero } from "./soundwave-hero";
import { createClient } from "@/lib/supabase/client";
import type { WorkMeta } from "@/lib/work";
import type { PostMeta } from "@/lib/posts";

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

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
      <line x1="37"  y1="110" x2="37"  y2="52"  stroke="rgb(var(--muted))" strokeWidth="0.9" opacity="0.55" />
      <line x1="163" y1="110" x2="163" y2="52"  stroke="rgb(var(--muted))" strokeWidth="0.9" opacity="0.55" />
      <line x1="22"  y1="96"  x2="22"  y2="38"  stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.35" />
      <line x1="178" y1="96"  x2="178" y2="38"  stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.35" />
      <line x1="100" y1="8"   x2="22"  y2="38"  stroke="rgb(var(--muted))" strokeWidth="0.9" opacity="0.55" />
      <line x1="100" y1="8"   x2="178" y2="38"  stroke="rgb(var(--muted))" strokeWidth="0.9" opacity="0.55" />
      <line x1="22"  y1="38"  x2="178" y2="38"  stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.45" />
      <line x1="37"  y1="52"  x2="163" y2="52"  stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.45" />
      <line x1="22"  y1="38"  x2="37"  y2="52"  stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.35" />
      <line x1="178" y1="38"  x2="163" y2="52"  stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.35" />
      <line x1="4"   y1="22"  x2="28"  y2="22"  stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.28" />
      <line x1="4"   y1="28"  x2="22"  y2="28"  stroke="rgb(var(--muted))" strokeWidth="0.5" opacity="0.2" />
      <line x1="4"   y1="34"  x2="18"  y2="34"  stroke="rgb(var(--muted))" strokeWidth="0.4" opacity="0.16" />
      <line x1="172" y1="22"  x2="196" y2="22"  stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.28" />
      <line x1="178" y1="28"  x2="196" y2="28"  stroke="rgb(var(--muted))" strokeWidth="0.5" opacity="0.2" />
      <line x1="182" y1="34"  x2="196" y2="34"  stroke="rgb(var(--muted))" strokeWidth="0.4" opacity="0.16" />
      <line x1="96"  y1="8"   x2="104" y2="8"   stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.6" />
      <line x1="100" y1="4"   x2="100" y2="12"  stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.6" />
    </svg>
  );
}

function MockupAether() {
  return (
    <img src="/aether-theme-mockup.svg" alt="" className="w-full rounded-lg translate-y-4" draggable={false} aria-hidden="true" />
  );
}

function MockupDashboard() {
  return (
    <img src="/inertia-dashboard-mockup.svg" alt="" className="w-full rounded-lg translate-y-4" draggable={false} aria-hidden="true" />
  );
}


const BUILDING = [
  {
    name: "Inertia",
    description: "Your vision, built properly. No handoffs, no excuses.",
    cta: "Work with us",
    href: "https://www.instagram.com/by.inertia/",
    sketch: <SketchInertia />,
  },
  {
    name: "Aether Theme",
    description: "A Shopify theme that makes your store feel like a brand.",
    cta: "See Aether",
    href: "/aether",
    sketch: <MockupAether />,
  },
  {
    name: "Inertia Dashboard",
    description: "Everything your project needs, in one place you'll actually check.",
    cta: "Join waitlist",
    href: "#",
    sketch: <MockupDashboard />,
  },
];

export default function Home() {
  const [work, setWork] = useState<WorkMeta[]>([]);

  useEffect(() => {
    fetch("/api/content").then((r) => r.json()).then((d) => {
      setWork(d.work ?? []);
    });
  }, []);

  return <VisualLayout work={work} />;
}


function GridRule() {
  return <div className="grid-rule" aria-hidden="true" />;
}


const SERVICE_GROUPS = [
  { category: "Storefronts", v: "--blue",   items: ["Shopify Liquid", "Theme development", "Theme licensing"] },
  { category: "Development", v: "--green",  items: ["Mobile apps", "Framer", "Vercel", "Custom builds"] },
  { category: "Marketing",   v: "--amber",  items: ["Meta ad campaigns", "Whop setup"] },
  { category: "Design",      v: "--purple", items: ["Brand identity", "UI design"] },
];

const IconPhotoshop = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? "w-5 h-5 shrink-0"} aria-hidden="true">
    <path d="M9.85 8.42c-.37-.15-.77-.21-1.18-.2-.26 0-.49 0-.68.01-.2-.01-.34 0-.41.01v3.36c.14.01.27.02.39.02h.53c.39 0 .78-.06 1.15-.18.32-.09.6-.28.82-.53.21-.25.31-.59.31-1.03.01-.31-.07-.62-.23-.89-.17-.26-.41-.46-.7-.57zM19.75.3H4.25C1.9.3 0 2.2 0 4.55v14.899c0 2.35 1.9 4.25 4.25 4.25h15.5c2.35 0 4.25-1.9 4.25-4.25V4.55C24 2.2 22.1.3 19.75.3zm-7.391 11.65c-.399.56-.959.98-1.609 1.22-.68.25-1.43.34-2.25.34-.24 0-.4 0-.5-.01s-.24-.01-.43-.01v3.209c.01.07-.04.131-.11.141H5.52c-.08 0-.12-.041-.12-.131V6.42c0-.07.03-.11.1-.11.17 0 .33 0 .56-.01.24-.01.49-.01.76-.02s.56-.01.87-.02c.31-.01.61-.01.91-.01.82 0 1.5.1 2.06.31.5.17.96.45 1.34.82.32.32.57.71.73 1.14.149.42.229.85.229 1.3.001.86-.199 1.57-.6 2.13zm7.091 3.89c-.28.4-.671.709-1.12.891-.49.209-1.09.318-1.811.318-.459 0-.91-.039-1.359-.129-.35-.061-.7-.17-1.02-.32-.07-.039-.121-.109-.111-.189v-1.74c0-.029.011-.07.041-.09.029-.02.06-.01.09.01.39.23.8.391 1.24.49.379.1.779.15 1.18.15.38 0 .65-.051.83-.141.16-.07.27-.24.27-.42 0-.141-.08-.27-.24-.4-.16-.129-.489-.279-.979-.471-.51-.18-.979-.42-1.42-.719-.31-.221-.569-.51-.761-.85-.159-.32-.239-.67-.229-1.021 0-.43.12-.84.341-1.21.25-.4.619-.72 1.049-.92.469-.239 1.059-.349 1.769-.349.41 0 .83.03 1.24.09.3.04.59.12.86.23.039.01.08.05.1.09.01.04.02.08.02.12v1.63c0 .04-.02.08-.05.1-.09.02-.14.02-.18 0-.3-.16-.62-.27-.96-.34-.37-.08-.74-.13-1.12-.13-.2-.01-.41.02-.601.07-.129.03-.24.1-.31.2-.05.08-.08.18-.08.27s.04.18.101.26c.09.11.209.2.34.27.229.12.47.23.709.33.541.18 1.061.43 1.541.73.33.209.6.49.789.83.16.318.24.67.23 1.029.011.471-.129.94-.389 1.331z" />
  </svg>
);

const IconWhop = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 383.2 196.4" fill="currentColor" className={className ?? "w-5 h-5 shrink-0"} aria-hidden="true">
    <path d="M60.9,0C35.7,0,18.4,11.1,5.2,23.5c0,0-5.3,5-5.2,5.2l55.2,55.2l55.2-55.2C99.9,14.3,80.2,0,60.9,0z" />
    <path d="M197.2,0c-25.2,0-42.5,11.1-55.7,23.5c0,0-4.8,4.9-5.1,5.2L68.2,96.9l55.1,55.1L246.6,28.7C236.1,14.3,216.5,0,197.2,0z" />
    <path d="M333.8,0c-25.2,0-42.5,11.1-55.7,23.5c0,0-5,4.9-5.2,5.2L136.4,165.2l14.4,14.4c22.3,22.3,58.9,22.3,81.3,0L383,28.7h0.2C372.8,14.3,353.1,0,333.8,0z" />
  </svg>
);

const ALL_PHRASES: { label: string; text: string; v: string; icon: React.ReactNode; cta: { label: string; href: string } }[] = [
  {
    label: "Right now we're building",
    text: "Shopify storefronts",
    v: "--blue",
    icon: <SiShopify className="w-5 h-5 shrink-0" />,
    cta: { label: "See Aether", href: "/aether" },
  },
  {
    label: "Right now we're writing",
    text: "Shopify Liquid",
    v: "--blue",
    icon: <SiShopify className="w-5 h-5 shrink-0" />,
    cta: { label: "See Aether", href: "/aether" },
  },
  {
    label: "Right now we're licensing",
    text: "Aether Theme",
    v: "--blue",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    cta: { label: "License Aether", href: "/aether/buy" },
  },
  {
    label: "Right now we're shipping",
    text: "iOS Apps",
    v: "--green",
    icon: <SiApple className="w-5 h-5 shrink-0" />,
    cta: { label: "Work with us", href: "https://www.instagram.com/by.inertia/" },
  },
  {
    label: "Right now we're designing in",
    text: "Framer",
    v: "--green",
    icon: <SiFramer className="w-5 h-5 shrink-0" />,
    cta: { label: "Start a project", href: "https://www.instagram.com/by.inertia/" },
  },
  {
    label: "Right now we're deploying on",
    text: "Vercel",
    v: "--green",
    icon: <SiVercel className="w-5 h-5 shrink-0" />,
    cta: { label: "Start a project", href: "https://www.instagram.com/by.inertia/" },
  },
  {
    label: "Right now we're running",
    text: "Meta Ad Campaigns",
    v: "--amber",
    icon: <SiMeta className="w-5 h-5 shrink-0" />,
    cta: { label: "Work with us", href: "https://www.instagram.com/by.inertia/" },
  },
  {
    label: "Right now we're setting up",
    text: "Whop Storefronts",
    v: "--amber",
    icon: <IconWhop />,
    cta: { label: "Work with us", href: "https://www.instagram.com/by.inertia/" },
  },
  {
    label: "Right now we're crafting",
    text: "Brand Identities",
    v: "--purple",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
    cta: { label: "Work with us", href: "https://www.instagram.com/by.inertia/" },
  },
  {
    label: "Right now we're doing",
    text: "UI Design",
    v: "--purple",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>,
    cta: { label: "View our work", href: "/work" },
  },
];

function RotatingPanel() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const hold = setTimeout(() => {
      setExiting(true);
      setTimeout(() => {
        setPhraseIdx(i => (i + 1) % ALL_PHRASES.length);
        setAnimKey(k => k + 1);
        setExiting(false);
      }, 420);
    }, 3000);
    return () => clearTimeout(hold);
  }, [animKey]);


  const current = ALL_PHRASES[phraseIdx];
  const isExternal = current.cta.href.startsWith("http");
  const ctaClass = "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] tracking-tight bg-[rgb(var(--fg))] text-[rgb(var(--bg))] hover:opacity-80 transition-opacity";

  return (
    <div
      ref={panelRef}
      className="flex flex-col items-center justify-center text-center px-6 sm:px-10"
      style={{ height: isMobile ? 240 : 380, gap: 0 }}
    >
      {/* Label — sits just above phrase, tightly grouped */}
      <p
        key={`label-${animKey}`}
        className="text-[clamp(0.78rem,1.6vw,0.88rem)] tracking-tight text-[rgb(var(--muted))]"
        style={{
          opacity: exiting ? 0 : 1,
          transform: exiting ? "translateY(-4px)" : "translateY(0px)",
          transition: "opacity 260ms ease, transform 260ms ease",
          marginBottom: "10px",
        }}
      >
        {current.label}
      </p>

      {/* Icon + phrase — letter-by-letter 3D flip */}
      <p
        className="flex items-center gap-2 whitespace-nowrap text-[clamp(2rem,5vw,2.4rem)] tracking-tight leading-none font-normal"
        style={{ color: "rgb(var(--fg))", perspective: "800px", perspectiveOrigin: "50% 50%", marginBottom: "20px" }}
      >
        <span
          key={`icon-${animKey}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            flexShrink: 0,
            opacity: exiting ? 0 : 0.75,
            filter: exiting ? "blur(3px)" : "blur(0px)",
            transform: exiting ? "translateY(-8px) rotateX(45deg)" : "translateY(0) rotateX(0)",
            transition: "opacity 260ms ease, filter 260ms ease, transform 260ms cubic-bezier(0.22,1,0.36,1)",
            animation: exiting ? "none" : "char-in 360ms cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          {current.icon}
        </span>

        <span aria-label={current.text} style={{ display: "inline-flex" }}>
          {current.text.split("").map((ch, i) => (
            <span
              key={`${animKey}-${i}`}
              aria-hidden="true"
              style={{
                display: "inline-block",
                width: ch === " " ? "0.28em" : undefined,
                opacity: exiting ? 0 : 1,
                filter: exiting ? "blur(3px)" : "blur(0px)",
                transform: exiting
                  ? "translateY(-10px) rotateX(60deg)"
                  : "translateY(0) rotateX(0)",
                transition: `opacity 220ms ease ${i * 12}ms, filter 220ms ease ${i * 12}ms, transform 220ms cubic-bezier(0.22,1,0.36,1) ${i * 12}ms`,
                animation: exiting ? "none" : `char-in 380ms cubic-bezier(0.22,1,0.36,1) ${i * 22}ms both`,
              }}
            >
              {ch}
            </span>
          ))}
        </span>
      </p>

      {/* CTA — anchored below phrase at consistent distance */}
      <div
        key={`cta-${animKey}`}
        style={{
          opacity: exiting ? 0 : 1,
          transform: exiting ? "translateY(4px)" : "translateY(0)",
          transition: "opacity 240ms ease 40ms, transform 240ms ease 40ms",
          animation: exiting ? "none" : "rise-in 400ms 100ms cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        {isExternal ? (
          <a href={current.cta.href} target="_blank" rel="noreferrer" className={ctaClass}>
            {current.cta.label}
            <span aria-hidden="true">↗</span>
          </a>
        ) : (
          <Link href={current.cta.href} className={ctaClass}>
            {current.cta.label}
            <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </div>
  );
}

function LaptopWithText() {
  const muted = "rgb(var(--muted))";
  const line = "rgb(var(--line))";
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [tilt, setTilt] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh * 0.5)));
      if (progress > 0.05 && !revealed) setRevealed(true);
      const pastCenter = Math.max(0, vh / 2 - rect.bottom + rect.height / 2);
      setTilt(Math.min(14, pastCenter / 22));
    };

    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); };
  }, [revealed]);

  const transform = revealed
    ? `perspective(1000px) rotateX(${tilt}deg) translateY(0px)`
    : "perspective(1000px) rotateX(6deg) translateY(32px)";

  return (
    <div
      ref={ref}
      className="relative w-full select-none"
      style={{
        opacity: revealed ? 1 : 0,
        transform,
        transition: "opacity 650ms cubic-bezier(0.22,1,0.36,1), transform 650ms cubic-bezier(0.22,1,0.36,1)",
        willChange: "transform, opacity",
      }}
    >
      <svg viewBox="0 0 320 186" fill="none" className="w-full">
        <defs>
          <clipPath id="screen-clip">
            <rect x="22" y="14" width="276" height="162" rx="6" />
          </clipPath>
        </defs>

        <rect x="12" y="6" width="296" height="174" rx="12" fill="rgb(var(--line))" fillOpacity="0.08" stroke={line} strokeWidth="0.8" opacity="0.6" />
        <rect x="22" y="14" width="276" height="162" rx="6" fill="rgb(var(--bg))" stroke={line} strokeWidth="0.6" opacity="0.5" />
        <circle cx="160" cy="10" r="1.6" fill={muted} opacity="0.2" />

        <rect x="22" y="14" width="276" height="20" rx="6" fill="rgb(var(--line))" fillOpacity="0.18" clipPath="url(#screen-clip)" />
        <line x1="22" y1="34" x2="298" y2="34" stroke={line} strokeWidth="0.5" opacity="0.5" />
        <circle cx="38" cy="24" r="3" fill="#ff5f57" opacity="0.7" />
        <circle cx="49" cy="24" r="3" fill="#febc2e" opacity="0.7" />
        <circle cx="60" cy="24" r="3" fill="#28c840" opacity="0.7" />
        <rect x="104" y="19" width="112" height="10" rx="3" fill="rgb(var(--line))" fillOpacity="0.25" opacity="0.6" />

        <foreignObject x="22" y="34" width="276" height="142" clipPath="url(#screen-clip)">
          <div style={{ width: "100%", height: "100%", fontFamily: "inherit", background: "rgb(var(--bg))", display: "flex", flexDirection: "column", padding: "14px 16px 12px", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ height: "5px", borderRadius: "3px", background: "rgb(var(--fg))", opacity: 0.55, width: "36px" }} />
              <div style={{ flex: 1 }} />
              {[28, 22, 24].map((w, i) => (
                <div key={i} style={{ height: "4px", borderRadius: "2px", background: "rgb(var(--muted))", opacity: 0.18, width: `${w}px` }} />
              ))}
              <div style={{ height: "10px", borderRadius: "5px", background: "rgb(var(--fg))", opacity: 0.5, width: "32px" }} />
            </div>
            <div style={{ height: "1px", background: "rgb(var(--line))", opacity: 0.6 }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "6px" }}>
              <p style={{ fontSize: "10.5px", lineHeight: 1.7, letterSpacing: "-0.01em", color: "rgb(var(--fg))", margin: 0, opacity: 0.85 }}>
                <span style={{ fontWeight: 600 }}>We build whatever your vision demands.</span>{" "}
                Storefronts, apps, brands, tools.
              </p>
              <div style={{ display: "flex", gap: "5px", marginTop: "4px" }}>
                <div style={{ height: "14px", borderRadius: "7px", background: "rgb(var(--fg))", opacity: 0.65, width: "56px" }} />
                <div style={{ height: "14px", borderRadius: "7px", border: "1px solid rgb(var(--line))", width: "44px" }} />
              </div>
            </div>
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}

// ── Pulse grid ────────────────────────────────────────────────────────

const GRID_W = 480;
const GRID_H = 360;
const GRID_COLS = 9;
const GRID_ROWS = 7;
const VP_X = GRID_W / 2;
const VP_Y = GRID_H * 0.5; // horizon sits at vertical midpoint
const ABOUT_TEXT = "Most agencies will disappoint you. We're built so we don't.";

// Perspective grid points below the horizon
const GRID_POINTS = (() => {
  const pts: { cx: number; cy: number; r: number; baseOp: number; row: number; col: number }[] = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    // linear t so rows are evenly spaced in perspective depth
    const t = (row + 1) / GRID_ROWS;
    const cy = VP_Y + t * (GRID_H - VP_Y) * 1.05; // slight overshoot
    const halfSpread = t * (GRID_W / 2) * 1.05;   // slight overshoot so edges bleed
    for (let col = 0; col < GRID_COLS; col++) {
      const norm = (col / (GRID_COLS - 1)) - 0.5;
      const cx = VP_X + norm * halfSpread * 2;
      const edgeFade = 1 - Math.abs(norm) * 0.35;
      const r = 0.7 + t * 1.8;
      const baseOp = (0.07 + t * 0.22) * edgeFade;
      pts.push({ cx, cy, r, baseOp, row, col });
    }
  }
  return pts;
})();

function PulseGrid() {
  const svgRef = useRef<SVGSVGElement>(null);
  const circleRefs = useRef<(SVGCircleElement | null)[]>([]);
  const ripples = useRef<{ x: number; y: number; t: number }[]>([]);
  const rafRef = useRef<number>(0);
  const lastIdleRipple = useRef<number>(0);

  useEffect(() => {
    let running = true;

    const animate = (now: number) => {
      if (!running) return;

      if (now - lastIdleRipple.current > 2800) {
        const col = Math.floor(Math.random() * GRID_COLS);
        const pt = GRID_POINTS[(GRID_ROWS - 1) * GRID_COLS + col];
        if (pt) ripples.current.push({ x: pt.cx, y: pt.cy, t: now });
        lastIdleRipple.current = now;
      }

      ripples.current = ripples.current.filter(r => now - r.t < 2000);

      circleRefs.current.forEach((el, i) => {
        if (!el) return;
        const d = GRID_POINTS[i];
        let boost = 0;
        for (const rip of ripples.current) {
          const age = (now - rip.t) / 1000;
          const dist = Math.sqrt((d.cx - rip.x) ** 2 + (d.cy - rip.y) ** 2);
          const waveFront = age * 260;
          const spread = 32;
          const delta = Math.abs(dist - waveFront);
          if (delta < spread) {
            const wave = Math.cos((delta / spread) * Math.PI * 0.5);
            const fade = Math.max(0, 1 - age / 2.0);
            boost = Math.max(boost, wave * fade * 0.7);
          }
        }
        el.style.opacity = String(Math.min(1, d.baseOp + boost));
        el.setAttribute("r", String(d.r * (1 + boost * 0.6)));
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { running = false; cancelAnimationFrame(rafRef.current); };
  }, []);

  const addRipple = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * GRID_W;
    const y = ((clientY - rect.top) / rect.height) * GRID_H;
    ripples.current.push({ x, y, t: performance.now() });
  };

  // Radial lines: from VP to bottom edge
  const radialLines = Array.from({ length: GRID_COLS }, (_, col) => {
    const norm = (col / (GRID_COLS - 1)) - 0.5;
    const x2 = VP_X + norm * GRID_W * 1.05;
    return { x1: VP_X, y1: VP_Y, x2, y2: GRID_H };
  });

  // Horizontal lines: connect left to right at each row
  const horizontalLines = Array.from({ length: GRID_ROWS }, (_, row) => {
    const left = GRID_POINTS[row * GRID_COLS];
    const right = GRID_POINTS[row * GRID_COLS + GRID_COLS - 1];
    const t = (row + 1) / GRID_ROWS;
    return { x1: left.cx, y1: left.cy, x2: right.cx, y2: right.cy, op: 0.04 + t * 0.08 };
  });

  return (
    <div
      className="relative w-full select-none overflow-hidden cursor-crosshair"
      style={{ height: 380 }}
      onMouseMove={e => addRipple(e.clientX, e.clientY)}
      onClick={e => addRipple(e.clientX, e.clientY)}
      onTouchMove={e => { const t = e.touches[0]; if (t) addRipple(t.clientX, t.clientY); }}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${GRID_W} ${GRID_H}`}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0, animation: "rise-in 1000ms cubic-bezier(0.16,1,0.3,1) 300ms forwards" }}
      >
        {radialLines.map((l, i) => (
          <line key={`r${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="rgb(var(--fg))" strokeWidth="0.4" opacity={0.07} />
        ))}
        {horizontalLines.map((l, i) => (
          <line key={`h${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="rgb(var(--fg))" strokeWidth="0.4" opacity={l.op} />
        ))}
        {GRID_POINTS.map((d, i) => (
          <circle
            key={i}
            ref={el => { circleRefs.current[i] = el; }}
            cx={d.cx} cy={d.cy} r={d.r}
            fill="rgb(var(--fg))"
            style={{ opacity: d.baseOp }}
          />
        ))}
      </svg>

      {/* Gradient: solid bg top half (text lives here), fade at sides */}
      <div className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: "55%", background: "linear-gradient(to bottom, rgb(var(--bg)) 60%, transparent 100%)" }} />
      <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ height: "8%", background: "linear-gradient(to top, rgb(var(--bg)) 0%, transparent 100%)" }} />
      <div className="absolute inset-y-0 left-0 pointer-events-none" style={{ width: "5%", background: "linear-gradient(to right, rgb(var(--bg)) 0%, transparent 100%)" }} />
      <div className="absolute inset-y-0 right-0 pointer-events-none" style={{ width: "5%", background: "linear-gradient(to left, rgb(var(--bg)) 0%, transparent 100%)" }} />

      <div className="absolute inset-x-0 flex flex-col items-center justify-center px-6 pointer-events-none" style={{ top: 0, height: "52%" }}>
        <p
          className="pulse-grid-text text-center tracking-tight leading-tight font-medium"
          style={{
            fontSize: "clamp(1.75rem, 4.5vw, 2.1rem)",
            maxWidth: 340,
            opacity: 0,
            animation: "rise-in 700ms cubic-bezier(0.22,1,0.36,1) 400ms forwards",
          }}
        >
          {ABOUT_TEXT}
        </p>
      </div>
    </div>
  );
}


const STACK_PHRASES = [
  "We don't pick a lane. We own the whole road.",
  "Quality isn't a setting we turn on. It's the default.",
  "Most studios specialize. We refused to.",
  "Built by people who care what ships.",
  "Every field mastered. Every project, complete.",
];

function PhraseChars({ phrase, stage }: { phrase: string; stage: "enter" | "idle" | "exit" }) {
  const words = phrase.split(" ");
  const total = words.length;
  return (
    <>
      {words.map((word, i) => {
        const enterDelay = i * 40;
        const exitDelay = i * 28;
        let opacity = 1, blur = "blur(0px)", transform = "translateY(0px)", transition = "";
        if (stage === "enter") {
          opacity = 0;
          blur = "blur(3px)";
          transform = "translateY(8px)";
          transition = "none";
        } else if (stage === "idle") {
          opacity = 1;
          blur = "blur(0px)";
          transform = "translateY(0px)";
          transition = `opacity 400ms cubic-bezier(0.22,1,0.36,1) ${enterDelay}ms, filter 300ms ease ${enterDelay}ms, transform 500ms cubic-bezier(0.22,1,0.36,1) ${enterDelay}ms`;
        } else {
          opacity = 0;
          blur = "blur(0px)";
          transform = "translateY(-6px)";
          transition = `opacity 180ms ease ${exitDelay}ms, transform 180ms cubic-bezier(0.4,0,1,1) ${exitDelay}ms`;
        }
        return (
          <span key={i} style={{ display: "inline", whiteSpace: "nowrap" }}>
            <span
              aria-hidden="true"
              style={{
                display: "inline-block",
                opacity,
                filter: blur,
                transform,
                transition,
              }}
            >
              {word}
            </span>
            {i < total - 1 && " "}
          </span>
        );
      })}
    </>
  );
}

function StackPhrase() {
  const [idx, setIdx] = useState(0);
  const [stage, setStage] = useState<"enter" | "idle" | "exit">("enter");

  useLayoutEffect(() => {
    if (stage === "enter") {
      // force a paint in the hidden state, then transition to idle
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setStage("idle"));
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [stage, idx]);

  useEffect(() => {
    if (stage !== "idle") return;
    const phrase = STACK_PHRASES[idx];
    const idleDuration = 3600;
    const t = setTimeout(() => {
      setStage("exit");
      const exitDuration = (phrase.split(" ").length - 1) * 28 + 220;
      setTimeout(() => {
        setIdx(i => (i + 1) % STACK_PHRASES.length);
        setStage("enter");
      }, exitDuration);
    }, idleDuration);
    return () => clearTimeout(t);
  }, [stage, idx]);

  return (
    <p
      aria-label={STACK_PHRASES[idx]}
      className="text-[clamp(1.5rem,3vw,1.9rem)] font-[450] tracking-tight text-[rgb(var(--fg))] leading-snug pr-4 sm:pr-12"
      style={{ overflow: "visible", paddingTop: "6px", paddingBottom: "12px" }}
    >
      <PhraseChars phrase={STACK_PHRASES[idx]} stage={stage} />
    </p>
  );
}

function StackDiagram() {
  const upperCurve = "M1356 796.5H1419.5C1638.5 779.5 1657 623 1761 623";
  const lowerCurve = "M1356.5 797H1420C1639 814 1657.5 970.5 1761.5 970.5";
  const leftLine = "M366 781 L798 781";

  const nodeRef = useRef<SVGGElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const vel = useRef({ x: 0, y: 0 });
  const raf = useRef<number | null>(null);
  const target = useRef({ x: 0, y: 0 });
  const isHovering = useRef(false);

  useEffect(() => {
    const STIFFNESS = 0.18;
    const DAMPING = 0.72;
    const tick = () => {
      if (!nodeRef.current) return;
      const tx = isHovering.current ? target.current.x : 0;
      const ty = isHovering.current ? target.current.y : 0;
      const ax = (tx - pos.current.x) * STIFFNESS;
      const ay = (ty - pos.current.y) * STIFFNESS;
      vel.current.x = vel.current.x * DAMPING + ax;
      vel.current.y = vel.current.y * DAMPING + ay;
      pos.current.x += vel.current.x;
      pos.current.y += vel.current.y;
      const settled = !isHovering.current &&
        Math.abs(pos.current.x) < 0.01 && Math.abs(pos.current.y) < 0.01 &&
        Math.abs(vel.current.x) < 0.01 && Math.abs(vel.current.y) < 0.01;
      if (!settled) {
        nodeRef.current.style.transform = `translate(${pos.current.x.toFixed(2)}px, ${pos.current.y.toFixed(2)}px)`;
        raf.current = requestAnimationFrame(tick);
      } else {
        pos.current = { x: 0, y: 0 };
        vel.current = { x: 0, y: 0 };
        nodeRef.current.style.transform = "";
        raf.current = null;
      }
    };
    const onMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = 2115 / rect.width;
      const scaleY = 1562 / rect.height;
      const cx = rect.left + rect.width * (1076 / 2115);
      const cy = rect.top + rect.height * (781 / 1562);
      target.current = {
        x: (e.clientX - cx) * 0.18 / Math.min(scaleX, scaleY) * scaleX,
        y: (e.clientY - cy) * 0.18 / Math.min(scaleX, scaleY) * scaleY,
      };
      if (!raf.current) raf.current = requestAnimationFrame(tick);
    };
    const onEnter = () => { isHovering.current = true; };
    const onLeave = () => {
      isHovering.current = false;
      if (!raf.current) raf.current = requestAnimationFrame(tick);
    };
    const svg = svgRef.current;
    svg?.addEventListener("mousemove", onMove as EventListener);
    svg?.addEventListener("mouseenter", onEnter);
    svg?.addEventListener("mouseleave", onLeave);
    return () => {
      svg?.removeEventListener("mousemove", onMove as EventListener);
      svg?.removeEventListener("mouseenter", onEnter);
      svg?.removeEventListener("mouseleave", onLeave);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div className="flex flex-col sm:flex-row border-b border-[rgb(var(--line))]" style={{ overflow: "visible" }}>
      {/* Left: copy */}
      <div className="flex flex-col justify-center px-6 sm:px-8 py-8 gap-3 sm:flex-1 border-b border-[rgb(var(--line))] sm:border-b-0 sm:border-r border-[rgb(var(--line))]" style={{ overflow: "visible" }}>
        <span className="inline-flex items-center gap-1.5 text-[13px] tracking-tight text-[rgb(var(--muted))] self-start border border-[rgb(var(--line))] rounded-full px-3 py-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 opacity-60" aria-hidden="true">
            <rect x="7" y="7" width="10" height="10" rx="1" /><line x1="7" y1="9" x2="4" y2="9" /><line x1="7" y1="12" x2="4" y2="12" /><line x1="7" y1="15" x2="4" y2="15" /><line x1="17" y1="9" x2="20" y2="9" /><line x1="17" y1="12" x2="20" y2="12" /><line x1="17" y1="15" x2="20" y2="15" /><line x1="9" y1="7" x2="9" y2="4" /><line x1="12" y1="7" x2="12" y2="4" /><line x1="15" y1="7" x2="15" y2="4" /><line x1="9" y1="17" x2="9" y2="20" /><line x1="12" y1="17" x2="12" y2="20" /><line x1="15" y1="17" x2="15" y2="20" />
          </svg>
          Precision at every layer.
        </span>
        <StackPhrase />
        <Link href="/blog" className="self-start inline-flex items-center gap-2.5 mt-1 group">
          <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] group-hover:text-[rgb(var(--fg))] transition-colors">Read the blog</span>
          <span className="inline-flex items-center justify-center w-9 h-9 border border-[rgb(var(--line))] rounded-full text-[rgb(var(--muted))] group-hover:text-[rgb(var(--fg))] group-hover:border-[rgb(var(--fg)/0.3)] transition-colors text-[13px] leading-none shrink-0">
            <span style={{ lineHeight: 1, display: "block", marginTop: "1px" }}>→</span>
          </span>
        </Link>
      </div>
      {/* Right: diagram — exact SVG from design file, with animated line overlays */}
      <div className="flex items-center justify-center overflow-hidden sm:w-[38%] sm:shrink-0 sm:self-stretch py-6">
        <svg ref={svgRef} viewBox="0 0 2115 1562" fill="none" className="w-full" preserveAspectRatio="xMidYMid meet" style={{ maxHeight: 280 }} aria-hidden="true">
          <defs>
            <filter id="sd-filter0" x="971.476px" y="672.5px" width="212.104px" height="240.5px" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
              <feOffset/>
              <feGaussianBlur stdDeviation="12.6"/>
              <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
              <feBlend mode="normal" in2="shape" result="effect1_innerShadow"/>
            </filter>
            <clipPath id="sd-clip0">
              <rect width="175" height="173" fill="white" transform="translate(81 1268)"/>
            </clipPath>
            <clipPath id="sd-clip1">
              <rect width="156" height="156" fill="white" transform="translate(1862 545)"/>
            </clipPath>
          </defs>
          <rect x="4.5" y="4.5" width="341" height="1553" rx="37.5" stroke="rgb(var(--fg))" strokeOpacity="0.2" strokeWidth="9"/>
          <path d="M798 784L801 784L801 778L798 778L798 781L798 784ZM334 781C334 789.837 341.163 797 350 797C358.837 797 366 789.837 366 781C366 772.163 358.837 765 350 765C341.163 765 334 772.163 334 781ZM350 781L350 784L355.895 784L355.895 781L355.895 778L350 778L350 781ZM367.684 781L367.684 784L379.474 784L379.474 781L379.474 778L367.684 778L367.684 781ZM391.263 781L391.263 784L403.053 784L403.053 781L403.053 778L391.263 778L391.263 781ZM414.842 781L414.842 784L426.632 784L426.632 781L426.632 778L414.842 778L414.842 781ZM438.421 781L438.421 784L450.211 784L450.211 781L450.211 778L438.421 778L438.421 781ZM462 781L462 784L473.789 784L473.789 781L473.789 778L462 778L462 781ZM485.579 781L485.579 784L497.368 784L497.368 781L497.368 778L485.579 778L485.579 781ZM509.158 781L509.158 784L520.947 784L520.947 781L520.947 778L509.158 778L509.158 781ZM532.737 781L532.737 784L544.526 784L544.526 781L544.526 778L532.737 778L532.737 781ZM556.316 781L556.316 784L568.105 784L568.105 781L568.105 778L556.316 778L556.316 781ZM579.895 781L579.895 784L591.684 784L591.684 781L591.684 778L579.895 778L579.895 781ZM603.474 781L603.474 784L615.263 784L615.263 781L615.263 778L603.474 778L603.474 781ZM627.053 781L627.053 784L638.842 784L638.842 781L638.842 778L627.053 778L627.053 781ZM650.632 781L650.632 784L662.421 784L662.421 781L662.421 778L650.632 778L650.632 781ZM674.21 781L674.21 784L686 784L686 781L686 778L674.21 778L674.21 781ZM697.789 781L697.789 784L709.579 784L709.579 781L709.579 778L697.789 778L697.789 781ZM721.368 781L721.368 784L733.158 784L733.158 781L733.158 778L721.368 778L721.368 781ZM744.947 781L744.947 784L756.737 784L756.737 781L756.737 778L744.947 778L744.947 781ZM768.526 781L768.526 784L780.316 784L780.316 781L780.316 778L768.526 778L768.526 781ZM792.105 781L792.105 784L798 784L798 781L798 778L792.105 778L792.105 781Z" fill="rgb(var(--fg))" opacity="0.4"/>
          <g opacity="0.4">
          <path d="M173.5 118C125.181 118 86 158.166 86 207.715C86 247.354 111.071 280.983 145.838 292.846C150.211 293.676 151.817 290.9 151.817 288.53C151.817 286.391 151.735 279.323 151.698 271.827C127.355 277.254 122.218 261.241 122.218 261.241C118.238 250.871 112.503 248.115 112.503 248.115C104.564 242.546 113.101 242.66 113.101 242.66C121.888 243.294 126.515 251.906 126.515 251.906C134.319 265.621 146.984 261.656 151.977 259.364C152.763 253.565 155.031 249.608 157.533 247.367C138.098 245.098 117.667 237.406 117.667 203.03C117.667 193.235 121.085 185.232 126.683 178.949C125.774 176.689 122.78 167.564 127.53 155.207C127.53 155.207 134.878 152.795 151.599 164.403C158.579 162.415 166.064 161.418 173.5 161.384C180.937 161.418 188.428 162.415 195.421 164.403C212.122 152.795 219.459 155.207 219.459 155.207C224.222 167.564 221.226 176.689 220.317 178.949C225.927 185.232 229.322 193.235 229.322 203.03C229.322 237.487 208.853 245.075 189.369 247.296C192.507 250.08 195.303 255.54 195.303 263.91C195.303 275.913 195.202 285.575 195.202 288.53C195.202 290.917 196.777 293.715 201.213 292.834C235.96 280.958 261 247.341 261 207.715C261 158.166 221.824 118 173.5 118Z" fill="rgb(var(--fg))"/>
          <path d="M117.039 252.332C116.872 252.722 116.276 252.839 115.735 252.572C115.182 252.315 114.872 251.783 115.051 251.391C115.215 250.99 115.811 250.877 116.362 251.147C116.916 251.403 117.231 251.94 117.039 252.332ZM120.785 255.78C120.422 256.127 119.712 255.966 119.23 255.417C118.732 254.869 118.639 254.137 119.007 253.784C119.382 253.437 120.07 253.599 120.57 254.148C121.068 254.701 121.164 255.429 120.785 255.78L120.785 255.78ZM123.355 260.191C122.888 260.525 122.125 260.212 121.653 259.513C121.187 258.815 121.187 257.977 121.664 257.641C122.137 257.306 122.888 257.607 123.366 258.301C123.831 259.011 123.831 259.849 123.354 260.191L123.355 260.191ZM127.7 265.3C127.283 265.774 126.394 265.647 125.743 264.999C125.078 264.366 124.892 263.467 125.311 262.992C125.733 262.516 126.627 262.65 127.283 263.292C127.944 263.925 128.146 264.83 127.701 265.3H127.7ZM133.316 267.025C133.133 267.639 132.277 267.919 131.414 267.658C130.553 267.389 129.989 266.668 130.163 266.046C130.342 265.427 131.202 265.136 132.071 265.415C132.931 265.683 133.496 266.399 133.317 267.025H133.316ZM139.709 267.756C139.73 268.404 138.999 268.941 138.093 268.953C137.183 268.973 136.446 268.449 136.437 267.812C136.437 267.158 137.152 266.625 138.062 266.61C138.967 266.592 139.709 267.112 139.709 267.756ZM145.988 267.508C146.096 268.14 145.467 268.789 144.568 268.962C143.684 269.128 142.866 268.738 142.753 268.111C142.643 267.463 143.285 266.815 144.167 266.646C145.068 266.485 145.873 266.865 145.988 267.508Z" fill="rgb(var(--fg))"/>
          </g>
          <g opacity="0.4">
          <path d="M175.87 428.907L224.85 563H251.71L202.73 428.907H175.87Z" fill="rgb(var(--fg))"/>
          <path d="M118.877 509.937L135.58 462.813L152.284 509.937H118.877ZM121.585 428.907L72.7754 563H100.067L110.049 534.84H161.113L171.094 563H198.385L149.576 428.907H121.585Z" fill="rgb(var(--fg))"/>
          </g>
          <g opacity="0.4">
          <path d="M111.87 695.296H216.705C232.6 695.296 245.45 708.205 245.45 724.172V825.409C245.45 841.377 232.6 854.286 216.705 854.286H111.87C95.9753 854.286 83.125 841.377 83.125 825.409V724.172C83.125 708.205 95.9753 695.296 111.87 695.296Z" fill="rgb(var(--fg))"/>
          <path d="M141.353 736.117C139.32 736.117 137.288 736.117 135.189 736.187C133.088 736.255 131.123 736.255 129.294 736.325C127.465 736.393 125.772 736.393 124.146 736.461C122.587 736.529 121.504 736.529 120.352 736.529C119.878 736.529 119.675 736.803 119.675 737.285V807.908C119.675 808.526 119.945 808.801 120.488 808.801H133.63C134.104 808.732 134.443 808.32 134.374 807.84V785.809C135.661 785.809 136.61 785.809 137.288 785.877C137.965 785.945 139.049 785.945 140.674 785.945C146.23 785.945 151.311 785.327 155.917 783.612C160.32 781.965 164.114 779.082 166.823 775.238C169.533 771.395 170.888 766.522 170.888 760.619C170.888 757.531 170.347 754.58 169.331 751.698C168.254 748.761 166.567 746.093 164.385 743.873C161.809 741.338 158.708 739.415 155.307 738.245C151.513 736.803 146.907 736.117 141.353 736.117ZM142.864 749.636C145.278 749.682 147.627 750.11 149.82 751.01C151.785 751.766 153.41 753.139 154.562 754.922C155.643 756.768 156.183 758.887 156.121 761.033C156.121 764.052 155.443 766.386 154.02 768.101C152.529 769.817 150.633 771.122 148.466 771.739C145.958 772.563 143.316 772.973 140.674 772.973H137.084C136.271 772.973 135.392 772.905 134.443 772.837V749.776C134.917 749.707 135.866 749.639 137.221 749.708C138.508 749.639 140.065 749.639 141.827 749.639C142.174 749.63 142.52 749.629 142.864 749.636ZM199.679 753.14C194.869 753.14 190.872 753.894 187.688 755.541C184.776 756.915 182.269 759.11 180.576 761.855C179.086 764.395 178.271 767.208 178.271 770.16C178.214 772.588 178.749 774.993 179.83 777.161C181.097 779.469 182.856 781.462 184.979 782.994C187.959 785.059 191.193 786.721 194.598 787.936C197.917 789.239 200.153 790.269 201.237 791.161C202.321 792.054 202.863 792.946 202.863 793.907C202.863 795.142 202.118 796.31 201.034 796.79C199.815 797.407 197.986 797.751 195.411 797.751C192.702 797.751 189.991 797.407 187.417 796.721C184.46 796.052 181.626 794.918 179.017 793.359C178.814 793.221 178.611 793.153 178.407 793.291C178.204 793.427 178.137 793.701 178.137 793.907V805.849C178.07 806.399 178.407 806.879 178.882 807.153C181.079 808.192 183.403 808.931 185.792 809.349C188.841 809.967 191.888 810.241 195.003 810.241C199.881 810.241 203.947 809.487 207.266 808.046C210.314 806.81 212.956 804.683 214.852 801.937C216.628 799.237 217.55 796.053 217.494 792.809C217.561 790.359 217.026 787.93 215.937 785.74C214.649 783.406 212.82 781.485 210.585 780.043C207.314 777.963 203.813 776.281 200.153 775.032C198.518 774.347 196.913 773.591 195.343 772.768C194.462 772.288 193.649 771.67 193.04 770.914C192.633 770.365 192.363 769.749 192.363 769.131C192.363 768.513 192.566 767.827 192.904 767.278C193.379 766.592 194.123 766.111 195.003 765.905C196.291 765.562 197.714 765.355 199.068 765.423C201.643 765.423 204.149 765.767 206.656 766.316C208.96 766.796 211.127 767.552 213.159 768.651C213.43 768.787 213.769 768.787 214.379 768.651C214.484 768.571 214.57 768.468 214.629 768.348C214.688 768.229 214.718 768.097 214.718 767.964V756.777C214.718 756.501 214.649 756.227 214.582 755.953C214.446 755.679 214.175 755.404 213.905 755.336C212.036 754.562 210.079 754.031 208.078 753.757C205.297 753.346 202.49 753.141 199.679 753.14Z" fill="rgb(var(--bg))"/>
          </g>
          <path fillRule="evenodd" clipRule="evenodd" d="M2019 418L1939.5 281L1860 418H2019Z" fill="rgb(var(--fg))" opacity="0.4"/>
          <path d="M1765.64 390.881L1771.02 389.741L1768.74 378.98L1763.36 380.119L1764.5 385.5L1765.64 390.881ZM1353.5 794.5V800H1394.06V794.5V789H1353.5V794.5ZM1435.13 782.993L1438.38 787.428C1467.88 765.799 1488.75 732.591 1507.07 695.031C1516.25 676.209 1524.87 656.116 1533.61 635.657C1542.37 615.157 1551.26 594.275 1561.04 573.674C1600.16 491.348 1653.08 414.728 1765.64 390.881L1764.5 385.5L1763.36 380.119C1645.74 405.036 1590.74 485.537 1551.11 568.953C1541.21 589.788 1532.23 610.88 1523.49 631.335C1514.73 651.831 1506.22 671.674 1497.18 690.21C1479.06 727.365 1459.15 758.561 1431.88 778.558L1435.13 782.993ZM1394.06 794.5V800C1409.27 800 1425.33 797.002 1438.38 787.428L1435.13 782.993L1431.88 778.558C1421.43 786.222 1408.01 789 1394.06 789V794.5Z" fill="#a78bfa" opacity="0.6"/>
          <g opacity="0.4">
          <path d="M138.292 1004H138.117L137.891 1023.07H138.051C150.556 1023.07 160.261 1032.96 181.363 1068.61L182.64 1070.78L182.727 1070.92L194.54 1053.15L194.452 1053.01C191.871 1048.78 189.201 1044.61 186.446 1040.49C183.733 1036.43 180.875 1032.47 177.878 1028.62C163.929 1010.8 152.262 1004 138.292 1004Z" fill="rgb(var(--fg))"/>
          <path d="M138.118 1004C124.096 1004.07 111.678 1013.17 102.731 1027.11C102.707 1027.16 102.682 1027.2 102.658 1027.24L119.094 1036.21L119.174 1036.09C124.409 1028.19 130.913 1023.16 137.899 1023.07H138.052L138.285 1004H138.118Z" fill="rgb(var(--fg))"/>
          <path d="M102.723 1027.11L102.643 1027.24C96.7514 1036.43 92.3618 1047.71 89.9993 1059.88L89.9629 1060.04L108.44 1064.42L108.469 1064.26C110.438 1053.56 114.2 1043.64 119.086 1036.22L119.166 1036.1L102.723 1027.11Z" fill="rgb(var(--fg))"/>
          <path d="M108.469 1064.26L89.9989 1059.88L89.9624 1060.04C88.6718 1066.74 88.0156 1073.54 88.001 1080.36V1080.53L106.945 1082.23V1082.06C106.876 1076.09 107.389 1070.13 108.476 1064.27L108.469 1064.26Z" fill="rgb(var(--fg))"/>
          <path d="M107.521 1088.12C107.181 1086.16 106.988 1084.18 106.945 1082.19V1082.03L88.0009 1080.33V1080.5C87.9796 1084.54 88.336 1088.57 89.0655 1092.55L107.55 1088.28C107.54 1088.23 107.53 1088.18 107.521 1088.12Z" fill="rgb(var(--fg))"/>
          <path d="M111.844 1097.99C109.774 1095.73 108.315 1092.48 107.55 1088.31L107.52 1088.15L89.0361 1092.42L89.0653 1092.57C90.4653 1099.94 93.207 1106.06 97.1299 1110.71L97.232 1110.83L111.947 1098.11C111.91 1098.07 111.881 1098.03 111.844 1097.99Z" fill="rgb(var(--fg))"/>
          <path d="M166.605 1045.23C155.463 1062.36 148.711 1073.12 148.711 1073.12C133.873 1096.45 128.739 1101.68 120.485 1101.68C118.862 1101.72 117.249 1101.41 115.756 1100.77C114.263 1100.14 112.927 1099.18 111.837 1097.98L97.1299 1110.69L97.232 1110.82C102.657 1117.15 110.299 1120.67 119.763 1120.67C134.077 1120.67 144.365 1113.9 162.667 1081.8L175.544 1058.98C172.688 1054.32 169.711 1049.73 166.605 1045.23Z" fill="rgb(var(--fg))"/>
          <path d="M186.454 1018.19L186.337 1018.31C183.421 1021.44 180.606 1024.93 177.879 1028.63C180.635 1032.16 183.479 1036.1 186.447 1040.52C189.947 1035.1 193.213 1030.71 196.414 1027.34L196.531 1027.23L186.454 1018.19Z" fill="rgb(var(--fg))"/>
          <path d="M240.529 1016.49C232.763 1008.62 223.502 1004 213.6 1004C203.159 1004 194.372 1009.74 186.454 1018.17L186.337 1018.29L196.414 1027.33L196.531 1027.21C201.744 1021.76 206.797 1019.04 212.397 1019.04C218.42 1019.04 224.064 1021.89 228.949 1026.88L229.059 1027L240.645 1016.61L240.529 1016.49Z" fill="rgb(var(--fg))"/>
          <path d="M262.985 1077.83C262.547 1052.55 253.724 1029.95 240.643 1016.61L240.526 1016.49L228.947 1026.87L229.057 1026.99C238.9 1037.14 245.66 1056.01 246.272 1077.82V1077.99H262.985V1077.83Z" fill="rgb(var(--fg))"/>
          <path d="M262.985 1078.01V1077.84H246.273V1078C246.302 1079.02 246.316 1080.06 246.316 1081.09C246.316 1087.04 245.434 1091.84 243.633 1095.31L243.553 1095.47L256.007 1108.47L256.102 1108.32C260.623 1101.32 263 1091.6 263 1079.81C263 1079.21 263 1078.61 262.985 1078.01Z" fill="rgb(var(--fg))"/>
          <path d="M243.634 1095.29L243.554 1095.43C241.993 1098.37 239.769 1100.32 236.867 1101.17L242.54 1119.12C243.634 1118.76 244.701 1118.31 245.734 1117.8C249.772 1115.76 253.205 1112.69 255.694 1108.92L256.015 1108.44L256.103 1108.3L243.634 1095.29Z" fill="rgb(var(--fg))"/>
          <path d="M233.25 1101.66C231.34 1101.66 229.663 1101.37 228.015 1100.64L222.196 1119.03C225.47 1120.14 228.956 1120.64 232.842 1120.64C236.43 1120.64 239.718 1120.11 242.7 1119.08L237.013 1101.12C235.795 1101.49 234.534 1101.67 233.25 1101.66Z" fill="rgb(var(--fg))"/>
          <path d="M221.605 1095.39L221.503 1095.27L208.115 1109.22L208.232 1109.35C212.877 1114.32 217.317 1117.4 222.356 1119.1L228.167 1100.72C226.045 1099.81 223.989 1098.15 221.605 1095.39Z" fill="rgb(var(--fg))"/>
          <path d="M221.504 1095.25C217.494 1090.57 212.521 1082.77 204.711 1070.17L194.532 1053.14L194.452 1052.99L182.64 1070.77L182.727 1070.91L189.939 1083.08C196.931 1094.82 202.626 1103.3 208.117 1109.22L208.233 1109.33L221.606 1095.38C221.572 1095.34 221.538 1095.29 221.504 1095.25Z" fill="rgb(var(--fg))"/>
          </g>
          <rect x="1769.5" y="161.5" width="341" height="1241" rx="37.5" stroke="rgb(var(--fg))" strokeOpacity="0.2" strokeWidth="9"/>
          <g clipPath="url(#sd-clip0)" opacity="0.4">
            <path d="M82.665 1328.33C82.665 1328.33 78.4026 1325.26 83.5174 1321.16L95.4342 1310.51C95.4342 1310.51 98.8441 1306.92 102.449 1310.05L212.418 1393.24V1433.14C212.418 1433.14 212.365 1439.4 204.319 1438.71L82.665 1328.33Z" fill="rgb(var(--fg))"/>
            <path d="M111.009 1354.04L82.6646 1379.79C82.6646 1379.79 79.752 1381.96 82.6646 1385.83L95.8246 1397.79C95.8246 1397.79 98.9503 1401.14 103.568 1397.33L133.617 1374.56L111.009 1354.04Z" fill="rgb(var(--fg))"/>
            <path d="M160.772 1354.26L212.755 1314.59L212.417 1274.91C212.417 1274.91 210.197 1266.25 202.792 1270.76L133.617 1333.67L160.772 1354.26Z" fill="rgb(var(--fg))"/>
            <path d="M204.319 1438.77C207.338 1441.85 210.997 1440.84 210.997 1440.84L251.507 1420.89C256.693 1417.36 255.965 1412.98 255.965 1412.98V1293.86C255.965 1288.63 250.601 1286.82 250.601 1286.82L215.49 1269.91C207.818 1265.17 202.792 1270.76 202.792 1270.76C202.792 1270.76 209.257 1266.11 212.418 1274.91V1432.41C212.418 1433.49 212.187 1434.56 211.725 1435.52C210.802 1437.38 208.795 1439.12 203.982 1438.39L204.319 1438.77Z" fill="rgb(var(--fg))"/>
          </g>
          <g clipPath="url(#sd-clip1)" opacity="0.4">
            <path d="M1998.36 575.634C1998.23 574.854 1997.45 574.422 1996.81 574.374C1996.17 574.327 1982.56 573.443 1982.56 573.443C1982.56 573.443 1973.11 565.219 1972.08 564.308C1971.04 563.398 1969.01 563.675 1968.23 563.878C1968.11 563.908 1966.16 564.435 1962.94 565.31C1959.78 557.346 1954.21 550.028 1944.41 550.028C1944.14 550.028 1943.86 550.038 1943.59 550.052C1940.8 546.82 1937.35 545.416 1934.36 545.416C1911.54 545.416 1900.63 570.438 1897.21 583.153C1888.34 585.563 1882.04 587.276 1881.23 587.498C1876.28 588.859 1876.13 588.996 1875.48 593.087C1874.99 596.184 1862.03 684.03 1862.03 684.03L1962.98 700.614L2017.68 690.239C2017.68 690.239 1998.48 576.414 1998.36 575.634ZM1957.36 566.823L1948.82 569.141C1948.82 568.613 1948.82 568.094 1948.82 567.526C1948.82 562.577 1948.04 558.592 1946.78 555.433C1951.83 555.988 1955.2 561.026 1957.36 566.823ZM1940.52 556.414C1941.92 559.498 1942.84 563.925 1942.84 569.897C1942.84 570.203 1942.83 570.482 1942.83 570.765C1937.27 572.274 1931.24 573.912 1925.19 575.555C1928.59 564.06 1934.95 558.508 1940.52 556.414ZM1933.74 550.785C1934.72 550.785 1935.71 551.078 1936.66 551.651C1929.35 554.67 1921.51 562.272 1918.2 577.454L1904.25 581.241C1908.13 569.661 1917.34 550.785 1933.74 550.785Z" fill="rgb(var(--fg))"/>
            <path d="M1996.81 574.374C1996.17 574.327 1982.56 573.443 1982.56 573.443C1982.56 573.443 1973.11 565.219 1972.08 564.308C1971.69 563.969 1971.17 563.796 1970.62 563.721L1962.99 700.613L2017.68 690.239C2017.68 690.239 1998.48 576.414 1998.36 575.634C1998.23 574.854 1997.45 574.422 1996.81 574.374Z" fill="rgb(var(--fg))" opacity="0.6"/>
            <path d="M1944.41 600.874L1937.67 618.465C1937.67 618.465 1931.76 615.7 1924.52 615.7C1913.9 615.7 1913.36 621.543 1913.36 623.015C1913.36 631.049 1937.25 634.127 1937.25 652.946C1937.25 667.751 1926.54 677.285 1912.1 677.285C1894.77 677.285 1885.91 667.829 1885.91 667.829L1890.55 654.387C1890.55 654.387 1899.65 661.244 1907.34 661.244C1912.36 661.244 1914.41 657.777 1914.41 655.243C1914.41 644.764 1894.81 644.296 1894.81 627.076C1894.81 612.582 1906.68 598.557 1930.63 598.557C1939.85 598.557 1944.41 600.874 1944.41 600.874Z" fill="rgb(var(--bg))"/>
          </g>
          {/* Upper curve — spine + comet */}
          <path d={upperCurve} stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" opacity="0.55"/>
          <path d={upperCurve} stroke="#a78bfa" strokeWidth="10" strokeLinecap="round"
            pathLength="1" strokeDasharray="0.2 0.8"
            style={{ animation: "sd-comet 3s ease-in-out 0s infinite" }}/>
          <path d={upperCurve} stroke="#ede9ff" strokeWidth="4" strokeLinecap="round"
            pathLength="1" strokeDasharray="0.06 0.94"
            style={{ animation: "sd-comet 3s ease-in-out 0s infinite" }}/>

          {/* Upper connector arrow — paired with upper curve */}
          {(() => {
            const d = "M1765.64 390.881L1771.02 389.741L1768.74 378.98L1763.36 380.119L1764.5 385.5L1765.64 390.881ZM1353.5 794.5V800H1394.06V794.5V789H1353.5V794.5ZM1435.13 782.993L1438.38 787.428C1467.88 765.799 1488.75 732.591 1507.07 695.031C1516.25 676.209 1524.87 656.116 1533.61 635.657C1542.37 615.157 1551.26 594.275 1561.04 573.674C1600.16 491.348 1653.08 414.728 1765.64 390.881L1764.5 385.5L1763.36 380.119C1645.74 405.036 1590.74 485.537 1551.11 568.953C1541.21 589.788 1532.23 610.88 1523.49 631.335C1514.73 651.831 1506.22 671.674 1497.18 690.21C1479.06 727.365 1459.15 758.561 1431.88 778.558L1435.13 782.993ZM1394.06 794.5V800C1409.27 800 1425.33 797.002 1438.38 787.428L1435.13 782.993L1431.88 778.558C1421.43 786.222 1408.01 789 1394.06 789V794.5Z";
            return (<>
              <path d={d} fill="none" stroke="#a78bfa" strokeWidth="10" strokeLinecap="round"
                pathLength="1" strokeDasharray="0.2 0.8"
                style={{ animation: "sd-comet 3s ease-in-out 0s infinite" }}/>
              <path d={d} fill="none" stroke="#ede9ff" strokeWidth="4" strokeLinecap="round"
                pathLength="1" strokeDasharray="0.06 0.94"
                style={{ animation: "sd-comet 3s ease-in-out 0s infinite" }}/>
              <path d={d} fill="#a78bfa" opacity="0.5"/>
            </>);
          })()}

          {/* Lower curve — spine + comet */}
          <path d={lowerCurve} stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" opacity="0.55"/>
          <path d={lowerCurve} stroke="#60a5fa" strokeWidth="10" strokeLinecap="round"
            pathLength="1" strokeDasharray="0.2 0.8"
            style={{ animation: "sd-comet 3s ease-in-out 0s infinite" }}/>
          <path d={lowerCurve} stroke="#daf0ff" strokeWidth="4" strokeLinecap="round"
            pathLength="1" strokeDasharray="0.06 0.94"
            style={{ animation: "sd-comet 3s ease-in-out 0s infinite" }}/>

          {/* Lower connector arrow — paired with lower curve */}
          {(() => {
            const d = "M1766.14 1202.62L1771.52 1203.76L1769.24 1214.52L1763.86 1213.38L1765 1208L1766.14 1202.62ZM1354 799V793.5H1394.56V799V804.5H1354V799ZM1435.63 810.507L1438.88 806.072C1468.38 827.701 1489.25 860.909 1507.57 898.469C1516.75 917.291 1525.37 937.384 1534.11 957.843C1542.87 978.343 1551.76 999.226 1561.54 1019.83C1600.66 1102.15 1653.58 1178.77 1766.14 1202.62L1765 1208L1763.86 1213.38C1646.24 1188.46 1591.24 1107.96 1551.61 1024.55C1541.71 1003.71 1532.73 982.62 1523.99 962.165C1515.23 941.669 1506.72 921.826 1497.68 903.291C1479.56 866.135 1459.65 834.939 1432.38 814.942L1435.63 810.507ZM1394.56 799V793.5C1409.77 793.5 1425.83 796.498 1438.88 806.072L1435.63 810.507L1432.38 814.942C1421.93 807.278 1408.01 804.5 1394.56 804.5V799Z";
            return (<>
              <path d={d} fill="none" stroke="#60a5fa" strokeWidth="10" strokeLinecap="round"
                pathLength="1" strokeDasharray="0.2 0.8"
                style={{ animation: "sd-comet 3s ease-in-out 0s infinite" }}/>
              <path d={d} fill="none" stroke="#daf0ff" strokeWidth="4" strokeLinecap="round"
                pathLength="1" strokeDasharray="0.06 0.94"
                style={{ animation: "sd-comet 3s ease-in-out 0s infinite" }}/>
              <path d={d} fill="#60a5fa" opacity="0.5"/>
            </>);
          })()}

          <rect x="798" y="503" width="556" height="556" rx="52" fill="rgb(var(--fg))" fillOpacity="0.07" stroke="rgb(var(--fg))" strokeOpacity="0.12" strokeWidth="3"/>
          <g ref={nodeRef} style={{ willChange: "transform" }}>
            <g filter="url(#sd-filter0)">
              <path d="M971.476 913V672.5H1013.4V913H971.476ZM1038.95 913V735.712H1073.4L1076.33 754.562H1078.44C1084.72 747.629 1092.09 742.321 1100.54 738.637C1109.1 734.846 1118.42 732.95 1128.49 732.95C1139.11 732.95 1148.53 735.062 1156.77 739.287C1165.11 743.404 1171.66 750.175 1176.43 759.6C1181.2 769.025 1183.58 781.592 1183.58 797.3V913H1142.3V799.9C1142.3 788.308 1139.87 780.292 1134.99 775.85C1130.22 771.408 1123.72 769.187 1115.49 769.187C1111.59 769.187 1107.47 769.783 1103.14 770.975C1098.81 772.167 1094.64 774.062 1090.63 776.662C1086.73 779.154 1083.32 782.458 1080.39 786.575V913H1038.95Z" fill="#c8c8c8"/>
            </g>
          </g>
          <g opacity="0.4">
          <path d="M1871.1 919C1857.82 919 1848.7 924.903 1841.74 931.497C1841.74 931.497 1838.95 934.156 1839 934.262L1868.1 963.617L1897.2 934.262C1891.66 926.605 1881.28 919 1871.1 919Z" fill="rgb(var(--fg))"/>
          <path d="M1942.95 919C1929.67 919 1920.55 924.903 1913.59 931.497C1913.59 931.497 1911.06 934.103 1910.9 934.262L1874.95 970.53L1904 999.832L1968.99 934.262C1963.46 926.605 1953.13 919 1942.95 919Z" fill="rgb(var(--fg))"/>
          <path d="M2014.96 919C2001.68 919 1992.56 924.903 1985.6 931.497C1985.6 931.497 1982.96 934.103 1982.86 934.262L1910.9 1006.85L1918.49 1014.51C1930.25 1026.37 1949.54 1026.37 1961.35 1014.51L2040.89 934.262H2041C2035.52 926.605 2025.13 919 2014.96 919Z" fill="rgb(var(--fg))"/>
          </g>
          <g opacity="0.4">
            <path d="M2007.4 1169.69C2006.38 1170.49 1988.26 1180.76 1988.26 1203.6C1988.26 1230.02 2011.31 1239.36 2012 1239.59C2011.89 1240.16 2008.34 1252.39 1999.85 1264.85C1992.28 1275.82 1984.37 1286.77 1972.34 1286.77C1960.31 1286.77 1957.22 1279.74 1943.33 1279.74C1929.8 1279.74 1924.99 1287 1913.99 1287C1902.99 1287 1895.31 1276.85 1886.48 1264.39C1876.26 1249.76 1868 1227.03 1868 1205.45C1868 1170.84 1890.36 1152.49 1912.36 1152.49C1924.05 1152.49 1933.8 1160.22 1941.14 1160.22C1948.13 1160.22 1959.02 1152.03 1972.33 1152.03C1977.37 1152.03 1995.48 1152.49 2007.4 1169.69ZM1966.01 1137.38C1971.51 1130.81 1975.4 1121.69 1975.4 1112.58C1975.4 1111.31 1975.3 1110.03 1975.07 1109C1966.12 1109.34 1955.47 1115 1949.05 1122.49C1944.01 1128.26 1939.3 1137.38 1939.3 1146.62C1939.3 1148 1939.53 1149.39 1939.64 1149.84C1940.2 1149.94 1941.12 1150.07 1942.04 1150.07C1950.07 1150.07 1960.17 1144.66 1966.01 1137.38Z" fill="rgb(var(--fg))"/>
          </g>
          {/* Left line — scrolling dashes matching dashboard style */}
          <path d={leftLine} stroke="rgb(var(--fg))" strokeWidth="6" strokeLinecap="round"
            strokeDasharray="12 8" opacity="0.2"
            style={{ animation: "sd-left-dash 2s linear infinite" }}/>
        </svg>
      </div>
    </div>
  );
}

const SERVICE_CARDS = [
  {
    category: "Performance",
    headline: "Every tool, working together.",
    description: "We integrate what fits, cut what doesn't, and make sure the whole thing runs smooth.",
    href: "https://www.instagram.com/by.inertia/",
    illustration: (
      <svg viewBox="0 0 2233 1526" fill="none" className="w-full" aria-hidden="true">
        <g className="node-fade node-fade-1">
          <circle cx="980.5" cy="781.5" r="738.5" stroke="rgb(var(--fg))" strokeWidth="12" strokeDasharray="24 24" strokeOpacity="0.25"/>
        </g>
        <g className="box-bob-1">
          <rect x="531" y="3" width="700" height="197" rx="27" fill="#6b8fff"/>
          <path d="M577.293 131H573.693V77.75H577.293L597.693 126.65L618.018 77.75H621.693V131H618.093V101.825C618.093 99.625 618.093 97.7 618.093 96.05C618.143 94.35 618.168 92.85 618.168 91.55C618.218 90.2 618.268 89.025 618.318 88.025C618.368 86.975 618.418 86 618.468 85.1L599.493 131H595.893L576.918 85.325C577.018 86.075 577.093 87.925 577.143 90.875C577.243 93.775 577.293 97.425 577.293 101.825V131ZM640.616 131.9C636.766 131.9 633.766 130.925 631.616 128.975C629.516 127.025 628.466 124.525 628.466 121.475C628.466 118.175 629.666 115.525 632.066 113.525C634.466 111.525 637.766 110.35 641.966 110L654.341 109.025V107.675C654.341 104.975 653.866 102.875 652.916 101.375C651.966 99.825 650.691 98.75 649.091 98.15C647.491 97.55 645.741 97.25 643.841 97.25C640.491 97.25 637.866 98 635.966 99.5C634.116 100.95 633.191 103 633.191 105.65H629.741C629.741 103.3 630.316 101.275 631.466 99.575C632.666 97.825 634.341 96.475 636.491 95.525C638.641 94.575 641.116 94.1 643.916 94.1C646.516 94.1 648.841 94.55 650.891 95.45C652.991 96.3 654.666 97.7 655.916 99.65C657.166 101.55 657.791 104.05 657.791 107.15V131H655.016L654.341 124.25C653.091 126.7 651.266 128.6 648.866 129.95C646.466 131.25 643.716 131.9 640.616 131.9ZM641.066 128.825C645.316 128.825 648.591 127.425 650.891 124.625C653.191 121.825 654.341 118.225 654.341 113.825V111.875L642.266 112.85C638.616 113.15 635.966 114.1 634.316 115.7C632.716 117.3 631.916 119.2 631.916 121.4C631.916 123.85 632.766 125.7 634.466 126.95C636.166 128.2 638.366 128.825 641.066 128.825ZM668.722 131H665.272V76.85H668.722V115.175L688.297 95H692.722L678.772 109.4L692.872 131H688.897L676.447 111.725L668.722 119.75V131ZM709.026 131.9C705.576 131.9 702.551 131.125 699.951 129.575C697.351 127.975 695.326 125.775 693.876 122.975C692.426 120.125 691.701 116.825 691.701 113.075C691.701 109.325 692.401 106.025 693.801 103.175C695.251 100.325 697.226 98.1 699.726 96.5C702.276 94.9 705.226 94.1 708.576 94.1C711.726 94.1 714.476 94.8 716.826 96.2C719.226 97.6 721.076 99.55 722.376 102.05C723.726 104.5 724.401 107.375 724.401 110.675V113.075H693.651L693.801 110.225H720.876C720.876 106.325 719.751 103.2 717.501 100.85C715.251 98.45 712.276 97.25 708.576 97.25C705.926 97.25 703.576 97.875 701.526 99.125C699.526 100.375 697.951 102.15 696.801 104.45C695.701 106.7 695.151 109.325 695.151 112.325C695.151 117.475 696.376 121.5 698.826 124.4C701.276 127.3 704.676 128.75 709.026 128.75C712.226 128.75 714.826 128.075 716.826 126.725C718.826 125.325 720.176 123.3 720.876 120.65H724.401C723.351 124.35 721.526 127.15 718.926 129.05C716.376 130.95 713.076 131.9 709.026 131.9ZM750.043 131H746.593V95H749.368L750.043 101.975H749.368C750.118 99.475 751.543 97.55 753.643 96.2C755.743 94.8 758.168 94.1 760.918 94.1C764.168 94.1 766.893 95.025 769.093 96.875C771.343 98.675 772.693 101.125 773.143 104.225H772.243C772.693 101.125 774.018 98.675 776.218 96.875C778.468 95.025 781.268 94.1 784.618 94.1C788.318 94.1 791.368 95.275 793.768 97.625C796.168 99.975 797.368 103.25 797.368 107.45V131H794.068V107.9C794.068 104.6 793.193 102 791.443 100.1C789.693 98.2 787.318 97.25 784.318 97.25C782.068 97.25 780.143 97.775 778.543 98.825C776.993 99.825 775.793 101.15 774.943 102.8C774.143 104.45 773.743 106.175 773.743 107.975V131H770.368V107.825C770.368 104.525 769.493 101.95 767.743 100.1C765.993 98.2 763.618 97.25 760.618 97.25C758.368 97.25 756.443 97.775 754.843 98.825C753.293 99.825 752.093 101.15 751.243 102.8C750.443 104.4 750.043 106.1 750.043 107.9V131ZM802.504 95L816.904 133.325L813.529 133.55L798.904 95H802.504ZM799.954 146.225V143.45H803.329C804.329 143.45 805.354 143.375 806.404 143.225C807.454 143.075 808.454 142.65 809.404 141.95C810.354 141.25 811.129 140.05 811.729 138.35L827.329 95H830.854L814.879 139.325C813.929 141.925 812.629 143.8 810.979 144.95C809.329 146.1 807.279 146.675 804.829 146.675C803.879 146.675 803.004 146.625 802.204 146.525C801.454 146.475 800.704 146.375 799.954 146.225ZM860.821 131L845.896 95H849.571L860.296 121.175C860.696 122.125 861.071 123.1 861.421 124.1C861.821 125.05 862.221 126.175 862.621 127.475C863.021 126.175 863.396 125.05 863.746 124.1C864.146 123.15 864.546 122.175 864.946 121.175L875.671 95H879.271L864.346 131H860.821ZM881.959 131V95H885.409V131H881.959ZM883.684 83.975C882.834 83.975 882.084 83.675 881.434 83.075C880.834 82.425 880.534 81.7 880.534 80.9C880.534 80.05 880.834 79.3 881.434 78.65C882.084 78 882.834 77.675 883.684 77.675C884.534 77.675 885.259 78 885.859 78.65C886.509 79.3 886.834 80.05 886.834 80.9C886.834 81.7 886.509 82.425 885.859 83.075C885.259 83.675 884.534 83.975 883.684 83.975ZM889.852 121.25H893.227C893.227 123.55 894.027 125.375 895.627 126.725C897.277 128.075 899.477 128.75 902.227 128.75C905.277 128.75 907.677 128.125 909.427 126.875C911.177 125.575 912.052 123.825 912.052 121.625C912.052 119.875 911.577 118.5 910.627 117.5C909.677 116.5 908.027 115.7 905.677 115.1L899.602 113.525C896.552 112.725 894.277 111.5 892.777 109.85C891.277 108.2 890.527 106.275 890.527 104.075C890.527 102.075 891.027 100.325 892.027 98.825C893.077 97.325 894.527 96.175 896.377 95.375C898.277 94.525 900.452 94.1 902.902 94.1C905.402 94.1 907.552 94.525 909.352 95.375C911.152 96.225 912.552 97.425 913.552 98.975C914.602 100.525 915.152 102.4 915.202 104.6H911.827C911.727 102.25 910.877 100.45 909.277 99.2C907.727 97.9 905.602 97.25 902.902 97.25C900.002 97.25 897.777 97.85 896.227 99.05C894.727 100.2 893.977 101.875 893.977 104.075C893.977 107.225 896.127 109.35 900.427 110.45L906.427 112.025C909.577 112.825 911.877 114 913.327 115.55C914.777 117.1 915.502 119.125 915.502 121.625C915.502 123.675 914.952 125.475 913.852 127.025C912.752 128.575 911.227 129.775 909.277 130.625C907.327 131.475 905.027 131.9 902.377 131.9C898.577 131.9 895.527 130.95 893.227 129.05C890.977 127.1 889.852 124.5 889.852 121.25ZM920.968 131V95H924.418V131H920.968ZM922.693 83.975C921.843 83.975 921.093 83.675 920.443 83.075C919.843 82.425 919.543 81.7 919.543 80.9C919.543 80.05 919.843 79.3 920.443 78.65C921.093 78 921.843 77.675 922.693 77.675C923.543 77.675 924.268 78 924.868 78.65C925.518 79.3 925.843 80.05 925.843 80.9C925.843 81.7 925.518 82.425 924.868 83.075C924.268 83.675 923.543 83.975 922.693 83.975ZM929.386 113C929.386 109.35 930.161 106.125 931.711 103.325C933.261 100.475 935.386 98.225 938.086 96.575C940.786 94.925 943.836 94.1 947.236 94.1C950.686 94.1 953.736 94.925 956.386 96.575C959.086 98.225 961.211 100.475 962.761 103.325C964.311 106.125 965.086 109.35 965.086 113C965.086 116.6 964.311 119.825 962.761 122.675C961.211 125.525 959.086 127.775 956.386 129.425C953.736 131.075 950.686 131.9 947.236 131.9C943.836 131.9 940.786 131.075 938.086 129.425C935.386 127.775 933.261 125.525 931.711 122.675C930.161 119.825 929.386 116.6 929.386 113ZM932.911 113C932.911 116.05 933.511 118.775 934.711 121.175C935.961 123.525 937.661 125.375 939.811 126.725C941.961 128.075 944.436 128.75 947.236 128.75C950.036 128.75 952.511 128.075 954.661 126.725C956.811 125.375 958.486 123.525 959.686 121.175C960.936 118.775 961.561 116.05 961.561 113C961.561 109.9 960.936 107.175 959.686 104.825C958.486 102.475 956.811 100.625 954.661 99.275C952.511 97.925 950.036 97.25 947.236 97.25C944.436 97.25 941.961 97.925 939.811 99.275C937.661 100.625 935.961 102.475 934.711 104.825C933.511 107.175 932.911 109.9 932.911 113ZM973.461 131H970.011V95H972.786L973.536 101.975C974.736 99.475 976.486 97.55 978.786 96.2C981.086 94.8 983.586 94.1 986.286 94.1C991.386 94.1 994.986 95.475 997.086 98.225C999.236 100.975 1000.31 104.6 1000.31 109.1V131H996.861V109.775C996.861 105.025 995.886 101.75 993.936 99.95C992.036 98.15 989.461 97.25 986.211 97.25C982.111 97.25 978.961 98.65 976.761 101.45C974.561 104.2 973.461 107.85 973.461 112.4V131ZM1041.94 94.475V97.475H1039.24C1035.89 97.475 1033.22 98.575 1031.22 100.775C1029.22 102.925 1028.22 105.7 1028.22 109.1V131H1024.77V95H1027.99L1028.37 101.9H1027.99C1028.49 99.55 1029.72 97.675 1031.67 96.275C1033.67 94.825 1036.04 94.1 1038.79 94.1C1039.34 94.1 1039.84 94.125 1040.29 94.175C1040.79 94.225 1041.34 94.325 1041.94 94.475ZM1058.57 131.9C1055.12 131.9 1052.09 131.125 1049.49 129.575C1046.89 127.975 1044.87 125.775 1043.42 122.975C1041.97 120.125 1041.24 116.825 1041.24 113.075C1041.24 109.325 1041.94 106.025 1043.34 103.175C1044.79 100.325 1046.77 98.1 1049.27 96.5C1051.82 94.9 1054.77 94.1 1058.12 94.1C1061.27 94.1 1064.02 94.8 1066.37 96.2C1068.77 97.6 1070.62 99.55 1071.92 102.05C1073.27 104.5 1073.94 107.375 1073.94 110.675V113.075H1043.19L1043.34 110.225H1070.42C1070.42 106.325 1069.29 103.2 1067.04 100.85C1064.79 98.45 1061.82 97.25 1058.12 97.25C1055.47 97.25 1053.12 97.875 1051.07 99.125C1049.07 100.375 1047.49 102.15 1046.34 104.45C1045.24 106.7 1044.69 109.325 1044.69 112.325C1044.69 117.475 1045.92 121.5 1048.37 124.4C1050.82 127.3 1054.22 128.75 1058.57 128.75C1061.77 128.75 1064.37 128.075 1066.37 126.725C1068.37 125.325 1069.72 123.3 1070.42 120.65H1073.94C1072.89 124.35 1071.07 127.15 1068.47 129.05C1065.92 130.95 1062.62 131.9 1058.57 131.9ZM1088.7 131.9C1084.85 131.9 1081.85 130.925 1079.7 128.975C1077.6 127.025 1076.55 124.525 1076.55 121.475C1076.55 118.175 1077.75 115.525 1080.15 113.525C1082.55 111.525 1085.85 110.35 1090.05 110L1102.42 109.025V107.675C1102.42 104.975 1101.95 102.875 1101 101.375C1100.05 99.825 1098.77 98.75 1097.17 98.15C1095.57 97.55 1093.82 97.25 1091.92 97.25C1088.57 97.25 1085.95 98 1084.05 99.5C1082.2 100.95 1081.27 103 1081.27 105.65H1077.82C1077.82 103.3 1078.4 101.275 1079.55 99.575C1080.75 97.825 1082.42 96.475 1084.57 95.525C1086.72 94.575 1089.2 94.1 1092 94.1C1094.6 94.1 1096.92 94.55 1098.97 95.45C1101.07 96.3 1102.75 97.7 1104 99.65C1105.25 101.55 1105.87 104.05 1105.87 107.15V131H1103.1L1102.42 124.25C1101.17 126.7 1099.35 128.6 1096.95 129.95C1094.55 131.25 1091.8 131.9 1088.7 131.9ZM1089.15 128.825C1093.4 128.825 1096.67 127.425 1098.97 124.625C1101.27 121.825 1102.42 118.225 1102.42 113.825V111.875L1090.35 112.85C1086.7 113.15 1084.05 114.1 1082.4 115.7C1080.8 117.3 1080 119.2 1080 121.4C1080 123.85 1080.85 125.7 1082.55 126.95C1084.25 128.2 1086.45 128.825 1089.15 128.825ZM1116.8 131H1113.35V76.85H1116.8V131Z" fill="white"/>
        </g>
        <g className="box-bob-2">
          <rect x="1488" y="680" width="462" height="203" rx="30" fill="#a78bfa"/>
          <path d="M1628.6 805H1613.3V758.728H1628.34C1632.95 758.728 1636.98 759.709 1640.44 761.672C1643.93 763.592 1646.64 766.301 1648.56 769.8C1650.53 773.256 1651.51 777.288 1651.51 781.896C1651.51 786.461 1650.55 790.493 1648.63 793.992C1646.71 797.448 1644.02 800.157 1640.56 802.12C1637.15 804.04 1633.16 805 1628.6 805ZM1619.57 761.672V802.12L1616.63 799.176H1628.15C1631.6 799.176 1634.57 798.472 1637.04 797.064C1639.56 795.656 1641.5 793.672 1642.87 791.112C1644.28 788.509 1644.98 785.437 1644.98 781.896C1644.98 778.312 1644.28 775.219 1642.87 772.616C1641.5 770.013 1639.54 768.008 1636.98 766.6C1634.46 765.192 1631.43 764.488 1627.89 764.488H1616.63L1619.57 761.672ZM1668.77 805.768C1665.74 805.768 1663.05 805.085 1660.7 803.72C1658.36 802.312 1656.52 800.392 1655.2 797.96C1653.88 795.485 1653.21 792.627 1653.21 789.384C1653.21 786.099 1653.85 783.219 1655.13 780.744C1656.46 778.269 1658.25 776.328 1660.51 774.92C1662.81 773.512 1665.48 772.808 1668.51 772.808C1671.5 772.808 1674.08 773.448 1676.25 774.728C1678.47 776.008 1680.18 777.8 1681.37 780.104C1682.61 782.408 1683.23 785.117 1683.23 788.232V790.472L1656.41 790.536L1656.54 786.504H1677.21C1677.21 783.901 1676.43 781.811 1674.85 780.232C1673.27 778.653 1671.16 777.864 1668.51 777.864C1666.51 777.864 1664.78 778.312 1663.33 779.208C1661.92 780.061 1660.83 781.341 1660.06 783.048C1659.34 784.712 1658.97 786.717 1658.97 789.064C1658.97 792.819 1659.83 795.72 1661.53 797.768C1663.24 799.773 1665.69 800.776 1668.89 800.776C1671.24 800.776 1673.16 800.307 1674.65 799.368C1676.15 798.429 1677.15 797.064 1677.66 795.272H1683.29C1682.53 798.6 1680.88 801.181 1678.37 803.016C1675.85 804.851 1672.65 805.768 1668.77 805.768ZM1694.46 805L1681.85 773.704H1688.25L1695.1 791.176C1695.65 792.627 1696.14 794.013 1696.57 795.336C1696.99 796.616 1697.34 797.725 1697.59 798.664C1697.89 797.597 1698.25 796.424 1698.68 795.144C1699.15 793.864 1699.66 792.541 1700.22 791.176L1707.19 773.704H1713.46L1700.41 805H1694.46ZM1727.12 805.768C1724.09 805.768 1721.4 805.085 1719.05 803.72C1716.71 802.312 1714.87 800.392 1713.55 797.96C1712.23 795.485 1711.56 792.627 1711.56 789.384C1711.56 786.099 1712.2 783.219 1713.48 780.744C1714.81 778.269 1716.6 776.328 1718.86 774.92C1721.16 773.512 1723.83 772.808 1726.86 772.808C1729.85 772.808 1732.43 773.448 1734.6 774.728C1736.82 776.008 1738.53 777.8 1739.72 780.104C1740.96 782.408 1741.58 785.117 1741.58 788.232V790.472L1714.76 790.536L1714.89 786.504H1735.56C1735.56 783.901 1734.78 781.811 1733.2 780.232C1731.62 778.653 1729.51 777.864 1726.86 777.864C1724.86 777.864 1723.13 778.312 1721.68 779.208C1720.27 780.061 1719.18 781.341 1718.41 783.048C1717.69 784.712 1717.32 786.717 1717.32 789.064C1717.32 792.819 1718.18 795.72 1719.88 797.768C1721.59 799.773 1724.04 800.776 1727.24 800.776C1729.59 800.776 1731.51 800.307 1733 799.368C1734.5 798.429 1735.5 797.064 1736.01 795.272H1741.64C1740.88 798.6 1739.23 801.181 1736.72 803.016C1734.2 804.851 1731 805.768 1727.12 805.768ZM1751.24 805H1745.23V757.896H1751.24V805ZM1754.85 789.32C1754.85 786.12 1755.56 783.283 1756.96 780.808C1758.37 778.333 1760.29 776.392 1762.72 774.984C1765.2 773.576 1768.02 772.872 1771.17 772.872C1774.33 772.872 1777.12 773.576 1779.56 774.984C1781.99 776.392 1783.91 778.333 1785.32 780.808C1786.72 783.283 1787.43 786.12 1787.43 789.32C1787.43 792.52 1786.72 795.357 1785.32 797.832C1783.91 800.307 1781.99 802.248 1779.56 803.656C1777.12 805.064 1774.33 805.768 1771.17 805.768C1768.02 805.768 1765.2 805.064 1762.72 803.656C1760.29 802.248 1758.37 800.307 1756.96 797.832C1755.56 795.357 1754.85 792.52 1754.85 789.32ZM1760.93 789.32C1760.93 791.496 1761.36 793.416 1762.21 795.08C1763.11 796.744 1764.32 798.045 1765.86 798.984C1767.4 799.923 1769.17 800.392 1771.17 800.392C1773.18 800.392 1774.95 799.923 1776.48 798.984C1778.02 798.045 1779.22 796.744 1780.07 795.08C1780.96 793.416 1781.41 791.496 1781.41 789.32C1781.41 787.101 1780.96 785.181 1780.07 783.56C1779.22 781.896 1778.02 780.595 1776.48 779.656C1774.95 778.717 1773.18 778.248 1771.17 778.248C1769.17 778.248 1767.4 778.717 1765.86 779.656C1764.32 780.595 1763.11 781.896 1762.21 783.56C1761.36 785.181 1760.93 787.101 1760.93 789.32ZM1790.89 819.016V773.704H1796.33L1796.78 779.336C1797.8 777.16 1799.31 775.539 1801.32 774.472C1803.37 773.363 1805.63 772.808 1808.1 772.808C1811.09 772.808 1813.67 773.512 1815.85 774.92C1818.02 776.285 1819.69 778.205 1820.84 780.68C1822.03 783.112 1822.63 785.928 1822.63 789.128C1822.63 792.328 1822.06 795.187 1820.9 797.704C1819.79 800.221 1818.15 802.205 1815.98 803.656C1813.84 805.107 1811.22 805.832 1808.1 805.832C1805.59 805.832 1803.35 805.32 1801.38 804.296C1799.42 803.272 1797.93 801.8 1796.9 799.88V819.016H1790.89ZM1796.97 789.384C1796.97 791.475 1797.35 793.373 1798.12 795.08C1798.93 796.744 1800.06 798.045 1801.51 798.984C1803.01 799.923 1804.78 800.392 1806.82 800.392C1808.87 800.392 1810.62 799.923 1812.07 798.984C1813.52 798.003 1814.63 796.68 1815.4 795.016C1816.21 793.352 1816.62 791.475 1816.62 789.384C1816.62 787.208 1816.21 785.288 1815.4 783.624C1814.63 781.96 1813.52 780.659 1812.07 779.72C1810.62 778.781 1808.87 778.312 1806.82 778.312C1804.78 778.312 1803.01 778.781 1801.51 779.72C1800.06 780.659 1798.93 781.96 1798.12 783.624C1797.35 785.288 1796.97 787.208 1796.97 789.384ZM1826.06 805V773.704H1832.08V805H1826.06ZM1829.01 766.28C1827.94 766.28 1827 765.896 1826.19 765.128C1825.42 764.317 1825.04 763.379 1825.04 762.312C1825.04 761.203 1825.42 760.264 1826.19 759.496C1827 758.728 1827.94 758.344 1829.01 758.344C1830.12 758.344 1831.05 758.728 1831.82 759.496C1832.59 760.264 1832.97 761.203 1832.97 762.312C1832.97 763.379 1832.59 764.317 1831.82 765.128C1831.05 765.896 1830.12 766.28 1829.01 766.28ZM1843.63 805H1837.61V773.704H1843.05L1843.69 778.504C1844.67 776.712 1846.08 775.325 1847.92 774.344C1849.79 773.32 1851.84 772.808 1854.06 772.808C1858.16 772.808 1861.19 773.981 1863.15 776.328C1865.11 778.675 1866.09 781.853 1866.09 785.864V805H1860.08V787.208C1860.08 784.051 1859.39 781.789 1858.03 780.424C1856.66 779.016 1854.83 778.312 1852.52 778.312C1849.71 778.312 1847.51 779.229 1845.93 781.064C1844.4 782.899 1843.63 785.352 1843.63 788.424V805ZM1869.24 788.552C1869.24 785.608 1869.84 782.963 1871.03 780.616C1872.23 778.227 1873.93 776.328 1876.15 774.92C1878.37 773.512 1881 772.808 1884.03 772.808C1886.84 772.808 1889.25 773.491 1891.26 774.856C1893.26 776.179 1894.69 778.035 1895.55 780.424L1894.78 781.256L1895.42 773.704H1900.79V803.72C1900.79 807.005 1900.15 809.843 1898.87 812.232C1897.59 814.664 1895.78 816.541 1893.43 817.864C1891.09 819.187 1888.31 819.848 1885.11 819.848C1880.85 819.848 1877.35 818.717 1874.62 816.456C1871.89 814.195 1870.22 811.08 1869.63 807.112H1875.64C1876.03 809.416 1877.05 811.208 1878.71 812.488C1880.38 813.768 1882.51 814.408 1885.11 814.408C1888.06 814.408 1890.4 813.512 1892.15 811.72C1893.95 809.971 1894.84 807.603 1894.84 804.616V795.784L1895.61 796.616C1894.8 798.963 1893.33 800.819 1891.19 802.184C1889.06 803.507 1886.59 804.168 1883.77 804.168C1880.78 804.168 1878.2 803.485 1876.03 802.12C1873.85 800.712 1872.16 798.835 1870.97 796.488C1869.82 794.141 1869.24 791.496 1869.24 788.552ZM1875.26 788.424C1875.26 790.387 1875.64 792.157 1876.41 793.736C1877.22 795.315 1878.33 796.573 1879.74 797.512C1881.19 798.451 1882.87 798.92 1884.79 798.92C1886.84 798.92 1888.59 798.472 1890.04 797.576C1891.49 796.68 1892.6 795.443 1893.37 793.864C1894.18 792.285 1894.59 790.472 1894.59 788.424C1894.59 786.376 1894.2 784.584 1893.43 783.048C1892.67 781.512 1891.56 780.296 1890.11 779.4C1888.65 778.504 1886.91 778.056 1884.86 778.056C1882.85 778.056 1881.12 778.525 1879.67 779.464C1878.27 780.403 1877.18 781.661 1876.41 783.24C1875.64 784.776 1875.26 786.504 1875.26 788.424ZM1909.65 805.672C1908.57 805.672 1907.62 805.299 1906.8 804.552C1906.01 803.768 1905.62 802.835 1905.62 801.752C1905.62 800.632 1906.01 799.699 1906.8 798.952C1907.62 798.168 1908.57 797.776 1909.65 797.776C1910.73 797.776 1911.67 798.168 1912.45 798.952C1913.24 799.699 1913.63 800.632 1913.63 801.752C1913.63 802.835 1913.24 803.768 1912.45 804.552C1911.67 805.299 1910.73 805.672 1909.65 805.672ZM1922.33 805.672C1921.25 805.672 1920.29 805.299 1919.47 804.552C1918.69 803.768 1918.3 802.835 1918.3 801.752C1918.3 800.632 1918.69 799.699 1919.47 798.952C1920.29 798.168 1921.25 797.776 1922.33 797.776C1923.41 797.776 1924.34 798.168 1925.13 798.952C1925.91 799.699 1926.3 800.632 1926.3 801.752C1926.3 802.835 1925.91 803.768 1925.13 804.552C1924.34 805.299 1923.41 805.672 1922.33 805.672Z" fill="white"/>
          <path d="M1596 752H1524V812H1596V752Z" stroke="white" strokeWidth="5"/>
          <path d="M1542 794L1554 782L1542 770" stroke="white" strokeWidth="5"/>
          <path d="M1560 794H1578" stroke="white" strokeWidth="5"/>
        </g>
        <g className="box-bob-3">
          <rect x="165" y="1159" width="517" height="203" rx="30" fill="#28b8e8"/>
          <path d="M396.972 1282L377.244 1230.45H382.788L396.54 1266.3C397.068 1267.7 397.596 1269.14 398.124 1270.62C398.652 1272.06 399.204 1273.7 399.78 1275.52C400.308 1273.65 400.86 1271.87 401.436 1270.19C402.06 1268.51 402.564 1267.19 402.948 1266.23L416.628 1230.45H421.956L402.372 1282H396.972ZM424.953 1282V1247.15H429.921V1282H424.953ZM427.401 1237.58C426.393 1237.58 425.529 1237.22 424.809 1236.5C424.089 1235.78 423.729 1234.91 423.729 1233.9C423.729 1232.9 424.089 1232.03 424.809 1231.31C425.529 1230.54 426.393 1230.16 427.401 1230.16C428.409 1230.16 429.273 1230.54 429.993 1231.31C430.761 1232.03 431.145 1232.9 431.145 1233.9C431.145 1234.91 430.761 1235.78 429.993 1236.5C429.273 1237.22 428.409 1237.58 427.401 1237.58ZM434.449 1272.21H439.201C439.201 1274.22 439.921 1275.83 441.361 1277.03C442.801 1278.18 444.721 1278.76 447.121 1278.76C449.809 1278.76 451.897 1278.23 453.385 1277.18C454.921 1276.07 455.689 1274.58 455.689 1272.71C455.689 1271.27 455.281 1270.12 454.465 1269.26C453.649 1268.39 452.209 1267.7 450.145 1267.17L444.169 1265.66C441.145 1264.89 438.889 1263.71 437.401 1262.13C435.913 1260.54 435.169 1258.58 435.169 1256.22C435.169 1254.21 435.697 1252.46 436.753 1250.97C437.809 1249.43 439.273 1248.26 441.145 1247.44C443.065 1246.62 445.273 1246.22 447.769 1246.22C450.217 1246.22 452.353 1246.65 454.177 1247.51C456.001 1248.38 457.417 1249.6 458.425 1251.18C459.481 1252.72 460.033 1254.57 460.081 1256.73H455.257C455.209 1254.66 454.513 1253.08 453.169 1251.98C451.825 1250.87 449.977 1250.32 447.625 1250.32C445.177 1250.32 443.281 1250.82 441.937 1251.83C440.641 1252.84 439.993 1254.28 439.993 1256.15C439.993 1258.84 441.889 1260.66 445.681 1261.62L451.657 1263.14C454.681 1263.9 456.889 1265.03 458.281 1266.52C459.721 1268.01 460.441 1270 460.441 1272.5C460.441 1274.56 459.889 1276.38 458.785 1277.97C457.681 1279.55 456.121 1280.78 454.105 1281.64C452.137 1282.46 449.833 1282.86 447.193 1282.86C443.305 1282.86 440.209 1281.9 437.905 1279.98C435.601 1278.02 434.449 1275.42 434.449 1272.21ZM465.74 1282V1247.15H470.708V1282H465.74ZM468.188 1237.58C467.18 1237.58 466.316 1237.22 465.596 1236.5C464.876 1235.78 464.516 1234.91 464.516 1233.9C464.516 1232.9 464.876 1232.03 465.596 1231.31C466.316 1230.54 467.18 1230.16 468.188 1230.16C469.196 1230.16 470.06 1230.54 470.78 1231.31C471.548 1232.03 471.932 1232.9 471.932 1233.9C471.932 1234.91 471.548 1235.78 470.78 1236.5C470.06 1237.22 469.196 1237.58 468.188 1237.58ZM475.74 1264.58C475.74 1260.98 476.508 1257.81 478.044 1255.07C479.58 1252.34 481.692 1250.18 484.38 1248.59C487.068 1247.01 490.092 1246.22 493.452 1246.22C496.86 1246.22 499.884 1247.01 502.524 1248.59C505.212 1250.18 507.324 1252.34 508.86 1255.07C510.396 1257.81 511.164 1260.98 511.164 1264.58C511.164 1268.08 510.396 1271.22 508.86 1274.01C507.324 1276.74 505.212 1278.9 502.524 1280.49C499.884 1282.07 496.86 1282.86 493.452 1282.86C490.092 1282.86 487.068 1282.07 484.38 1280.49C481.692 1278.9 479.58 1276.74 478.044 1274.01C476.508 1271.22 475.74 1268.08 475.74 1264.58ZM480.78 1264.5C480.78 1267.24 481.308 1269.66 482.364 1271.78C483.468 1273.84 484.956 1275.47 486.828 1276.67C488.748 1277.82 490.956 1278.4 493.452 1278.4C495.948 1278.4 498.132 1277.82 500.004 1276.67C501.924 1275.47 503.412 1273.84 504.468 1271.78C505.572 1269.66 506.124 1267.24 506.124 1264.5C506.124 1261.82 505.572 1259.44 504.468 1257.38C503.412 1255.31 501.924 1253.68 500.004 1252.48C498.132 1251.28 495.948 1250.68 493.452 1250.68C490.956 1250.68 488.748 1251.28 486.828 1252.48C484.956 1253.68 483.468 1255.31 482.364 1257.38C481.308 1259.44 480.78 1261.82 480.78 1264.5ZM521.198 1282H516.23V1247.15H520.55L521.27 1253.2C522.422 1250.99 524.054 1249.29 526.166 1248.09C528.326 1246.84 530.678 1246.22 533.222 1246.22C538.022 1246.22 541.478 1247.54 543.59 1250.18C545.702 1252.82 546.758 1256.32 546.758 1260.69V1282H541.79V1261.77C541.79 1257.69 540.926 1254.83 539.198 1253.2C537.518 1251.57 535.238 1250.75 532.358 1250.75C528.806 1250.75 526.046 1251.95 524.078 1254.35C522.158 1256.7 521.198 1259.85 521.198 1263.78V1282Z" fill="white"/>
        </g>
      </svg>
    ),
  },
  {
    category: "Availability",
    headline: "We don't go dark.",
    description: "You'll always have a line to us. No days of silence, no chasing us down.",
    href: "https://www.instagram.com/by.inertia/",
    illustration: (
      <div style={{ animation: "notify-slide 3.6s ease-in-out infinite" }} className="w-3/4 max-w-[280px]">
        <img src="/availability-notification.svg" alt="" aria-hidden="true" className="w-full dark:invert dark:brightness-75" />
      </div>
    ),
  },
  {
    category: "Brand",
    headline: "Identity that sticks.",
    description: "Logos, systems, and visual language built to last. Not trends, not clipart.",
    href: "https://www.instagram.com/by.inertia/",
    illustration: (
      <svg viewBox="0 0 1597 1527" fill="none" className="w-full" aria-hidden="true">
        {/* Central "In" card — appears first */}
        <g className="node-fade node-fade-1">
          <rect x="340" y="378" width="694" height="694" rx="73" fill="rgb(var(--fg))" fillOpacity="0.08" stroke="rgb(var(--fg))" strokeWidth="4" strokeOpacity="0.15"/>
          <path d="M558.47 887V591H610.07V887H558.47ZM641.52 887V668.8H683.92L687.52 692H690.12C697.854 683.467 706.92 676.933 717.32 672.4C727.854 667.733 739.32 665.4 751.72 665.4C764.787 665.4 776.387 668 786.52 673.2C796.787 678.267 804.854 686.6 810.72 698.2C816.587 709.8 819.52 725.267 819.52 744.6V887H768.72V747.8C768.72 733.533 765.72 723.667 759.72 718.2C753.854 712.733 745.854 710 735.72 710C730.92 710 725.854 710.733 720.52 712.2C715.187 713.667 710.054 716 705.12 719.2C700.32 722.267 696.12 726.333 692.52 731.4V887H641.52Z" fill="rgb(var(--fg))" fillOpacity="0.5"/>
        </g>
        {/* Top-left node — GitHub */}
        <g className="node-fade node-fade-2">
          <rect x="0" y="0" width="302" height="302" rx="43" fill="rgb(var(--fg))" fillOpacity="0.07" stroke="rgb(var(--fg))" strokeWidth="2" strokeOpacity="0.12"/>
          <path d="M151.146 69.6111C106.5 69.6111 70.2959 106.653 70.2959 152.349C70.2959 188.905 93.4619 219.92 125.586 230.86C129.627 231.626 131.11 229.065 131.11 226.88C131.11 224.907 131.035 218.389 131 211.476C108.508 216.481 103.762 201.713 103.762 201.713C100.084 192.15 94.7847 189.607 94.7847 189.607C87.4492 184.472 95.3376 184.577 95.3376 184.577C103.456 185.16 107.731 193.104 107.731 193.104C114.942 205.753 126.645 202.096 131.259 199.982C131.984 194.635 134.08 190.983 136.392 188.918C118.434 186.826 99.5563 179.731 99.5563 148.028C99.5563 138.994 102.715 131.614 107.887 125.819C107.047 123.734 104.28 115.32 108.67 103.923C108.67 103.923 115.459 101.699 130.909 112.404C137.359 110.571 144.275 109.652 151.146 109.62C158.017 109.652 164.939 110.571 171.4 112.404C186.831 101.699 193.611 103.923 193.611 103.923C198.012 115.32 195.243 123.734 194.404 125.819C199.588 131.614 202.725 138.994 202.725 148.028C202.725 179.806 183.811 186.804 165.808 188.852C168.708 191.42 171.292 196.455 171.292 204.174C171.292 215.243 171.198 224.153 171.198 226.88C171.198 229.082 172.653 231.662 176.751 230.849C208.858 219.896 231.995 188.893 231.995 152.349C231.995 106.653 195.796 69.6111 151.146 69.6111" fill="#6b8fff"/>
        </g>
        {/* Top-right node — Apple */}
        <g className="node-fade node-fade-3">
          <rect x="1294" y="16" width="303" height="303" rx="43" fill="rgb(var(--fg))" fillOpacity="0.07" stroke="rgb(var(--fg))" strokeWidth="2" strokeOpacity="0.12"/>
          <path d="M1446 87C1490.74 87 1527 123.265 1527 168C1527 212.735 1490.74 249 1446 249C1401.26 249 1365 212.735 1365 168C1365 123.265 1401.26 87 1446 87ZM1465.64 141.598C1457.13 141.598 1453.53 145.668 1447.62 145.668C1441.53 145.668 1436.91 141.608 1429.55 141.608C1422.32 141.609 1414.63 146.025 1409.75 153.574C1402.9 164.207 1404.07 184.197 1415.18 201.226C1419.16 207.32 1424.47 214.167 1431.41 214.229C1437.59 214.29 1439.34 210.264 1447.71 210.22C1456.09 210.17 1457.68 214.279 1463.85 214.212C1470.8 214.156 1476.4 206.567 1480.38 200.473C1483.22 196.107 1484.29 193.904 1486.5 188.976C1470.42 182.859 1467.84 159.992 1483.76 151.216C1478.9 145.127 1472.08 141.598 1465.64 141.598ZM1463.78 119.4C1458.72 119.752 1452.81 122.985 1449.37 127.2C1446.22 131.02 1443.64 136.702 1444.65 142.217C1450.17 142.39 1455.88 139.077 1459.19 134.795C1462.28 130.803 1464.62 125.16 1463.78 119.4Z" fill="#a78bfa"/>
        </g>
        {/* Bottom-right node — Shopify */}
        <g className="node-fade node-fade-4">
          <rect x="1084" y="1225" width="302" height="302" rx="43" fill="rgb(var(--fg))" fillOpacity="0.07" stroke="rgb(var(--fg))" strokeWidth="2" strokeOpacity="0.12"/>
          <path d="M1235 1295C1279.74 1295 1316 1331.26 1316 1376C1316 1420.74 1279.74 1457 1235 1457C1190.26 1457 1154 1420.74 1154 1376C1154 1331.26 1190.26 1295 1235 1295ZM1231.19 1327.91C1218.74 1327.97 1212.83 1343.49 1210.96 1351.39C1206.12 1352.87 1202.71 1353.94 1202.26 1354.06C1199.59 1354.91 1199.47 1354.97 1199.13 1357.53C1198.85 1359.51 1191.82 1413.96 1191.8 1414.08L1246.77 1424.37L1276.55 1417.95C1276.54 1417.79 1266.1 1347.26 1266.04 1346.73C1265.98 1346.22 1265.52 1345.99 1265.18 1345.93C1264.84 1345.87 1257.4 1345.36 1257.4 1345.36C1257.38 1345.35 1252.22 1340.25 1251.71 1339.68C1251.14 1339.11 1250.06 1339.28 1249.61 1339.39C1249.55 1339.39 1248.47 1339.73 1246.71 1340.3C1245.06 1335.36 1241.99 1330.81 1236.65 1330.81H1236.19C1234.66 1328.82 1232.78 1327.91 1231.19 1327.91Z" fill="#e040a0"/>
          <path d="M1243.7 1341.27C1242.33 1341.72 1240.74 1342.18 1239.04 1342.69V1341.67C1239.04 1338.6 1238.58 1336.1 1237.9 1334.16C1240.68 1334.56 1242.56 1337.69 1243.7 1341.27Z" fill="#e040a0"/>
          <path d="M1234.55 1334.79C1235.28 1336.72 1235.8 1339.45 1235.8 1343.15V1343.66C1232.78 1344.57 1229.49 1345.59 1226.19 1346.61C1228.07 1339.56 1231.53 1336.1 1234.55 1334.79Z" fill="#e040a0"/>
          <path d="M1230.85 1331.32C1231.36 1331.32 1231.93 1331.49 1232.44 1331.83C1228.46 1333.71 1224.2 1338.43 1222.38 1347.86C1219.77 1348.66 1217.15 1349.45 1214.76 1350.19C1216.92 1343.03 1221.93 1331.32 1230.85 1331.32Z" fill="#e040a0"/>
          <path d="M1236.65 1362.41L1232.95 1373.33C1232.95 1373.33 1229.71 1371.62 1225.79 1371.62C1219.99 1371.62 1219.71 1375.26 1219.71 1376.17C1219.71 1381.17 1232.73 1383.05 1232.73 1394.76C1232.73 1403.97 1226.87 1409.88 1219.03 1409.88C1209.59 1409.88 1204.76 1404.02 1204.76 1404.02L1207.26 1395.67C1207.26 1395.67 1212.21 1399.93 1216.41 1399.93C1219.14 1399.93 1220.28 1397.77 1220.28 1396.18C1220.28 1389.64 1209.59 1389.36 1209.59 1378.67C1209.59 1369.69 1216.07 1360.94 1229.09 1360.94C1234.2 1360.99 1236.65 1362.41 1236.65 1362.41Z" fill="#e040a0"/>
        </g>
        {/* Connectors and arrowheads — appear last */}
        <g className="node-fade node-fade-5">
          <path d="M1068 725 H1356 Q1446 725 1446 635 V359" stroke="#a78bfa" strokeWidth="10" strokeDasharray="16 10" strokeLinecap="round" fill="none" style={{ animation: "dash-march-sd 1.6s linear infinite" }}/>
          <path d="M340 137 H627 Q687 137 687 197 V340" stroke="#6b8fff" strokeWidth="10" strokeDasharray="16 10" strokeLinecap="round" fill="none" style={{ animation: "dash-march-sd 1.6s linear infinite", animationDelay: "0.4s" }}/>
          <path d="M687 1114 V1316 Q687 1376 747 1376 H1045" stroke="#e040a0" strokeWidth="10" strokeDasharray="16 10" strokeLinecap="round" fill="none" style={{ animation: "dash-march-sd 1.6s linear infinite", animationDelay: "0.8s" }}/>
          <polygon points="1056.45,725 1068,740 1079.55,725 1068,710" fill="#a78bfa"/>
          <polygon points="1446,345 1460,359 1446,373 1432,359" fill="#a78bfa"/>
          <polygon points="687,349 701,340 687,325 673,340" fill="#6b8fff"/>
          <polygon points="326,137 340,152 354,137 340,122" fill="#6b8fff"/>
          <polygon points="687,1100 673,1114 687,1128 701,1114" fill="#e040a0"/>
          <polygon points="1058,1376 1045,1362 1032,1376 1045,1390" fill="#e040a0"/>
        </g>
      </svg>
    ),
  },
  {
    category: "Discretion",
    headline: "Your work stays yours.",
    description: "We don't share, post, or reference your project without your say-so. Full stop.",
    href: "https://www.instagram.com/by.inertia/",
    illustration: (
      <svg viewBox="0 0 1505 1505" fill="none" className="w-full" aria-hidden="true">
        {/* Outer shield */}
        <g className="node-fade node-fade-1">
          <path d="M752.5 188.125C942.977 347.326 1161.44 337.449 1223.99 337.449C1210.11 1242.57 1105.23 1063.14 752.5 1316.88C399.766 1063.14 295.121 1242.57 282.188 337.449C343.093 337.449 561.553 347.326 752.5 188.125Z" stroke="rgb(var(--fg))" strokeWidth="21" strokeOpacity="0.15"/>
        </g>
        {/* Inner shield */}
        <g className="node-fade node-fade-2">
          <path d="M753 295.5C907.406 424.553 1084.5 416.547 1135.2 416.547C1123.96 1150.26 1038.94 1004.82 753 1210.5C467.062 1004.82 382.234 1150.26 371.75 416.547C421.122 416.547 598.212 424.553 753 295.5Z" stroke="rgb(var(--fg))" strokeWidth="21" strokeOpacity="0.3"/>
        </g>
        {/* Padlock */}
        <g className="node-fade node-fade-3">
          <path d="M934.375 934.375L873.75 904.062L813.125 934.375L752.5 904.062L691.875 934.375L631.25 904.062L570.625 934.375V752.5C570.625 704.264 589.787 658.003 623.895 623.895C658.003 589.787 704.264 570.625 752.5 570.625C800.736 570.625 846.997 589.787 881.105 623.895C915.213 658.003 934.375 704.264 934.375 752.5V934.375Z" stroke="rgb(var(--fg))" strokeWidth="18" strokeOpacity="0.6"/>
          <path d="M691.875 722.188V752.5" stroke="rgb(var(--fg))" strokeWidth="18" strokeOpacity="0.6"/>
          <path d="M813.125 722.188V752.5" stroke="rgb(var(--fg))" strokeWidth="18" strokeOpacity="0.6"/>
        </g>
      </svg>
    ),
  },
];

function ServiceCards() {
  const [active, setActive] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const dragging = useRef(false);

  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    dragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    const dx = e.clientX - startX.current;
    if (dx < -40) setActive(i => Math.min(i + 1, SERVICE_CARDS.length - 1));
    else if (dx > 40) setActive(i => Math.max(i - 1, 0));
  };
  const onPointerCancel = () => { dragging.current = false; };

  return (
    <>
      {/* Mobile carousel */}
      <div className="sm:hidden border-b border-[rgb(var(--line))]">
        <div
          ref={viewportRef}
          className="overflow-hidden cursor-grab active:cursor-grabbing"
          style={{ touchAction: "pan-y", height: 420 }}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
        >
          <div
            className="flex items-stretch transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${active * 100}%)`, height: "100%" }}
          >
            {SERVICE_CARDS.map((card) => {
              const isExternal = card.href.startsWith("http");
              const inner = (
                <div className="group flex flex-col justify-between px-6 pt-7 pb-7 select-none" style={{ height: "100%" }}>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-[22px] font-medium tracking-tight text-[rgb(var(--fg))] leading-snug">{card.headline}</h3>
                    <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] leading-snug">{card.description}</p>
                  </div>
                  <div className="flex-1 flex items-center justify-center overflow-hidden py-4 [&>svg]:max-h-64 [&>svg]:w-auto [&>img]:max-w-[340px] [&>img]:w-full [&>img]:h-auto [&>img]:max-h-64">{card.illustration}</div>
                </div>
              );
              return (
                <div key={card.category} className="shrink-0" style={{ width: "100%", height: "100%" }}>
                  {isExternal
                    ? <a href={card.href} target="_blank" rel="noreferrer" style={{ display: "block", height: "100%" }}>{inner}</a>
                    : <Link href={card.href} style={{ display: "block", height: "100%" }}>{inner}</Link>}
                </div>
              );
            })}
          </div>
        </div>
        {/* Dots */}
        <div className="flex items-center justify-center gap-2 py-4">
          {SERVICE_CARDS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{ width: i === active ? 12 : 6, height: 6, opacity: i === active ? 0.6 : 0.2 }}
              className="rounded-full bg-[rgb(var(--fg))] transition-all duration-200"
              aria-label={`Go to card ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop — first card full-width (stack diagram style), rest in 3-col row */}
      <div className="hidden sm:block">
        {(() => {
          const [first, ...rest] = SERVICE_CARDS;
          const firstExternal = first.href.startsWith("http");
          const firstInner = (
            <div className="group flex flex-col sm:flex-row border-b border-[rgb(var(--line))] transition-colors duration-200 hover:bg-[rgb(var(--fg))/0.02]">
              <div className="flex items-center justify-center overflow-hidden sm:w-[38%] sm:shrink-0 sm:self-stretch py-6 sm:border-r border-[rgb(var(--line))]">
                <div className="w-full flex items-center justify-center [&>svg]:max-h-64 [&>svg]:w-full [&>img]:max-w-[280px] [&>img]:w-3/4 [&>img]:h-auto [&>img]:max-h-64">{first.illustration}</div>
              </div>
              <div className="flex flex-col justify-center px-8 py-8 gap-3 sm:flex-1">
                <h3 className="text-[22px] sm:text-[28px] font-medium tracking-tight text-[rgb(var(--fg))] leading-snug">{first.headline}</h3>
                <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] leading-snug">{first.description}</p>
              </div>
            </div>
          );
          return (
            <>
              {firstExternal
                ? <a href={first.href} target="_blank" rel="noreferrer">{firstInner}</a>
                : <Link href={first.href}>{firstInner}</Link>}
              <div className="grid grid-cols-3">
                {rest.map((card, i) => {
                  const isExternal = card.href.startsWith("http");
                  const borderClass = i < rest.length - 1 ? "border-r border-[rgb(var(--line))]" : "";
                  const inner = (
                    <div className={`group flex flex-col justify-between px-8 pt-7 pb-7 h-full min-h-[320px] transition-colors duration-200 hover:bg-[rgb(var(--fg))/0.025] ${borderClass}`}>
                      <div className="flex flex-col gap-1.5">
                        <h3 className="text-[22px] font-medium tracking-tight text-[rgb(var(--fg))] leading-snug">{card.headline}</h3>
                        <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] leading-snug">{card.description}</p>
                      </div>
                      <div className="flex-1 flex items-center justify-center overflow-hidden py-4 [&>svg]:max-h-56 [&>svg]:w-auto [&>img]:max-w-[260px] [&>img]:w-3/4 [&>img]:h-auto [&>img]:max-h-56" style={{ maskImage: "linear-gradient(to top, transparent 0%, black 35%)", WebkitMaskImage: "linear-gradient(to top, transparent 0%, black 35%)" }}>{card.illustration}</div>
                    </div>
                  );
                  if (isExternal) return <a key={card.category} href={card.href} target="_blank" rel="noreferrer">{inner}</a>;
                  return <Link key={card.category} href={card.href}>{inner}</Link>;
                })}
              </div>
            </>
          );
        })()}
      </div>
    </>
  );
}

function WhatWeDo() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2">
      <div className="sm:border-r sm:border-[rgb(var(--line))] overflow-hidden">
        <PulseGrid />
      </div>

      {/* Rotating panel */}
      <div className="border-t border-[rgb(var(--line))] sm:border-t-0">
        <RotatingPanel />
      </div>
    </div>
  );
}

// Slug-specific sketches for the think section — one per post
const THINK_SLUG_SKETCHES: Record<string, React.ReactElement> = {
  "ai-capability-forecast": (
    // A curve that starts nearly flat, then rockets upward — acceleration made visible
    <svg key="ai-capability-forecast" viewBox="0 0 200 120" fill="none" className="w-full" aria-hidden="true">
      {/* Faint ruled grid — recedes into background */}
      {[100,80,60,40,20].map((y, i) => (
        <line key={i} x1="0" y1={y} x2="200" y2={y} stroke="rgb(var(--fg))" strokeWidth="0.3" opacity={0.03 + i * 0.015} />
      ))}
      {/* Filled area under curve — sense of accumulation */}
      <path d="M 0 108 C 40 107, 80 103, 110 90 C 135 78, 155 52, 170 28 L 200 4 L 200 120 L 0 120 Z" fill="rgb(var(--blue))" opacity="0.09" />
      {/* The curve itself — thick, authoritative */}
      <path d="M 0 108 C 40 107, 80 103, 110 90 C 135 78, 155 52, 170 28 L 200 4" stroke="rgb(var(--blue))" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
      {/* Inflection dot — where everything changes */}
      <circle cx="110" cy="90" r="3.5" fill="rgb(var(--blue))" opacity="0.85" />
      <circle cx="110" cy="90" r="7"   stroke="rgb(var(--blue))" strokeWidth="0.7" opacity="0.3" />
      {/* Right-edge vertical emphasis — the wall */}
      <line x1="200" y1="4" x2="200" y2="120" stroke="rgb(var(--blue))" strokeWidth="0.5" strokeDasharray="3 4" opacity="0.2" />
      {/* Baseline */}
      <line x1="0" y1="112" x2="200" y2="112" stroke="rgb(var(--fg))" strokeWidth="0.4" opacity="0.15" />
    </svg>
  ),

  "four-years": (
    // Four progressively heavier bands — weight as evidence of time
    <svg key="four-years" viewBox="0 0 200 120" fill="none" className="w-full" aria-hidden="true">
      {/* Bands grow in both height and opacity — years accumulating */}
      <rect x="0" y="90" width="200" height="8"  fill="rgb(var(--green))" opacity="0.15" />
      <rect x="0" y="72" width="200" height="12" fill="rgb(var(--green))" opacity="0.28" />
      <rect x="0" y="48" width="200" height="16" fill="rgb(var(--green))" opacity="0.48" />
      <rect x="0" y="16" width="200" height="22" fill="rgb(var(--green))" opacity="0.75" />
      {/* Top highlight on the heaviest band */}
      <line x1="0" y1="16" x2="200" y2="16" stroke="rgb(var(--green))" strokeWidth="1" opacity="0.5" />
      {/* Year markers flush left — counting */}
      {["01","02","03","04"].map((n, i) => {
        const tops = [90, 72, 48, 16];
        const ops  = [0.25, 0.35, 0.5, 0.7];
        return (
          <text key={n} x="8" y={tops[i] + (i === 3 ? 14 : i === 2 ? 11 : i === 1 ? 8 : 6)}
            fontFamily="monospace" fontSize="7" fill="rgb(var(--fg))" opacity={ops[i]}>
            {n}
          </text>
        );
      })}
      {/* Thin baseline */}
      <line x1="0" y1="112" x2="200" y2="112" stroke="rgb(var(--fg))" strokeWidth="0.4" opacity="0.12" />
    </svg>
  ),

  "hello-world": (
    // The moment before anything exists — a cursor waiting in the dark
    <svg key="hello-world" viewBox="0 0 200 120" fill="none" className="w-full" aria-hidden="true">
      {/* Deep field — concentric rings radiating from cursor, like a stone dropped in water */}
      <rect x="26" y="34" width="54" height="54" rx="12" stroke="rgb(var(--fg))" strokeWidth="0.3" opacity="0.04" />
      <rect x="34" y="41" width="38" height="40" rx="8"  stroke="rgb(var(--fg))" strokeWidth="0.4" opacity="0.07" />
      <rect x="40" y="46" width="26" height="30" rx="5"  stroke="rgb(var(--fg))" strokeWidth="0.5" opacity="0.11" />
      {/* The cursor itself — solid, patient, inevitable */}
      <rect x="47" y="51" width="12" height="20" rx="1.5" fill="rgb(var(--fg))" opacity="0.8" />
      {/* The line it sits on — sparse, like ruled paper */}
      <line x1="0" y1="71" x2="200" y2="71" stroke="rgb(var(--fg))" strokeWidth="0.3" opacity="0.07" />
      {/* What comes after — ghost words fading into potential */}
      <line x1="68"  y1="61" x2="106" y2="61" stroke="rgb(var(--fg))" strokeWidth="1.5" opacity="0.09" strokeLinecap="round" />
      <line x1="68"  y1="61" x2="88"  y2="61" stroke="rgb(var(--fg))" strokeWidth="1.5" opacity="0.06" strokeLinecap="round" />
      <line x1="110" y1="61" x2="140" y2="61" stroke="rgb(var(--fg))" strokeWidth="1.5" opacity="0.04" strokeLinecap="round" />
      {/* Second line — the idea forming */}
      <line x1="47"  y1="83" x2="120" y2="83" stroke="rgb(var(--fg))" strokeWidth="1"   opacity="0.05" strokeLinecap="round" />
      <line x1="47"  y1="91" x2="88"  y2="91" stroke="rgb(var(--fg))" strokeWidth="1"   opacity="0.03" strokeLinecap="round" />
      {/* Top rule — the edge of the page */}
      <line x1="0" y1="8" x2="200" y2="8" stroke="rgb(var(--fg))" strokeWidth="0.3" opacity="0.08" />
    </svg>
  ),
};

// ── Tech Marquee ───────────────────────────────────────────────────────
const TECH_ALL: { name: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { name: "Shopify",    icon: SiShopify,    color: "#96BF48" },
  { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
  { name: "Tailwind",   icon: SiTailwindcss,color: "#38BDF8" },
  { name: "Photoshop",  icon: IconPhotoshop,color: "#31A8FF" },
  { name: "Swift",      icon: SiSwift,      color: "#F05138" },
  { name: "Whop",       icon: IconWhop,     color: "#E8470A" },
  { name: "Meta",       icon: SiMeta,       color: "#0082FB" },
  { name: "Figma",      icon: SiFigma,      color: "#F24E1E" },
];

function TechMarquee() {
  const items = [...TECH_ALL, ...TECH_ALL, ...TECH_ALL];
  return (
    <div className="overflow-hidden select-none" aria-hidden="true">
      <div className="marquee-row marquee-row--fwd">
        {items.map((tech, i) => (
          <div
            key={i}
            className="marquee-item group"
            style={{ "--tech-color": tech.color } as React.CSSProperties}
          >
            <tech.icon className="transition-colors duration-200 group-hover:text-[var(--tech-color)]" />
            <span>{tech.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Dashboard waitlist modal ────────────────────────────────────── */

type Plan = "free" | "service";

function DashboardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [plan, setPlan] = useState<Plan>("free");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const backdropRef = useRef<HTMLDivElement>(null);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      setTimeout(() => { setDone(false); setError(""); setEmail(""); setName(""); setPlan("free"); }, 300);
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) { document.addEventListener("keydown", onKey); document.body.style.overflow = "hidden"; }
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: err } = await supabase.from("dashboard_waitlist").insert({ name, email, plan });
      if (err) throw err;
      setDone(true);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const accent = "rgb(var(--blue))";
  const inputBase = "w-full bg-transparent border-0 border-b py-3 text-[16px] tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-40 focus:outline-none transition-colors duration-200";

  const PLANS = [
    { key: "free" as Plan, label: "Get early access", sub: "Free, no commitment" },
    { key: "service" as Plan, label: "Work with us", sub: "Already a client or ready to start" },
  ];

  const modal = (
    <div
      ref={backdropRef}
      className="fixed z-50 flex items-end sm:items-center justify-center"
      style={{
        inset: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: "100dvh",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transition: "opacity 220ms ease",
      }}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div
        className="relative w-full sm:max-w-[420px] bg-[rgb(var(--bg))] border border-[rgb(var(--line))] rounded-t-2xl sm:rounded-sm mx-0 sm:mx-4 overflow-y-auto overscroll-contain"
        style={{
          maxHeight: "90dvh",
          animation: open ? "modal-up 320ms cubic-bezier(0.22,1,0.36,1) both" : "none",
        }}
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-8 h-1 rounded-full bg-[rgb(var(--line))]" />
        </div>

        <button
          onClick={onClose}
          className="hidden sm:flex absolute top-4 right-4 w-7 h-7 items-center justify-center text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
          aria-label="Close"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-4 h-4">
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>

        <div className="px-6 sm:px-8 pt-5 sm:pt-7 pb-8 sm:pb-8">
          {done ? (
            <div style={{ animation: "rise-in 280ms cubic-bezier(0.22,1,0.36,1) both" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center mb-4" style={{ background: "rgb(var(--blue)/0.1)" }}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ color: accent }}>
                  <polyline points="2 8 6 12 14 4" />
                </svg>
              </div>
              <p className="text-[20px] font-medium tracking-tight text-[rgb(var(--fg))] leading-snug mb-2">
                {plan === "service" ? "We'll be in touch soon." : "You're on the list."}
              </p>
              <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] leading-relaxed">
                {plan === "service"
                  ? "We'll review your details and reach out within a day to get things moving."
                  : "Access is limited while we build. We'll email you when your spot is ready."}
              </p>
              <button onClick={onClose} className="mt-6 text-[13px] tracking-tight transition-colors hover:text-[rgb(var(--fg))]" style={{ color: accent }}>
                Done
              </button>
            </div>
          ) : (
            <>
              <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] mb-3">Inertia Dashboard</p>
              <h2 className="text-[clamp(1.25rem,4vw,1.5rem)] font-medium tracking-tight text-[rgb(var(--fg))] leading-snug mb-2">
                Your project, all in one place.
              </h2>
              <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] leading-relaxed mb-7">
                Status updates, files, invoices, and support. Built for clients who want visibility without the back-and-forth.
              </p>

              <div className="grid grid-cols-2 gap-2.5 mb-7">
                {PLANS.map(({ key, label, sub }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPlan(key)}
                    className="flex flex-col gap-1 p-3.5 border text-left transition-all duration-150 rounded-sm"
                    style={{
                      borderColor: plan === key ? accent : "rgb(var(--line))",
                      background: plan === key ? "rgb(var(--blue)/0.07)" : "transparent",
                    }}
                  >
                    <span className="text-[13px] font-medium tracking-tight" style={{ color: plan === key ? accent : "rgb(var(--fg))" }}>{label}</span>
                    <span className="text-[11.5px] tracking-tight text-[rgb(var(--muted))] leading-snug">{sub}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="your name" autoComplete="name" className={inputBase}
                  style={{ borderColor: name ? accent : "rgb(var(--line))" }}
                  onFocus={(e) => { e.target.style.borderColor = accent; }}
                  onBlur={(e) => { e.target.style.borderColor = name ? accent : "rgb(var(--line))"; }}
                />
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="email address" autoComplete="email" className={inputBase}
                  style={{ borderColor: email ? accent : "rgb(var(--line))" }}
                  onFocus={(e) => { e.target.style.borderColor = accent; }}
                  onBlur={(e) => { e.target.style.borderColor = email ? accent : "rgb(var(--line))"; }}
                />
                {plan === "service" && (
                  <p className="text-[12px] tracking-tight text-[rgb(var(--muted))] -mt-2 leading-relaxed">
                    Tell us a bit about your project in the next step and we'll take it from there.
                  </p>
                )}
                {error && <p className="text-[13px] tracking-tight text-red-500 -mt-1">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex items-center justify-center gap-2 rounded-full py-3 text-[15px] tracking-tight font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed mt-1"
                  style={{ background: accent, color: "white" }}
                >
                  {loading ? "Sending..." : plan === "free" ? "Get early access" : "Start the conversation"}
                  {!loading && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}


function BlogGrid({ posts }: { posts: PostMeta[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragMoved = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragMoved.current = false;
    startX.current = e.pageX - (trackRef.current?.offsetLeft ?? 0);
    scrollLeft.current = trackRef.current?.scrollLeft ?? 0;
    e.preventDefault();
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    const walk = e.pageX - trackRef.current.offsetLeft - startX.current;
    if (Math.abs(walk) > 4) dragMoved.current = true;
    trackRef.current.scrollLeft = scrollLeft.current - walk;
  };
  const onMouseUp = () => { isDragging.current = false; };

  useEffect(() => {
    const up = () => { isDragging.current = false; };
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, []);

  const introCard = (extraClass = "") => (
    <Link href="/blog" className={`group flex flex-col justify-between gap-5 px-7 pt-7 pb-7 border-r border-b border-[rgb(var(--line))] transition-colors hover:bg-[rgb(var(--line))/0.15] ${extraClass}`}>
      {/* Sketch: open magazine spread — left image block, right text column */}
      <svg viewBox="0 0 280 120" fill="none" className="w-full" aria-hidden="true">
        {/* Spine */}
        <line x1="140" y1="0" x2="140" y2="120" stroke="rgb(var(--fg))" strokeWidth="0.6" strokeOpacity="0.12" />
        {/* Left page — dominant image fill */}
        <rect x="8" y="8" width="122" height="104" rx="1" fill="rgb(var(--fg))" fillOpacity="0.08" />
        <rect x="8" y="8" width="122" height="104" rx="1" stroke="rgb(var(--fg))" strokeWidth="0.4" strokeOpacity="0.1" />
        {/* Image texture — horizontal bands of varying density */}
        <rect x="8"  y="8"  width="122" height="28" fill="rgb(var(--fg))" fillOpacity="0.28" />
        <rect x="8"  y="36" width="122" height="18" fill="rgb(var(--fg))" fillOpacity="0.14" />
        <rect x="8"  y="54" width="122" height="10" fill="rgb(var(--fg))" fillOpacity="0.06" />
        {/* Image caption line */}
        <rect x="14" y="104" width="60" height="3" rx="1" fill="rgb(var(--fg))" fillOpacity="0.2" />
        {/* Right page — article text */}
        {/* Section label */}
        <rect x="150" y="12" width="28" height="4" rx="1" fill="rgb(var(--fg))" fillOpacity="0.3" />
        {/* Headline — three descending bars */}
        <rect x="150" y="22" width="118" height="9" rx="1" fill="rgb(var(--fg))" fillOpacity="0.65" />
        <rect x="150" y="35" width="100" height="9" rx="1" fill="rgb(var(--fg))" fillOpacity="0.48" />
        <rect x="150" y="48" width="72"  height="9" rx="1" fill="rgb(var(--fg))" fillOpacity="0.3" />
        {/* Rule */}
        <line x1="150" y1="64" x2="272" y2="64" stroke="rgb(var(--fg))" strokeWidth="0.5" strokeOpacity="0.18" />
        {/* Body copy */}
        <rect x="150" y="70" width="118" height="3.5" rx="1" fill="rgb(var(--fg))" fillOpacity="0.18" />
        <rect x="150" y="78" width="110" height="3.5" rx="1" fill="rgb(var(--fg))" fillOpacity="0.13" />
        <rect x="150" y="86" width="114" height="3.5" rx="1" fill="rgb(var(--fg))" fillOpacity="0.1" />
        <rect x="150" y="94" width="90"  height="3.5" rx="1" fill="rgb(var(--fg))" fillOpacity="0.07" />
        <rect x="150" y="102" width="104" height="3.5" rx="1" fill="rgb(var(--fg))" fillOpacity="0.05" />
      </svg>
      <div className="flex flex-col gap-1.5">
        <span className="text-[20px] sm:text-[24px] font-medium tracking-tight text-[rgb(var(--fg))] leading-snug">Inertia Writes</span>
        <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] leading-relaxed opacity-60">Honest takes on building, selling, and why most of it gets done wrong.</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] tabular-nums opacity-40">Journal</span>
        <span className="inline-flex items-center gap-2 border border-[rgb(var(--line))] rounded-full px-3 py-1.5 text-[rgb(var(--muted))] text-[13px] tracking-tight group-hover:text-[rgb(var(--fg))] group-hover:border-[rgb(var(--fg)/0.3)] transition-all duration-200">Read more <span aria-hidden="true">→</span></span>
      </div>
    </Link>
  );

  const postCard = (post: PostMeta, i: number) => (
    <Link key={post.slug} href={`/blog/${post.slug}`}
      className="group flex flex-col justify-between gap-4 px-6 pt-6 pb-6 transition-colors hover:bg-[rgb(var(--line))/0.15] border-r border-b border-[rgb(var(--line))] h-full">
      <div className="w-full overflow-hidden">{THINK_SLUG_SKETCHES[post.slug]}</div>
      <div className="flex flex-col gap-1.5">
        {i === 0 && (
          <span className="inline-flex items-center self-start border border-[rgb(var(--line))] text-[rgb(var(--muted))] px-2 py-0.5 text-[11px] tracking-tight leading-none rounded-sm mb-1">Latest</span>
        )}
        <span className="text-[18px] sm:text-[22px] font-medium tracking-tight text-[rgb(var(--fg))] leading-snug">{post.title}</span>
        {post.summary && <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] leading-relaxed opacity-70 line-clamp-2">{post.summary}</span>}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] tabular-nums opacity-50">{formatDate(post.date)}</span>
        <span className="inline-flex items-center gap-2 border border-[rgb(var(--line))] rounded-full px-3 py-1.5 text-[rgb(var(--muted))] text-[13px] tracking-tight group-hover:text-[rgb(var(--fg))] group-hover:border-[rgb(var(--fg)/0.3)] transition-all duration-200">Read <span aria-hidden="true">→</span></span>
      </div>
    </Link>
  );

  return (
    <>
      {/* Mobile: drag carousel */}
      <div className="sm:hidden border-t border-[rgb(var(--line))]">
        <div
          ref={trackRef}
          className="flex overflow-x-auto select-none cursor-grab"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch", scrollSnapType: "x mandatory" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          <div className="shrink-0 w-[82vw]" style={{ scrollSnapAlign: "start" }}>
            {introCard()}
          </div>
          {posts.slice(0, 3).map((post, i) => (
            <div key={post.slug} className="shrink-0 w-[72vw]" style={{ scrollSnapAlign: "start" }}>
              {postCard(post, i)}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 px-6 py-3 border-t border-[rgb(var(--line))]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 shrink-0" style={{ color: "rgb(var(--muted))", opacity: 0.4 }}>
            <path d="M5 12h14M15 7l5 5-5 5" />
          </svg>
          <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-40">Drag to explore</span>
        </div>
      </div>

      {/* Desktop: 3-col grid, intro spans 2 cols row 1, then 3 posts fill row 2 */}
      <div className="hidden sm:grid sm:grid-cols-3 border-t border-l border-[rgb(var(--line))]">
        <div className="sm:col-span-2">{introCard()}</div>
        {posts[0] ? postCard(posts[0], 0) : <div className="border-r border-b border-[rgb(var(--line))]" aria-hidden="true" />}
        {posts.slice(1, 4).map((post, i) => postCard(post, i + 1))}
        {Array.from({ length: Math.max(0, 3 - posts.slice(1, 4).length) }).map((_, i) => (
          <div key={`ghost-${i}`} className="border-r border-b border-[rgb(var(--line))]" aria-hidden="true" />
        ))}
      </div>
    </>
  );
}

function VisualLayout({ work }: { work: WorkMeta[] }) {
  const [dashboardModalOpen, setDashboardModalOpen] = useState(false);
  return (
    <>
    <DashboardModal open={dashboardModalOpen} onClose={() => setDashboardModalOpen(false)} />
    <main className="page-container mx-auto w-full max-w-6xl min-h-screen flex flex-col">

      <SoundwaveHero />

      <GridRule />

      <TechMarquee />

      <GridRule />

      <div className="flex flex-col md:flex-row gap-y-0 overflow-visible">

        <div className="w-full rise flex flex-col" style={{ ["--rise-delay" as any]: "0ms" }}>

          <div className="grid grid-cols-2 sm:grid-cols-3">
            {BUILDING.map((item, i) => {
              const isDashboard = item.name === "Inertia Dashboard";
              const external = !isDashboard && item.href.startsWith("http");
              const borderClass = [
                i === 0 ? "border-r border-[rgb(var(--line))]" : "",
                i < 2 ? "sm:border-r sm:border-[rgb(var(--line))]" : "",
                i < 2 ? "border-b border-[rgb(var(--line))] sm:border-b-0" : "",
                i === 2 ? "col-span-2 sm:col-span-1" : "",
              ].filter(Boolean).join(" ");
              // third card (col-span-2) is shorter on mobile, normal on sm+
              const heightClass = i === 2 ? "min-h-[160px] sm:min-h-0" : "";
              const sharedClass = `group flex flex-col px-6 pt-5 pb-0 overflow-hidden transition-colors hover:bg-[rgb(var(--line))/0.12] text-left rise max-h-[340px] sm:max-h-[320px] ${borderClass} ${heightClass}`;
              const riseDelay = { ["--rise-delay" as any]: `${i * 60}ms` };
              // first two cards get a taller sketch on mobile
              const sketchClass = i < 2 ? "mt-auto w-full overflow-hidden [&_svg]:h-36 [&_svg]:w-full sm:[&_svg]:h-auto" : "mt-auto w-full overflow-hidden";
              const inner = (
                <>
                  {/* Text content */}
                  <div className="flex flex-col gap-1.5 mb-4">
                    <span className="text-[22px] font-medium tracking-tight text-[rgb(var(--fg))] leading-none">{item.name}</span>
                    <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] leading-snug">{item.description}</span>
                  </div>
                  {/* CTA */}
                  <span className="inline-flex self-start items-center gap-2 border border-[rgb(var(--line))] rounded-full px-3 py-1.5 mb-6 text-[rgb(var(--muted))] group-hover:text-[rgb(var(--fg))] group-hover:border-[rgb(var(--fg)/0.3)] transition-colors text-[13px] tracking-tight">
                    {item.cta}<span aria-hidden="true">→</span>
                  </span>
                  {/* Mockup flush to bottom — upward shadow to immerse sketch into card */}
                  <div className={`${sketchClass} relative`}>
                    {item.sketch}
                    <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none" style={{ background: "linear-gradient(to top, rgb(var(--bg)) 0%, transparent 100%)" }} />
                  </div>
                </>
              );
              if (isDashboard) return (
                <button key={item.name} onClick={() => setDashboardModalOpen(true)} className={sharedClass} style={riseDelay}>{inner}</button>
              );
              if (external) return (
                <a key={item.name} href={item.href} target="_blank" rel="noreferrer" className={sharedClass} style={riseDelay}>{inner}</a>
              );
              return (
                <Link key={item.name} href={item.href} className={sharedClass} style={riseDelay}>{inner}</Link>
              );
            })}
          </div>

          <GridRule />

          <StackDiagram />

        </div>

      </div>

      <section className="rise flex flex-col" style={{ ["--rise-delay" as any]: "0ms" }}>

        <div className="flex items-center justify-center px-6 sm:px-8 py-4 border-t border-b border-[rgb(var(--line))]">
          <span className="text-[25px] font-medium tracking-tight text-[rgb(var(--fg))] opacity-40">Past work</span>
        </div>

        <PastWork work={work} />

      </section>

      <div className="flex items-center justify-center px-6 sm:px-8 py-4 border-t border-b border-[rgb(var(--line))]">
        <span className="text-[25px] font-medium tracking-tight text-[rgb(var(--fg))] opacity-40">Commitments</span>
      </div>

      <ServiceCards />

      <GridRule />

    </main>
    </>
  );
}
