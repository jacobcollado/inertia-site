"use client";

import React from "react";
import Link from "next/link";
import { SiShopify, SiReact, SiTypescript, SiTailwindcss, SiFigma, SiSwift, SiMeta, SiSubstack, SiDribbble } from "react-icons/si";
import { useEffect, useState } from "react";
import { TooltipPill } from "./tooltip-pill";
import { PastWork } from "./past-work";
import { SoundwaveHero } from "./soundwave-hero";
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
      <line x1="37"  y1="110" x2="37"  y2="52"  stroke="rgb(160,140,255)" strokeWidth="0.9" opacity="0.55" />
      <line x1="163" y1="110" x2="163" y2="52"  stroke="rgb(160,140,255)" strokeWidth="0.9" opacity="0.55" />
      <line x1="22"  y1="96"  x2="22"  y2="38"  stroke="rgb(160,140,255)" strokeWidth="0.7" opacity="0.35" />
      <line x1="178" y1="96"  x2="178" y2="38"  stroke="rgb(160,140,255)" strokeWidth="0.7" opacity="0.35" />
      {/* Top face — accent tinted */}
      <line x1="100" y1="8"   x2="22"  y2="38"  stroke="rgb(160,140,255)" strokeWidth="0.9" opacity="0.55" />
      <line x1="100" y1="8"   x2="178" y2="38"  stroke="rgb(160,140,255)" strokeWidth="0.9" opacity="0.55" />
      <line x1="22"  y1="38"  x2="178" y2="38"  stroke="rgb(160,140,255)" strokeWidth="0.8" opacity="0.45" />
      <line x1="37"  y1="52"  x2="163" y2="52"  stroke="rgb(160,140,255)" strokeWidth="0.8" opacity="0.45" />
      <line x1="22"  y1="38"  x2="37"  y2="52"  stroke="rgb(160,140,255)" strokeWidth="0.6" opacity="0.35" />
      <line x1="178" y1="38"  x2="163" y2="52"  stroke="rgb(160,140,255)" strokeWidth="0.6" opacity="0.35" />
      {/* Motion lines */}
      <line x1="4"   y1="22"  x2="28"  y2="22"  stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.28" />
      <line x1="4"   y1="28"  x2="22"  y2="28"  stroke="rgb(var(--muted))" strokeWidth="0.5" opacity="0.2" />
      <line x1="4"   y1="34"  x2="18"  y2="34"  stroke="rgb(var(--muted))" strokeWidth="0.4" opacity="0.16" />
      <line x1="172" y1="22"  x2="196" y2="22"  stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.28" />
      <line x1="178" y1="28"  x2="196" y2="28"  stroke="rgb(var(--muted))" strokeWidth="0.5" opacity="0.2" />
      <line x1="182" y1="34"  x2="196" y2="34"  stroke="rgb(var(--muted))" strokeWidth="0.4" opacity="0.16" />
      {/* Vanishing point cross — accent */}
      <line x1="96"  y1="8"   x2="104" y2="8"   stroke="rgb(160,140,255)" strokeWidth="0.6" opacity="0.6" />
      <line x1="100" y1="4"   x2="100" y2="12"  stroke="rgb(160,140,255)" strokeWidth="0.6" opacity="0.6" />
      {/* Dimension tick marks */}
      <line x1="10"  y1="110" x2="10"  y2="115" stroke="rgb(var(--muted))" strokeWidth="0.5" opacity="0.22" />
      <line x1="190" y1="110" x2="190" y2="115" stroke="rgb(var(--muted))" strokeWidth="0.5" opacity="0.22" />
      <line x1="10"  y1="112" x2="190" y2="112" stroke="rgb(var(--muted))" strokeWidth="0.4" opacity="0.18" />
    </svg>
  );
}

function SketchDashboard() {
  const blue = "rgb(56,180,255)";
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
  const blue = "rgb(56,180,255)";
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
    href: "https://www.instagram.com/kayz.xyz/",
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

// Blueprint sketches for the perspectives (think) cards
const THINK_SKETCHES = [
  // Drafting compass — precision, craft
  <svg key="compass" viewBox="0 0 200 120" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
    {/* Compass legs */}
    <line x1="100" y1="28" x2="62" y2="100" stroke="rgb(var(--muted))" strokeWidth="0.9" opacity="0.32" />
    <line x1="100" y1="28" x2="138" y2="100" stroke="rgb(var(--muted))" strokeWidth="0.9" opacity="0.32" />
    {/* Needle tip */}
    <line x1="62" y1="100" x2="60" y2="107" stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.28" />
    <line x1="60" y1="107" x2="64" y2="107" stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.22" />
    {/* Pencil tip */}
    <line x1="138" y1="100" x2="136" y2="107" stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.28" />
    <line x1="136" y1="107" x2="140" y2="104" stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.22" />
    {/* Arc being drawn — amber accent */}
    <path d="M 52 95 A 58 58 0 0 1 148 95" stroke="rgb(251,191,36)" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.65" />
    {/* Hinge crossbar */}
    <line x1="88" y1="52" x2="112" y2="52" stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.28" />
    <circle cx="94" cy="52" r="1.5" stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.28" />
    <circle cx="106" cy="52" r="1.5" stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.28" />
    {/* Adjustment screw */}
    <line x1="100" y1="28" x2="100" y2="18" stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.28" />
    <line x1="96" y1="18" x2="104" y2="18" stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.26" />
    <line x1="97" y1="15" x2="103" y2="15" stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.22" />
    <line x1="98" y1="12" x2="102" y2="12" stroke="rgb(var(--muted))" strokeWidth="0.5" opacity="0.18" />
    {/* Pivot point — amber accent */}
    <circle cx="100" cy="28" r="3" stroke="rgb(251,191,36)" strokeWidth="0.9" opacity="0.7" />
    <circle cx="100" cy="28" r="1.2" fill="rgb(251,191,36)" opacity="0.55" />
    {/* Construction lines */}
    <line x1="100" y1="95" x2="100" y2="110" stroke="rgb(var(--muted))" strokeWidth="0.4" strokeDasharray="2 2" opacity="0.18" />
    <line x1="60" y1="95" x2="140" y2="95" stroke="rgb(var(--muted))" strokeWidth="0.4" strokeDasharray="2 2" opacity="0.18" />
    {/* Radius dimension — amber */}
    <line x1="100" y1="97" x2="138" y2="97" stroke="rgb(251,191,36)" strokeWidth="0.5" opacity="0.45" />
    <line x1="100" y1="95" x2="100" y2="99" stroke="rgb(251,191,36)" strokeWidth="0.6" opacity="0.5" />
    <line x1="138" y1="95" x2="138" y2="99" stroke="rgb(251,191,36)" strokeWidth="0.6" opacity="0.5" />
  </svg>,

  // Type specimen grid — hierarchy, rhythm
  <svg key="type" viewBox="0 0 200 120" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
    {/* Baseline grid */}
    {[32,48,64,80,96,112].map(y => (
      <line key={y} x1="12" y1={y} x2="188" y2={y} stroke="rgb(var(--muted))" strokeWidth="0.4" strokeDasharray="2 3" opacity="0.16" />
    ))}
    {/* Display headline — amber accent */}
    <line x1="12" y1="12" x2="12"  y2="32" stroke="rgb(251,191,36)" strokeWidth="3.5" opacity="0.55" />
    <line x1="22" y1="12" x2="22"  y2="32" stroke="rgb(251,191,36)" strokeWidth="3.5" opacity="0.55" />
    <line x1="12" y1="21" x2="22"  y2="21" stroke="rgb(251,191,36)" strokeWidth="2.5" opacity="0.45" />
    <line x1="32" y1="12" x2="32"  y2="32" stroke="rgb(251,191,36)" strokeWidth="3.5" opacity="0.55" />
    <line x1="32" y1="12" x2="44"  y2="32" stroke="rgb(251,191,36)" strokeWidth="3.5" opacity="0.55" />
    <line x1="54" y1="12" x2="54"  y2="32" stroke="rgb(251,191,36)" strokeWidth="3.5" opacity="0.55" />
    <line x1="54" y1="12" x2="66"  y2="12" stroke="rgb(251,191,36)" strokeWidth="3.5" opacity="0.55" />
    <line x1="54" y1="22" x2="63"  y2="22" stroke="rgb(251,191,36)" strokeWidth="2.5" opacity="0.45" />
    <line x1="54" y1="32" x2="66"  y2="32" stroke="rgb(251,191,36)" strokeWidth="3.5" opacity="0.55" />
    {/* Subhead — medium muted */}
    <line x1="12" y1="44" x2="90"  y2="44" stroke="rgb(var(--muted))" strokeWidth="1.8" opacity="0.35" />
    <line x1="12" y1="52" x2="75"  y2="52" stroke="rgb(var(--muted))" strokeWidth="1.8" opacity="0.35" />
    {/* Body copy */}
    <line x1="12" y1="60" x2="186" y2="60" stroke="rgb(var(--muted))" strokeWidth="0.9" opacity="0.22" />
    <line x1="12" y1="68" x2="186" y2="68" stroke="rgb(var(--muted))" strokeWidth="0.9" opacity="0.22" />
    <line x1="12" y1="76" x2="160" y2="76" stroke="rgb(var(--muted))" strokeWidth="0.9" opacity="0.22" />
    <line x1="12" y1="84" x2="186" y2="84" stroke="rgb(var(--muted))" strokeWidth="0.9" opacity="0.22" />
    <line x1="12" y1="92" x2="140" y2="92" stroke="rgb(var(--muted))" strokeWidth="0.9" opacity="0.22" />
    {/* Cap-height marker — amber */}
    <line x1="6" y1="12" x2="10"  y2="12" stroke="rgb(251,191,36)" strokeWidth="0.7" opacity="0.55" />
    <line x1="6" y1="32" x2="10"  y2="32" stroke="rgb(251,191,36)" strokeWidth="0.7" opacity="0.55" />
    <line x1="8" y1="12" x2="8"   y2="32" stroke="rgb(251,191,36)" strokeWidth="0.5" opacity="0.45" />
    {/* x-height marker — amber */}
    <line x1="192" y1="44" x2="196" y2="44" stroke="rgb(251,191,36)" strokeWidth="0.7" opacity="0.5" />
    <line x1="192" y1="52" x2="196" y2="52" stroke="rgb(251,191,36)" strokeWidth="0.7" opacity="0.5" />
    <line x1="194" y1="44" x2="194" y2="52" stroke="rgb(251,191,36)" strokeWidth="0.5" opacity="0.4" />
  </svg>,

  // Light bulb cross-section — ideas, clarity
  <svg key="bulb" viewBox="0 0 200 120" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
    {/* Bulb glow fill — amber */}
    <path d="M 100 10 C 130 10 148 30 148 55 C 148 75 136 88 128 95 L 72 95 C 64 88 52 75 52 55 C 52 30 70 10 100 10 Z" fill="rgb(251,191,36)" fillOpacity="0.06" stroke="rgb(251,191,36)" strokeWidth="0.9" opacity="0.5" />
    {/* Filament support wires */}
    <line x1="84" y1="95" x2="84" y2="72" stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.28" />
    <line x1="116" y1="95" x2="116" y2="72" stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.28" />
    {/* Filament coil — amber accent */}
    <path d="M 84 72 Q 88 62 92 68 Q 96 74 100 64 Q 104 54 108 64 Q 112 74 116 68 Q 116 66 116 64" stroke="rgb(251,191,36)" strokeWidth="1.0" opacity="0.7" />
    {/* Glass neck / base */}
    <line x1="72" y1="95" x2="72"  y2="108" stroke="rgb(var(--muted))" strokeWidth="0.9" opacity="0.3" />
    <line x1="128" y1="95" x2="128" y2="108" stroke="rgb(var(--muted))" strokeWidth="0.9" opacity="0.3" />
    <line x1="72" y1="100" x2="128" y2="100" stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.22" />
    <line x1="72" y1="104" x2="128" y2="104" stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.22" />
    <line x1="72" y1="108" x2="128" y2="108" stroke="rgb(var(--muted))" strokeWidth="0.9" opacity="0.3" />
    {/* Base screw threads */}
    <path d="M 72 108 Q 80 112 88 108 Q 96 104 104 108 Q 112 112 120 108 Q 126 105 128 108" stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.22" />
    <path d="M 74 114 Q 82 118 90 114 Q 98 110 106 114 Q 114 118 122 114 Q 126 112 128 114" stroke="rgb(var(--muted))" strokeWidth="0.5" opacity="0.18" />
    {/* Radiation lines — amber */}
    <line x1="100" y1="8"  x2="100" y2="2"  stroke="rgb(251,191,36)" strokeWidth="0.6" opacity="0.55" />
    <line x1="118" y1="13" x2="122" y2="9"  stroke="rgb(251,191,36)" strokeWidth="0.6" opacity="0.45" />
    <line x1="130" y1="26" x2="135" y2="23" stroke="rgb(251,191,36)" strokeWidth="0.6" opacity="0.38" />
    <line x1="82"  y1="13" x2="78"  y2="9"  stroke="rgb(251,191,36)" strokeWidth="0.6" opacity="0.45" />
    <line x1="70"  y1="26" x2="65"  y2="23" stroke="rgb(251,191,36)" strokeWidth="0.6" opacity="0.38" />
    {/* Center line */}
    <line x1="100" y1="10" x2="100" y2="95" stroke="rgb(var(--muted))" strokeWidth="0.35" strokeDasharray="3 2" opacity="0.18" />
    {/* Dimension marks */}
    <line x1="52"  y1="115" x2="148" y2="115" stroke="rgb(var(--muted))" strokeWidth="0.4" opacity="0.18" />
    <line x1="52"  y1="113" x2="52"  y2="117" stroke="rgb(var(--muted))" strokeWidth="0.5" opacity="0.22" />
    <line x1="148" y1="113" x2="148" y2="117" stroke="rgb(var(--muted))" strokeWidth="0.5" opacity="0.22" />
  </svg>,
];

// Slug-specific sketch overrides for the think section
const THINK_SLUG_SKETCHES: Record<string, React.ReactElement> = {
  "hello-world": (
    <svg key="hello-world" viewBox="0 0 200 120" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Origin point — amber */}
      <circle cx="44" cy="60" r="3.5" fill="rgb(251,191,36)" opacity="0.65" />
      {/* Concentric arcs — amber fading out */}
      <path d="M 55 43 A 20 20 0 0 1 55 77" stroke="rgb(251,191,36)" strokeWidth="1.0" opacity="0.55" />
      <path d="M 68 30 A 34 34 0 0 1 68 90" stroke="rgb(251,191,36)" strokeWidth="0.7" opacity="0.38" />
      <path d="M 84 19 A 48 48 0 0 1 84 101" stroke="rgb(var(--muted))" strokeWidth="0.45" opacity="0.28" />
      <path d="M 103 10 A 62 62 0 0 1 103 110" stroke="rgb(var(--muted))" strokeWidth="0.28" opacity="0.18" />
      {/* Dashed axis */}
      <line x1="44" y1="60" x2="170" y2="60" stroke="rgb(var(--muted))" strokeWidth="0.3" strokeDasharray="2 5" opacity="0.2" />
      {/* Arrival tick + arrow — amber */}
      <line x1="170" y1="51" x2="170" y2="69" stroke="rgb(251,191,36)" strokeWidth="0.8" opacity="0.55" />
      <line x1="177" y1="60" x2="190" y2="60" stroke="rgb(251,191,36)" strokeWidth="0.6" opacity="0.5" />
      <polyline points="184,55 190,60 184,65" stroke="rgb(251,191,36)" strokeWidth="0.7" opacity="0.5" />
    </svg>
  ),
  "four-years": (
    <svg key="four-years" viewBox="0 0 200 120" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Grid lines — faint */}
      {[30, 55, 80, 105].map(y => (
        <line key={y} x1="20" y1={y} x2="185" y2={y} stroke="rgb(var(--muted))" strokeWidth="0.35" strokeDasharray="2 4" opacity="0.16" />
      ))}
      {/* Baseline */}
      <line x1="20" y1="105" x2="185" y2="105" stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.22" />
      {/* Y axis */}
      <line x1="20" y1="20" x2="20" y2="105" stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.22" />
      {/* Growth curve — starts flat, accelerates — green accent */}
      <path
        d="M 20 103 C 50 102 70 96 90 86 C 110 74 128 55 148 38 C 158 30 168 24 185 18"
        stroke="rgb(52,211,153)"
        strokeWidth="1.4"
        opacity="0.75"
      />
      {/* Milestone dots along the curve */}
      <circle cx="55"  cy="100" r="2.2" fill="rgb(52,211,153)" opacity="0.45" />
      <circle cx="90"  cy="86"  r="2.2" fill="rgb(52,211,153)" opacity="0.55" />
      <circle cx="125" cy="62"  r="2.5" fill="rgb(52,211,153)" opacity="0.65" />
      <circle cx="160" cy="33"  r="3"   fill="rgb(52,211,153)" opacity="0.8"  />
      {/* Vertical drops from milestones to baseline — dashed */}
      <line x1="55"  y1="100" x2="55"  y2="105" stroke="rgb(52,211,153)" strokeWidth="0.5" opacity="0.3" />
      <line x1="90"  y1="86"  x2="90"  y2="105" stroke="rgb(52,211,153)" strokeWidth="0.5" opacity="0.3" strokeDasharray="2 2" />
      <line x1="125" y1="62"  x2="125" y2="105" stroke="rgb(52,211,153)" strokeWidth="0.5" opacity="0.3" strokeDasharray="2 2" />
      <line x1="160" y1="33"  x2="160" y2="105" stroke="rgb(52,211,153)" strokeWidth="0.5" opacity="0.3" strokeDasharray="2 2" />
      {/* Year labels on baseline */}
      <line x1="55"  y1="105" x2="55"  y2="109" stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.3" />
      <line x1="90"  y1="105" x2="90"  y2="109" stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.3" />
      <line x1="125" y1="105" x2="125" y2="109" stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.3" />
      <line x1="160" y1="105" x2="160" y2="109" stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.3" />
      {/* Arrow tip on curve end */}
      <polyline points="179,14 185,18 179,22" stroke="rgb(52,211,153)" strokeWidth="1.0" opacity="0.7" />
    </svg>
  ),
};

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

const TECH = [
  { name: "Shopify",    icon: SiShopify },
  { name: "React",      icon: SiReact },
  { name: "TypeScript", icon: SiTypescript },
  { name: "Tailwind",   icon: SiTailwindcss },
  { name: "Figma",      icon: SiFigma },
  { name: "Photoshop",  icon: IconPhotoshop },
  { name: "Swift",      icon: SiSwift },
  { name: "Whop",       icon: IconWhop },
  { name: "Meta",       icon: SiMeta },
];

function TechMarquee() {
  const items = [...TECH, ...TECH];
  return (
    <div className="overflow-hidden py-5" aria-hidden="true">
      <div className="marquee-track">
        {items.map((tech, i) => (
          <div key={i} className="flex items-center gap-1.5 px-8 text-[rgb(var(--muted))] opacity-30 hover:opacity-70 transition-opacity duration-300">
            <tech.icon className="w-5 h-5 shrink-0" />
            <span className="text-[13px] tracking-tight font-medium whitespace-nowrap">{tech.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VisualLayout({ posts, work }: { posts: PostMeta[]; work: WorkMeta[] }) {
  return (
    <main className="page-container mx-auto w-full max-w-5xl pb-16 sm:pb-20 min-h-screen flex flex-col">

      {/* Soundwave hero — touches both grid lines */}
      <SoundwaveHero />

      <GridRule />

      {/* Tech marquee */}
      <TechMarquee />

      <GridRule />

      {/* Shipping + Perspectives */}
      <div className="flex flex-col md:flex-row gap-y-0 overflow-visible">

        <div className="w-full rise flex flex-col" style={{ ["--rise-delay" as any]: "120ms" }}>

          {/* ── What we're shipping ── */}
          <div className="flex items-center justify-center gap-3 py-6">
            <span className="text-[19px] tracking-tight text-[rgb(var(--muted))]">What we're actively</span>
            <TooltipPill tip="Products and themes we're currently developing under the Inertia name.">
              <div className="flex items-center gap-1.5 border border-[rgb(var(--line))] rounded-full px-3.5 py-2 cursor-default">
                <SiShopify className="w-4 h-4 text-[rgb(var(--fg))]" />
                <span className="text-[17px] font-medium tracking-tight text-[rgb(var(--fg))]">building</span>
              </div>
            </TooltipPill>
            <span className="text-[19px] tracking-tight text-[rgb(var(--muted))]">right now</span>
          </div>

          <GridRule />

          {/* Items — 2×2 on mobile, row on sm+ */}
          <div className="grid grid-cols-2 sm:flex">
            {BUILDING.map((item, i) => {
              const external = item.href.startsWith("http");
              const Cmp: any = external ? "a" : Link;
              const extra = external ? { target: "_blank", rel: "noreferrer" } : {};
              const isActive = item.tag === "Active" || item.tag === "Building";
              // 2×2 grid on mobile: col0 has right border, row0 has bottom border; 3rd item spans 2 cols
              const borderClass = [
                i === 0 ? "border-r border-[rgb(var(--line))]" : "",
                i === 1 ? "sm:border-r sm:border-[rgb(var(--line))]" : "",
                i < 2   ? "border-b border-[rgb(var(--line))] sm:border-b-0" : "",
                i === 2 ? "col-span-2 sm:col-span-1" : "",
              ].filter(Boolean).join(" ");
              return (
                <Cmp key={item.name} href={item.href} {...extra} className={`group flex-1 flex flex-col justify-between gap-6 px-5 sm:px-8 pt-8 pb-6 transition-colors hover:bg-[rgb(var(--line))/0.15] min-h-[200px] sm:min-h-[220px] ${borderClass}`}>
                  <div className="flex-1 flex flex-col gap-5">
                    <div className="w-full">
                      {item.sketch}
                    </div>
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
                </Cmp>
              );
            })}
          </div>

          <GridRule />

          {/* ── Perspectives ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-3 py-6 px-8 sm:px-0 sm:relative">
            <div className="flex items-center justify-center gap-3">
              <span className="text-[19px] tracking-tight text-[rgb(var(--muted))]">How we</span>
              <TooltipPill tip="Short posts on design, development, and the decisions behind what we build.">
                <div className="flex items-center gap-1.5 border border-[rgb(var(--line))] rounded-full px-3.5 py-2 cursor-default">
                  <SiSubstack className="w-4 h-4 text-[rgb(var(--fg))]" />
                  <span className="text-[17px] font-medium tracking-tight text-[rgb(var(--fg))]">think</span>
                </div>
              </TooltipPill>
              <span className="text-[19px] tracking-tight text-[rgb(var(--muted))]">about the craft</span>
            </div>
            <Link href="/blog" className="sm:absolute sm:right-8 text-[11px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors text-center sm:text-left">all posts →</Link>
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
                    "group flex flex-col justify-between gap-6 px-5 sm:px-8 pt-8 pb-6 transition-colors hover:bg-[rgb(var(--line))/0.15] min-h-[200px] sm:min-h-[220px]",
                    // right border on left-column cells
                    i % 2 === 0 ? "border-r border-[rgb(var(--line))]" : "",
                    // bottom border on top-row cells
                    i < 2 ? "border-b border-[rgb(var(--line))]" : "",
                  ].filter(Boolean).join(" ")}
                >
                  <div className="flex-1 flex flex-col gap-5">
                    <div className="w-full">
                      {THINK_SLUG_SKETCHES[post.slug] ?? THINK_SKETCHES[i % THINK_SKETCHES.length]}
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
      <section className="rise flex flex-col" style={{ ["--rise-delay" as any]: "60ms" }}>

        {/* Label cell */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-3 py-6 px-8 sm:px-0 sm:relative">
          <div className="flex items-center justify-center gap-3">
            <span className="text-[19px] tracking-tight text-[rgb(var(--muted))]">Things we've</span>
            <TooltipPill tip="Selected client work spanning Shopify builds, brand identities, and custom web projects.">
              <div className="flex items-center gap-1.5 border border-[rgb(var(--line))] rounded-full px-3.5 py-2 cursor-default">
                <SiDribbble className="w-4 h-4 text-[rgb(var(--fg))]" />
                <span className="text-[17px] font-medium tracking-tight text-[rgb(var(--fg))]">shipped</span>
              </div>
            </TooltipPill>
            <span className="text-[19px] tracking-tight text-[rgb(var(--muted))]">for real clients</span>
          </div>
          <Link href="/work" className="sm:absolute sm:right-8 text-[11px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors text-center sm:text-left">all work →</Link>
        </div>

        <GridRule />

        <PastWork work={work} />

      </section>

      <GridRule />

    </main>
  );
}
