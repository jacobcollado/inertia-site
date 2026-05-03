"use client";

import React, { useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { SiShopify, SiTypescript, SiTailwindcss, SiSwift, SiMeta, SiSubstack, SiDribbble, SiFramer, SiVercel, SiApple } from "react-icons/si";
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
      {/* Ground plane — perspective grid */}
      <line x1="100" y1="60" x2="10"  y2="110" stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.32" />
      <line x1="100" y1="60" x2="190" y2="110" stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.32" />
      <line x1="100" y1="60" x2="10"  y2="85"  stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.22" />
      <line x1="100" y1="60" x2="190" y2="85"  stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.22" />
      <line x1="37"  y1="110" x2="163" y2="110" stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.32" />
      <line x1="22"  y1="96"  x2="178" y2="96"  stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.22" />
      <line x1="55"  y1="73"  x2="145" y2="73"  stroke="rgb(var(--muted))" strokeWidth="0.5" opacity="0.18" />
      {/* Vertical columns — accent tinted */}
      <line x1="37"  y1="110" x2="37"  y2="52"  stroke="rgb(var(--purple))" strokeWidth="0.9" opacity="0.55" />
      <line x1="163" y1="110" x2="163" y2="52"  stroke="rgb(var(--purple))" strokeWidth="0.9" opacity="0.55" />
      <line x1="22"  y1="96"  x2="22"  y2="38"  stroke="rgb(var(--purple))" strokeWidth="0.7" opacity="0.35" />
      <line x1="178" y1="96"  x2="178" y2="38"  stroke="rgb(var(--purple))" strokeWidth="0.7" opacity="0.35" />
      {/* Top face — accent tinted */}
      <line x1="100" y1="8"   x2="22"  y2="38"  stroke="rgb(var(--purple))" strokeWidth="0.9" opacity="0.55" />
      <line x1="100" y1="8"   x2="178" y2="38"  stroke="rgb(var(--purple))" strokeWidth="0.9" opacity="0.55" />
      <line x1="22"  y1="38"  x2="178" y2="38"  stroke="rgb(var(--purple))" strokeWidth="0.8" opacity="0.45" />
      <line x1="37"  y1="52"  x2="163" y2="52"  stroke="rgb(var(--purple))" strokeWidth="0.8" opacity="0.45" />
      <line x1="22"  y1="38"  x2="37"  y2="52"  stroke="rgb(var(--purple))" strokeWidth="0.6" opacity="0.35" />
      <line x1="178" y1="38"  x2="163" y2="52"  stroke="rgb(var(--purple))" strokeWidth="0.6" opacity="0.35" />
      {/* Motion lines */}
      <line x1="4"   y1="22"  x2="28"  y2="22"  stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.28" />
      <line x1="4"   y1="28"  x2="22"  y2="28"  stroke="rgb(var(--muted))" strokeWidth="0.5" opacity="0.2" />
      <line x1="4"   y1="34"  x2="18"  y2="34"  stroke="rgb(var(--muted))" strokeWidth="0.4" opacity="0.16" />
      <line x1="172" y1="22"  x2="196" y2="22"  stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.28" />
      <line x1="178" y1="28"  x2="196" y2="28"  stroke="rgb(var(--muted))" strokeWidth="0.5" opacity="0.2" />
      <line x1="182" y1="34"  x2="196" y2="34"  stroke="rgb(var(--muted))" strokeWidth="0.4" opacity="0.16" />
      {/* Vanishing point cross — accent */}
      <line x1="96"  y1="8"   x2="104" y2="8"   stroke="rgb(var(--purple))" strokeWidth="0.6" opacity="0.6" />
      <line x1="100" y1="4"   x2="100" y2="12"  stroke="rgb(var(--purple))" strokeWidth="0.6" opacity="0.6" />
      {/* Dimension tick marks */}
      <line x1="10"  y1="110" x2="10"  y2="115" stroke="rgb(var(--muted))" strokeWidth="0.5" opacity="0.22" />
      <line x1="190" y1="110" x2="190" y2="115" stroke="rgb(var(--muted))" strokeWidth="0.5" opacity="0.22" />
      <line x1="10"  y1="112" x2="190" y2="112" stroke="rgb(var(--muted))" strokeWidth="0.4" opacity="0.18" />
    </svg>
  );
}

function SketchDashboard() {
  const blue = "rgb(var(--blue))";
  const muted = "rgb(var(--muted))";
  return (
    <svg viewBox="0 0 200 120" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* App chrome */}
      <rect x="8" y="8" width="184" height="104" rx="3" stroke={muted} strokeWidth="0.9" opacity="0.32" />
      {/* Sidebar */}
      <line x1="48" y1="8" x2="48" y2="112" stroke={muted} strokeWidth="0.6" opacity="0.22" />
      {/* Sidebar nav items */}
      <rect x="14" y="18" width="26" height="5" rx="1.5" stroke={muted} strokeWidth="0.5" opacity="0.28" />
      {[30,50,60,70].map(y => (
        <line key={y} x1="14" y1={y} x2="40" y2={y} stroke={muted} strokeWidth="0.5" opacity="0.22" />
      ))}
      {/* Active nav — accent */}
      <rect x="12" y="37.5" width="2.5" height="7" rx="1" fill={blue} opacity="0.7" />
      <line x1="17" y1="41" x2="40" y2="41" stroke={blue} strokeWidth="0.9" opacity="0.65" />
      {/* Stat cards row — first card accented */}
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
      {/* Theme card */}
      <rect x="56" y="44" width="82" height="36" rx="2" stroke={muted} strokeWidth="0.7" opacity="0.28" />
      <line x1="62" y1="52" x2="108" y2="52" stroke={muted} strokeWidth="0.9" opacity="0.32" />
      <line x1="62" y1="58" x2="96" y2="58" stroke={muted} strokeWidth="0.5" opacity="0.22" />
      <line x1="62" y1="64" x2="100" y2="64" stroke={muted} strokeWidth="0.5" opacity="0.22" />
      {/* CTA button — accent */}
      <rect x="62" y="70" width="28" height="5" rx="1.5" fill={blue} fillOpacity="0.18" stroke={blue} strokeWidth="0.5" opacity="0.6" />
      {/* Activity feed */}
      <rect x="146" y="44" width="38" height="64" rx="2" stroke={muted} strokeWidth="0.6" opacity="0.26" />
      <line x1="152" y1="52" x2="178" y2="52" stroke={muted} strokeWidth="0.6" opacity="0.26" />
      {[62,72,82,96].map(y => (
        <g key={y}>
          <circle cx="155" cy={y} r="2" stroke={muted} strokeWidth="0.5" opacity="0.26" />
          <line x1="161" y1={y} x2="178" y2={y} stroke={muted} strokeWidth="0.5" opacity="0.26" />
          <line x1="161" y1={y + 4} x2="172" y2={y + 4} stroke={muted} strokeWidth="0.4" opacity="0.2" />
        </g>
      ))}
      {/* Support thread */}
      <rect x="56" y="86" width="82" height="20" rx="2" stroke={muted} strokeWidth="0.6" opacity="0.26" />
      <line x1="62" y1="93" x2="110" y2="93" stroke={muted} strokeWidth="0.6" opacity="0.26" />
      <line x1="62" y1="99" x2="96" y2="99" stroke={muted} strokeWidth="0.5" opacity="0.22" />
      {/* Online dot — accent */}
      <circle cx="184" cy="16" r="2.5" fill={blue} opacity="0.55" />
    </svg>
  );
}

function SketchAether() {
  const blue = "rgb(var(--blue))";
  const muted = "rgb(var(--muted))";
  return (
    <svg viewBox="0 0 200 120" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Browser chrome */}
      <rect x="8" y="8" width="184" height="104" rx="3" stroke={muted} strokeWidth="0.9" opacity="0.32" />
      {/* Nav bar */}
      <line x1="8" y1="22" x2="192" y2="22" stroke={muted} strokeWidth="0.7" opacity="0.22" />
      {/* Logo placeholder */}
      <rect x="16" y="13" width="18" height="6" rx="1" stroke={muted} strokeWidth="0.6" opacity="0.32" />
      {/* Nav links */}
      <line x1="46"  y1="16" x2="62"  y2="16" stroke={muted} strokeWidth="0.6" opacity="0.26" />
      <line x1="68"  y1="16" x2="84"  y2="16" stroke={muted} strokeWidth="0.6" opacity="0.26" />
      <line x1="90"  y1="16" x2="106" y2="16" stroke={muted} strokeWidth="0.6" opacity="0.26" />
      {/* CTA button top-right — accent */}
      <rect x="162" y="13" width="22" height="6" rx="2" fill={blue} fillOpacity="0.18" stroke={blue} strokeWidth="0.6" opacity="0.65" />
      {/* Hero block */}
      <rect x="16" y="28" width="168" height="38" rx="2" stroke={muted} strokeWidth="0.7" opacity="0.26" />
      {/* Hero title lines */}
      <line x1="30" y1="38" x2="120" y2="38" stroke={muted} strokeWidth="1.2" opacity="0.38" />
      <line x1="30" y1="44" x2="100" y2="44" stroke={muted} strokeWidth="1.2" opacity="0.38" />
      <line x1="30" y1="50" x2="80"  y2="50" stroke={muted} strokeWidth="0.8" opacity="0.26" />
      {/* Hero CTA — accent */}
      <rect x="30" y="55" width="32" height="7" rx="2" fill={blue} fillOpacity="0.2" stroke={blue} strokeWidth="0.7" opacity="0.65" />
      {/* Product grid — first card accented */}
      <rect x="16"  y="72" width="50" height="34" rx="2" stroke={blue} strokeWidth="0.8" opacity="0.45" fill={blue} fillOpacity="0.04" />
      <rect x="75"  y="72" width="50" height="34" rx="2" stroke={muted} strokeWidth="0.7" opacity="0.26" />
      <rect x="134" y="72" width="50" height="34" rx="2" stroke={muted} strokeWidth="0.7" opacity="0.26" />
      {/* Card image area top */}
      <rect x="20"  y="75" width="42" height="20" rx="1" stroke={blue} strokeWidth="0.5" opacity="0.35" fill={blue} fillOpacity="0.06" />
      <rect x="79"  y="75" width="42" height="20" rx="1" stroke={muted} strokeWidth="0.5" opacity="0.22" />
      <rect x="138" y="75" width="42" height="20" rx="1" stroke={muted} strokeWidth="0.5" opacity="0.22" />
      {/* Card title lines */}
      <line x1="20"  y1="99"  x2="52"  y2="99"  stroke={muted} strokeWidth="0.6" opacity="0.28" />
      <line x1="79"  y1="99"  x2="111" y2="99"  stroke={muted} strokeWidth="0.6" opacity="0.26" />
      <line x1="138" y1="99"  x2="170" y2="99"  stroke={muted} strokeWidth="0.6" opacity="0.26" />
      <line x1="20"  y1="103" x2="40"  y2="103" stroke={muted} strokeWidth="0.5" opacity="0.22" />
      <line x1="79"  y1="103" x2="99"  y2="103" stroke={muted} strokeWidth="0.5" opacity="0.2" />
      <line x1="138" y1="103" x2="158" y2="103" stroke={muted} strokeWidth="0.5" opacity="0.2" />
      {/* Dimension marks */}
      <line x1="8"  y1="118" x2="192" y2="118" stroke={muted} strokeWidth="0.4" opacity="0.18" />
      <line x1="8"  y1="116" x2="8"   y2="120" stroke={muted} strokeWidth="0.5" opacity="0.22" />
      <line x1="192" y1="116" x2="192" y2="120" stroke={muted} strokeWidth="0.5" opacity="0.22" />
    </svg>
  );
}

const BUILDING = [
  {
    name: "Inertia",
    description: "We turn your vision into something real.",
    tag: "Active",
    href: "https://www.instagram.com/by.inertia/",
    sketch: <SketchInertia />,
  },
  {
    name: "Aether Theme",
    description: "High-end Shopify theme.",
    tag: "In Progress",
    href: "/aether",
    sketch: <SketchAether />,
  },
  {
    name: "Inertia Dashboard",
    description: "Client portal for theme management, support, and updates.",
    tag: "Building",
    href: "#",
    sketch: <SketchDashboard />,
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
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState<"typing" | "erasing">("typing");

  useEffect(() => {
    const target = ALL_PHRASES[phraseIdx].text;
    let t: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (displayed.length < target.length) {
        t = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 58);
      } else {
        t = setTimeout(() => setPhase("erasing"), 2400);
      }
    } else {
      if (displayed.length > 0) {
        t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 26);
      } else {
        setPhraseIdx(i => (i + 1) % ALL_PHRASES.length);
        setPhase("typing");
      }
    }
    return () => clearTimeout(t);
  }, [displayed, phase, phraseIdx]);

  const current = ALL_PHRASES[phraseIdx];
  const isExternal = current.cta.href.startsWith("http");
  const ctaClass = "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] tracking-tight border border-[rgb(var(--line))] text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] hover:border-[rgb(var(--fg)/0.3)] transition-colors";

  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 px-6 sm:px-10 py-8 sm:py-10 text-center">

      {/* Label */}
      <p
        key={`label-${phraseIdx}`}
        className="text-[clamp(0.85rem,1.8vw,0.95rem)] tracking-tight text-[rgb(var(--muted))]"
        style={{ animation: "rise-in 300ms cubic-bezier(0.22,1,0.36,1) both" }}
      >
        {current.label}
      </p>

      {/* Icon + typed phrase — single line, no wrap */}
      <p
        className="flex items-center justify-center gap-2 whitespace-nowrap text-[clamp(1.55rem,3.8vw,2.4rem)] tracking-tight leading-none font-semibold transition-colors duration-300"
        style={{
          color: `rgb(var(${current.v}))`,
          textShadow: `0 1px 0 color-mix(in srgb, rgb(var(${current.v})) 35%, transparent), 0 2px 8px color-mix(in srgb, rgb(var(${current.v})) 18%, transparent)`,
        }}
      >
        <span
          key={`icon-${phraseIdx}`}
          style={{
            opacity: 0.75,
            animation: "rise-in 380ms 30ms cubic-bezier(0.22,1,0.36,1) both",
            display: "inline-flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {current.icon}
        </span>
        <span>
          {displayed}
          <span className="opacity-20 animate-pulse font-light">|</span>
        </span>
      </p>

      {/* CTA */}
      <div
        key={`cta-${phraseIdx}`}
        style={{ animation: "rise-in 420ms 100ms cubic-bezier(0.22,1,0.36,1) both" }}
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
  const blue = "rgb(var(--blue))";
  const green = "rgb(var(--green))";
  const purple = "rgb(var(--purple))";
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
      // Parallax tilt: increases as element scrolls up past center
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
            <rect x="28" y="18" width="264" height="158" rx="3" />
          </clipPath>
          <linearGradient id="fg-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(var(--fg))" />
            <stop offset="100%" stopColor="rgb(var(--muted))" />
          </linearGradient>
        </defs>

        {/* Lid bezel */}
        <rect x="12" y="6" width="296" height="174" rx="10" stroke={muted} strokeWidth="1.2" opacity="0.35" />
        {/* Screen */}
        <rect x="28" y="18" width="264" height="158" rx="3" fill="rgb(var(--bg))" stroke={line} strokeWidth="0.6" opacity="0.55" />
        {/* Camera */}
        <circle cx="160" cy="12" r="2" fill={muted} opacity="0.28" />

        {/* Browser bar */}
        <rect x="28" y="18" width="264" height="18" rx="3" fill="rgb(var(--bg))" clipPath="url(#screen-clip)" />
        <line x1="28" y1="36" x2="292" y2="36" stroke={line} strokeWidth="0.5" opacity="0.55" />
        {/* Traffic lights */}
        <circle cx="42" cy="27" r="2.8" fill={muted} opacity="0.18" />
        <circle cx="51" cy="27" r="2.8" fill={muted} opacity="0.18" />
        <circle cx="60" cy="27" r="2.8" fill={muted} opacity="0.18" />
        {/* URL bar */}
        <rect x="94" y="22" width="132" height="10" rx="3" stroke={muted} strokeWidth="0.4" opacity="0.16" />
        {/* Lock icon in URL */}
        <rect x="100" y="24.5" width="4" height="5" rx="1" stroke={muted} strokeWidth="0.4" opacity="0.22" />
        <path d="M101 24.5 v-1.5 a1.5 1.5 0 0 1 3 0 v1.5" stroke={muted} strokeWidth="0.4" opacity="0.22" fill="none" />
        <line x1="108" y1="27" x2="218" y2="27" stroke={muted} strokeWidth="0.4" opacity="0.15" />

        {/* Page nav bar */}
        <line x1="36" y1="46" x2="56" y2="46" stroke={muted} strokeWidth="1.1" strokeLinecap="round" opacity="0.45" />
        <line x1="62" y1="46" x2="76" y2="46" stroke={muted} strokeWidth="0.8" strokeLinecap="round" opacity="0.25" />
        <line x1="82" y1="46" x2="96" y2="46" stroke={muted} strokeWidth="0.8" strokeLinecap="round" opacity="0.25" />
        <line x1="102" y1="46" x2="116" y2="46" stroke={muted} strokeWidth="0.8" strokeLinecap="round" opacity="0.25" />
        {/* Nav CTA */}
        <rect x="258" y="41" width="26" height="10" rx="5" fill={blue} fillOpacity="0.15" stroke={blue} strokeWidth="0.5" opacity="0.5" />

        {/* Hero section */}
        <line x1="36" y1="64" x2="190" y2="64" stroke="url(#fg-grad)" strokeWidth="3.2" strokeLinecap="round" opacity="0.8" />
        <line x1="36" y1="74" x2="152" y2="74" stroke="url(#fg-grad)" strokeWidth="3.2" strokeLinecap="round" opacity="0.75" />

        {/* Gradient keyword lines */}
        <line x1="36" y1="86" x2="130" y2="86" stroke={blue} strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
        <line x1="134" y1="86" x2="164" y2="86" stroke={green} strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
        <line x1="168" y1="86" x2="210" y2="86" stroke={purple} strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />

        {/* Body copy */}
        <line x1="36" y1="98" x2="278" y2="98" stroke={muted} strokeWidth="0.9" strokeLinecap="round" opacity="0.28" />
        <line x1="36" y1="106" x2="254" y2="106" stroke={muted} strokeWidth="0.9" strokeLinecap="round" opacity="0.28" />
        <line x1="36" y1="114" x2="268" y2="114" stroke={muted} strokeWidth="0.9" strokeLinecap="round" opacity="0.28" />

        {/* CTA button */}
        <rect x="36" y="126" width="58" height="16" rx="8" fill={blue} fillOpacity="0.12" stroke={blue} strokeWidth="0.7" opacity="0.55" />
        <line x1="48" y1="134" x2="80" y2="134" stroke={blue} strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />

        {/* 3-column card row */}
        {[36, 118, 200].map((x, i) => (
          <g key={x}>
            <rect x={x} y="152" width="74" height="18" rx="2" stroke={i === 0 ? blue : muted} strokeWidth="0.6" opacity={i === 0 ? 0.4 : 0.2} fill={i === 0 ? blue : "none"} fillOpacity="0.04" />
            <line x1={x + 8} y1="158" x2={x + 50} y2="158" stroke={i === 0 ? blue : muted} strokeWidth="0.7" strokeLinecap="round" opacity={i === 0 ? 0.45 : 0.2} />
            <line x1={x + 8} y1="163" x2={x + 36} y2="163" stroke={muted} strokeWidth="0.5" strokeLinecap="round" opacity="0.16" />
          </g>
        ))}
      </svg>
    </div>
  );
}

function WhatWeDo() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2">
      {/* Laptop */}
      <div className="px-6 sm:px-10 py-8 sm:py-10 flex items-center justify-center sm:border-r sm:border-[rgb(var(--line))]">
        <LaptopWithText />
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
  // "A quiet forecast on AI capability" — capability curve with horizon line and uncertainty band
  "ai-capability-forecast": (
    <svg key="ai-capability-forecast" viewBox="0 0 200 120" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Grid */}
      {[30, 55, 80].map(y => (
        <line key={y} x1="18" y1={y} x2="188" y2={y} stroke="rgb(var(--muted))" strokeWidth="0.4" strokeDasharray="2 4" opacity="0.2" />
      ))}
      <line x1="18" y1="100" x2="188" y2="100" stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.3" />
      <line x1="18" y1="12"  x2="18"  y2="100" stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.3" />
      {/* Historical curve — solid blue */}
      <path d="M 18 98 C 40 97 60 92 80 84 C 95 78 108 68 120 56" stroke="rgb(var(--blue))" strokeWidth="1.8" opacity="0.8" />
      {/* Forecast zone — dashed, fanning uncertainty */}
      <path d="M 120 56 C 133 44 148 30 165 18" stroke="rgb(var(--blue))" strokeWidth="1.4" strokeDasharray="4 3" opacity="0.55" />
      {/* Upper uncertainty bound */}
      <path d="M 120 56 C 133 38 150 22 170 12" stroke="rgb(var(--blue))" strokeWidth="0.7" strokeDasharray="2 3" opacity="0.3" />
      {/* Lower uncertainty bound */}
      <path d="M 120 56 C 133 52 148 42 165 32" stroke="rgb(var(--blue))" strokeWidth="0.7" strokeDasharray="2 3" opacity="0.3" />
      {/* Horizon divider */}
      <line x1="120" y1="10" x2="120" y2="100" stroke="rgb(var(--muted))" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.25" />
      {/* "Now" tick */}
      <line x1="120" y1="100" x2="120" y2="106" stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.4" />
      {/* Milestone dots on curve */}
      <circle cx="50"  cy="95" r="2.5" fill="rgb(var(--blue))" opacity="0.5" />
      <circle cx="80"  cy="84" r="2.5" fill="rgb(var(--blue))" opacity="0.65" />
      <circle cx="120" cy="56" r="3.5" fill="rgb(var(--blue))" opacity="0.85" />
      <circle cx="120" cy="56" r="6"   stroke="rgb(var(--blue))" strokeWidth="0.8" opacity="0.25" />
      {/* Arrow on forecast line */}
      <polyline points="159,14 165,18 159,22" stroke="rgb(var(--blue))" strokeWidth="1.2" opacity="0.6" />
    </svg>
  ),

  // "Four years in" — growth curve, starts slow, accelerates
  "four-years": (
    <svg key="four-years" viewBox="0 0 200 120" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Grid */}
      {[30, 55, 80].map(y => (
        <line key={y} x1="18" y1={y} x2="188" y2={y} stroke="rgb(var(--muted))" strokeWidth="0.4" strokeDasharray="2 4" opacity="0.2" />
      ))}
      <line x1="18" y1="100" x2="188" y2="100" stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.3" />
      <line x1="18" y1="12"  x2="18"  y2="100" stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.3" />
      {/* Growth curve — slow start, then hockey stick */}
      <path d="M 18 98 C 50 97 72 94 90 86 C 110 74 130 52 150 34 C 162 24 172 17 188 12"
        stroke="rgb(var(--green))" strokeWidth="2.0" opacity="0.85" />
      {/* Milestone dots */}
      <circle cx="55"  cy="97" r="2.5" fill="rgb(var(--green))" opacity="0.5" />
      <circle cx="90"  cy="86" r="2.5" fill="rgb(var(--green))" opacity="0.65" />
      <circle cx="130" cy="52" r="3"   fill="rgb(var(--green))" opacity="0.8" />
      <circle cx="170" cy="18" r="3.5" fill="rgb(var(--green))" opacity="0.95" />
      {/* Drop lines */}
      <line x1="55"  y1="97" x2="55"  y2="100" stroke="rgb(var(--green))" strokeWidth="0.7" opacity="0.4" />
      <line x1="90"  y1="86" x2="90"  y2="100" stroke="rgb(var(--green))" strokeWidth="0.7" strokeDasharray="2 2" opacity="0.35" />
      <line x1="130" y1="52" x2="130" y2="100" stroke="rgb(var(--green))" strokeWidth="0.7" strokeDasharray="2 2" opacity="0.35" />
      <line x1="170" y1="18" x2="170" y2="100" stroke="rgb(var(--green))" strokeWidth="0.7" strokeDasharray="2 2" opacity="0.3" />
      {/* Baseline ticks */}
      {[55, 90, 130, 170].map(x => (
        <line key={x} x1={x} y1="100" x2={x} y2="106" stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.35" />
      ))}
      {/* Arrow */}
      <polyline points="182,8 188,12 182,16" stroke="rgb(var(--green))" strokeWidth="1.3" opacity="0.75" />
    </svg>
  ),

  // "Hello, world" — first page going live
  "hello-world": (
    <svg key="hello-world" viewBox="0 0 200 120" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Page chrome */}
      <rect x="14" y="10" width="172" height="100" rx="2" stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.28" />
      {/* Nav bar */}
      <line x1="14" y1="26" x2="186" y2="26" stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.2" />
      <line x1="24" y1="18" x2="52" y2="18" stroke="rgb(var(--fg))" strokeWidth="1.0" opacity="0.5" />
      <line x1="80" y1="18" x2="100" y2="18" stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.22" />
      <line x1="108" y1="18" x2="128" y2="18" stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.22" />
      {/* Big heading lines */}
      <line x1="24" y1="42" x2="130" y2="42" stroke="rgb(var(--fg))" strokeWidth="2.2" opacity="0.7" strokeLinecap="round" />
      <line x1="24" y1="52" x2="96" y2="52" stroke="rgb(var(--fg))" strokeWidth="2.2" opacity="0.7" strokeLinecap="round" />
      {/* Sub text */}
      <line x1="24" y1="64" x2="148" y2="64" stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.3" />
      <line x1="24" y1="71" x2="120" y2="71" stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.3" />
      <line x1="24" y1="78" x2="136" y2="78" stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.3" />
      {/* Cursor blink */}
      <rect x="138" y="73" width="5" height="9" rx="0.5" fill="rgb(var(--fg))" opacity="0.6" />
      {/* URL bar */}
      <rect x="60" y="13" width="80" height="10" rx="2" stroke="rgb(var(--muted))" strokeWidth="0.5" opacity="0.18" />
      <circle cx="67" cy="18" r="2" fill="rgb(var(--green))" opacity="0.55" />
      <line x1="73" y1="18" x2="132" y2="18" stroke="rgb(var(--muted))" strokeWidth="0.5" opacity="0.2" />
    </svg>
  ),
};

const TECH_ALL = [
  { name: "Shopify",    icon: SiShopify },
  { name: "TypeScript", icon: SiTypescript },
  { name: "Tailwind",   icon: SiTailwindcss },
  { name: "Photoshop",  icon: IconPhotoshop },
  { name: "Swift",      icon: SiSwift },
  { name: "Whop",       icon: IconWhop },
  { name: "Meta",       icon: SiMeta },
  { name: "Substack",   icon: SiSubstack },
  { name: "Dribbble",   icon: SiDribbble },
];

function TechMarquee() {
  const items = [...TECH_ALL, ...TECH_ALL, ...TECH_ALL];
  return (
    <div className="overflow-hidden py-4 select-none" aria-hidden="true">
      <div className="marquee-row marquee-row--fwd">
        {items.map((tech, i) => (
          <div key={i} className="marquee-item">
            <tech.icon />
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
    {
      key: "free" as Plan,
      label: "Get early access",
      sub: "Free, no commitment",
    },
    {
      key: "service" as Plan,
      label: "Work with us",
      sub: "Already a client or ready to start",
    },
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
        {/* Drag handle — mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-8 h-1 rounded-full bg-[rgb(var(--line))]" />
        </div>

        {/* Close — desktop */}
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
                Status updates, files, invoices, and support — built for clients who want visibility without the back-and-forth.
              </p>

              {/* Plan selector */}
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

      {/* Soundwave hero — touches both grid lines */}
      <SoundwaveHero />

      <GridRule />

      {/* Tech marquee */}
      <TechMarquee />

      <GridRule />

      {/* What we do */}
      <WhatWeDo />

      <GridRule />

      {/* Shipping + Perspectives */}
      <div className="flex flex-col md:flex-row gap-y-0 overflow-visible">

        <div className="w-full rise flex flex-col" style={{ ["--rise-delay" as any]: "0ms" }}>

          {/* ── What we're shipping ── */}
          <div className="flex items-center justify-center gap-3 py-6">
            <span className="text-[19px] tracking-tight text-[rgb(var(--muted))]">What we're actively</span>
            <TooltipPill tip="Products and themes we're currently developing under the Inertia name.">
              <div className="flex items-center gap-1.5 rounded-full px-3.5 py-2 cursor-default" style={{ background: "rgb(var(--muted)/0.08)", border: "1px solid rgb(var(--muted)/0.25)" }}>
                <SiShopify className="w-4 h-4" style={{ color: "rgb(var(--fg))" }} />
                <span className="text-[17px] font-medium tracking-tight" style={{ color: "rgb(var(--fg))" }}>building</span>
              </div>
            </TooltipPill>
            <span className="text-[19px] tracking-tight text-[rgb(var(--muted))]">right now</span>
          </div>

          <GridRule />

          {/* Items — 2×2 on mobile, row on sm+ */}
          <div className="grid grid-cols-2 sm:flex">
            {BUILDING.map((item, i) => {
              const isDashboard = item.name === "Inertia Dashboard";
              const external = !isDashboard && item.href.startsWith("http");
              const isActive = item.tag === "Active" || item.tag === "Building";
              const borderClass = [
                i === 0 ? "border-r border-[rgb(var(--line))]" : "",
                i === 1 ? "sm:border-r sm:border-[rgb(var(--line))]" : "",
                i < 2   ? "border-b border-[rgb(var(--line))] sm:border-b-0" : "",
                i === 2 ? "col-span-2 sm:col-span-1" : "",
              ].filter(Boolean).join(" ");
              const sharedClass = `group flex-1 flex flex-col justify-between gap-6 px-5 sm:px-8 pt-8 pb-6 transition-colors hover:bg-[rgb(var(--line))/0.15] min-h-[200px] sm:min-h-[220px] text-left rise ${borderClass}`;
              const riseDelay = { ["--rise-delay" as any]: `${i * 70}ms` };
              const inner = (
                <>
                  <div className="flex-1 flex flex-col gap-5">
                    <div className="w-full">{item.sketch}</div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[15px] sm:text-[17px] font-medium tracking-tight text-[rgb(var(--fg))] leading-none">{item.name}</span>
                      <span className="text-[12px] sm:text-[13px] tracking-tight text-[rgb(var(--muted))] leading-snug">{item.description}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="flex items-center gap-1.5 text-[11px] tracking-tight text-[rgb(var(--muted))]">
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-[rgb(var(--muted))] opacity-50"}`} />
                      {item.tag}
                    </span>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 text-[rgb(var(--muted))] opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0 duration-200" aria-hidden="true">
                      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
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

          {/* ── Perspectives ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-3 py-6 px-8 sm:px-0 sm:relative">
            <div className="flex items-center justify-center gap-3">
              <span className="text-[19px] tracking-tight text-[rgb(var(--muted))]">The way we</span>
              <TooltipPill tip="Short posts on design, development, and the decisions behind what we build.">
                <div className="flex items-center gap-1.5 rounded-full px-3.5 py-2 cursor-default" style={{ background: "rgb(var(--muted)/0.08)", border: "1px solid rgb(var(--muted)/0.25)" }}>
                  <SiSubstack className="w-4 h-4" style={{ color: "rgb(var(--fg))" }} />
                  <span className="text-[17px] font-medium tracking-tight" style={{ color: "rgb(var(--fg))" }}>think</span>
                </div>
              </TooltipPill>
              <span className="text-[19px] tracking-tight text-[rgb(var(--muted))]">about our work</span>
            </div>
            <Link href="/blog" className="sm:absolute sm:right-8 text-[13px] tracking-tight text-[rgb(var(--fg))] hover:text-[rgb(var(--muted))] transition-colors text-center sm:text-left">All Posts →</Link>
          </div>

          <GridRule />

          {posts.length === 0 ? (
            <p className="px-8 py-6 text-[13px] tracking-tight text-[rgb(var(--muted))]">Nothing yet.</p>
          ) : (
            <div className="grid grid-cols-2">
              {posts.slice(0, 4).map((post, i) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className={[
                    "group flex flex-col justify-between gap-4 px-5 sm:px-6 pt-6 pb-5 transition-colors hover:bg-[rgb(var(--line))/0.15] rise",
                    i % 2 === 0 ? "border-r border-[rgb(var(--line))]" : "",
                    i < 2 ? "border-b border-[rgb(var(--line))]" : "",
                  ].filter(Boolean).join(" ")}
                  style={{ ["--rise-delay" as any]: `${i * 60}ms` }}
                >
                  <div className="flex flex-col gap-4">
                    <div className="w-full overflow-hidden">
                      {THINK_SLUG_SKETCHES[post.slug]}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] sm:text-[15px] font-medium tracking-tight text-[rgb(var(--fg))] leading-snug">{post.title}</span>
                      <span className="text-[11px] sm:text-[12px] tracking-tight text-[rgb(var(--muted))] tabular-nums">{formatDate(post.date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    {i === 0
                      ? <span className="inline-flex items-center justify-center rounded-full bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-2.5 pt-[3px] pb-[4px] text-[10.5px] font-medium tracking-tight leading-none">New</span>
                      : <span />
                    }
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 text-[rgb(var(--muted))] opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0 duration-200" aria-hidden="true">
                      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <GridRule />

        </div>

      </div>

      {/* Past work */}
      <section className="rise flex flex-col" style={{ ["--rise-delay" as any]: "0ms" }}>

        {/* Label cell */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-3 py-6 px-8 sm:px-0 sm:relative">
          <div className="flex items-center justify-center gap-3">
            <span className="text-[19px] tracking-tight text-[rgb(var(--muted))]">Things we've</span>
            <TooltipPill tip="Selected client work spanning Shopify builds, brand identities, and custom web projects.">
              <div className="flex items-center gap-1.5 rounded-full px-3.5 py-2 cursor-default" style={{ background: "rgb(var(--muted)/0.08)", border: "1px solid rgb(var(--muted)/0.25)" }}>
                <SiDribbble className="w-4 h-4" style={{ color: "rgb(var(--fg))" }} />
                <span className="text-[17px] font-medium tracking-tight" style={{ color: "rgb(var(--fg))" }}>shipped</span>
              </div>
            </TooltipPill>
            <span className="text-[19px] tracking-tight text-[rgb(var(--muted))]">for real clients</span>
          </div>
          <Link href="/work" className="sm:absolute sm:right-8 text-[13px] tracking-tight text-[rgb(var(--fg))] hover:text-[rgb(var(--muted))] transition-colors text-center sm:text-left">All Work →</Link>
        </div>

        <GridRule />

        <PastWork work={work} />

      </section>

      <GridRule />

    </main>
    </>
  );
}
