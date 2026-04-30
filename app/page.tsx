"use client";

import React from "react";
import Link from "next/link";
import { SiNextdotjs, SiShopify, SiReact, SiTypescript, SiTailwindcss, SiFigma, SiSubstack, SiDribbble } from "react-icons/si";
import { useEffect, useState } from "react";
import { PastWork } from "./past-work";
import { WelcomeBack } from "./ambient";
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
    <svg viewBox="0 0 200 120" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full text-[rgb(var(--muted))] opacity-[0.18]" aria-hidden="true">
      {/* Ground plane — perspective grid */}
      <line x1="100" y1="60" x2="10"  y2="110" strokeWidth="0.8" />
      <line x1="100" y1="60" x2="190" y2="110" strokeWidth="0.8" />
      <line x1="100" y1="60" x2="10"  y2="85"  strokeWidth="0.6" />
      <line x1="100" y1="60" x2="190" y2="85"  strokeWidth="0.6" />
      <line x1="37"  y1="110" x2="163" y2="110" strokeWidth="0.8" />
      <line x1="22"  y1="96"  x2="178" y2="96"  strokeWidth="0.6" />
      <line x1="55"  y1="73"  x2="145" y2="73"  strokeWidth="0.5" />
      {/* Vertical columns rising */}
      <line x1="37"  y1="110" x2="37"  y2="52"  strokeWidth="0.8" />
      <line x1="163" y1="110" x2="163" y2="52"  strokeWidth="0.8" />
      <line x1="22"  y1="96"  x2="22"  y2="38"  strokeWidth="0.6" />
      <line x1="178" y1="96"  x2="178" y2="38"  strokeWidth="0.6" />
      {/* Top face */}
      <line x1="100" y1="8"   x2="22"  y2="38"  strokeWidth="0.8" />
      <line x1="100" y1="8"   x2="178" y2="38"  strokeWidth="0.8" />
      <line x1="22"  y1="38"  x2="178" y2="38"  strokeWidth="0.8" />
      <line x1="37"  y1="52"  x2="163" y2="52"  strokeWidth="0.8" />
      <line x1="22"  y1="38"  x2="37"  y2="52"  strokeWidth="0.6" />
      <line x1="178" y1="38"  x2="163" y2="52"  strokeWidth="0.6" />
      {/* Motion lines — velocity streaks */}
      <line x1="4"   y1="22"  x2="28"  y2="22"  strokeWidth="0.7" />
      <line x1="4"   y1="28"  x2="22"  y2="28"  strokeWidth="0.5" />
      <line x1="4"   y1="34"  x2="18"  y2="34"  strokeWidth="0.4" />
      <line x1="172" y1="22"  x2="196" y2="22"  strokeWidth="0.7" />
      <line x1="178" y1="28"  x2="196" y2="28"  strokeWidth="0.5" />
      <line x1="182" y1="34"  x2="196" y2="34"  strokeWidth="0.4" />
      {/* Vanishing point cross */}
      <line x1="96"  y1="8"   x2="104" y2="8"   strokeWidth="0.5" />
      <line x1="100" y1="4"   x2="100" y2="12"  strokeWidth="0.5" />
      {/* Dimension tick marks */}
      <line x1="10"  y1="110" x2="10"  y2="115" strokeWidth="0.5" />
      <line x1="190" y1="110" x2="190" y2="115" strokeWidth="0.5" />
      <line x1="10"  y1="112" x2="190" y2="112" strokeWidth="0.4" />
    </svg>
  );
}

function SketchAether() {
  return (
    <svg viewBox="0 0 200 120" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full text-[rgb(var(--muted))] opacity-[0.18]" aria-hidden="true">
      {/* Browser chrome */}
      <rect x="8" y="8" width="184" height="104" rx="3" strokeWidth="0.9" />
      {/* Nav bar */}
      <line x1="8" y1="22" x2="192" y2="22" strokeWidth="0.7" />
      {/* Logo placeholder */}
      <rect x="16" y="13" width="18" height="6" rx="1" strokeWidth="0.6" />
      {/* Nav links */}
      <line x1="46"  y1="16" x2="62"  y2="16" strokeWidth="0.6" />
      <line x1="68"  y1="16" x2="84"  y2="16" strokeWidth="0.6" />
      <line x1="90"  y1="16" x2="106" y2="16" strokeWidth="0.6" />
      {/* CTA button top-right */}
      <rect x="162" y="13" width="22" height="6" rx="2" strokeWidth="0.6" />
      {/* Hero block */}
      <rect x="16" y="28" width="168" height="38" rx="2" strokeWidth="0.7" />
      {/* Hero title lines */}
      <line x1="30" y1="38" x2="120" y2="38" strokeWidth="1.2" />
      <line x1="30" y1="44" x2="100" y2="44" strokeWidth="1.2" />
      <line x1="30" y1="50" x2="80"  y2="50" strokeWidth="0.8" />
      {/* Hero CTA */}
      <rect x="30" y="55" width="32" height="7" rx="2" strokeWidth="0.7" />
      {/* Product grid — 3 cards */}
      <rect x="16"  y="72" width="50" height="34" rx="2" strokeWidth="0.7" />
      <rect x="75"  y="72" width="50" height="34" rx="2" strokeWidth="0.7" />
      <rect x="134" y="72" width="50" height="34" rx="2" strokeWidth="0.7" />
      {/* Card image area top */}
      <rect x="20"  y="75" width="42" height="20" rx="1" strokeWidth="0.5" />
      <rect x="79"  y="75" width="42" height="20" rx="1" strokeWidth="0.5" />
      <rect x="138" y="75" width="42" height="20" rx="1" strokeWidth="0.5" />
      {/* Card title lines */}
      <line x1="20"  y1="99"  x2="52"  y2="99"  strokeWidth="0.6" />
      <line x1="79"  y1="99"  x2="111" y2="99"  strokeWidth="0.6" />
      <line x1="138" y1="99"  x2="170" y2="99"  strokeWidth="0.6" />
      <line x1="20"  y1="103" x2="40"  y2="103" strokeWidth="0.5" />
      <line x1="79"  y1="103" x2="99"  y2="103" strokeWidth="0.5" />
      <line x1="138" y1="103" x2="158" y2="103" strokeWidth="0.5" />
      {/* Dimension marks */}
      <line x1="8"  y1="118" x2="192" y2="118" strokeWidth="0.4" />
      <line x1="8"  y1="116" x2="8"   y2="120" strokeWidth="0.5" />
      <line x1="192" y1="116" x2="192" y2="120" strokeWidth="0.5" />
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
  <svg key="compass" viewBox="0 0 200 120" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full text-[rgb(var(--muted))] opacity-[0.18]" aria-hidden="true">
    {/* Compass pivot point */}
    <circle cx="100" cy="28" r="3" strokeWidth="0.8" />
    {/* Left leg */}
    <line x1="100" y1="28" x2="62" y2="100" strokeWidth="0.9" />
    {/* Right leg */}
    <line x1="100" y1="28" x2="138" y2="100" strokeWidth="0.9" />
    {/* Needle tip left */}
    <line x1="62" y1="100" x2="60" y2="107" strokeWidth="0.8" />
    <line x1="60" y1="107" x2="64" y2="107" strokeWidth="0.6" />
    {/* Pencil tip right */}
    <line x1="138" y1="100" x2="136" y2="107" strokeWidth="0.8" />
    <line x1="136" y1="107" x2="140" y2="104" strokeWidth="0.6" />
    {/* Arc being drawn */}
    <path d="M 52 95 A 58 58 0 0 1 148 95" strokeWidth="0.7" strokeDasharray="3 2" />
    {/* Hinge crossbar */}
    <line x1="88" y1="52" x2="112" y2="52" strokeWidth="0.7" />
    <circle cx="94" cy="52" r="1.5" strokeWidth="0.6" />
    <circle cx="106" cy="52" r="1.5" strokeWidth="0.6" />
    {/* Adjustment screw */}
    <line x1="100" y1="28" x2="100" y2="18" strokeWidth="0.8" />
    <line x1="96" y1="18" x2="104" y2="18" strokeWidth="0.7" />
    <line x1="97" y1="15" x2="103" y2="15" strokeWidth="0.6" />
    <line x1="98" y1="12" x2="102" y2="12" strokeWidth="0.5" />
    {/* Construction lines */}
    <line x1="100" y1="95" x2="100" y2="110" strokeWidth="0.4" strokeDasharray="2 2" />
    <line x1="60" y1="95" x2="140" y2="95" strokeWidth="0.4" strokeDasharray="2 2" />
    {/* Radius dimension */}
    <line x1="100" y1="97" x2="138" y2="97" strokeWidth="0.4" />
    <line x1="100" y1="95" x2="100" y2="99" strokeWidth="0.5" />
    <line x1="138" y1="95" x2="138" y2="99" strokeWidth="0.5" />
  </svg>,

  // Type specimen grid — hierarchy, rhythm
  <svg key="type" viewBox="0 0 200 120" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full text-[rgb(var(--muted))] opacity-[0.18]" aria-hidden="true">
    {/* Baseline grid */}
    <line x1="12" y1="32"  x2="188" y2="32"  strokeWidth="0.4" strokeDasharray="2 3" />
    <line x1="12" y1="48"  x2="188" y2="48"  strokeWidth="0.4" strokeDasharray="2 3" />
    <line x1="12" y1="64"  x2="188" y2="64"  strokeWidth="0.4" strokeDasharray="2 3" />
    <line x1="12" y1="80"  x2="188" y2="80"  strokeWidth="0.4" strokeDasharray="2 3" />
    <line x1="12" y1="96"  x2="188" y2="96"  strokeWidth="0.4" strokeDasharray="2 3" />
    <line x1="12" y1="112" x2="188" y2="112" strokeWidth="0.4" strokeDasharray="2 3" />
    {/* Display headline — tall thick strokes */}
    <line x1="12" y1="12" x2="12"  y2="32" strokeWidth="3.5" />
    <line x1="22" y1="12" x2="22"  y2="32" strokeWidth="3.5" />
    <line x1="12" y1="21" x2="22"  y2="21" strokeWidth="2.5" />
    <line x1="32" y1="12" x2="32"  y2="32" strokeWidth="3.5" />
    <line x1="32" y1="12" x2="44"  y2="32" strokeWidth="3.5" />
    <line x1="54" y1="12" x2="54"  y2="32" strokeWidth="3.5" />
    <line x1="54" y1="12" x2="66"  y2="12" strokeWidth="3.5" />
    <line x1="54" y1="22" x2="63"  y2="22" strokeWidth="2.5" />
    <line x1="54" y1="32" x2="66"  y2="32" strokeWidth="3.5" />
    {/* Subhead — medium */}
    <line x1="12" y1="44" x2="90"  y2="44" strokeWidth="1.8" />
    <line x1="12" y1="52" x2="75"  y2="52" strokeWidth="1.8" />
    {/* Body copy — thin lines */}
    <line x1="12" y1="60" x2="186" y2="60" strokeWidth="0.9" />
    <line x1="12" y1="68" x2="186" y2="68" strokeWidth="0.9" />
    <line x1="12" y1="76" x2="160" y2="76" strokeWidth="0.9" />
    <line x1="12" y1="84" x2="186" y2="84" strokeWidth="0.9" />
    <line x1="12" y1="92" x2="140" y2="92" strokeWidth="0.9" />
    {/* Cap-height marker */}
    <line x1="6" y1="12" x2="10"  y2="12" strokeWidth="0.6" />
    <line x1="6" y1="32" x2="10"  y2="32" strokeWidth="0.6" />
    <line x1="8" y1="12" x2="8"   y2="32" strokeWidth="0.5" />
    {/* x-height marker */}
    <line x1="192" y1="44" x2="196" y2="44" strokeWidth="0.6" />
    <line x1="192" y1="52" x2="196" y2="52" strokeWidth="0.6" />
    <line x1="194" y1="44" x2="194" y2="52" strokeWidth="0.5" />
  </svg>,

  // Light bulb cross-section — ideas, clarity
  <svg key="bulb" viewBox="0 0 200 120" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full text-[rgb(var(--muted))] opacity-[0.18]" aria-hidden="true">
    {/* Bulb outer profile */}
    <path d="M 100 10 C 130 10 148 30 148 55 C 148 75 136 88 128 95 L 72 95 C 64 88 52 75 52 55 C 52 30 70 10 100 10 Z" strokeWidth="0.9" />
    {/* Filament support wires */}
    <line x1="84" y1="95" x2="84" y2="72" strokeWidth="0.7" />
    <line x1="116" y1="95" x2="116" y2="72" strokeWidth="0.7" />
    {/* Filament coil */}
    <path d="M 84 72 Q 88 62 92 68 Q 96 74 100 64 Q 104 54 108 64 Q 112 74 116 68 Q 116 66 116 64" strokeWidth="0.8" />
    {/* Glass neck / base */}
    <line x1="72" y1="95" x2="72"  y2="108" strokeWidth="0.9" />
    <line x1="128" y1="95" x2="128" y2="108" strokeWidth="0.9" />
    <line x1="72" y1="100" x2="128" y2="100" strokeWidth="0.7" />
    <line x1="72" y1="104" x2="128" y2="104" strokeWidth="0.7" />
    <line x1="72" y1="108" x2="128" y2="108" strokeWidth="0.9" />
    {/* Base screw threads */}
    <path d="M 72 108 Q 80 112 88 108 Q 96 104 104 108 Q 112 112 120 108 Q 126 105 128 108" strokeWidth="0.6" />
    <path d="M 74 114 Q 82 118 90 114 Q 98 110 106 114 Q 114 118 122 114 Q 126 112 128 114" strokeWidth="0.5" />
    {/* Radiation lines — light emanating */}
    <line x1="100" y1="8"  x2="100" y2="2"  strokeWidth="0.5" />
    <line x1="118" y1="13" x2="122" y2="9"  strokeWidth="0.5" />
    <line x1="130" y1="26" x2="135" y2="23" strokeWidth="0.5" />
    <line x1="82"  y1="13" x2="78"  y2="9"  strokeWidth="0.5" />
    <line x1="70"  y1="26" x2="65"  y2="23" strokeWidth="0.5" />
    {/* Cross-section center line */}
    <line x1="100" y1="10" x2="100" y2="95" strokeWidth="0.35" strokeDasharray="3 2" />
    {/* Dimension: bulb width */}
    <line x1="52"  y1="115" x2="148" y2="115" strokeWidth="0.4" />
    <line x1="52"  y1="113" x2="52"  y2="117" strokeWidth="0.5" />
    <line x1="148" y1="113" x2="148" y2="117" strokeWidth="0.5" />
  </svg>,
];

const TECH = [
  { name: "Next.js",    icon: SiNextdotjs },
  { name: "Shopify",    icon: SiShopify },
  { name: "React",      icon: SiReact },
  { name: "TypeScript", icon: SiTypescript },
  { name: "Tailwind",   icon: SiTailwindcss },
  { name: "Figma",      icon: SiFigma },
];

function TechMarquee() {
  const items = [...TECH, ...TECH];
  return (
    <div className="overflow-hidden py-5" aria-hidden="true">
      <div className="marquee-track">
        {items.map((tech, i) => (
          <div key={i} className="flex items-center gap-2.5 px-10 text-[rgb(var(--muted))] opacity-30 hover:opacity-70 transition-opacity duration-300">
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
            <div className="flex items-center gap-2 border border-[rgb(var(--line))] rounded-full px-4 py-2">
              <SiShopify className="w-4 h-4 text-[rgb(var(--fg))]" />
              <span className="text-[17px] font-medium tracking-tight text-[rgb(var(--fg))]">building</span>
            </div>
            <span className="text-[19px] tracking-tight text-[rgb(var(--muted))]">right now</span>
          </div>

          <GridRule />

          {/* Items side by side */}
          <div className="flex">
            {BUILDING.map((item, i) => {
              const external = item.href.startsWith("http");
              const Cmp: any = external ? "a" : Link;
              const extra = external ? { target: "_blank", rel: "noreferrer" } : {};
              const isActive = item.tag === "Active";
              return (
                <React.Fragment key={item.name}>
                  {i > 0 && <div className="w-px bg-[rgb(var(--line))] shrink-0" />}
                  <Cmp href={item.href} {...extra} className="group flex-1 flex flex-col justify-between gap-6 px-8 pt-8 pb-6 transition-colors hover:bg-[rgb(var(--line))/0.15] min-h-[220px]">
                    <div className="flex-1 flex flex-col gap-5">
                      {/* Blueprint sketch */}
                      <div className="w-full">
                        {item.sketch}
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[17px] font-medium tracking-tight text-[rgb(var(--fg))] leading-none">{item.name}</span>
                        <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] leading-snug">{item.description}</span>
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
                </React.Fragment>
              );
            })}
          </div>

          <GridRule />

          {/* ── Perspectives ── */}
          <div className="relative flex items-center justify-center gap-3 py-6">
            <span className="text-[19px] tracking-tight text-[rgb(var(--muted))]">How we</span>
            <div className="flex items-center gap-2 border border-[rgb(var(--line))] rounded-full px-4 py-2">
              <SiSubstack className="w-4 h-4 text-[rgb(var(--fg))]" />
              <span className="text-[17px] font-medium tracking-tight text-[rgb(var(--fg))]">think</span>
            </div>
            <span className="text-[19px] tracking-tight text-[rgb(var(--muted))]">about the craft</span>
            <Link href="/blog" className="absolute right-8 text-[11px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">all posts →</Link>
          </div>

          <GridRule />

          {posts.length === 0 ? (
            <p className="px-8 py-6 text-[13px] tracking-tight text-[rgb(var(--muted))]">Nothing yet.</p>
          ) : (
            <div className="flex">
              {posts.slice(0, 3).map((post, i) => (
                <React.Fragment key={post.slug}>
                  {i > 0 && <div className="w-px bg-[rgb(var(--line))] shrink-0" />}
                  <Link href={`/blog/${post.slug}`} className="group flex-1 flex flex-col justify-between gap-6 px-8 pt-8 pb-6 transition-colors hover:bg-[rgb(var(--line))/0.15] min-h-[220px]">
                    <div className="flex-1 flex flex-col gap-5">
                      <div className="w-full">
                        {THINK_SKETCHES[i % THINK_SKETCHES.length]}
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))] leading-snug">{post.title}</span>
                        <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] tabular-nums">{formatDate(post.date)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      {i === 0
                        ? <span className="inline-flex items-center justify-center rounded-full bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-2.5 pt-[3px] pb-[4px] text-[10.5px] font-medium tracking-tight leading-none">new</span>
                        : <span />
                      }
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 text-[rgb(var(--muted))] opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0 duration-200" aria-hidden="true">
                        <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </Link>
                </React.Fragment>
              ))}
            </div>
          )}

          <GridRule />

        </div>

      </div>

      {/* Past work */}
      <section className="rise flex flex-col" style={{ ["--rise-delay" as any]: "60ms" }}>

        {/* Label cell */}
        <div className="relative flex items-center justify-center gap-3 py-6">
          <span className="text-[19px] tracking-tight text-[rgb(var(--muted))]">Things we've</span>
          <div className="flex items-center gap-2 border border-[rgb(var(--line))] rounded-full px-4 py-2">
            <SiDribbble className="w-4 h-4 text-[rgb(var(--fg))]" />
            <span className="text-[17px] font-medium tracking-tight text-[rgb(var(--fg))]">shipped</span>
          </div>
          <span className="text-[19px] tracking-tight text-[rgb(var(--muted))]">for real clients</span>
          <Link href="/work" className="absolute right-8 text-[11px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">all work →</Link>
        </div>

        <GridRule />

        <PastWork work={work} />

      </section>

      <GridRule />

      <footer className="px-8 py-8 flex items-center justify-between gap-6 text-sm tracking-tight text-[rgb(var(--muted))] rise" style={{ ["--rise-delay" as any]: "260ms" }}>
        <WelcomeBack />
        <a href="https://www.instagram.com/inertia.dev/" target="_blank" rel="noreferrer" aria-label="Instagram — @inertia.dev" className="inline-flex items-center gap-[3px] hover:text-[rgb(var(--fg))] transition-colors ml-auto">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-[14px] w-[14px]" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
          </svg>
          inertia.dev
        </a>
      </footer>

    </main>
  );
}
