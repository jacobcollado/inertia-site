"use client";

import React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

// â"€â"€â"€ Types â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

type Product = {
  id: string;
  name: string;
  description: string;
  accent: [number, number, number];
  sections: DocSection[];
};

type DocSection = {
  id: string;
  title: string;
  articles: Article[];
};

type Article = {
  id: string;
  title: string;
  body: ArticleBlock[];
};

type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "ol"; items: string[] }
  | { type: "ul"; items: string[] }
  | { type: "note"; accent?: [number, number, number]; label?: string; text: string }
  | { type: "code"; text: string }
  | { type: "sketch"; name: string; accent: [number, number, number]; image?: string; alt?: string; images?: { src: string; alt: string; label: string }[] };

function rgba([r, g, b]: [number, number, number], a = 1) {
  return `rgba(${r},${g},${b},${a})`;
}

const SIDEBAR_HOVER_OVERLAY =
  "pointer-events-none absolute inset-0 rounded-lg bg-[rgb(var(--fg)/0.06)] opacity-0 transition-opacity duration-200 group-hover:opacity-100";

function SidebarNavLink({
  href,
  active,
  accent,
  onClick,
  children,
  className = "text-[13.5px] tracking-tight",
  rounded = "rounded-lg",
}: {
  href: string;
  active: boolean;
  accent: [number, number, number];
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  rounded?: string;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`group relative block px-3 py-1.5 transition-opacity duration-200 hover:opacity-100 ${rounded} ${className}`}
      style={{
        color: "rgb(var(--fg))",
        fontWeight: active ? 600 : 400,
        opacity: active ? 1 : 0.5,
        background: active ? rgba(accent, 0.12) : "transparent",
      }}
    >
      <span aria-hidden className={`${SIDEBAR_HOVER_OVERLAY} ${rounded}`} />
      <span className="relative">{children}</span>
    </a>
  );
}

// For sketch text labels — uses CSS var so it respects light/dark
const sketchText = (opacity = 0.4) => ({ fill: `rgb(var(--fg) / ${opacity})` } as React.SVGProps<SVGTextElement>);

// ─── Sketch primitives ──────────────────────────────────────────────────────
//
// Every sketch is drawn from this one vocabulary so the whole set reads as a
// single hand. Three ink levels, two stroke weights, one radius, one type size.
// Nothing below should hardcode a color, an opacity, or a stroke width.

const INK = {
  frame: 0.14, // panel outlines
  faint: 0.06, // fills, grid, dividers
  muted: 0.2, // inactive content lines
  strong: 0.4, // emphasized content lines
} as const;

const STROKE = { hair: 0.6, line: 0.9 } as const;
const RADIUS = 3;
const LABEL_SIZE = 6.5;

// All sketch ink is foreground-derived so light and dark both work from one
// definition. Accent is the single exception and is used sparingly.
const ink = (o: number) => `rgb(var(--fg) / ${o})`;

/** Panel — the base container every sketch composes from. */
function SkPanel({ x, y, w, h, fill = false }: { x: number; y: number; w: number; h: number; fill?: boolean }) {
  return (
    <rect x={x} y={y} width={w} height={h} rx={RADIUS}
      fill={fill ? ink(INK.faint) : "none"}
      stroke={ink(INK.frame)} strokeWidth={STROKE.hair} />
  );
}

/** Panel with a title bar — used for any browser/admin/editor chrome. */
function SkWindow({ x, y, w, h, accent, action = false }: { x: number; y: number; w: number; h: number; accent: string; action?: boolean }) {
  return (
    <g>
      <SkPanel x={x} y={y} w={w} h={h} />
      <line x1={x} y1={y + 16} x2={x + w} y2={y + 16} stroke={ink(INK.frame)} strokeWidth={STROKE.hair} />
      <SkLine x={x + 8} y={y + 8} w={Math.min(28, w * 0.22)} tone={INK.muted} />
      {action && <rect x={x + w - 32} y={y + 5} width="24" height="7" rx="2" fill={accent} opacity="0.8" />}
    </g>
  );
}

/** Text line — the single stand-in for any copy. */
function SkLine({ x, y, w, tone = INK.muted, accent, weight = STROKE.hair }:
  { x: number; y: number; w: number; tone?: number; accent?: string; weight?: number }) {
  return <line x1={x} y1={y} x2={x + w} y2={y} stroke={accent ?? ink(tone)} strokeWidth={weight} strokeLinecap="round" />;
}

/** Stack of text lines at a fixed rhythm. */
function SkLines({ x, y, widths, tone = INK.muted, gap = 7 }:
  { x: number; y: number; widths: number[]; tone?: number; gap?: number }) {
  return (
    <g>
      {widths.map((w, i) => <SkLine key={i} x={x} y={y + i * gap} w={w} tone={tone} />)}
    </g>
  );
}

/** Media / image placeholder — one consistent treatment everywhere. */
function SkMedia({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={RADIUS} fill={ink(INK.faint)} stroke={ink(INK.frame)} strokeWidth={STROKE.hair} />
      <line x1={x} y1={y + h} x2={x + w} y2={y} stroke={ink(INK.faint)} strokeWidth={STROKE.hair} />
    </g>
  );
}

/** Solid accent button. */
function SkButton({ x, y, w = 30, h = 8, accent }: { x: number; y: number; w?: number; h?: number; accent: string }) {
  return <rect x={x} y={y} width={w} height={h} rx="2.5" fill={accent} opacity="0.85" />;
}

/** Dashed connector with an arrowhead. Horizontal or vertical. */
function SkArrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const head = x1 === x2
    ? `${x2 - 3.5},${y2 + (y2 > y1 ? -4 : 4)} ${x2},${y2} ${x2 + 3.5},${y2 + (y2 > y1 ? -4 : 4)}`
    : `${x2 + (x2 > x1 ? -4 : 4)},${y2 - 3.5} ${x2},${y2} ${x2 + (x2 > x1 ? -4 : 4)},${y2 + 3.5}`;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink(INK.muted)} strokeWidth={STROKE.hair} strokeDasharray="2.5 2.5" />
      <polyline points={head} stroke={ink(INK.strong)} strokeWidth={STROKE.hair} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** Caption under a sketch element. */
function SkLabel({ x, y, children, tone = 0.35 }: { x: number; y: number; children: React.ReactNode; tone?: number }) {
  return (
    <text x={x} y={y} textAnchor="middle" fontSize={LABEL_SIZE} {...sketchText(tone)} fontFamily="inherit">{children}</text>
  );
}

/** Shared frame — fixes the viewBox and stroke defaults for every sketch. */
function SketchFrame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 280 110" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {children}
    </svg>
  );
}

function ArrowUpIcon({ className = "size-[1em]" }: { className?: string }) {
  return (
    <svg viewBox="4 4 8 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`} aria-hidden="true">
      <line x1="8" y1="13" x2="8" y2="5" />
      <line x1="5" y1="8" x2="8" y2="5" />
      <line x1="11" y1="8" x2="8" y2="5" />
    </svg>
  );
}

// â"€â"€â"€ Aether sketches â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function SketchInstall({ accent }: { accent: [number, number, number] }) {
  const a = rgba(accent, 0.85);
  // Theme list, with the uploaded zip arriving into it
  return (
    <SketchFrame>
      <SkWindow x={8} y={12} w={168} h={86} accent={a} />
      {/* Theme rows — second is the new upload */}
      <SkPanel x={20} y={38} w={144} h={22} fill />
      <SkLines x={30} y={47} widths={[52, 34]} gap={7} />
      <rect x="20" y="66" width="144" height="22" rx={RADIUS} fill={rgba(accent, 0.06)} stroke={a} strokeWidth={STROKE.hair} />
      <SkLine x={30} y={75} w={44} accent={a} weight={STROKE.line} />
      <SkLine x={30} y={82} w={28} tone={INK.strong} />
      {/* Zip dropping in */}
      <SkArrow x1={218} y1={74} x2={218} y2={54} />
      <SkPanel x={198} y={76} w={40} h={22} fill />
      <SkLines x={206} y={85} widths={[24, 16]} gap={6} />
      <SkLabel x={218} y={106}>theme.zip</SkLabel>
    </SketchFrame>
  );
}

function SketchProductPage({ accent }: { accent: [number, number, number] }) {
  const a = rgba(accent, 0.85);
  // Media on the left, sticky form column on the right
  return (
    <SketchFrame>
      <SkWindow x={8} y={12} w={264} h={86} accent={a} />
      <SkMedia x={20} y={38} w={116} h={52} />
      {/* Form column */}
      <SkLine x={152} y={40} w={72} tone={INK.muted} />
      <SkLine x={152} y={48} w={40} accent={a} weight={STROKE.line} />
      {/* Variant swatches */}
      {[0, 1, 2, 3].map(i => (
        <circle key={i} cx={156 + i * 11} cy={60} r="3.5"
          fill={i === 0 ? a : "none"} stroke={ink(INK.muted)} strokeWidth={STROKE.hair} />
      ))}
      <SkButton x={152} y={72} w={68} h={9} accent={a} />
      <SkLines x={152} y={90} widths={[58, 42]} gap={6} />
    </SketchFrame>
  );
}

function SketchUpdate({ accent }: { accent: [number, number, number] }) {
  const a = rgba(accent, 0.85);
  // Current version, then the release that replaces it
  return (
    <SketchFrame>
      <SkPanel x={26} y={26} w={72} h={56} fill />
      <SkLines x={38} y={44} widths={[48, 34, 42]} gap={9} />
      <SkLabel x={62} y={94}>current</SkLabel>

      <SkArrow x1={112} y1={54} x2={166} y2={54} />

      <rect x="180" y="26" width="72" height="56" rx={RADIUS} fill={rgba(accent, 0.06)} stroke={a} strokeWidth={STROKE.hair} />
      <SkLine x={192} y={44} w={48} accent={a} weight={STROKE.line} />
      <SkLine x={192} y={53} w={34} tone={INK.strong} />
      <SkLine x={192} y={62} w={42} tone={INK.strong} />
      <SkLabel x={216} y={94} tone={0.5}>new release</SkLabel>
    </SketchFrame>
  );
}

function SketchHero({ accent }: { accent: [number, number, number] }) {
  const a = rgba(accent, 0.85);
  // Three hero variants, same frame, differing only in layout
  return (
    <SketchFrame>
      {/* Full-bleed */}
      <SkMedia x={8} y={12} w={80} h={74} />
      <SkLine x={18} y={46} w={54} accent={a} weight={STROKE.line} />
      <SkLine x={18} y={54} w={38} tone={INK.strong} />
      <SkButton x={18} y={60} w={24} accent={a} />
      <SkLabel x={48} y={100}>full-bleed</SkLabel>

      {/* Split */}
      <SkPanel x={100} y={12} w={80} h={74} />
      <SkMedia x={100} y={12} w={40} h={74} />
      <SkLine x={148} y={46} w={24} accent={a} weight={STROKE.line} />
      <SkLine x={148} y={54} w={18} tone={INK.strong} />
      <SkButton x={148} y={60} w={20} accent={a} />
      <SkLabel x={140} y={100}>split</SkLabel>

      {/* Text-only */}
      <SkPanel x={192} y={12} w={80} h={74} />
      <SkLine x={204} y={44} w={56} accent={a} weight={STROKE.line} />
      <SkLine x={204} y={52} w={44} tone={INK.strong} />
      <SkLine x={204} y={59} w={50} tone={INK.muted} />
      <SkButton x={204} y={66} w={28} accent={a} />
      <SkLabel x={232} y={100}>text</SkLabel>
    </SketchFrame>
  );
}

function SketchMegaMenu({ accent }: { accent: [number, number, number] }) {
  const a = rgba(accent, 0.85);
  // Nav bar with the second item open into a two-column panel
  return (
    <SketchFrame>
      <SkPanel x={8} y={10} w={264} h={18} fill />
      <SkLine x={18} y={19} w={22} tone={INK.strong} weight={STROKE.line} />
      {[0, 1, 2, 3].map(i => (
        <SkLine key={i} x={70 + i * 46} y={19} w={20}
          accent={i === 1 ? a : undefined} tone={INK.muted} weight={i === 1 ? STROKE.line : STROKE.hair} />
      ))}
      {/* Panel */}
      <SkPanel x={58} y={34} w={164} h={64} fill />
      <SkLine x={70} y={48} w={60} accent={a} weight={STROKE.line} />
      <SkLines x={70} y={60} widths={[56, 48, 52]} gap={11} />
      <line x1="146" y1="42" x2="146" y2="90" stroke={ink(INK.faint)} strokeWidth={STROKE.hair} />
      <SkMedia x={158} y={44} w={52} h={30} />
      <SkLine x={158} y={82} w={40} tone={INK.strong} />
      <SkLine x={158} y={89} w={28} tone={INK.muted} />
    </SketchFrame>
  );
}

function SketchDarkMode({ accent }: { accent: [number, number, number] }) {
  const a = rgba(accent, 0.85);
  // Same storefront, two schemes — distinguished by ink density, not literal
  // black and white fills, so it reads correctly in both themes
  return (
    <SketchFrame>
      <SkWindow x={12} y={12} w={112} h={86} accent={a} />
      <SkMedia x={24} y={38} w={88} h={30} />
      <SkLine x={24} y={78} w={60} tone={INK.muted} />
      <SkLine x={24} y={85} w={44} tone={INK.muted} />
      <SkButton x={24} y={90} accent={a} />
      <SkLabel x={68} y={106}>light</SkLabel>

      <SkArrow x1={134} y1={55} x2={148} y2={55} />

      <rect x="156" y="12" width="112" height="86" rx={RADIUS} fill={ink(INK.muted)} stroke={ink(INK.frame)} strokeWidth={STROKE.hair} />
      <line x1="156" y1="28" x2="268" y2="28" stroke={ink(INK.frame)} strokeWidth={STROKE.hair} />
      <SkLine x={164} y={20} w={28} tone={INK.strong} />
      <rect x="168" y="38" width="88" height="30" rx={RADIUS} fill={ink(INK.faint)} stroke={ink(INK.frame)} strokeWidth={STROKE.hair} />
      <SkLine x={168} y={78} w={60} tone={INK.strong} />
      <SkLine x={168} y={85} w={44} tone={INK.strong} />
      <SkButton x={168} y={90} accent={a} />
      <SkLabel x={212} y={106}>dark</SkLabel>
    </SketchFrame>
  );
}

function SketchLicense({ accent }: { accent: [number, number, number] }) {
  const a = rgba(accent, 0.85);
  // Theme settings with the license key field focused
  return (
    <SketchFrame>
      <SkWindow x={8} y={12} w={264} h={86} accent={a} />
      {/* Settings nav */}
      <line x1="72" y1="28" x2="72" y2="98" stroke={ink(INK.faint)} strokeWidth={STROKE.hair} />
      {[0, 1, 2, 3].map(i => (
        <SkLine key={i} x={20} y={42 + i * 13} w={40}
          accent={i === 2 ? a : undefined} tone={INK.muted} weight={i === 2 ? STROKE.line : STROKE.hair} />
      ))}
      {/* Key field */}
      <SkLine x={88} y={40} w={40} tone={INK.strong} />
      <rect x="88" y="50" width="152" height="16" rx={RADIUS} fill={rgba(accent, 0.06)} stroke={a} strokeWidth={STROKE.hair} />
      <SkLine x={98} y={58} w={96} accent={a} />
      <SkButton x={88} y={76} w={44} h={10} accent={a} />
    </SketchFrame>
  );
}

// â"€â"€â"€ Inertia sketches â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const INERTIA_ACCENT: [number, number, number] = [109, 40, 217];

function SketchStudio({ accent }: { accent: [number, number, number] }) {
  const a = rgba(accent, 0.85);
  // One studio, four disciplines — all chips share one treatment
  const spokes = [
    { x: 40, y: 26, label: "Shopify" },
    { x: 40, y: 84, label: "Brand" },
    { x: 240, y: 26, label: "Web" },
    { x: 240, y: 84, label: "Identity" },
  ];
  return (
    <SketchFrame>
      {spokes.map(({ x, y, label }) => (
        <g key={label}>
          <line x1={x < 140 ? x + 28 : x - 28} y1={y} x2={x < 140 ? 122 : 158} y2={y < 55 ? 46 : 64}
            stroke={ink(INK.muted)} strokeWidth={STROKE.hair} strokeDasharray="2.5 2.5" />
          <rect x={x - 28} y={y - 9} width="56" height="18" rx={RADIUS}
            fill={ink(INK.faint)} stroke={ink(INK.frame)} strokeWidth={STROKE.hair} />
          <SkLabel x={x} y={y + 2.5} tone={0.45}>{label}</SkLabel>
        </g>
      ))}
      <circle cx="140" cy="55" r="17" fill={rgba(accent, 0.08)} stroke={a} strokeWidth={STROKE.line} />
      <circle cx="140" cy="55" r="5" fill={a} />
    </SketchFrame>
  );
}

function SketchProcess({ accent }: { accent: [number, number, number] }) {
  const a = rgba(accent, 0.85);
  // Four phases, current one carries the accent
  const cols = ["Brief", "Design", "Build", "Ship"];
  const current = 2;
  return (
    <SketchFrame>
      {cols.map((label, i) => {
        const x = 10 + i * 68;
        const active = i === current;
        return (
          <g key={label}>
            <rect x={x} y="12" width="58" height="14" rx={RADIUS}
              fill={active ? rgba(accent, 0.08) : ink(INK.faint)}
              stroke={active ? a : ink(INK.frame)} strokeWidth={STROKE.hair} />
            <SkLabel x={x + 29} y={21.5} tone={active ? 0.6 : 0.35}>{label}</SkLabel>
            {[0, 1].map(k => (
              <g key={k}>
                <SkPanel x={x} y={34 + k * 24} w={58} h={18} fill />
                <SkLine x={x + 8} y={43 + k * 24} w={42}
                  accent={active ? a : undefined} tone={INK.muted} />
              </g>
            ))}
          </g>
        );
      })}
    </SketchFrame>
  );
}

function SketchShopifyBuild({ accent }: { accent: [number, number, number] }) {
  const a = rgba(accent, 0.85);
  // Section list on the left, live preview on the right
  return (
    <SketchFrame>
      <SkWindow x={8} y={12} w={124} h={86} accent={a} />
      {[0, 1, 2, 3].map(i => (
        <g key={i}>
          <rect x="20" y={38 + i * 15} width="100" height="12" rx={RADIUS}
            fill={i === 1 ? rgba(accent, 0.08) : ink(INK.faint)}
            stroke={i === 1 ? a : ink(INK.frame)} strokeWidth={STROKE.hair} />
          <SkLine x={28} y={44 + i * 15} w={56} accent={i === 1 ? a : undefined} tone={INK.muted} />
        </g>
      ))}
      <SkWindow x={148} y={12} w={124} h={86} accent={a} action />
      <SkMedia x={160} y={38} w={100} h={32} />
      <SkLine x={160} y={80} w={64} accent={a} weight={STROKE.line} />
      <SkLine x={160} y={88} w={44} tone={INK.strong} />
    </SketchFrame>
  );
}

function SketchBrandIdentity({ accent }: { accent: [number, number, number] }) {
  const a = rgba(accent, 0.85);
  // Mark, type scale, and palette — one identity system
  return (
    <SketchFrame>
      <SkPanel x={12} y={20} w={80} h={70} fill />
      <circle cx="52" cy="55" r="22" fill="none" stroke={ink(INK.frame)} strokeWidth={STROKE.hair} />
      <circle cx="52" cy="55" r="12" fill={rgba(accent, 0.08)} stroke={a} strokeWidth={STROKE.hair} />
      <circle cx="52" cy="55" r="4" fill={a} />

      {/* Type scale */}
      <SkLine x={112} y={32} w={100} accent={a} weight={2} />
      <SkLine x={112} y={44} w={82} tone={INK.strong} weight={STROKE.line} />
      <SkLine x={112} y={53} w={68} tone={INK.muted} />

      {/* Palette — one accent, the rest neutral steps */}
      {[0, 1, 2, 3].map(i => (
        <rect key={i} x={112 + i * 22} y="64" width="18" height="18" rx={RADIUS}
          fill={i === 0 ? a : ink(INK.strong - i * 0.08)}
          stroke={ink(INK.frame)} strokeWidth={STROKE.hair} />
      ))}
    </SketchFrame>
  );
}

function SketchWebProject({ accent }: { accent: [number, number, number] }) {
  const a = rgba(accent, 0.85);
  // One layout, two breakpoints
  return (
    <SketchFrame>
      <SkWindow x={8} y={12} w={182} h={86} accent={a} action />
      <SkMedia x={20} y={38} w={84} h={50} />
      <SkLine x={116} y={44} w={62} accent={a} weight={STROKE.line} />
      <SkLine x={116} y={53} w={52} tone={INK.strong} />
      <SkLine x={116} y={61} w={58} tone={INK.muted} />
      <SkButton x={116} y={72} w={42} accent={a} />

      {/* Mobile */}
      <SkPanel x={206} y={12} w={66} h={86} />
      <line x1="206" y1="28" x2="272" y2="28" stroke={ink(INK.frame)} strokeWidth={STROKE.hair} />
      <SkLine x={214} y={20} w={22} tone={INK.muted} />
      <SkMedia x={214} y={38} w={50} h={28} />
      <SkLine x={214} y={76} w={44} accent={a} />
      <SkLine x={214} y={83} w={32} tone={INK.strong} />
      <SkButton x={214} y={88} w={26} accent={a} />
    </SketchFrame>
  );
}

function SketchTimeline({ accent }: { accent: [number, number, number] }) {
  const a = rgba(accent, 0.85);
  // Five weeks, four phases — the final one is the accent
  const rows = [
    { label: "Brief", start: 0, len: 1 },
    { label: "Design", start: 1, len: 1 },
    { label: "Build", start: 2, len: 2 },
    { label: "Launch", start: 4, len: 1 },
  ];
  const colW = 42, startX = 62, startY = 22, rowH = 19;
  return (
    <SketchFrame>
      {[1, 2, 3, 4, 5].map((w, i) => (
        <SkLabel key={w} x={startX + i * colW + colW / 2} y={14}>{`Wk ${w}`}</SkLabel>
      ))}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <line key={i} x1={startX + i * colW} y1="20" x2={startX + i * colW} y2={startY + rows.length * rowH}
          stroke={ink(INK.faint)} strokeWidth={STROKE.hair} />
      ))}
      {rows.map((row, ri) => {
        const y = startY + ri * rowH;
        const last = ri === rows.length - 1;
        return (
          <g key={row.label}>
            <text x="54" y={y + 12} textAnchor="end" fontSize={LABEL_SIZE} {...sketchText(0.45)} fontFamily="inherit">{row.label}</text>
            <rect x={startX + row.start * colW + 3} y={y + 4} width={row.len * colW - 6} height={rowH - 8} rx={RADIUS}
              fill={last ? rgba(accent, 0.12) : ink(INK.faint)}
              stroke={last ? a : ink(INK.frame)} strokeWidth={STROKE.hair} />
          </g>
        );
      })}
    </SketchFrame>
  );
}

// â"€â"€â"€ Sketch registry â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const SKETCH_MAP: Record<string, (p: { accent: [number, number, number] }) => React.ReactElement> = {
  install: SketchInstall,
  productPage: SketchProductPage,
  update: SketchUpdate,
  hero: SketchHero,
  megaMenu: SketchMegaMenu,
  darkMode: SketchDarkMode,
  license: SketchLicense,
  studio: SketchStudio,
  process: SketchProcess,
  shopifyBuild: SketchShopifyBuild,
  brandIdentity: SketchBrandIdentity,
  webProject: SketchWebProject,
  timeline: SketchTimeline,
};

// â"€â"€â"€ Aether docs â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

// Site primary — #0a84ff (--sh-primary), same blue as /aether
const AETHER_ACCENT: [number, number, number] = [10, 132, 255];

const AETHER_DOCS: DocSection[] = [
  {
    id: "aether-getting-started",
    title: "Getting started",
    articles: [
      {
        id: "aether-installation",
        title: "Installation",
        body: [
          {
            type: "sketch",
            name: "install",
            accent: AETHER_ACCENT,
            images: [
              {
                src: "/docs/aether-installation-online-store.png",
                alt: "Shopify admin sidebar with Online Store selected under Sales channels",
                label: "Online Store",
              },
              {
                src: "/docs/aether-installation.png",
                alt: "Shopify admin Draft themes view with the Import menu open to upload a zip file",
                label: "Upload zip",
              },
            ],
          },
          { type: "p", text: "Installation is included with every license. You don't need to do anything technical." },
          { type: "h3", text: "We install it for you" },
          { type: "ol", items: [
            "After you buy, we send a collaborator request to your Shopify store.",
            "Accept it in your Shopify admin. It takes one click.",
            "We install Aether and set it up the same day.",
          ]},
          { type: "note", accent: AETHER_ACCENT, label: "Good to know", text: "Your current theme stays live the whole time. Nothing changes for your customers until you publish Aether." },
          { type: "h3", text: "Install it yourself" },
          { type: "p", text: "Prefer to do it on your own? It takes about two minutes." },
          { type: "ol", items: [
            "In your Inertia dashboard, open **Licenses** and download the Aether zip under your license.",
            "In your Shopify admin, go to **Online Store → Themes**.",
            "Click **Add theme → Upload zip file** and choose the zip.",
            "Click **Customize** to set it up, or **Publish** to go live.",
          ]},
          { type: "note", accent: AETHER_ACCENT, label: "Tip", text: "No dashboard account yet? After purchase we email you a link to create one." },
        ],
      },
      {
        id: "aether-first-setup",
        title: "First-time setup",
        body: [
          { type: "p", text: "A few settings make Aether look like your brand. You can do all of this before editing a single section." },
          { type: "ol", items: [
            "Open the theme editor and click **Theme settings**.",
            "Set your brand colors under **Colors**.",
            "Upload your logo under **Header**.",
            "Pick a type size under **Typography**. The default suits most brands.",
            "Look over the homepage. Most sections come filled in already.",
          ]},
          { type: "p", text: "That's usually enough to publish. The built-in sections are designed to look good with any brand color." },
        ],
      },
      {
        id: "aether-license",
        title: "License and activation",
        body: [
          {
            type: "sketch",
            name: "license",
            accent: AETHER_ACCENT,
            image: "/docs/aether-license.png",
            alt: "Aether license activation overlay showing the license key field and Activate button",
          },
          { type: "p", text: "Your license key arrives by email after purchase. It looks like AETH-XXXX-XXXX-XXXX. You can also find it any time in your Inertia dashboard under **Licenses**." },
          { type: "h3", text: "Activate your license" },
          { type: "ol", items: [
            "In your Shopify admin, go to **Online Store → Themes → Customize**.",
            "Open **Theme settings → License Key**.",
            "Paste your key and click **Save**.",
            "The store reloads and the lock screen disappears. Your key is now linked to this store.",
          ]},
          { type: "h3", text: "What your license covers" },
          { type: "ul", items: [
            "One Shopify store.",
            "Every future update, for life. No renewals.",
            "Priority support from the people who built Aether.",
            "Installation, done for you.",
          ]},
          { type: "note", accent: AETHER_ACCENT, text: "Moving to a different store? Reply to your purchase email and we'll move your license over." },
        ],
      },
    ],
  },
  {
    id: "aether-sections",
    title: "Sections",
    articles: [
      {
        id: "aether-header",
        title: "Header",
        body: [
          {
            type: "sketch",
            name: "megaMenu",
            accent: AETHER_ACCENT,
            images: [
              {
                src: "/docs/aether-header.jpg",
                alt: "Shopify theme editor showing Header Desktop with navigation, logo, and mega menu preview",
                label: "Overview",
              },
              {
                src: "/docs/aether-header-settings.png",
                alt: "Close-up of Header Desktop settings for logo, navigation, mega menu colors, and cart drawer",
                label: "Settings",
              },
            ],
          },
          { type: "p", text: "The header can be a simple menu, a mega menu, or see-through over your hero image. You'll find every option in **Theme settings → Header**." },
          { type: "h3", text: "Mega menu" },
          { type: "p", text: "Any menu item with links under it opens as a two-column mega menu. The right side can show a featured image, a collection, or nothing." },
          { type: "ol", items: [
            "Add your menu links in **Shopify admin → Navigation → Main menu**.",
            "Nest links under a top-level item. That item now opens a mega menu.",
            "In the theme editor, choose what shows on the right under **Header → Mega menu panels**.",
          ]},
          { type: "h3", text: "Transparent header" },
          { type: "p", text: "Turn this on when your homepage hero is a full-width image or has a dark background. The header becomes solid as visitors scroll." },
        ],
      },
      {
        id: "aether-hero",
        title: "Hero",
        body: [
          {
            type: "sketch",
            name: "hero",
            accent: AETHER_ACCENT,
            images: [
              {
                src: "/docs/aether-hero.jpg",
                alt: "Shopify theme editor showing Hero Banner Desktop with split layout and live preview",
                label: "Overview",
              },
              {
                src: "/docs/aether-hero-settings.png",
                alt: "Close-up of Hero Banner Desktop settings for height, layout, background media, and overlay",
                label: "Settings",
              },
            ],
          },
          { type: "p", text: "The hero is the first thing visitors see. Aether has three layouts, each with its own settings." },
          { type: "ul", items: [
            "**Full width:** an image or video across the whole screen, with text on top. Place the text in any of six spots.",
            "**Split:** media on one side, text on the other, at 50/50 or 60/40. Best for showing off a product.",
            "**Text only:** a headline with optional text and a button, centered or left-aligned. Good for launches and announcements.",
          ]},
          { type: "note", accent: AETHER_ACCENT, text: "Every hero layout works with the announcement bar above it. The bar uses the brand color from Theme settings." },
        ],
      },
      {
        id: "aether-product-page",
        title: "Product page",
        body: [
          {
            type: "sketch",
            name: "productPage",
            accent: AETHER_ACCENT,
            image: "/docs/aether-product-page.png",
            alt: "Shopify theme editor showing Product Page Desktop settings with back button, variant buttons, add to cart styling, and shipping info",
          },
          { type: "p", text: "The product page is built to load fast and keep the buy button close. Images sit on the left and the product details stay in view on the right as visitors scroll." },
          { type: "h3", text: "Sticky add to cart" },
          { type: "p", text: "Once the main add to cart button scrolls out of view, a slim bar appears with the product name, the chosen option and a buy button. You can turn it off for any product template in the theme editor." },
          { type: "h3", text: "Trust badges" },
          { type: "p", text: "A row of badges sits just below the add to cart button. Add up to four icons with short labels in the product page blocks." },
          { type: "h3", text: "Tabs" },
          { type: "p", text: "Details, materials, shipping and returns fold into tabs to keep the page tidy. Rename or reorder them in the product page template." },
        ],
      },
      {
        id: "aether-collection",
        title: "Collection page",
        body: [
          {
            type: "sketch",
            name: "collectionPage",
            accent: AETHER_ACCENT,
            images: [
              {
                src: "/docs/aether-collection-page.jpg",
                alt: "Shopify theme editor showing the Collection Products page with grid layout and filter controls",
                label: "Overview",
              },
              {
                src: "/docs/aether-collection-page-settings.png",
                alt: "Close-up of Collection Products settings for tabs, layout columns, card styling, and titles",
                label: "Settings",
              },
            ],
          },
          { type: "p", text: "Collection pages come in two layouts: a standard grid and an editorial layout with mixed card sizes. Set either one per template." },
          { type: "h3", text: "Filters" },
          { type: "p", text: "Filters use Shopify's free Search & Discovery app. Turn it on in your Shopify admin and the filters show up on their own. No code needed." },
          { type: "h3", text: "Product card options" },
          { type: "ul", items: [
            "**Quick add:** an add to cart button that appears on hover. Products with options get a small picker.",
            "**Color swatches:** shows each color option on the card. Hovering a swatch loads that color's image.",
            "**Sold out badge:** appears on the image when every option is out of stock.",
          ]},
        ],
      },
      {
        id: "aether-announcement-bar",
        title: "Announcement bar",
        body: [
          {
            type: "sketch",
            name: "announcementBar",
            accent: AETHER_ACCENT,
            images: [
              {
                src: "/docs/aether-announcement-bar.jpg",
                alt: "Shopify theme editor showing the Announcement Bar above the collection page preview",
                label: "Overview",
              },
              {
                src: "/docs/aether-announcement-bar-settings.png",
                alt: "Close-up of Announcement Bar settings for colors, typography, rotation, and close button",
                label: "Settings",
              },
            ],
          },
          { type: "p", text: "The announcement bar runs across the top of every page. It can rotate through several messages, and each one can link somewhere." },
          { type: "h3", text: "Add rotating messages" },
          { type: "ol", items: [
            "In the theme editor, open the **Announcement bar** section.",
            "Add a message block for each message. Each one has a text field and an optional link.",
            "Set how many seconds each message shows under **Rotate interval**. The default is 4.",
            "Turn on **Show close** if you want visitors to be able to hide the bar.",
          ]},
          { type: "note", accent: AETHER_ACCENT, label: "Tip", text: "You can change the bar's colors, text size, spacing and capitalization in its section settings." },
        ],
      },
      {
        id: "aether-email-capture",
        title: "Email and SMS capture",
        body: [
          { type: "p", text: "Aether has three ways to collect emails and phone numbers. Use whichever fits your brand." },
          { type: "ul", items: [
            "**Signup card:** slides in after a delay you choose. Takes email or SMS signups, can reveal a discount code, and won't show again to the same visitor for a set number of days.",
            "**Email popup:** a centered window with full control over fonts and colors. Show it when the page loads or once visitors scroll part way down.",
            "**SMS tab:** a small tab in a corner of the screen that opens into a panel linking to your SMS signup. Choose which corner or edge it sits on.",
          ]},
          { type: "note", accent: AETHER_ACCENT, label: "Tip", text: "Each one is its own section, so you can use one, two or all three. If you use more than one, check how they stack up for a first-time visitor." },
        ],
      },
    ],
  },
  {
    id: "aether-customization",
    title: "Customization",
    articles: [
      {
        id: "aether-colors",
        title: "Colors",
        body: [
          { type: "p", text: "Set a few base colors in **Theme settings → Colors** and Aether works out the rest for you." },
          { type: "ul", items: [
            "**Primary:** buttons, links and highlights. Use your brand color.",
            "**Surface:** the background of cards and popups.",
            "**Foreground:** text. Aether keeps it readable against your background automatically.",
            "**Line:** borders and dividers. Made from a light version of your text color.",
          ]},
          { type: "h3", text: "Dark mode" },
          { type: "p", text: "Aether matches each visitor's device setting for light or dark mode, with no flash on load. You can also give customers a switch in **Theme settings → Colors**. Both modes are designed separately, not just inverted." },
        ],
      },
      {
        id: "aether-custom-fonts",
        title: "Custom fonts",
        body: [
          { type: "p", text: "You can use your own fonts without touching code. Turn them on in **Theme settings → Custom Font**, then add a name and a file link for your heading and body fonts." },
          { type: "h3", text: "Upload a font to Shopify" },
          { type: "ol", items: [
            "In your Shopify admin, go to **Content → Files**.",
            "Upload your font file (TTF, WOFF or WOFF2).",
            "Copy the file's link from the list.",
            "Paste it into **Theme settings → Custom Font → Heading Font URL** or **Regular Font URL**.",
            "Type the font's name exactly as it appears in the file.",
          ]},
          { type: "h3", text: "Use a font hosted elsewhere" },
          { type: "p", text: "Any direct link to a font file works, including Google Fonts. Text stays visible while the font loads, so the page never looks blank." },
          { type: "note", accent: AETHER_ACCENT, label: "Tip", text: "Heading and body fonts are set separately. Use two different fonts or the same one for both." },
        ],
      },
      {
        id: "aether-custom-css",
        title: "Custom CSS",
        body: [
          { type: "p", text: "For changes the theme editor can't make, add your own CSS in **Theme settings → Advanced → Custom CSS**. These variables match the theme's colors and corners:" },
          { type: "code", text: `--color-primary     your brand accent
--color-surface     card and overlay background
--color-fg          foreground text
--color-bg          page background
--color-line        borders and dividers
--radius-sm / -md / -lg   border radii` },
          { type: "note", accent: AETHER_ACCENT, text: "Your custom CSS stays in place when you update, as long as you don't overwrite the theme's base files." },
        ],
      },
    ],
  },
  {
    id: "aether-updates",
    title: "Updates",
    articles: [
      {
        id: "aether-how-to-update",
        title: "How to update",
        body: [
          { type: "sketch", name: "update", accent: AETHER_ACCENT },
          { type: "p", text: "Every new version shows up in your Inertia dashboard. Nothing changes on your store until you choose to update." },
          { type: "ol", items: [
            "In your Inertia dashboard, open **Licenses** and download the latest zip under your license.",
            "In your Shopify admin, go to **Online Store → Themes**.",
            "Click **Add theme → Upload zip file**. This adds a new copy and leaves your live theme alone.",
            "Preview the new version. If it looks right, publish it.",
            "If you edited any theme code, copy those edits into the new version.",
          ]},
          { type: "note", accent: AETHER_ACCENT, label: "Tip", text: "Read the changelog first. Big releases list every file that changed, so you know where your edits need to go." },
        ],
      },
      {
        id: "aether-backup",
        title: "Backing up",
        body: [
          { type: "p", text: "When you publish a new theme, Shopify keeps the old one in your theme list. To roll back, just publish the old one again." },
          { type: "p", text: "If you've edited theme code, keep a copy of those files outside Shopify too. A private GitHub repo works well and makes it easy to compare against a new version." },
        ],
      },
      {
        id: "aether-merging",
        title: "Keeping your code edits",
        body: [
          { type: "p", text: "If you've changed theme files directly, you'll need to copy those changes into each new version. The changelog lists which files changed in every release, so you only check the ones that matter." },
          { type: "ol", items: [
            "Find the files you edited by comparing your theme against the original Aether files.",
            "Download the new version.",
            "Open the old and new files side by side.",
            "Copy your changes into the new files, using the changelog as a guide.",
            "Upload the updated theme.",
          ]},
          { type: "note", accent: AETHER_ACCENT, label: "Tip", text: "Doing a lot of custom work? Shopify CLI with Git makes this much easier." },
        ],
      },
    ],
  },
];

// â"€â"€â"€ Inertia docs â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const INERTIA_DOCS: DocSection[] = [
  {
    id: "inertia-overview",
    title: "Overview",
    articles: [
      {
        id: "inertia-what-we-do",
        title: "What we do",
        body: [
          { type: "sketch", name: "studio", accent: INERTIA_ACCENT },
          { type: "p", text: "Inertia is a small design and development studio. We build Shopify themes, brand identities, and custom web products, mostly for independent brands that care about craft." },
          { type: "p", text: "Everything we ship is built in-house. No outsourcing, no templates. Each project starts from a real brief and ends with something that fits the brand it was made for." },
          { type: "h3", text: "What we take on" },
          { type: "ul", items: [
            "Shopify store builds: from a base theme up to a full custom storefront.",
            "Brand identity work: logo, type, color, and the system that holds it together.",
            "Custom web projects: marketing sites, editorial platforms, tools.",
            "Aether theme support: installation, configuration, and custom development on top of Aether.",
          ]},
        ],
      },
      {
        id: "inertia-how-we-work",
        title: "How we work",
        body: [
          { type: "sketch", name: "process", accent: INERTIA_ACCENT },
          { type: "p", text: "Projects run in focused phases. We don't drag things out. Most engagements are five weeks or under: brief, concepts, build, then ship." },
          { type: "h3", text: "The phases" },
          { type: "ol", items: [
            "Brief and discovery: we learn the brand, the goals, and what success looks like before we touch a file.",
            "Concepts: one or two directions, no endless revisions. We show you our thinking, you push back, we refine.",
            "Build: development happens fast because the design is settled. We don't design in the browser.",
            "Ship: we help with launch including staging, QA, and go-live. You're not handed a zip and left to figure it out.",
          ]},
          { type: "note", accent: INERTIA_ACCENT, text: "We keep the client list short intentionally. It means more focus per project and quicker turnaround." },
        ],
      },
    ],
  },
  {
    id: "inertia-services",
    title: "Services",
    articles: [
      {
        id: "inertia-shopify",
        title: "Shopify builds",
        body: [
          { type: "sketch", name: "shopifyBuild", accent: INERTIA_ACCENT },
          { type: "p", text: "Shopify builds are the core of what we do. We've shipped stores across apparel, home goods, beauty, and accessories. Each one different, each one considered." },
          { type: "h3", text: "What's included" },
          { type: "ul", items: [
            "Theme selection or custom theme development. We'll tell you honestly whether Aether fits or whether you need something bespoke.",
            "Section configuration and content build-out.",
            "App setup. We work with the standard Shopify ecosystem and a short list of vetted third-party apps.",
            "Performance review before launch.",
            "30-day post-launch support for anything that surfaces after go-live.",
          ]},
          { type: "h3", text: "Starting point" },
          { type: "p", text: "Send us a note through the contact page. We'll ask a few questions about the brand, the timeline, and what you're trying to achieve. From there we'll put together a scope and a quote, usually within a few days." },
        ],
      },
      {
        id: "inertia-brand",
        title: "Brand identity",
        body: [
          { type: "sketch", name: "brandIdentity", accent: INERTIA_ACCENT },
          { type: "p", text: "Brand identity work is about building a system, not just a logo. We work with founders and small teams who are building something worth a mark that will last." },
          { type: "h3", text: "What we deliver" },
          { type: "ul", items: [
            "Logo and wordmark: primary and alternate lockups.",
            "Type system: headline, body, and any supporting faces.",
            "Color palette: primary, secondary, and neutral ranges.",
            "Usage guidelines so the system works without us in the room.",
          ]},
          { type: "p", text: "Identity work pairs well with a Shopify build. When the brand and the store are designed together, the result is more coherent than when they're done separately." },
        ],
      },
      {
        id: "inertia-web",
        title: "Custom web projects",
        body: [
          { type: "sketch", name: "webProject", accent: INERTIA_ACCENT },
          { type: "p", text: "Custom web projects are for when a template won't cut it. Marketing sites, editorial platforms, portfolio builds, tools. Anything where the design and the code need to be tightly integrated." },
          { type: "h3", text: "Stack" },
          { type: "p", text: "We build in Next.js by default. It's what we know best and what lets us move fastest. For content-heavy projects we use a CMS (usually Sanity or Contentful). For interactive work we lean on Framer Motion and Canvas." },
          { type: "note", accent: INERTIA_ACCENT, text: "We don't do WordPress. If your project requires it, we're happy to point you somewhere better." },
        ],
      },
    ],
  },
  {
    id: "inertia-working-together",
    title: "Working together",
    articles: [
      {
        id: "inertia-timeline",
        title: "Timeline and pace",
        body: [
          { type: "sketch", name: "timeline", accent: INERTIA_ACCENT },
          { type: "p", text: "Most projects are five weeks. Some are shorter, some run a week or two longer if the scope is large. We don't pad timelines and we don't let projects drift." },
          { type: "h3", text: "What keeps things moving" },
          { type: "ul", items: [
            "One decision-maker on your side. Committees slow everything down.",
            "Feedback within 48 hours of each deliverable. We'll tell you when we need it.",
            "Content ready before the build phase starts. Placeholder copy leads to placeholder results.",
          ]},
        ],
      },
      {
        id: "inertia-getting-started",
        title: "Getting started",
        body: [
          { type: "p", text: "The best way to start is to send a note through the contact page. Tell us what you're building, what you're trying to achieve, and when you need it." },
          { type: "p", text: "We'll get back to you within two business days. If it sounds like a fit, we'll set up a short call to go deeper before putting together a scope." },
          { type: "h3", text: "What to include in your first message" },
          { type: "ul", items: [
            "What you're building and what stage you're at.",
            "What service you think you need. It's fine if you're not sure.",
            "A rough timeline or deadline if you have one.",
            "Any reference sites or brands that resonate with where you're trying to go.",
          ]},
          { type: "note", accent: INERTIA_ACCENT, text: "We take on a limited number of projects at a time. If we're full, we'll tell you honestly and give you a realistic date for when we could start." },
        ],
      },
    ],
  },
];

// â"€â"€â"€ Products registry â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const PRODUCTS: Product[] = [
  {
    id: "aether",
    name: "Aether",
    description: "Shopify theme",
    accent: AETHER_ACCENT,
    sections: AETHER_DOCS,
  },
  {
    id: "inertia",
    name: "Inertia",
    description: "Studio",
    accent: INERTIA_ACCENT,
    sections: INERTIA_DOCS,
  },
];

// â"€â"€â"€ Components â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium tracking-tight transition-colors hover:text-[rgb(var(--fg))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--line))]"
      style={{
        background: "rgb(var(--surface))",
        border: "1px solid rgb(var(--line))",
        color: copied ? "rgb(var(--fg))" : "rgb(var(--muted))",
        boxShadow: "0 1px 2px rgb(var(--fg) / 0.04)",
      }}
      aria-label={copied ? "Copied" : "Copy code"}
    >
      {copied ? (
        <>
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="1.5,6 4.5,9 10.5,3" /></svg>
          Copied
        </>
      ) : (
        <>
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
            <rect x="4" y="4" width="7" height="7" rx="1" /><path d="M8 4V2.5A.5.5 0 0 0 7.5 2h-5a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 .5.5H4" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

function SketchImageCarousel({
  images,
  accent,
}: {
  images: { src: string; alt: string; label: string }[];
  accent: [number, number, number];
}) {
  const [active, setActive] = useState(0);
  const slide = images[active] ?? images[0];

  return (
    <div
      className="w-full rounded-xl overflow-hidden border border-[rgb(var(--line))]"
      style={{ background: "rgb(var(--fg) / 0.02)" }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Installation steps"
    >
      <img
        key={slide.src}
        src={slide.src}
        alt={slide.alt}
        className="block w-full h-auto"
        loading={active === 0 ? "eager" : "lazy"}
        decoding="async"
      />
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-t border-[rgb(var(--line))]">
        {images.map((img, i) => {
          const on = i === active;
          return (
            <button
              key={img.src}
              type="button"
              onClick={() => setActive(i)}
              aria-current={on ? "true" : undefined}
              aria-label={`View step: ${img.label}`}
              className="rounded-full px-3 py-1 text-[12px] font-medium tracking-tight transition-colors [-webkit-tap-highlight-color:transparent]"
              style={{
                background: on ? rgba(accent, 0.12) : "transparent",
                color: on ? rgba(accent, 1) : "rgb(var(--muted))",
                border: `1px solid ${on ? rgba(accent, 0.25) : "rgb(var(--line))"}`,
              }}
            >
              {img.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// **Label** in doc copy marks an interface label or menu path, so readers can
// spot what to click while following along in Shopify.
function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-medium text-[rgb(var(--fg))]">{part.slice(2, -2)}</strong>
    ) : (
      part
    ),
  );
}

function ArticleBody({ body, accent }: { body: ArticleBlock[]; accent: [number, number, number] }) {
  return (
    <div className="flex flex-col gap-6">
      {body.map((block, i) => {
        if (block.type === "sketch") {
          if (block.images?.length) {
            return <SketchImageCarousel key={i} images={block.images} accent={block.accent} />;
          }
          if (block.image) {
            return (
              <div key={i} className="w-full rounded-xl overflow-hidden border border-[rgb(var(--line))]" style={{ background: "rgb(var(--fg) / 0.02)" }}>
                <img src={block.image} alt={block.alt ?? ""} className="block w-full h-auto" loading="lazy" decoding="async" />
              </div>
            );
          }
          const Sketch = SKETCH_MAP[block.name];
          if (!Sketch) return null;
          return (
            <div key={i} className="w-full rounded-xl overflow-hidden border border-[rgb(var(--line))] py-8 px-6" style={{ background: "rgb(var(--fg) / 0.02)" }}>
              <Sketch accent={block.accent} />
            </div>
          );
        }
        if (block.type === "p") {
          return <p key={i} className="text-[16px] leading-[1.85] tracking-tight text-[rgb(var(--fg))]" style={{ opacity: 0.75 }}>{renderInline(block.text)}</p>;
        }
        if (block.type === "h3") {
          return (
            <h3 key={i} className="text-[15px] font-semibold tracking-tight text-[rgb(var(--fg))] pt-2 pb-1">
              {block.text}
            </h3>
          );
        }
        if (block.type === "ol") {
          return (
            <ol key={i} className="flex flex-col gap-3">
              {block.items.map((item, j) => (
                <li key={j} className="flex gap-3 text-[16px] leading-[1.85] tracking-tight">
                  <span
                    className="mt-[5px] flex size-[20px] shrink-0 items-center justify-center rounded-full text-[12px] font-medium tabular-nums leading-none"
                    style={{ background: rgba(accent, 0.1), color: rgba(accent, 0.95) }}
                    aria-hidden="true"
                  >
                    {j + 1}
                  </span>
                  <span className="min-w-0 text-[rgb(var(--fg))]" style={{ opacity: 0.75 }}>{renderInline(item)}</span>
                </li>
              ))}
            </ol>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={i} className="flex flex-col gap-3 pl-4">
              {block.items.map((item, j) => (
                <li key={j} className="text-[16px] leading-[1.85] tracking-tight text-[rgb(var(--fg))] list-disc pl-1" style={{ opacity: 0.75 }}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }
        if (block.type === "note") {
          const na = block.accent ?? accent;
          return (
            <div key={i} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${rgba(na, 0.25)}` }}>
              {/* Label bar */}
              <div className="flex items-center gap-1.5 px-4 py-2" style={{ borderBottom: `1px solid ${rgba(na, 0.15)}`, background: rgba(na, 0.07) }}>
                <svg viewBox="0 0 14 14" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0" style={{ stroke: rgba(na, 0.8) }} strokeWidth="1.5" aria-hidden="true">
                  <circle cx="7" cy="7" r="5.5" />
                  <line x1="7" y1="6.5" x2="7" y2="9.5" />
                  <circle cx="7" cy="4.5" r="0.55" fill={rgba(na, 0.8)} stroke="none" />
                </svg>
                <span className="text-[13px] font-semibold tracking-tight leading-none" style={{ color: rgba(na, 0.85) }}>{block.label ?? "Note"}</span>
              </div>
              {/* Body */}
              <div className="px-4 py-3">
                <p className="text-[14.5px] leading-relaxed tracking-tight text-[rgb(var(--fg))]" style={{ opacity: 0.8 }}>{renderInline(block.text)}</p>
              </div>
            </div>
          );
        }
        if (block.type === "code") {
          return (
            <div key={i} className="relative">
              <pre className="text-[14px] leading-relaxed font-mono rounded-xl border border-[rgb(var(--line))] pl-5 pr-[5.75rem] py-4 overflow-x-auto whitespace-pre text-[rgb(var(--muted))] select-text" style={{ background: "rgb(var(--fg) / 0.03)" }}>
                <code>{block.text}</code>
              </pre>
              <CopyButton text={block.text} />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

function SidebarNav({
  products,
  activeProductId,
  activeArticleId,
  onSelectProduct,
  onNav,
}: {
  products: Product[];
  activeProductId: string;
  activeArticleId: string;
  onSelectProduct: (id: string) => void;
  onNav?: () => void;
}) {
  const product = products.find((p) => p.id === activeProductId)!;
  return (
    <div className="flex flex-col py-6">

      {/* Product switcher */}
      <div className="flex flex-col gap-1 mb-6 pb-6 border-b border-[rgb(var(--line))]">
        {products.map((p) => {
          const active = p.id === activeProductId;
          return (
            <button
              key={p.id}
              onClick={() => onSelectProduct(p.id)}
              className="flex items-center gap-2.5 py-1.5 text-left rounded px-2 -mx-2 transition-colors"
              style={active ? { background: rgba(p.accent, 0.07) } : {}}
            >
              <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: rgba(p.accent, active ? 0.9 : 0.3) }} />
              <span className="text-[13px] tracking-tight" style={{ color: active ? rgba(p.accent, 1) : "rgb(var(--fg))", opacity: active ? 1 : 0.6 }}>
                {p.name}
              </span>
              <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] ml-0.5" style={{ opacity: 0.38 }}>
                {p.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sections + articles */}
      <div className="flex flex-col gap-5">
        {product.sections.map((section) => (
          <div key={section.id} className="flex flex-col gap-0.5">
            <p className="text-[11px] tracking-tight font-medium text-[rgb(var(--muted))] mb-1.5 px-2" style={{ opacity: 0.45 }}>
              {section.title}
            </p>
            {section.articles.map((article) => {
              const active = activeArticleId === article.id;
              return (
                <a
                  key={article.id}
                  href={`#${article.id}`}
                  onClick={onNav}
                  className="block py-1.5 text-[13px] tracking-tight transition-colors rounded px-2 -mx-2"
                  style={{
                    color: "rgb(var(--fg))",
                    opacity: active ? 1 : 0.55,
                    background: active ? rgba(product.accent, 0.12) : undefined,
                  }}
                >
                  {article.title}
                </a>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

const INTRO_ID = "__intro__";

type SearchResult = { productId: string; productName: string; sectionTitle: string; articleId: string; articleTitle: string; excerpt: string };

function buildSearchIndex(): SearchResult[] {
  const results: SearchResult[] = [];
  for (const product of PRODUCTS) {
    for (const section of product.sections) {
      for (const article of section.articles) {
        const textBlocks = article.body
          .filter((b): b is { type: "p"; text: string } => b.type === "p")
          .map((b) => b.text.replace(/\*\*/g, ""))
          .join(" ");
        results.push({
          productId: product.id,
          productName: product.name,
          sectionTitle: section.title,
          articleId: article.id,
          articleTitle: article.title,
          excerpt: textBlocks.slice(0, 120),
        });
      }
    }
  }
  return results;
}

const SEARCH_INDEX = buildSearchIndex();

function DocsPageInner() {
  const searchParams = useSearchParams();
  const fromAether = searchParams.get("from") === "aether";
  const [activeProductId, setActiveProductId] = useState(PRODUCTS[0].id);
  const [activeArticleId, setActiveArticleId] = useState<string>(INTRO_ID);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [nearBottom, setNearBottom] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const scrollElRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      if (!nudgeDismissed) setShowNudge(true);
    }, 15000);
    return () => clearTimeout(t);
  }, [nudgeDismissed]);
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 300);
      const distFromBottom = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
      setNearBottom(distFromBottom < 200);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const searchResults = searchQuery.trim().length > 0
    ? SEARCH_INDEX.filter((r) => {
        const q = searchQuery.toLowerCase();
        return r.articleTitle.toLowerCase().includes(q) || r.excerpt.toLowerCase().includes(q) || r.sectionTitle.toLowerCase().includes(q);
      }).slice(0, 8)
    : [];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const product = PRODUCTS.find((p) => p.id === activeProductId)!;
  const allArticles = product.sections.flatMap((s) => s.articles);

  const handleSelectProduct = (id: string) => {
    setActiveProductId(id);
    setActiveArticleId(INTRO_ID);
    const lenis = (window as any).__lenis;
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo({ top: 0, behavior: "auto" });
  };

  useEffect(() => {
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveArticleId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-10% 0px -75% 0px", threshold: 0 }
    );
    const introEl = document.getElementById(INTRO_ID);
    if (introEl) observerRef.current.observe(introEl);
    allArticles.forEach((a) => {
      const el = document.getElementById(a.id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [activeProductId]);

  useEffect(() => {
    const locked = sheetOpen || searchOpen;
    if (!locked) return;
    // Lock scroll without letting the removed scrollbar shift layout — a bare
    // `overflow: hidden` changes the viewport width, which resets sticky
    // elements (like the desktop sidebar) to the top instead of holding their
    // scrolled position.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [sheetOpen, searchOpen]);

  return (
    <>
    <div className="min-h-screen flex flex-col" style={{ background: "rgb(var(--bg))" }}>

      {/* Docs header — desktop hidden, mobile only */}
      <header className="lg:hidden flex items-center justify-between px-3 shrink-0" style={{ height: 72, background: "rgb(var(--bg))" }}>
        <div className="flex items-center gap-3 pl-3">
          <Link href="/">
            <img src="/logo.png" alt="Inertia" className="h-5 w-auto" />
          </Link>
          {fromAether && (
            <Link href="/aether" className="flex items-center gap-1 text-[12px] tracking-tight transition-colors" style={{ color: "rgb(var(--muted))", opacity: 0.6 }}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 shrink-0">
                <line x1="13" y1="8" x2="3" y2="8" /><polyline points="7 4 3 8 7 12" />
              </svg>
              Aether
            </Link>
          )}
        </div>
        <Link href="/aether#pricing" className="hidden sm:inline-flex items-center gap-1.5 rounded-[6px] px-3.5 py-1.5 text-[12px] tracking-tight font-medium transition-opacity hover:opacity-80" style={{ background: "rgb(var(--fg))", color: "rgb(var(--bg))" }}>
          Get Aether
        </Link>
      </header>

      <div className="flex flex-1 min-h-0">

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-56 xl:w-64 shrink-0 p-3">
          <div className="sticky top-3 max-h-[calc(100vh-24px)] overflow-y-auto rounded-2xl border border-[rgb(var(--line))] px-3 py-4 flex flex-col gap-4 transition-[border-color] duration-200 hover:border-[rgb(var(--fg)/0.12)]" style={{ background: "rgb(var(--surface))" }}>

            {/* Back to Aether */}
            {fromAether && (
              <Link href="/aether" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] tracking-tight transition-colors hover:bg-[rgb(var(--fg)/0.05)]" style={{ color: "rgb(var(--muted))", opacity: 0.7 }}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 shrink-0">
                  <line x1="13" y1="8" x2="3" y2="8" /><polyline points="7 4 3 8 7 12" />
                </svg>
                Back to Aether
              </Link>
            )}

            {/* Logo */}
            <div className="flex items-center justify-between px-3 py-2 mb-1">
              <Link href="/">
                <img src="/logo.png" alt="Inertia" className="h-5 w-auto" />
              </Link>
              <Link href="/aether#pricing" className="text-[11px] tracking-tight font-medium transition-opacity hover:opacity-70" style={{ color: "rgb(var(--muted))", opacity: 0.5 }}>
                Get Aether
              </Link>
            </div>

            {/* Search trigger */}
            <button
              onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 50); }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] tracking-tight text-[rgb(var(--muted))] border border-[rgb(var(--line))] w-full transition-colors hover:border-[rgb(var(--fg)/0.3)] hover:bg-[rgb(var(--fg)/0.04)] hover:text-[rgb(var(--fg))]"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 shrink-0" aria-hidden="true">
                <circle cx="6.5" cy="6.5" r="4" /><path d="M11 11l2.5 2.5" />
              </svg>
              <span className="flex-1 text-left">Search</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] border border-[rgb(var(--line))]">⌘K</span>
            </button>

            <div className="h-px" style={{ background: "rgb(var(--line))" }} />

            {/* Product switcher */}
            <div className="flex flex-col gap-0.5">
              {PRODUCTS.map((p) => {
                const active = p.id === activeProductId;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProduct(p.id)}
                    className="group relative flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-opacity duration-200 hover:opacity-100"
                    style={{ background: active ? rgba(p.accent, 0.12) : "transparent" }}
                  >
                    <span aria-hidden className={SIDEBAR_HOVER_OVERLAY} />
                    <span className="relative text-[14px] tracking-tight" style={{ color: "rgb(var(--fg))", fontWeight: active ? 600 : 400, opacity: active ? 1 : 0.5 }}>{p.name}</span>
                    <span className="relative text-[12px] tracking-tight" style={{ color: "rgb(var(--muted))", opacity: 0.5 }}>{p.description}</span>
                  </button>
                );
              })}
            </div>

            <div className="h-px" style={{ background: "rgb(var(--line))" }} />

            {/* Intro link */}
            <div className="flex flex-col gap-0.5">
              <SidebarNavLink
                href={`#${INTRO_ID}`}
                active={activeArticleId === INTRO_ID}
                accent={product.accent}
              >
                Introduction
              </SidebarNavLink>
            </div>

            {/* Nav sections */}
            {product.sections.map((section) => (
              <div key={section.id} className="flex flex-col gap-0.5">
                <p className="text-[12px] font-semibold tracking-tight px-3 mb-1 mt-2" style={{ color: "rgb(var(--fg))", opacity: 0.55 }}>
                  {section.title}
                </p>
                {section.articles.map((article) => {
                  const active = activeArticleId === article.id;
                  return (
                    <SidebarNavLink
                      key={article.id}
                      href={`#${article.id}`}
                      active={active}
                      accent={product.accent}
                    >
                      {article.title}
                    </SidebarNavLink>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        {/* Content — centered with max-width */}
        <div ref={scrollElRef} className="docs-scroll flex-1 min-w-0 pb-32 lg:pb-24 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-6 sm:px-10">

          {/* Introduction */}
          <article id={INTRO_ID} className="scroll-mt-4 py-12 sm:py-16 border-b border-[rgb(var(--line))]">
              <p className="text-[14px] tracking-tight mb-4 font-medium" style={{ color: rgba(product.accent, 1) }}>
                {product.name}
              </p>
              <h1 className="text-[2.2rem] font-medium tracking-tight leading-tight text-[rgb(var(--fg))] mb-4">
                {product.id === "aether" ? "Aether documentation" : "Inertia documentation"}
              </h1>
              <p className="text-[17px] leading-[1.85] tracking-tight mb-8 text-[rgb(var(--fg))]" style={{ opacity: 0.7 }}>
                {product.id === "aether"
                  ? "Aether is a Shopify theme built for conversion. This documentation covers everything from installation to advanced customization. Whether you're setting it up for the first time or modifying theme files, start here."
                  : "Inertia is a small design and development studio. This documentation covers our services, how we work, and what to expect when working with us."}
              </p>

              {/* Quick start cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {product.sections.slice(0, 4).map((section) => {
                  const first = section.articles[0];
                  return (
                    <a
                      key={section.id}
                      href={`#${first.id}`}
                      className="group flex flex-col gap-1.5 p-4 rounded-xl border border-[rgb(var(--line))] transition-all hover:border-[rgb(var(--fg)/0.25)] hover:bg-[rgb(var(--fg)/0.03)] hover:shadow-sm"
                      style={{ background: "rgb(var(--fg) / 0.02)" }}
                    >
                      <span className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))]">{section.title}</span>
                      <span className="text-[13px] tracking-tight leading-snug" style={{ color: "rgb(var(--muted))", opacity: 0.65 }}>
                        {section.articles.length} {section.articles.length === 1 ? "article" : "articles"}
                      </span>
                      <span className="text-[13px] tracking-tight mt-1 transition-colors" style={{ color: rgba(product.accent, 0.9) }}>
                        Start with {first.title} →
                      </span>
                    </a>
                  );
                })}
              </div>

              {product.id === "aether" && (
                <Link href="/aether#pricing" className="inline-flex items-center gap-1.5 rounded-[6px] px-4 py-2 text-[13px] font-medium tracking-tight transition-opacity hover:opacity-80" style={{ background: rgba(product.accent, 0.12), color: rgba(product.accent, 1) }}>
                  Get Aether
                </Link>
              )}
          </article>

          {/* Articles */}
          {product.sections.map((section) =>
            section.articles.map((article) => (
              <article
                key={article.id}
                id={article.id}
                className="scroll-mt-4 py-10 sm:py-14 border-b border-[rgb(var(--line))]"
              >
                <div>
                  <p className="text-[14px] tracking-tight mb-3 font-medium" style={{ color: rgba(product.accent, 1) }}>
                    {section.title}
                  </p>
                  <h2 className="text-[1.75rem] font-medium tracking-tight leading-tight text-[rgb(var(--fg))] mb-8">
                    {article.title}
                  </h2>
                  <ArticleBody body={article.body} accent={product.accent} />
                </div>
              </article>
            ))
          )}
          {/* End of docs */}
          <div className="flex flex-col items-center gap-5 py-20 text-center">
            <div className="w-8 h-px" style={{ background: "rgb(var(--line))" }} />
            <p className="text-[15px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.5 }}>
              You've reached the end of the {product.name} docs.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] tracking-tight transition-all hover:opacity-80"
              style={{ background: "rgb(var(--fg) / 0.06)", border: "1px solid rgb(var(--line))", color: "rgb(var(--muted))" }}
            >
              <ArrowUpIcon />
              Back to top
            </button>
          </div>
          </div>
        </div>
      </div>


    </div>

    {mounted && createPortal(<>
      {/* Back to top — hide when near bottom where inline button is visible */}
      {scrolled && !nearBottom && !sheetOpen && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed z-40 flex items-center justify-center text-[15px] [-webkit-tap-highlight-color:transparent] transition-opacity hover:opacity-70"
          style={{
            bottom: 24,
            right: 24,
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "rgb(var(--fg) / 0.08)",
            border: "1px solid rgb(var(--line))",
            color: "rgb(var(--fg))",
          }}
          aria-label="Back to top"
        >
          <ArrowUpIcon className="size-[1em]" />
        </button>
      )}

      {/* Nudge notification — bottom-left on mobile, centered on desktop */}
      <div
        className={`fixed bottom-7 left-6 lg:left-1/2 z-50 flex items-center gap-2.5 px-3.5 py-2.5 rounded-[14px] border border-[rgb(var(--line))] bg-[rgb(var(--surface))] shadow-[0_8px_32px_rgba(0,0,0,0.12)] whitespace-nowrap transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] lg:-translate-x-1/2 ${
          showNudge && !nudgeDismissed
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <Link
          href="/"
          className="text-[13px] tracking-tight text-[rgb(var(--fg))]"
          style={{ opacity: 0.75 }}
          onClick={() => setNudgeDismissed(true)}
        >
          Done reading? Head back to the site →
        </Link>
        <button
          onClick={() => { setShowNudge(false); setNudgeDismissed(true); }}
          className="flex items-center justify-center shrink-0"
          style={{ color: "rgb(var(--muted))", opacity: 0.4 }}
          aria-label="Dismiss"
        >
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-3 h-3">
            <line x1="2" y1="2" x2="10" y2="10" /><line x1="10" y1="2" x2="2" y2="10" />
          </svg>
        </button>
      </div>

      {/* Fixed mobile menu button */}
      {!sheetOpen && (
        <button
          onClick={() => setSheetOpen(true)}
          className="lg:hidden fixed z-40 flex flex-col gap-[5px] items-center justify-center [-webkit-tap-highlight-color:transparent]"
          style={{
            top: 10,
            right: 16,
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "rgb(var(--fg) / 0.08)",
          }}
          aria-label="Open navigation"
        >
          <span className="block h-px" style={{ width: 16, background: "rgb(var(--fg))" }} />
          <span className="block h-px" style={{ width: 16, background: "rgb(var(--fg))" }} />
        </button>
      )}

      {/* Search modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
        >
          <div
            ref={searchRef}
            className="w-full max-w-2xl mx-4 mt-[10vh] rounded-xl overflow-hidden flex flex-col"
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
              maxHeight: "72vh",
            }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-5 py-4">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0" style={{ color: "rgba(0,0,0,0.3)" }} aria-hidden="true">
                <circle cx="6.5" cy="6.5" r="4" /><path d="M11 11l2.5 2.5" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documentation..."
                className="flex-1 bg-transparent text-[15px] tracking-tight outline-none"
                style={{ color: "rgba(0,0,0,0.8)", caretColor: "black" }}
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{ color: "rgba(0,0,0,0.3)" }}
                  className="hover:text-black transition-colors"
                  aria-label="Clear"
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-3.5 h-3.5">
                    <line x1="12" y1="4" x2="4" y2="12" /><line x1="4" y1="4" x2="12" y2="12" />
                  </svg>
                </button>
              ) : (
                <span
                  className="text-[11px] tracking-tight px-1.5 py-0.5 rounded"
                  style={{ color: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,0,0,0.12)" }}
                >
                  Esc
                </span>
              )}
            </div>

            <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }} />

            {/* Results list */}
            <div className="overflow-y-auto flex-1 py-3">
              {searchQuery.trim().length === 0 ? (
                PRODUCTS.map((p) => (
                  <div key={p.id} className="mb-2">
                    <p
                      className="text-[11px] tracking-tight font-medium px-5 py-2"
                      style={{ color: "rgba(0,0,0,0.4)" }}
                    >
                      {p.name}
                    </p>
                    {p.sections.flatMap((s) => s.articles).slice(0, 4).map((a) => (
                      <button
                        key={a.id}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery("");
                          setActiveProductId(p.id);
                          setTimeout(() => document.getElementById(a.id)?.scrollIntoView({ behavior: "smooth" }), 80);
                        }}
                        className="flex items-center gap-3 w-full text-left px-5 py-2.5 transition-colors"
                        style={{ color: "rgba(0,0,0,0.78)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.045)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0" style={{ color: "rgba(0,0,0,0.3)" }} aria-hidden="true">
                          <rect x="3" y="2" width="10" height="12" rx="1.5" />
                          <line x1="5.5" y1="6" x2="10.5" y2="6" />
                          <line x1="5.5" y1="9" x2="9" y2="9" />
                        </svg>
                        <span className="text-[13.5px] tracking-tight">{a.title}</span>
                      </button>
                    ))}
                  </div>
                ))
              ) : searchResults.length === 0 ? (
                <p className="px-5 py-8 text-[13px] tracking-tight text-center" style={{ color: "rgba(0,0,0,0.35)" }}>
                  No results for &ldquo;{searchQuery}&rdquo;
                </p>
              ) : (
                searchResults.map((r) => {
                  const p = PRODUCTS.find((p) => p.id === r.productId)!;
                  return (
                    <button
                      key={r.articleId}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery("");
                        setActiveProductId(r.productId);
                        setTimeout(() => document.getElementById(r.articleId)?.scrollIntoView({ behavior: "smooth" }), 80);
                      }}
                      className="flex items-start gap-3 w-full text-left px-5 py-3 transition-colors"
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.045)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0 mt-[3px]" style={{ color: "rgba(0,0,0,0.3)" }} aria-hidden="true">
                        <rect x="3" y="2" width="10" height="12" rx="1.5" />
                        <line x1="5.5" y1="6" x2="10.5" y2="6" />
                        <line x1="5.5" y1="9" x2="9" y2="9" />
                      </svg>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-[13.5px] tracking-tight" style={{ color: "rgba(0,0,0,0.75)" }}>{r.articleTitle}</span>
                        <span className="text-[11.5px] tracking-tight" style={{ color: "rgba(0,0,0,0.32)" }}>{r.productName} / {r.sectionTitle}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile nav backdrop */}
      {sheetOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setSheetOpen(false)}
          className="fixed inset-0 z-[49] lg:hidden bg-[rgb(var(--fg)/0.14)] backdrop-blur-md [-webkit-tap-highlight-color:transparent]"
        />
      )}

      {/* Mobile floating nav */}
      <div
        className="fixed z-50 lg:hidden flex flex-col max-h-[calc(100dvh-24px)] overflow-hidden"
        style={{
          top: 12,
          left: 12,
          right: 12,
          background: "rgb(var(--surface))",
          border: "1px solid rgb(var(--line))",
          borderRadius: "20px",
          display: sheetOpen ? "flex" : "none",
          boxShadow: "0 20px 60px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.12)",
        }}
      >
        {/* Header */}
        <div className="shrink-0 px-4 pt-4 pb-3 flex flex-col gap-3">
          {/* Top row: logo + close */}
          <div className="flex items-center justify-between">
            <Link href="/" onClick={() => setSheetOpen(false)}>
              <img src="/logo.png" alt="Inertia" className="h-6 w-auto" />
            </Link>
            <button
              onClick={() => setSheetOpen(false)}
              className="h-8 w-8 flex items-center justify-center rounded-full [-webkit-tap-highlight-color:transparent]"
              style={{ background: "rgb(var(--fg) / 0.06)" }}
              aria-label="Close"
            >
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="h-3.5 w-3.5 text-[rgb(var(--fg))]">
                <line x1="2" y1="2" x2="12" y2="12" /><line x1="12" y1="2" x2="2" y2="12" />
              </svg>
            </button>
          </div>

          {/* Product tabs */}
          <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: "rgb(var(--fg) / 0.05)" }}>
            {PRODUCTS.map((p) => {
              const active = p.id === activeProductId;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectProduct(p.id)}
                  className="flex-1 py-1.5 rounded-lg text-[13px] font-medium tracking-tight transition-all [-webkit-tap-highlight-color:transparent]"
                  style={{
                    background: active ? "rgb(var(--surface))" : "transparent",
                    color: active ? rgba(p.accent, 1) : "rgb(var(--fg))",
                    opacity: active ? 1 : 0.45,
                    boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  {p.name}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <button
            onClick={() => { setSheetOpen(false); setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 50); }}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[rgb(var(--line))] w-full text-left [-webkit-tap-highlight-color:transparent]"
            style={{ background: "rgb(var(--bg))" }}
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0 text-[rgb(var(--muted))]" aria-hidden="true">
              <circle cx="6.5" cy="6.5" r="4" /><path d="M11 11l2.5 2.5" />
            </svg>
            <span className="text-[13.5px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.5 }}>Search docs...</span>
            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded border border-[rgb(var(--line))] text-[rgb(var(--muted))]" style={{ opacity: 0.4 }}>⌘K</span>
          </button>
        </div>

        <div className="h-px mx-4 shrink-0" style={{ background: "rgb(var(--line))" }} />

        {/* Nav — content height by default; scrolls only when list exceeds viewport */}
        <div
          className="overflow-y-auto px-4 py-4 flex flex-col gap-1 max-h-[calc(100dvh-24px-11.5rem)] overscroll-contain"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)" }}
        >
          <SidebarNavLink
            href={`#${INTRO_ID}`}
            active={activeArticleId === INTRO_ID}
            accent={product.accent}
            onClick={() => setSheetOpen(false)}
            className="text-[14px] tracking-tight [-webkit-tap-highlight-color:transparent]"
            rounded="rounded-xl"
          >
            Introduction
          </SidebarNavLink>

          {product.sections.map((section) => (
            <div key={section.id} className="flex flex-col mt-4">
              <p className="text-[11px] tracking-tight font-semibold px-3 mb-1" style={{ color: "rgb(var(--fg))", opacity: 0.35 }}>
                {section.title}
              </p>
              {section.articles.map((article) => {
                const active = activeArticleId === article.id;
                return (
                  <SidebarNavLink
                    key={article.id}
                    href={`#${article.id}`}
                    active={active}
                    accent={product.accent}
                    onClick={() => setSheetOpen(false)}
                    className="text-[14px] tracking-tight [-webkit-tap-highlight-color:transparent]"
                    rounded="rounded-xl"
                  >
                    {article.title}
                  </SidebarNavLink>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>, document.body)}
    </>
  );
}

export default function DocsPage() {
  return (
    <React.Suspense>
      <DocsPageInner />
    </React.Suspense>
  );
}

