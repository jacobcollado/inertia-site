"use client";

import React, { useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { SiShopify, SiTypescript, SiTailwindcss, SiSwift, SiMeta, SiSubstack, SiDribbble, SiFramer, SiVercel, SiApple } from "react-icons/si";
import { LuHandshake } from "react-icons/lu";
import { HiOutlineCube, HiOutlineCommandLine, HiOutlineClock, HiOutlineWrenchScrewdriver, HiOutlineDevicePhoneMobile, HiOutlineShoppingBag, HiOutlineCheckCircle, HiOutlineArrowPath } from "react-icons/hi2";
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

function MockupDashboard() {
  return (
    <div className="w-full overflow-hidden border border-b-0 border-[rgb(var(--line))]" style={{ fontFamily: "inherit", background: "rgb(var(--bg))", borderRadius: "8px 8px 0 0" }}>
      {/* Top bar */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[rgb(var(--line))]">
        <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--muted))] opacity-20" />
        <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--muted))] opacity-20" />
        <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--muted))] opacity-20" />
        <div className="ml-2 w-20 h-1.5 rounded-full bg-[rgb(var(--muted))] opacity-10" />
      </div>
      {/* Body */}
      <div className="flex" style={{ minHeight: "160px" }}>
        {/* Sidebar */}
        <div className="flex flex-col gap-1.5 border-r border-[rgb(var(--line))] py-3 px-2" style={{ width: "48px" }}>
          {[true, false, false, false, false].map((active, i) => (
            <div key={i} className="h-1.5 rounded-full" style={{ background: active ? "rgb(var(--blue))" : "rgb(var(--muted))", opacity: active ? 0.55 : 0.12 }} />
          ))}
        </div>
        {/* Content */}
        <div className="flex-1 p-3 flex flex-col gap-3">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="w-16 h-2 rounded-full bg-[rgb(var(--muted))] opacity-15" />
            <div className="w-8 h-2 rounded-full bg-[rgb(var(--blue))] opacity-30" />
          </div>
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-1.5">
            {[0,1,2].map(i => (
              <div key={i} className="flex flex-col gap-1 p-2 border border-[rgb(var(--line))]" style={{ borderColor: i === 0 ? "rgb(var(--blue)/0.25)" : undefined, background: i === 0 ? "rgb(var(--blue)/0.04)" : undefined }}>
                <div className="w-full h-1 rounded-full bg-[rgb(var(--muted))] opacity-15" />
                <div className="w-1/2 h-2 rounded-full" style={{ background: i === 0 ? "rgb(var(--blue))" : "rgb(var(--muted))", opacity: i === 0 ? 0.5 : 0.2 }} />
              </div>
            ))}
          </div>
          {/* Progress bar */}
          <div className="flex flex-col gap-1.5 border border-[rgb(var(--line))] p-2">
            <div className="flex items-center justify-between">
              <div className="w-20 h-1.5 rounded-full bg-[rgb(var(--muted))] opacity-15" />
              <div className="w-6 h-1.5 rounded-full bg-[rgb(var(--blue))] opacity-35" />
            </div>
            <div className="w-full rounded-full overflow-hidden" style={{ height: "3px", background: "rgb(var(--line))" }}>
              <div className="h-full rounded-full" style={{ width: "62%", background: "rgb(var(--blue))", opacity: 0.5 }} />
            </div>
          </div>
          {/* Activity rows */}
          <div className="flex flex-col gap-1.5">
            {[0.9, 0.65, 0.4].map((op, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--muted))] shrink-0" style={{ opacity: op * 0.3 }} />
                <div className="h-1 rounded-full bg-[rgb(var(--muted))]" style={{ width: `${55 - i * 12}%`, opacity: op * 0.18 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MockupAether() {
  return (
    <div className="w-full overflow-hidden border border-b-0 border-[rgb(var(--line))]" style={{ fontFamily: "inherit", background: "rgb(var(--bg))", borderRadius: "8px 8px 0 0" }}>
      {/* Nav */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[rgb(var(--line))]">
        <div className="w-8 h-1.5 rounded-full bg-[rgb(var(--muted))] opacity-25" />
        <div className="flex gap-2">
          {[0,1,2].map(i => <div key={i} className="w-5 h-1 rounded-full bg-[rgb(var(--muted))] opacity-15" />)}
        </div>
        <div className="w-6 h-1.5 rounded-full bg-[rgb(var(--muted))] opacity-15" />
      </div>
      {/* Hero */}
      <div className="px-3 py-4 flex flex-col gap-2" style={{ minHeight: "90px" }}>
        <div className="w-14 h-1 rounded-full bg-[rgb(var(--muted))] opacity-15" />
        <div className="w-28 h-3 rounded-full bg-[rgb(var(--muted))] opacity-25" />
        <div className="w-20 h-2 rounded-full bg-[rgb(var(--muted))] opacity-15" />
        <div className="w-12 h-5 rounded-full border border-[rgb(var(--line))] mt-1" />
      </div>
      {/* Product row */}
      <div className="grid grid-cols-3 border-t border-[rgb(var(--line))]">
        {[0,1,2].map(i => (
          <div key={i} className="flex flex-col gap-1.5 p-2" style={{ borderRight: i < 2 ? "1px solid rgb(var(--line))" : "none" }}>
            <div className="rounded-sm bg-[rgb(var(--muted))] opacity-8" style={{ height: "30px" }} />
            <div className="w-8 h-1 rounded-full bg-[rgb(var(--muted))] opacity-15" />
            <div className="w-5 h-1 rounded-full bg-[rgb(var(--muted))] opacity-10" />
          </div>
        ))}
      </div>
    </div>
  );
}

const BUILDING = [
  {
    name: "Inertia",
    description: "We become the technical partner your vision deserves.",
    tag: "Active",
    href: "https://www.instagram.com/by.inertia/",
    sketch: <SketchInertia />,
  },
  {
    name: "Aether Theme",
    description: "A high-end Shopify theme built for conversion and presence.",
    tag: "In Progress",
    href: "/aether",
    sketch: <MockupAether />,
  },
  {
    name: "Inertia Dashboard",
    description: "Project status, files, invoices, and support in one place.",
    tag: "Building",
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

  const chars = [...current.icon ? [] : [], ...current.text.split("")];

  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 px-6 sm:px-10 py-8 sm:py-10 text-center">

      {/* Label */}
      <p
        key={`label-${animKey}`}
        className="text-[clamp(0.85rem,1.8vw,0.95rem)] tracking-tight text-[rgb(var(--muted))]"
        style={{
          opacity: exiting ? 0 : 1,
          transform: exiting ? "translateY(-6px)" : "translateY(0px)",
          transition: "opacity 300ms ease, transform 300ms ease",
        }}
      >
        {current.label}
      </p>

      {/* Icon + animated phrase */}
      <p
        className="flex items-center justify-center gap-2 whitespace-nowrap text-[clamp(2rem,5vw,2.4rem)] tracking-tight leading-none font-semibold"
        style={{
          color: "rgb(var(--fg))",
          perspective: "600px",
        }}
      >
        {/* Icon */}
        <span
          key={`icon-${animKey}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            flexShrink: 0,
            opacity: exiting ? 0 : 0.75,
            filter: exiting ? "blur(4px)" : "blur(0px)",
            transform: exiting ? "translateY(-10px) rotateX(60deg)" : "translateY(0px) rotateX(0deg)",
            transition: "opacity 300ms ease, filter 300ms ease, transform 300ms ease",
            animation: exiting ? "none" : `char-in 380ms cubic-bezier(0.22,1,0.36,1) both`,
          }}
        >
          {current.icon}
        </span>

        {/* Per-character animated text */}
        <span aria-label={current.text} style={{ display: "inline-flex" }}>
          {current.text.split("").map((ch, i) => (
            <span
              key={`${animKey}-${i}`}
              aria-hidden="true"
              style={{
                display: "inline-block",
                width: ch === " " ? "0.3em" : undefined,
                opacity: exiting ? 0 : 1,
                filter: exiting ? "blur(4px)" : "blur(0px)",
                transform: exiting
                  ? "translateY(-12px) rotateX(70deg)"
                  : "translateY(0px) rotateX(0deg)",
                transition: `opacity 280ms ease ${i * 14}ms, filter 280ms ease ${i * 14}ms, transform 280ms ease ${i * 14}ms`,
                animation: exiting ? "none" : `char-in 420ms cubic-bezier(0.22,1,0.36,1) ${i * 30}ms both`,
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
          transform: exiting ? "translateY(-6px)" : "translateY(0px)",
          transition: "opacity 300ms ease, transform 300ms ease",
          animation: exiting ? "none" : "rise-in 450ms 120ms cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        {isExternal ? (
          <a href={current.cta.href} target="_blank" rel="noreferrer" className={ctaClass} >
            {current.cta.label}
            <span aria-hidden="true">↗</span>
          </a>
        ) : (
          <Link href={current.cta.href} className={ctaClass} >
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
            <rect x="22" y="14" width="276" height="162" rx="6" />
          </clipPath>
        </defs>

        {/* Lid bezel */}
        <rect x="12" y="6" width="296" height="174" rx="12" fill="rgb(var(--line))" fillOpacity="0.08" stroke={line} strokeWidth="0.8" opacity="0.6" />
        {/* Screen bezel inset */}
        <rect x="22" y="14" width="276" height="162" rx="6" fill="rgb(var(--bg))" stroke={line} strokeWidth="0.6" opacity="0.5" />
        {/* Camera */}
        <circle cx="160" cy="10" r="1.6" fill={muted} opacity="0.2" />

        {/* Title bar */}
        <rect x="22" y="14" width="276" height="20" rx="6" fill="rgb(var(--line))" fillOpacity="0.18" clipPath="url(#screen-clip)" />
        <line x1="22" y1="34" x2="298" y2="34" stroke={line} strokeWidth="0.5" opacity="0.5" />
        {/* Window buttons */}
        <circle cx="38" cy="24" r="3" fill="#ff5f57" opacity="0.7" />
        <circle cx="49" cy="24" r="3" fill="#febc2e" opacity="0.7" />
        <circle cx="60" cy="24" r="3" fill="#28c840" opacity="0.7" />
        {/* URL bar */}
        <rect x="104" y="19" width="112" height="10" rx="3" fill="rgb(var(--line))" fillOpacity="0.25" opacity="0.6" />

        {/* Screen content */}
        <foreignObject x="22" y="34" width="276" height="142" clipPath="url(#screen-clip)">
          <div style={{ width: "100%", height: "100%", fontFamily: "inherit", background: "rgb(var(--bg))", display: "flex", flexDirection: "column", padding: "14px 16px 12px", gap: "10px" }}>
            {/* Skeleton nav row */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ height: "5px", borderRadius: "3px", background: "rgb(var(--fg))", opacity: 0.55, width: "36px" }} />
              <div style={{ flex: 1 }} />
              {[28, 22, 24].map((w, i) => (
                <div key={i} style={{ height: "4px", borderRadius: "2px", background: "rgb(var(--muted))", opacity: 0.18, width: `${w}px` }} />
              ))}
              <div style={{ height: "10px", borderRadius: "5px", background: "rgb(var(--fg))", opacity: 0.5, width: "32px" }} />
            </div>
            {/* Divider */}
            <div style={{ height: "1px", background: "rgb(var(--line))", opacity: 0.6 }} />
            {/* About text */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "6px" }}>
              <p style={{ fontSize: "10.5px", lineHeight: 1.7, letterSpacing: "-0.01em", color: "rgb(var(--fg))", margin: 0, opacity: 0.85 }}>
                <span style={{ fontWeight: 600 }}>We build whatever your vision demands.</span>{" "}
                Storefronts, apps, brands, tools.
              </p>
              {/* CTAs */}
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


function PulseGrid() {
  const COLS = 11;
  const ROWS = 9;
  const W = 480;
  const H = 360;
  const HORIZON = 0.52;

  const dots: { cx: number; cy: number; r: number; opacity: number; delay: number }[] = [];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const t = row / (ROWS - 1);
      const px = W / 2 + (col - (COLS - 1) / 2) * (18 + t * 38);
      const py = HORIZON * H + t * H * (1 - HORIZON);
      const r = 0.9 + t * 2.4;
      const edgeFade = 1 - Math.abs(col - (COLS - 1) / 2) / ((COLS - 1) / 2) * 0.55;
      const opacity = (0.06 + t * 0.3) * edgeFade;
      const distFromCenter = Math.sqrt(
        Math.pow((col - (COLS - 1) / 2) / ((COLS - 1) / 2), 2) +
        Math.pow(1 - t, 2)
      );
      dots.push({ cx: px, cy: py, r, opacity, delay: distFromCenter * 800 });
    }
  }

  return (
    <div className="relative w-full select-none overflow-hidden" style={{ height: 380 }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0, animation: "hero-line 800ms cubic-bezier(0.16,1,0.3,1) 100ms forwards" }}
      >
        <defs>
          <style>{`
            @keyframes dot-pulse {
              0%, 100% { opacity: var(--base-op); }
              50% { opacity: calc(var(--base-op) * 4); }
            }
          `}</style>
        </defs>
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            fill="rgb(var(--fg))"
            style={{
              "--base-op": d.opacity,
              opacity: d.opacity,
              animation: `dot-pulse 3000ms ease-in-out ${d.delay}ms infinite`,
            } as React.CSSProperties}
          />
        ))}
      </svg>

      <div className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: "25%", background: "linear-gradient(to bottom, rgb(var(--bg)) 0%, transparent 100%)" }} />
      <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ height: "20%", background: "linear-gradient(to top, rgb(var(--bg)) 0%, transparent 100%)" }} />
      <div className="absolute inset-y-0 left-0 pointer-events-none" style={{ width: "10%", background: "linear-gradient(to right, rgb(var(--bg)) 0%, transparent 100%)" }} />
      <div className="absolute inset-y-0 right-0 pointer-events-none" style={{ width: "10%", background: "linear-gradient(to left, rgb(var(--bg)) 0%, transparent 100%)" }} />

      <div className="absolute inset-x-0 flex flex-col items-center px-5 pointer-events-none" style={{ top: "18%" }}>
        <p
          className="text-center tracking-tight leading-snug font-semibold pulse-grid-text"
          style={{
            fontSize: "clamp(1.6rem, 4vw, 1.75rem)",
            maxWidth: 340,
          }}
        >
          The kind of partner you'll actually want to work with again.
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
  // "A quiet forecast on AI capability" — concentric signal rings dissolving into noise
  "ai-capability-forecast": (
    <svg key="ai-capability-forecast" viewBox="0 0 200 120" fill="none" className="w-full" aria-hidden="true">
      {/* Concentric rings — tight at center, spacing grows to suggest uncertainty */}
      <circle cx="100" cy="60" r="6"  stroke="rgb(var(--blue))" strokeWidth="1.4" opacity="0.9" />
      <circle cx="100" cy="60" r="16" stroke="rgb(var(--blue))" strokeWidth="1.1" opacity="0.7" />
      <circle cx="100" cy="60" r="28" stroke="rgb(var(--blue))" strokeWidth="0.9" opacity="0.5" />
      <circle cx="100" cy="60" r="43" stroke="rgb(var(--blue))" strokeWidth="0.7" strokeDasharray="4 3" opacity="0.35" />
      <circle cx="100" cy="60" r="60" stroke="rgb(var(--blue))" strokeWidth="0.5" strokeDasharray="3 5" opacity="0.2" />
      <circle cx="100" cy="60" r="80" stroke="rgb(var(--blue))" strokeWidth="0.4" strokeDasharray="2 6" opacity="0.1" />
      {/* Center dot */}
      <circle cx="100" cy="60" r="2.5" fill="rgb(var(--blue))" opacity="0.95" />
      {/* Noise scatter — random dots outside rings */}
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

  // "Four years in" — four stacked horizontal bars, each taller, like annual rings or layers of sediment
  "four-years": (
    <svg key="four-years" viewBox="0 0 200 120" fill="none" strokeLinecap="round" className="w-full" aria-hidden="true">
      {/* Year bars — bottom to top, growing width */}
      <rect x="80" y="94" width="40"  height="7" rx="1" fill="rgb(var(--green))" opacity="0.25" />
      <rect x="62" y="82" width="76"  height="7" rx="1" fill="rgb(var(--green))" opacity="0.4" />
      <rect x="40" y="70" width="120" height="7" rx="1" fill="rgb(var(--green))" opacity="0.6" />
      <rect x="16" y="58" width="168" height="7" rx="1" fill="rgb(var(--green))" opacity="0.85" />
      {/* Year labels — right aligned */}
      <line x1="192" y1="97" x2="194" y2="97" stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.35" />
      <line x1="192" y1="85" x2="194" y2="85" stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.35" />
      <line x1="192" y1="73" x2="194" y2="73" stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.35" />
      <line x1="192" y1="61" x2="194" y2="61" stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.35" />
      {/* Vertical spine */}
      <line x1="193" y1="56" x2="193" y2="102" stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.25" />
      {/* Arrow at top */}
      <polyline points="190,26 193,20 196,26" stroke="rgb(var(--green))" strokeWidth="1.2" strokeLinejoin="round" opacity="0.7" />
      <line x1="193" y1="20" x2="193" y2="56" stroke="rgb(var(--green))" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
    </svg>
  ),

  // "Hello, world" — a single terminal cursor blinking on an otherwise empty canvas
  "hello-world": (
    <svg key="hello-world" viewBox="0 0 200 120" fill="none" className="w-full" aria-hidden="true">
      {/* Terminal window outline */}
      <rect x="24" y="18" width="152" height="84" rx="4" stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.22" />
      {/* Title bar */}
      <line x1="24" y1="34" x2="176" y2="34" stroke="rgb(var(--muted))" strokeWidth="0.5" opacity="0.18" />
      <circle cx="37" cy="26" r="3" fill="rgb(var(--muted))" opacity="0.18" />
      <circle cx="48" cy="26" r="3" fill="rgb(var(--muted))" opacity="0.18" />
      <circle cx="59" cy="26" r="3" fill="rgb(var(--muted))" opacity="0.18" />
      {/* Prompt character */}
      <text x="38" y="57" fontFamily="monospace" fontSize="11" fill="rgb(var(--green))" opacity="0.7">$</text>
      {/* Typed text — dashes representing characters */}
      <line x1="50" y1="52" x2="66"  y2="52" stroke="rgb(var(--fg))" strokeWidth="1.4" opacity="0.55" strokeLinecap="round" />
      <line x1="69" y1="52" x2="80"  y2="52" stroke="rgb(var(--fg))" strokeWidth="1.4" opacity="0.55" strokeLinecap="round" />
      <line x1="83" y1="52" x2="100" y2="52" stroke="rgb(var(--fg))" strokeWidth="1.4" opacity="0.55" strokeLinecap="round" />
      {/* Cursor block */}
      <rect x="103" y="44" width="7" height="11" rx="1" fill="rgb(var(--fg))" opacity="0.7" />
      {/* Output line */}
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
                Status updates, files, invoices, and support. Built for clients who want visibility without the back-and-forth.
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
            <span className="text-[22px] sm:text-[22px] tracking-tight text-[rgb(var(--muted))]">What we're actively</span>
            <TooltipPill tip="Products and themes we're currently developing under the Inertia name.">
              <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 cursor-default" style={{ background: "rgb(var(--muted)/0.08)", border: "1px solid rgb(var(--muted)/0.25)" }}>
                <SiShopify className="w-4 h-4" style={{ color: "rgb(var(--fg))" }} />
                <span className="text-[20px] sm:text-[20px] font-medium tracking-tight" style={{ color: "rgb(var(--fg))" }}>building</span>
              </div>
            </TooltipPill>
            <span className="text-[22px] sm:text-[22px] tracking-tight text-[rgb(var(--muted))]">right now</span>
          </div>

          <GridRule />

          {/* Items — 2×2 on mobile, row on sm+ */}
          <div className="relative">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 sm:h-20 z-10" style={{ background: "linear-gradient(to top, rgb(var(--bg)), transparent)" }} />
          <div className="grid grid-cols-2 sm:flex pb-14">
            {BUILDING.map((item, i) => {
              const isDashboard = item.name === "Inertia Dashboard";
              const external = !isDashboard && item.href.startsWith("http");
              const borderClass = [
                i === 0 ? "border-r border-[rgb(var(--line))]" : "",
                i === 1 ? "sm:border-r sm:border-[rgb(var(--line))]" : "",
                i < 2   ? "border-b border-[rgb(var(--line))] sm:border-b-0" : "",
                i === 2 ? "col-span-2 sm:col-span-1" : "",
              ].filter(Boolean).join(" ");
              const isMockup = item.name === "Aether Theme";
              const isInertia = item.name === "Inertia";
              const sharedClass = `group flex-1 flex flex-col px-5 sm:px-8 pt-6 ${isMockup ? "pb-0" : "pb-6"} transition-colors hover:bg-[rgb(var(--line))/0.15] min-h-[280px] sm:min-h-[260px] text-left rise overflow-hidden ${borderClass}`;
              const riseDelay = { ["--rise-delay" as any]: `${i * 70}ms` };
              const inner = (
                <>
                  <div className="flex flex-col gap-1 mb-2">
                    <span className="text-[20px] sm:text-[22px] font-medium tracking-tight text-[rgb(var(--fg))] leading-none">{item.name}</span>
                    <span className="text-[13px] sm:text-[13px] tracking-tight text-[rgb(var(--muted))] leading-snug">{item.description}</span>
                  </div>
                  <span className="inline-flex self-start items-center justify-center w-7 h-7 border border-[rgb(var(--line))] rounded-full mb-5 text-[rgb(var(--muted))] group-hover:text-[rgb(var(--fg))] group-hover:border-[rgb(var(--fg)/0.3)] transition-colors text-[12px]">
                    →
                  </span>
                  <div className={`relative overflow-hidden ${isInertia || isMockup ? "mt-auto h-[110px] sm:h-auto" : "mt-auto"}`}>
                    {isInertia && (
                      <div className="sm:hidden pointer-events-none absolute inset-x-0 bottom-0 h-4 z-10" style={{ background: "linear-gradient(to top, rgb(var(--bg)), transparent)" }} />
                    )}
                    {isMockup && (
                      <div className="sm:hidden pointer-events-none absolute inset-x-0 bottom-0 h-4 z-10" style={{ background: "linear-gradient(to top, rgb(var(--bg)), transparent)" }} />
                    )}
                    {item.sketch}
                  </div>
                  {!isMockup && (
                    <div className="pb-2" />
                  )}
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
          </div>

          <GridRule />

          {/* ── Perspectives ── */}
          <div className="relative flex items-center justify-center py-6 px-8 sm:px-0">
            <div className="flex items-center gap-3">
              <span className="text-[22px] tracking-tight text-[rgb(var(--muted))]">The way we</span>
              <TooltipPill tip="Short posts on design, development, and the decisions behind what we build.">
                <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 cursor-default" style={{ background: "rgb(var(--muted)/0.08)", border: "1px solid rgb(var(--muted)/0.25)" }}>
                  <SiSubstack className="w-4 h-4" style={{ color: "rgb(var(--fg))" }} />
                  <span className="text-[20px] font-medium tracking-tight" style={{ color: "rgb(var(--fg))" }}>think</span>
                </div>
              </TooltipPill>
              <span className="hidden sm:inline text-[22px] tracking-tight text-[rgb(var(--muted))]">about our work</span>
              <Link href="/blog" className="sm:absolute sm:right-8 inline-flex items-center justify-center w-7 h-7 border border-[rgb(var(--line))] rounded-full text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] hover:border-[rgb(var(--fg)/0.3)] transition-colors text-[12px]">→</Link>
            </div>
          </div>

          <GridRule />

          {posts.length === 0 ? (
            <p className="px-8 py-6 text-[13px] tracking-tight text-[rgb(var(--muted))]">Nothing yet.</p>
          ) : (
            <div className="relative flex flex-col pb-16">
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 sm:h-24 z-10" style={{ background: "linear-gradient(to top, rgb(var(--bg)), transparent)" }} />
              {/* Featured post */}
              {(() => {
                const post = posts[0];
                return (
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group grid sm:grid-cols-2 border-b border-[rgb(var(--line))] transition-colors hover:bg-[rgb(var(--line))/0.15] rise"
                    style={{ ["--rise-delay" as any]: "0ms" }}
                  >
                    <div className="px-6 sm:px-10 pt-8 pb-6 sm:border-r border-[rgb(var(--line))] flex items-center">
                      <div className="w-full">
                        {THINK_SLUG_SKETCHES[post.slug]}
                      </div>
                    </div>
                    <div className="px-6 sm:px-10 pt-6 sm:pt-8 pb-6 sm:pb-8 flex flex-col justify-between gap-6">
                      <div className="flex flex-col gap-3">
                        <span className="inline-flex items-center self-start border border-[rgb(var(--line))] text-[rgb(var(--muted))] px-2 py-0.5 text-[11px] tracking-tight leading-none rounded-sm">
                          New post
                        </span>
                        <span className="text-[20px] sm:text-[22px] font-medium tracking-tight text-[rgb(var(--fg))] leading-snug">{post.title}</span>
                        {post.summary && (
                          <span className="text-[13px] sm:text-[14px] tracking-tight text-[rgb(var(--muted))] leading-relaxed">{post.summary}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] tabular-nums opacity-60">{formatDate(post.date)}</span>
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-[rgb(var(--line))] text-[rgb(var(--muted))] text-[12px] opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-1 group-hover:translate-x-0">→</span>
                      </div>
                    </div>
                  </Link>
                );
              })()}

              {/* Remaining posts — 2x2 on mobile, 3 cols on sm+ */}
              {posts.length > 1 && (
                <div className="grid grid-cols-2 sm:grid-cols-3">
                  {posts.slice(1, 4).map((post, i) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className={[
                        "group flex flex-col justify-between gap-4 px-4 sm:px-6 pt-5 pb-5 transition-colors hover:bg-[rgb(var(--line))/0.15] rise",
                        i < 2 ? "sm:border-r sm:border-[rgb(var(--line))]" : "",
                        i === 0 ? "border-r border-[rgb(var(--line))]" : "",
                        i < 2 ? "border-b border-[rgb(var(--line))] sm:border-b-0" : "",
                        i === 2 ? "col-span-2 sm:col-span-1 border-t border-[rgb(var(--line))] sm:border-t-0" : "",
                      ].filter(Boolean).join(" ")}
                      style={{ ["--rise-delay" as any]: `${(i + 1) * 60}ms` }}
                    >
                      <div className="hidden sm:block w-full overflow-hidden">
                        {THINK_SLUG_SKETCHES[post.slug]}
                      </div>
                      <div className="flex flex-col gap-1.5 sm:mt-1">
                        <span className="text-[14px] sm:text-[15px] font-medium tracking-tight text-[rgb(var(--fg))] leading-snug">{post.title}</span>
                        {post.summary && <span className="text-[11px] sm:text-[12px] tracking-tight text-[rgb(var(--muted))] leading-relaxed opacity-70 line-clamp-2">{post.summary}</span>}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] tabular-nums opacity-50">{formatDate(post.date)}</span>
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-[rgb(var(--line))] text-[rgb(var(--muted))] text-[11px] opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-1 group-hover:translate-x-0">→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          <GridRule />

        </div>

      </div>

      {/* Past work */}
      <section className="rise flex flex-col" style={{ ["--rise-delay" as any]: "0ms" }}>

        {/* Label cell */}
        <div className="relative flex items-center justify-center py-6 px-8 sm:px-0">
          <div className="flex items-center gap-3">
            <span className="text-[22px] tracking-tight text-[rgb(var(--muted))]">Things we've</span>
            <TooltipPill tip="Selected client work spanning Shopify builds, brand identities, and custom web projects.">
              <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 cursor-default" style={{ background: "rgb(var(--muted)/0.08)", border: "1px solid rgb(var(--muted)/0.25)" }}>
                <SiDribbble className="w-4 h-4" style={{ color: "rgb(var(--fg))" }} />
                <span className="text-[20px] font-medium tracking-tight" style={{ color: "rgb(var(--fg))" }}>shipped</span>
              </div>
            </TooltipPill>
            <span className="hidden sm:inline text-[22px] tracking-tight text-[rgb(var(--muted))]">for real clients</span>
            <Link href="/work" className="sm:absolute sm:right-8 inline-flex items-center justify-center w-7 h-7 border border-[rgb(var(--line))] rounded-full text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] hover:border-[rgb(var(--fg)/0.3)] transition-colors text-[12px]">→</Link>
          </div>
        </div>

        <GridRule />

        <PastWork work={work} />

      </section>

      <GridRule />

    </main>
    </>
  );
}
