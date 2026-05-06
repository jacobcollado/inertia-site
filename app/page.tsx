"use client";

import React, { useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { SiShopify, SiTypescript, SiTailwindcss, SiSwift, SiMeta, SiSubstack, SiFramer, SiVercel, SiApple } from "react-icons/si";
import { useEffect, useState } from "react";
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

// Aether — abstract storefront sketch: product image block, title, price, buy CTA
function MockupAether() {
  return (
    <svg viewBox="0 0 200 130" fill="none" className="w-full" aria-hidden="true">
      {/* Full-bleed product image area */}
      <rect x="0" y="0" width="200" height="72" fill="rgb(var(--muted))" fillOpacity="0.07" />
      {/* Thin nav */}
      <rect x="12" y="6" width="22" height="4" rx="2" fill="rgb(var(--fg))" opacity="0.22" />
      <rect x="160" y="5" width="28" height="6" rx="3" fill="rgb(var(--fg))" opacity="0.12" />
      <line x1="0" y1="16" x2="200" y2="16" stroke="rgb(var(--line))" strokeWidth="0.5" opacity="0.4" />
      {/* Product image hint */}
      <rect x="62" y="22" width="76" height="44" rx="1" fill="rgb(var(--muted))" fillOpacity="0.09" stroke="rgb(var(--line))" strokeWidth="0.4" strokeOpacity="0.3" />
      {/* Shopify icon centered in image area */}
      <foreignObject x="88" y="28" width="24" height="24">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", opacity: 0.22 }}>
          <SiShopify style={{ width: 20, height: 20, color: "rgb(var(--fg))" }} />
        </div>
      </foreignObject>
      {/* Product info row */}
      <rect x="12" y="82" width="72" height="5" rx="2.5" fill="rgb(var(--fg))" opacity="0.28" />
      <rect x="12" y="92" width="48" height="3" rx="1.5" fill="rgb(var(--muted))" opacity="0.18" />
      {/* Price + button */}
      <rect x="144" y="80" width="44" height="7" rx="3.5" fill="rgb(var(--fg))" opacity="0.3" />
      <rect x="144" y="94" width="44" height="14" rx="7" fill="rgb(var(--fg))" opacity="0.18" />
      {/* Product strip */}
      <line x1="0" y1="114" x2="200" y2="114" stroke="rgb(var(--line))" strokeWidth="0.5" opacity="0.3" />
      {[0,1,2,3].map((i) => (
        <rect key={i} x={6 + i * 49} y="118" width="40" height="10" rx="1" fill="rgb(var(--muted))" fillOpacity={0.07 + i * 0.01} />
      ))}
    </svg>
  );
}

// Dashboard — abstract portal sketch: stat cards, progress, file list
function MockupDashboard() {
  return (
    <svg viewBox="0 0 200 130" fill="none" className="w-full" aria-hidden="true">
      {/* Three stat cards */}
      {[0, 67, 134].map((x, i) => (
        <g key={i}>
          <rect x={x + 4} y="8" width="58" height="30" rx="2"
            stroke="rgb(var(--line))" strokeWidth="0.6"
            strokeOpacity={i === 0 ? 0.7 : 0.4}
            fill={i === 0 ? "rgb(var(--blue))" : "none"}
            fillOpacity={i === 0 ? 0.05 : 0} />
          <rect x={x + 10} y="16" width={30 - i * 5} height="4" rx="2"
            fill={i === 0 ? "rgb(var(--blue))" : "rgb(var(--muted))"}
            opacity={i === 0 ? 0.5 : 0.2} />
          <rect x={x + 10} y="24" width={20 - i * 3} height="2.5" rx="1.25"
            fill="rgb(var(--muted))" opacity="0.12" />
        </g>
      ))}
      {/* Vercel icon — top right, represents the web platform */}
      <foreignObject x="176" y="8" width="18" height="18">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", opacity: 0.2 }}>
          <SiVercel style={{ width: 14, height: 14, color: "rgb(var(--fg))" }} />
        </div>
      </foreignObject>
      {/* Progress row */}
      <rect x="4" y="48" width="192" height="22" rx="2" stroke="rgb(var(--line))" strokeWidth="0.6" strokeOpacity="0.35" />
      <rect x="10" y="54" width="90" height="2.5" rx="1.25" fill="rgb(var(--muted))" opacity="0.12" />
      <rect x="10" y="60" width="180" height="3" rx="1.5" fill="rgb(var(--line))" fillOpacity="0.5" />
      <rect x="10" y="60" width="112" height="3" rx="1.5" fill="rgb(var(--blue))" opacity="0.38" />
      {/* File rows */}
      {[0, 1, 2, 3].map(i => (
        <g key={i}>
          <rect x="4" y={80 + i * 12} width="8" height="8" rx="1"
            stroke="rgb(var(--line))" strokeWidth="0.6" strokeOpacity="0.4" />
          <rect x="16" y={82 + i * 12} width={110 - i * 16} height="3" rx="1.5"
            fill="rgb(var(--muted))" opacity={0.18 - i * 0.03} />
          <rect x={168} y={82 + i * 12} width="28" height="3" rx="1.5"
            fill="rgb(var(--muted))" opacity="0.09" />
        </g>
      ))}
    </svg>
  );
}

const BUILDING = [
  {
    name: "Inertia",
    description: "We become the technical partner your vision deserves.",
    cta: "Work with us",
    href: "https://www.instagram.com/by.inertia/",
    sketch: <SketchInertia />,
  },
  {
    name: "Aether Theme",
    description: "A high-end Shopify theme built for conversion and presence.",
    cta: "See Aether",
    href: "/aether",
    sketch: <MockupAether />,
  },
  {
    name: "Inertia Dashboard",
    description: "Project status, files, invoices, and support in one place.",
    cta: "Join waitlist",
    href: "#",
    sketch: <MockupDashboard />,
  },
];

export default function Home() {
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [work, setWork] = useState<WorkMeta[]>([]);

  useEffect(() => {
    fetch("/api/content").then((r) => r.json()).then((d) => {
      setPosts(d.posts ?? []);
      setWork(d.work ?? []);
    });
  }, []);

  return <VisualLayout posts={posts} work={work} />;
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

const IconPhotoshop = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0" aria-hidden="true">
    <path d="M9.85 8.42c-.37-.15-.77-.21-1.18-.2-.26 0-.49 0-.68.01-.2-.01-.34 0-.41.01v3.36c.14.01.27.02.39.02h.53c.39 0 .78-.06 1.15-.18.32-.09.6-.28.82-.53.21-.25.31-.59.31-1.03.01-.31-.07-.62-.23-.89-.17-.26-.41-.46-.7-.57zM19.75.3H4.25C1.9.3 0 2.2 0 4.55v14.899c0 2.35 1.9 4.25 4.25 4.25h15.5c2.35 0 4.25-1.9 4.25-4.25V4.55C24 2.2 22.1.3 19.75.3zm-7.391 11.65c-.399.56-.959.98-1.609 1.22-.68.25-1.43.34-2.25.34-.24 0-.4 0-.5-.01s-.24-.01-.43-.01v3.209c.01.07-.04.131-.11.141H5.52c-.08 0-.12-.041-.12-.131V6.42c0-.07.03-.11.1-.11.17 0 .33 0 .56-.01.24-.01.49-.01.76-.02s.56-.01.87-.02c.31-.01.61-.01.91-.01.82 0 1.5.1 2.06.31.5.17.96.45 1.34.82.32.32.57.71.73 1.14.149.42.229.85.229 1.3.001.86-.199 1.57-.6 2.13zm7.091 3.89c-.28.4-.671.709-1.12.891-.49.209-1.09.318-1.811.318-.459 0-.91-.039-1.359-.129-.35-.061-.7-.17-1.02-.32-.07-.039-.121-.109-.111-.189v-1.74c0-.029.011-.07.041-.09.029-.02.06-.01.09.01.39.23.8.391 1.24.49.379.1.779.15 1.18.15.38 0 .65-.051.83-.141.16-.07.27-.24.27-.42 0-.141-.08-.27-.24-.4-.16-.129-.489-.279-.979-.471-.51-.18-.979-.42-1.42-.719-.31-.221-.569-.51-.761-.85-.159-.32-.239-.67-.229-1.021 0-.43.12-.84.341-1.21.25-.4.619-.72 1.049-.92.469-.239 1.059-.349 1.769-.349.41 0 .83.03 1.24.09.3.04.59.12.86.23.039.01.08.05.1.09.01.04.02.08.02.12v1.63c0 .04-.02.08-.05.1-.09.02-.14.02-.18 0-.3-.16-.62-.27-.96-.34-.37-.08-.74-.13-1.12-.13-.2-.01-.41.02-.601.07-.129.03-.24.1-.31.2-.05.08-.08.18-.08.27s.04.18.101.26c.09.11.209.2.34.27.229.12.47.23.709.33.541.18 1.061.43 1.541.73.33.209.6.49.789.83.16.318.24.67.23 1.029.011.471-.129.94-.389 1.331z" />
  </svg>
);

const IconWhop = () => (
  <svg viewBox="0 0 383.2 196.4" fill="currentColor" className="w-5 h-5 shrink-0" aria-hidden="true">
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
      className="flex flex-col items-center justify-center gap-5 text-center px-6 sm:px-10"
      style={{ height: isMobile ? 240 : 380 }}
    >
      {/* Label */}
      <p
        key={`label-${animKey}`}
        className="text-[clamp(0.85rem,1.8vw,0.95rem)] tracking-tight text-[rgb(var(--muted))]"
        style={{
          opacity: exiting ? 0 : 1,
          transform: exiting ? "translateY(-5px)" : "translateY(0px)",
          transition: "opacity 280ms ease, transform 280ms ease",
        }}
      >
        {current.label}
      </p>

      {/* Icon + phrase — letter-by-letter 3D flip */}
      <p
        className="flex items-center gap-2 whitespace-nowrap text-[clamp(2rem,5vw,2.4rem)] tracking-tight leading-none font-normal"
        style={{ color: "rgb(var(--fg))", perspective: "800px", perspectiveOrigin: "50% 50%" }}
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

      {/* CTA */}
      <div
        key={`cta-${animKey}`}
        style={{
          opacity: exiting ? 0 : 1,
          transform: exiting ? "translateY(-5px)" : "translateY(0)",
          transition: "opacity 260ms ease 30ms, transform 260ms ease 30ms",
          animation: exiting ? "none" : "rise-in 420ms 80ms cubic-bezier(0.22,1,0.36,1) both",
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
const ABOUT_TEXT = "The kind of partner you'll actually want to work with again.";

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

const DIAGRAM_INPUTS = [
  { icon: SiShopify },
  { icon: SiSwift },
  { icon: SiFramer },
  { icon: SiMeta },
  { icon: SiTailwindcss },
];

const DIAGRAM_OUTPUTS = [
  { icon: SiVercel,  color: "#e2e8f0", darkColor: "#e2e8f0", negDelay: 0.5  },
  { icon: SiApple,   color: "#94a3b8", darkColor: "#cbd5e1", negDelay: 1.1  },
  { icon: SiFramer,  color: "#8B5CF6", darkColor: "#a78bfa", negDelay: 1.7  },
  { icon: SiMeta,    color: "#0082FB", darkColor: "#60a5fa", negDelay: 2.3  },
];

function StackDiagram() {
  const W = 340;
  const H = 300;
  const nodeX = W / 2;
  const nodeY = H / 2;

  const iconSize = 36;
  const iconGap = 8;
  const foSize = iconSize; // foreignObject matches icon slot exactly

  // Input pill (left)
  const totalInputH = DIAGRAM_INPUTS.length * iconSize + (DIAGRAM_INPUTS.length - 1) * iconGap;
  const pillW = 48;
  const inputPillX = 16;
  const inputPillCX = inputPillX + pillW / 2;
  const inputTopY = nodeY - totalInputH / 2;
  const connectorX1 = inputPillX + pillW + 2;
  const connectorX2 = nodeX - 22;

  // Output pill (right)
  const totalOutputH = DIAGRAM_OUTPUTS.length * iconSize + (DIAGRAM_OUTPUTS.length - 1) * iconGap;
  const outputPillX = W - 16 - pillW;
  const outputPillCX = outputPillX + pillW / 2;
  const outputTopY = nodeY - totalOutputH / 2;
  const connectorX3 = nodeX + 22;
  const connectorX4 = outputPillX - 2;

  return (
    <div className="flex flex-col sm:flex-row border-b border-[rgb(var(--line))]" >
      {/* Left: diagram */}
      <div className="sm:border-r border-[rgb(var(--line))] flex items-center justify-center overflow-hidden sm:w-1/3 sm:shrink-0 sm:self-stretch">
        <svg viewBox={`0 0 ${W} ${H}`} fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid meet" style={{ minHeight: 240 }}>
          {/* Input connector — flowing dashes travel left to right */}
          {(() => {
            const d = `M ${connectorX1} ${nodeY} C ${connectorX1 + 28} ${nodeY}, ${connectorX2 - 28} ${nodeY}, ${connectorX2} ${nodeY}`;
            return (
              <g>
                <path d={d} stroke="rgb(var(--fg))" strokeWidth="1" strokeLinecap="round" opacity="0.12" pathLength="1" />
                <path d={d} stroke="rgb(var(--fg))" strokeWidth="2" strokeLinecap="round"
                  strokeDasharray="0.08 0.12" opacity="0.7" pathLength="1"
                  style={{ animation: "line-travel 2s linear infinite" }} />
              </g>
            );
          })()}
          {/* Output connectors — static, no animation */}
          {DIAGRAM_OUTPUTS.map((out, i) => {
            const cy = outputTopY + i * (iconSize + iconGap) + iconSize / 2;
            const d = `M ${connectorX3} ${nodeY} C ${connectorX3 + 40} ${nodeY}, ${connectorX4 - 40} ${cy}, ${connectorX4} ${cy}`;
            return (
              <g key={i}>
                <path d={d} stroke={out.color} strokeWidth="1.5" strokeLinecap="round" opacity="0.35" pathLength="1" />
              </g>
            );
          })}
          {/* Central node */}
          <circle cx={nodeX} cy={nodeY} r="20" fill="rgb(var(--fg))" opacity="0.07" stroke="rgb(var(--fg))" strokeWidth="1" strokeOpacity="0.25" />
          <text x={nodeX} y={nodeY + 5} textAnchor="middle" fontSize="14" fontWeight="500" fill="rgb(var(--fg))" opacity="0.85" fontFamily="inherit">I</text>
          {/* Input pill */}
          <rect x={inputPillX} y={inputTopY - 4} width={pillW} height={totalInputH + 8} rx="8"
            fill="rgb(var(--bg))" stroke="rgb(var(--fg))" strokeWidth="1" strokeOpacity="0.2" />
          {DIAGRAM_INPUTS.map((inp, i) => {
            const cy = inputTopY + i * (iconSize + iconGap) + iconSize / 2;
            const iSize = 18;
            return (
              <foreignObject key={i} x={inputPillCX - iSize / 2} y={cy - iSize / 2} width={iSize} height={iSize}>
                <inp.icon style={{ width: iSize, height: iSize, color: "rgb(var(--fg))", opacity: 0.5 }} />
              </foreignObject>
            );
          })}
          {/* Output glow filter */}
          <defs>
            <filter id="out-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="out-dither" x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
          {/* Output pill with glow */}
          <g filter="url(#out-glow)">
            <rect x={outputPillX} y={outputTopY - 4} width={pillW} height={totalOutputH + 8} rx="8"
              fill="rgb(var(--bg))" stroke="rgb(var(--fg))" strokeWidth="1" strokeOpacity="0.15" />
          </g>
          {DIAGRAM_OUTPUTS.map((out, i) => {
            const cy = outputTopY + i * (iconSize + iconGap) + iconSize / 2;
            const iSize = 18;
            return (
              <g key={i} filter="url(#out-dither)">
                <foreignObject x={outputPillCX - iSize / 2} y={cy - iSize / 2} width={iSize} height={iSize}>
                  <out.icon style={{ width: iSize, height: iSize, color: out.color, opacity: 0.9 }} />
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Right: copy */}
      <div className="flex flex-col justify-center px-6 sm:px-8 py-6 gap-3 sm:flex-1 border-t border-[rgb(var(--line))] sm:border-t-0">
        <span className="inline-flex items-center gap-1.5 text-[14px] sm:text-[13px] tracking-tight text-[rgb(var(--muted))] self-start">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 opacity-60" aria-hidden="true">
            <rect x="7" y="7" width="10" height="10" rx="1" /><line x1="7" y1="9" x2="4" y2="9" /><line x1="7" y1="12" x2="4" y2="12" /><line x1="7" y1="15" x2="4" y2="15" /><line x1="17" y1="9" x2="20" y2="9" /><line x1="17" y1="12" x2="20" y2="12" /><line x1="17" y1="15" x2="20" y2="15" /><line x1="9" y1="7" x2="9" y2="4" /><line x1="12" y1="7" x2="12" y2="4" /><line x1="15" y1="7" x2="15" y2="4" /><line x1="9" y1="17" x2="9" y2="20" /><line x1="12" y1="17" x2="12" y2="20" /><line x1="15" y1="17" x2="15" y2="20" />
          </svg>
          End-to-end. One team.
        </span>
        <p className="text-[clamp(1.4rem,3vw,1.75rem)] font-normal tracking-tight text-[rgb(var(--fg))] leading-snug">
          Full-stack execution. One team owns the storefront, the app, the brand, and the campaign.
        </p>
      </div>
    </div>
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
    <svg key="ai-capability-forecast" viewBox="0 0 200 120" fill="none" className="w-full" aria-hidden="true">
      <circle cx="100" cy="60" r="6"  stroke="rgb(var(--blue))" strokeWidth="1.4" opacity="0.9" />
      <circle cx="100" cy="60" r="16" stroke="rgb(var(--blue))" strokeWidth="1.1" opacity="0.7" />
      <circle cx="100" cy="60" r="28" stroke="rgb(var(--blue))" strokeWidth="0.9" opacity="0.5" />
      <circle cx="100" cy="60" r="43" stroke="rgb(var(--blue))" strokeWidth="0.7" strokeDasharray="4 3" opacity="0.35" />
      <circle cx="100" cy="60" r="60" stroke="rgb(var(--blue))" strokeWidth="0.5" strokeDasharray="3 5" opacity="0.2" />
      <circle cx="100" cy="60" r="80" stroke="rgb(var(--blue))" strokeWidth="0.4" strokeDasharray="2 6" opacity="0.1" />
      <circle cx="100" cy="60" r="2.5" fill="rgb(var(--blue))" opacity="0.95" />
      <circle cx="38"  cy="22"  r="1.2" fill="rgb(var(--muted))" opacity="0.3" />
      <circle cx="162" cy="18"  r="1"   fill="rgb(var(--muted))" opacity="0.25" />
      <circle cx="22"  cy="88"  r="1.4" fill="rgb(var(--muted))" opacity="0.2" />
      <circle cx="178" cy="95"  r="1"   fill="rgb(var(--muted))" opacity="0.2" />
      <circle cx="52"  cy="108" r="1.2" fill="rgb(var(--muted))" opacity="0.25" />
      <circle cx="148" cy="105" r="1"   fill="rgb(var(--muted))" opacity="0.2" />
      <circle cx="12"  cy="50"  r="1"   fill="rgb(var(--muted))" opacity="0.18" />
      <circle cx="188" cy="60"  r="1.2" fill="rgb(var(--muted))" opacity="0.18" />
    </svg>
  ),

  "four-years": (
    <svg key="four-years" viewBox="0 0 200 120" fill="none" strokeLinecap="round" className="w-full" aria-hidden="true">
      <rect x="80" y="94" width="40"  height="7" rx="1" fill="rgb(var(--green))" opacity="0.25" />
      <rect x="62" y="82" width="76"  height="7" rx="1" fill="rgb(var(--green))" opacity="0.4" />
      <rect x="40" y="70" width="120" height="7" rx="1" fill="rgb(var(--green))" opacity="0.6" />
      <rect x="16" y="58" width="168" height="7" rx="1" fill="rgb(var(--green))" opacity="0.85" />
      <line x1="192" y1="97" x2="194" y2="97" stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.35" />
      <line x1="192" y1="85" x2="194" y2="85" stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.35" />
      <line x1="192" y1="73" x2="194" y2="73" stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.35" />
      <line x1="192" y1="61" x2="194" y2="61" stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.35" />
      <line x1="193" y1="56" x2="193" y2="102" stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.25" />
      <polyline points="190,26 193,20 196,26" stroke="rgb(var(--green))" strokeWidth="1.2" strokeLinejoin="round" opacity="0.7" />
      <line x1="193" y1="20" x2="193" y2="56" stroke="rgb(var(--green))" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
    </svg>
  ),

  "hello-world": (
    <svg key="hello-world" viewBox="0 0 200 120" fill="none" className="w-full" aria-hidden="true">
      <rect x="24" y="18" width="152" height="84" rx="4" stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.22" />
      <line x1="24" y1="34" x2="176" y2="34" stroke="rgb(var(--muted))" strokeWidth="0.5" opacity="0.18" />
      <circle cx="37" cy="26" r="3" fill="rgb(var(--muted))" opacity="0.18" />
      <circle cx="48" cy="26" r="3" fill="rgb(var(--muted))" opacity="0.18" />
      <circle cx="59" cy="26" r="3" fill="rgb(var(--muted))" opacity="0.18" />
      <text x="38" y="57" fontFamily="monospace" fontSize="11" fill="rgb(var(--green))" opacity="0.7">$</text>
      <line x1="50" y1="52" x2="66"  y2="52" stroke="rgb(var(--fg))" strokeWidth="1.4" opacity="0.55" strokeLinecap="round" />
      <line x1="69" y1="52" x2="80"  y2="52" stroke="rgb(var(--fg))" strokeWidth="1.4" opacity="0.55" strokeLinecap="round" />
      <line x1="83" y1="52" x2="100" y2="52" stroke="rgb(var(--fg))" strokeWidth="1.4" opacity="0.55" strokeLinecap="round" />
      <rect x="103" y="44" width="7" height="11" rx="1" fill="rgb(var(--fg))" opacity="0.7" />
      <line x1="38" y1="68" x2="120" y2="68" stroke="rgb(var(--green))" strokeWidth="1.0" opacity="0.45" strokeLinecap="round" />
      <line x1="38" y1="76" x2="90"  y2="76" stroke="rgb(var(--green))" strokeWidth="1.0" opacity="0.3" strokeLinecap="round" />
    </svg>
  ),
};

const TECH_ALL: { name: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { name: "Shopify",    icon: SiShopify,    color: "#96BF48" },
  { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
  { name: "Tailwind",   icon: SiTailwindcss,color: "#38BDF8" },
  { name: "Photoshop",  icon: IconPhotoshop,color: "#31A8FF" },
  { name: "Swift",      icon: SiSwift,      color: "#F05138" },
  { name: "Whop",       icon: IconWhop,     color: "#E8470A" },
  { name: "Meta",       icon: SiMeta,       color: "#0082FB" },
  { name: "Substack",   icon: SiSubstack,   color: "#FF6719" },
];

function TechMarquee() {
  const items = [...TECH_ALL, ...TECH_ALL, ...TECH_ALL];
  return (
    <div className="overflow-hidden py-4 select-none" aria-hidden="true">
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

function VisualLayout({ posts, work }: { posts: PostMeta[]; work: WorkMeta[] }) {
  const [dashboardModalOpen, setDashboardModalOpen] = useState(false);
  return (
    <>
    <DashboardModal open={dashboardModalOpen} onClose={() => setDashboardModalOpen(false)} />
    <main className="page-container mx-auto w-full max-w-5xl min-h-screen flex flex-col">

      <SoundwaveHero />

      <GridRule />

      <TechMarquee />

      <GridRule />

      <WhatWeDo />

      <GridRule />

      <div className="flex flex-col md:flex-row gap-y-0 overflow-visible">

        <div className="w-full rise flex flex-col" style={{ ["--rise-delay" as any]: "0ms" }}>

          {/* Building grid — no section label, cards speak for themselves */}
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
              const sharedClass = `group flex flex-col px-6 pt-6 pb-0 overflow-hidden transition-colors hover:bg-[rgb(var(--line))/0.12] text-left rise ${borderClass} ${heightClass}`;
              const riseDelay = { ["--rise-delay" as any]: `${i * 60}ms` };
              // first two cards get a taller sketch on mobile
              const sketchClass = i < 2 ? "mt-auto w-full overflow-hidden [&_svg]:h-40 [&_svg]:w-full sm:[&_svg]:h-auto" : "mt-auto w-full overflow-hidden";
              const inner = (
                <>
                  {/* Text content */}
                  <div className="flex flex-col gap-1.5 mb-4">
                    <span className="text-[22px] font-medium tracking-tight text-[rgb(var(--fg))] leading-none">{item.name}</span>
                    <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] leading-snug">{item.description}</span>
                  </div>
                  {/* CTA arrow */}
                  <span className="inline-flex self-start items-center justify-center w-9 h-9 border border-[rgb(var(--line))] rounded-full mb-6 text-[rgb(var(--muted))] group-hover:text-[rgb(var(--fg))] group-hover:border-[rgb(var(--fg)/0.3)] transition-colors text-[14px]">
                    →
                  </span>
                  {/* Mockup flush to bottom */}
                  <div className={sketchClass}>
                    {item.sketch}
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

          <GridRule />

          <div className="grid grid-cols-2 sm:grid-cols-3 border-l border-[rgb(var(--line))]">
            {/* Intro card */}
            <Link href="/blog" className="group flex flex-col justify-between gap-4 px-6 pt-6 pb-6 border-r border-b border-[rgb(var(--line))] transition-colors hover:bg-[rgb(var(--line))/0.15] rise" style={{ ["--rise-delay" as any]: "0ms" }}>
              <div className="w-full overflow-hidden">
                <svg viewBox="0 0 200 120" fill="none" className="w-full" aria-hidden="true">
                  <line x1="12" y1="16" x2="188" y2="16" stroke="rgb(var(--line))" strokeWidth="0.6" opacity="0.6" />
                  <rect x="12" y="24" width="72" height="8" rx="4" fill="rgb(var(--fg))" opacity="0.25" />
                  <rect x="12" y="38" width="140" height="5" rx="2.5" fill="rgb(var(--muted))" opacity="0.18" />
                  <rect x="12" y="47" width="110" height="5" rx="2.5" fill="rgb(var(--muted))" opacity="0.13" />
                  <rect x="12" y="56" width="128" height="5" rx="2.5" fill="rgb(var(--muted))" opacity="0.1" />
                  <line x1="12" y1="70" x2="188" y2="70" stroke="rgb(var(--line))" strokeWidth="0.6" opacity="0.4" />
                  <rect x="12" y="78" width="56" height="5" rx="2.5" fill="rgb(var(--muted))" opacity="0.15" />
                  <rect x="12" y="87" width="80" height="5" rx="2.5" fill="rgb(var(--muted))" opacity="0.11" />
                  <rect x="12" y="96" width="64" height="5" rx="2.5" fill="rgb(var(--muted))" opacity="0.08" />
                </svg>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[18px] sm:text-[22px] font-medium tracking-tight text-[rgb(var(--fg))] leading-snug">Inertia Writes</span>
                <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] leading-relaxed opacity-70">Short essays on building products, running a brand, and what the industry gets wrong.</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] tabular-nums opacity-50">Journal</span>
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-[rgb(var(--line))] text-[rgb(var(--muted))] text-[14px] group-hover:text-[rgb(var(--fg))] group-hover:border-[rgb(var(--fg)/0.3)] transition-all duration-200">→</span>
              </div>
            </Link>
            {/* Post cards */}
            {posts.slice(0, 3).map((post, i) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col justify-between gap-4 px-6 pt-6 pb-6 transition-colors hover:bg-[rgb(var(--line))/0.15] rise border-r border-b border-[rgb(var(--line))]"
                style={{ ["--rise-delay" as any]: `${(i + 1) * 60}ms` }}
              >
                <div className="w-full overflow-hidden">
                  {THINK_SLUG_SKETCHES[post.slug]}
                </div>
                <div className="flex flex-col gap-1.5">
                  {i === 0 && (
                    <span className="inline-flex items-center self-start border border-[rgb(var(--line))] text-[rgb(var(--muted))] px-2 py-0.5 text-[11px] tracking-tight leading-none rounded-sm mb-1">
                      Latest
                    </span>
                  )}
                  <span className="text-[18px] sm:text-[22px] font-medium tracking-tight text-[rgb(var(--fg))] leading-snug">{post.title}</span>
                  {post.summary && <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] leading-relaxed opacity-70 line-clamp-2">{post.summary}</span>}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] tabular-nums opacity-50">{formatDate(post.date)}</span>
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-[rgb(var(--line))] text-[rgb(var(--muted))] text-[14px] opacity-100 transition-all duration-200">→</span>
                </div>
              </Link>
            ))}
          </div>

        </div>

      </div>

      <section className="rise flex flex-col" style={{ ["--rise-delay" as any]: "0ms" }}>

        <div className="relative flex items-center justify-center gap-3 py-6 px-6 sm:px-8 border-b border-[rgb(var(--line))]">
          <p className="text-[clamp(1.25rem,3vw,1.6rem)] font-normal tracking-tight text-[rgb(var(--fg))] leading-snug flex items-center gap-2 flex-wrap justify-center">
            Ship faster without
            <TooltipPill tip="Selected client work spanning Shopify builds, brand identities, and custom web projects.">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 cursor-default" style={{ background: "rgb(var(--muted)/0.08)", border: "1px solid rgb(var(--muted)/0.25)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 opacity-70" style={{ color: "rgb(var(--fg))" }}>
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/>
                </svg>
                <span className="text-[0.85em] font-medium tracking-tight" style={{ color: "rgb(var(--fg))" }}>compromise</span>
              </span>
            </TooltipPill>
            on quality.
          </p>
          <Link href="/work" className="absolute right-6 sm:right-8 inline-flex items-center justify-center w-7 h-7 border border-[rgb(var(--line))] rounded-full text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] hover:border-[rgb(var(--fg)/0.3)] transition-colors text-[12px] shrink-0">→</Link>
        </div>

        <PastWork work={work} />

      </section>

      <GridRule />

    </main>
    </>
  );
}
