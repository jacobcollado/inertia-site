"use client";

import React from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import type { WorkMeta } from "@/lib/work";

const TABS = [
  { label: "All", test: (_: WorkMeta) => true },
  { label: "Shopify", test: (w: WorkMeta) => !!w.service && /shopify/i.test(w.service) },
  { label: "Custom", test: (w: WorkMeta) => !!w.service && /custom|e-commerce|ecommerce|merch/i.test(w.service) && !/shopify/i.test(w.service) },
  { label: "Brand", test: (w: WorkMeta) => !!w.service && /logo|brand|identity|portfolio/i.test(w.service) },
];

export function PastWork({ work }: { work: WorkMeta[] }) {
  const [tab, setTab] = useState(0);
  const filtered = work.filter(TABS[tab].test);

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-[rgb(var(--line))]">
        {TABS.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setTab(i)}
            className={`relative py-3 text-[12px] tracking-tight transition-colors duration-150 px-5`}
            style={{
              color: tab === i ? "rgb(var(--fg))" : "rgb(var(--muted))",
              borderRight: i < TABS.length - 1 ? "1px solid rgb(var(--line))" : undefined,
            }}
          >
            {t.label}
            {tab === i && (
              <span className="absolute inset-x-0 bottom-0 h-px bg-[rgb(var(--fg))]" style={{ opacity: 0.36 }} />
            )}
          </button>
        ))}
      </div>

      <div className="hidden sm:block">
        <BlueprintCanvas work={filtered} />
      </div>
      <div className="sm:hidden">
        <MobileCarousel work={filtered} />
      </div>
    </div>
  );
}

/* ── Blueprint types ─────────────────────────────────────────────── */

type Placement = {
  cx: number; // center x, 0-1 fraction of canvas width
  cy: number; // center y, 0-1 fraction of canvas height
  annotationSide: "left" | "right";
  annotationY: number; // 0-1 fraction
};

// Fixed placements for up to 6 projects. Staggered, never overlapping.
const PLACEMENTS: Placement[] = [
  { cx: 0.22, cy: 0.20, annotationSide: "left",  annotationY: 0.16 },
  { cx: 0.68, cy: 0.16, annotationSide: "right", annotationY: 0.12 },
  { cx: 0.44, cy: 0.52, annotationSide: "right", annotationY: 0.50 },
  { cx: 0.18, cy: 0.72, annotationSide: "left",  annotationY: 0.70 },
  { cx: 0.74, cy: 0.62, annotationSide: "right", annotationY: 0.60 },
  { cx: 0.50, cy: 0.84, annotationSide: "left",  annotationY: 0.84 },
];

const CARD_W = 148;
const CARD_H = 96;
const CANVAS_H = 520;

// Mobile carousel: card size and strip layout
const M_CARD_W = 120;
const M_CARD_H = 78;
const M_CANVAS_H = 280;
const M_COL_W = 200; // width each project occupies in the strip

/* ── Desktop blueprint canvas ────────────────────────────────────── */

function BlueprintCanvas({ work }: { work: WorkMeta[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [active, setActive] = useState<WorkMeta | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.offsetWidth));
    ro.observe(el);
    setWidth(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  const items = work.slice(0, PLACEMENTS.length);

  return (
    <>
      <div
        ref={containerRef}
        className="relative border-b border-[rgb(var(--line))] overflow-hidden"
        style={{ height: CANVAS_H }}
      >
        {/* SVG layer: connector lines */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={width}
          height={CANVAS_H}
          aria-hidden="true"
        >
          {items.map((w, i) => {
            const p = PLACEMENTS[i];
            const cx = p.cx * width;
            const cy = p.cy * CANVAS_H;
            const isHovered = hovered === w.slug;
            const dimmed = hovered !== null && !isHovered;
            const annotX = p.annotationSide === "left" ? 28 : width - 28;
            const annotY = p.annotationY * CANVAS_H;
            const cardLeft = cx - CARD_W / 2;
            const cardRight = cx + CARD_W / 2;
            const cardTop = cy - CARD_H / 2;
            const cardBottom = cy + CARD_H / 2;
            const lineX2 = p.annotationSide === "left" ? cardLeft : cardRight;
            const lineY2 = annotY < cardTop ? cardTop : annotY > cardBottom ? cardBottom : cy;

            return (
              <g key={w.slug} style={{ opacity: dimmed ? 0.2 : 1, transition: "opacity 200ms" }}>
                <line
                  x1={p.annotationSide === "left" ? annotX - 4 : annotX + 4}
                  y1={annotY} x2={annotX} y2={annotY}
                  stroke="rgb(var(--fg))" strokeWidth={0.75}
                  strokeOpacity={isHovered ? 0.7 : 0.3}
                />
                <line
                  x1={annotX} y1={annotY} x2={lineX2} y2={lineY2}
                  stroke="rgb(var(--fg))" strokeWidth={0.75}
                  strokeOpacity={isHovered ? 0.55 : 0.2}
                  strokeDasharray={isHovered ? "none" : "3 3"}
                />
              </g>
            );
          })}
        </svg>

        {/* Cards + annotations */}
        {items.map((w, i) => {
          const p = PLACEMENTS[i];
          const cx = p.cx * width;
          const cy = p.cy * CANVAS_H;
          const isHovered = hovered === w.slug;
          const dimmed = hovered !== null && !isHovered;
          const annotY = p.annotationY * CANVAS_H;

          return (
            <React.Fragment key={w.slug}>
              <div
                className="absolute pointer-events-none"
                style={{
                  left: p.annotationSide === "left" ? 0 : undefined,
                  right: p.annotationSide === "right" ? 0 : undefined,
                  top: annotY,
                  transform: "translateY(-50%)",
                  opacity: dimmed ? 0.15 : 1,
                  transition: "opacity 200ms",
                  paddingLeft: p.annotationSide === "left" ? 6 : undefined,
                  paddingRight: p.annotationSide === "right" ? 6 : undefined,
                  textAlign: p.annotationSide === "right" ? "right" : "left",
                  maxWidth: Math.min(p.annotationSide === "left" ? cx - CARD_W / 2 - 40 : width - (cx + CARD_W / 2) - 40, 140),
                  minWidth: 80,
                }}
              >
                <div className="text-[10px] tracking-tight leading-tight tabular-nums"
                  style={{ color: "rgb(var(--muted))", opacity: isHovered ? 0.9 : 0.45 }}>
                  {w.year?.match(/\d{4}/)?.[0]}
                </div>
                <div className="text-[11px] font-medium tracking-tight leading-tight"
                  style={{ color: "rgb(var(--fg))", opacity: isHovered ? 1 : 0.65 }}>
                  {w.client}
                </div>
                <div className="text-[10px] tracking-tight leading-tight mt-0.5"
                  style={{ color: "rgb(var(--muted))", opacity: isHovered ? 0.7 : 0.3 }}>
                  {serviceTag(w.service)}
                </div>
              </div>

              <button
                onClick={() => setActive(w)}
                onMouseEnter={() => setHovered(w.slug)}
                onMouseLeave={() => setHovered(null)}
                className="absolute group"
                style={{
                  left: cx - CARD_W / 2, top: cy - CARD_H / 2,
                  width: CARD_W, height: CARD_H,
                  opacity: dimmed ? 0.15 : 1,
                  transition: "opacity 200ms, transform 200ms",
                  transform: isHovered ? "scale(1.03)" : "scale(1)",
                }}
                aria-label={w.client}
              >
                <CardInner work={w} hovered={isHovered} />
              </button>
            </React.Fragment>
          );
        })}
      </div>
      {active && <WorkSheet item={active} onClose={() => setActive(null)} />}
    </>
  );
}

/* ── Mobile carousel canvas ──────────────────────────────────────── */

// Each project gets a column in the strip. Cards are vertically staggered.
const M_STAGGER = [0.18, 0.42, 0.22, 0.52, 0.30, 0.44]; // cy fraction per slot

function MobileCarousel({ work }: { work: WorkMeta[] }) {
  const [active, setActive] = useState<WorkMeta | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; startOffset: number; dragging: boolean } | null>(null);
  const offsetRef = useRef(0);
  // velocity for momentum flick
  const velRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTRef = useRef(0);
  const rafRef = useRef(0);

  const items = work.slice(0, 6);
  const STRIP_W = items.length * M_COL_W + 60;

  const clamp = (v: number) => {
    const vw = viewportRef.current?.offsetWidth ?? 0;
    return Math.max(Math.min(v, 0), -(STRIP_W - vw));
  };

  // Apply offset directly to DOM — no React re-render
  const applyOffset = (v: number) => {
    offsetRef.current = v;
    if (stripRef.current) stripRef.current.style.transform = `translateX(${v}px)`;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    cancelAnimationFrame(rafRef.current);
    dragState.current = { startX: e.clientX, startOffset: offsetRef.current, dragging: false };
    velRef.current = 0;
    lastXRef.current = e.clientX;
    lastTRef.current = e.timeStamp;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    if (!dragState.current.dragging && Math.abs(dx) > 4) dragState.current.dragging = true;
    if (!dragState.current.dragging) return;
    const dt = e.timeStamp - lastTRef.current || 1;
    velRef.current = (e.clientX - lastXRef.current) / dt;
    lastXRef.current = e.clientX;
    lastTRef.current = e.timeStamp;
    applyOffset(clamp(dragState.current.startOffset + dx));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragState.current) return;
    const wasDragging = dragState.current.dragging;
    dragState.current = null;
    if (!wasDragging) return;
    // Momentum flick
    let vel = velRef.current * 14;
    const decay = () => {
      vel *= 0.88;
      if (Math.abs(vel) < 0.5) return;
      applyOffset(clamp(offsetRef.current + vel));
      rafRef.current = requestAnimationFrame(decay);
    };
    rafRef.current = requestAnimationFrame(decay);
  };

  return (
    <>
      <div
        ref={viewportRef}
        className="relative border-b border-[rgb(var(--line))] overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ height: M_CANVAS_H, touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Panning strip — transform driven imperatively, no React state */}
        <div
          ref={stripRef}
          className="absolute top-0 left-0 h-full"
          style={{ width: STRIP_W }}
        >
          {/* SVG connector lines */}
          <svg className="absolute inset-0 pointer-events-none" width={STRIP_W} height={M_CANVAS_H} aria-hidden="true">
            {items.map((w, i) => {
              const cx = 30 + i * M_COL_W + M_COL_W / 2;
              const cy = M_STAGGER[i] * M_CANVAS_H + M_CARD_H / 2;
              // annotation below card
              const annotY = cy + M_CARD_H / 2 + 18;
              return (
                <g key={w.slug}>
                  <line
                    x1={cx} y1={cy + M_CARD_H / 2}
                    x2={cx} y2={annotY - 4}
                    stroke="rgb(var(--fg))" strokeWidth={0.75} strokeOpacity={0.2} strokeDasharray="3 3"
                  />
                  <line
                    x1={cx - 4} y1={annotY} x2={cx + 4} y2={annotY}
                    stroke="rgb(var(--fg))" strokeWidth={0.75} strokeOpacity={0.3}
                  />
                </g>
              );
            })}
          </svg>

          {/* Cards */}
          {items.map((w, i) => {
            const cx = 30 + i * M_COL_W + M_COL_W / 2;
            const cy = M_STAGGER[i] * M_CANVAS_H;
            const annotY = cy + M_CARD_H / 2 + 22;

            return (
              <React.Fragment key={w.slug}>
                {/* Card */}
                <button
                  onClick={() => setActive(w)}
                  className="absolute"
                  style={{ left: cx - M_CARD_W / 2, top: cy, width: M_CARD_W, height: M_CARD_H }}
                  aria-label={w.client}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <CardInner work={w} hovered={false} />
                </button>
                {/* Annotation below */}
                <div
                  className="absolute pointer-events-none"
                  style={{ left: cx - M_COL_W / 2 + 8, top: annotY, width: M_COL_W - 16, textAlign: "center" }}
                >
                  <div className="text-[9px] tracking-tight tabular-nums"
                    style={{ color: "rgb(var(--muted))", opacity: 0.4 }}>
                    {w.year?.match(/\d{4}/)?.[0]}
                  </div>
                  <div className="text-[10px] font-medium tracking-tight"
                    style={{ color: "rgb(var(--fg))", opacity: 0.7 }}>
                    {w.client}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Edge fade — right */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12"
          style={{ background: "linear-gradient(to right, transparent, rgb(var(--bg)))" }} aria-hidden="true" />
      </div>
      {active && <WorkSheet item={active} onClose={() => setActive(null)} />}
    </>
  );
}

/* ── Shared card inner ───────────────────────────────────────────── */

function CardInner({ work, hovered }: { work: WorkMeta; hovered: boolean }) {
  return (
    <div className="relative w-full h-full">
      <div
        className="w-full h-full overflow-hidden"
        style={{
          border: "1px solid rgb(var(--line))",
          borderColor: hovered ? "rgba(var(--fg), 0.3)" : "rgb(var(--line))",
          transition: "border-color 200ms",
          background: "rgb(var(--bg))",
        }}
      >
        <MockupSVG work={work} hovered={hovered} />
      </div>
      {/* Corner tick marks */}
      {([
        { top: -4, left: -4, w: 6, h: 1 }, { top: -4, left: -4, w: 1, h: 6 },
        { top: -4, right: -4, w: 6, h: 1 }, { top: -4, right: -4, w: 1, h: 6 },
        { bottom: -4, left: -4, w: 6, h: 1 }, { bottom: -4, left: -4, w: 1, h: 6 },
        { bottom: -4, right: -4, w: 6, h: 1 }, { bottom: -4, right: -4, w: 1, h: 6 },
      ] as { top?: number; bottom?: number; left?: number; right?: number; w: number; h: number }[]).map((tick, ti) => (
        <div
          key={ti}
          className="absolute pointer-events-none"
          aria-hidden="true"
          style={{
            top: tick.top, bottom: tick.bottom,
            left: tick.left, right: tick.right,
            width: tick.w, height: tick.h,
            background: "rgb(var(--fg))",
            opacity: hovered ? 0.5 : 0.2,
            transition: "opacity 200ms",
          }}
        />
      ))}
    </div>
  );
}

/* ── SVG mockups ─────────────────────────────────────────────────── */

function MockupSVG({ work, hovered }: { work: WorkMeta; hovered: boolean }) {
  const type = getProjectType(work);
  const fg = "rgb(var(--fg))";
  const muted = "rgb(var(--muted))";

  if (type === "brand") return <BrandMockup hovered={hovered} fg={fg} muted={muted} palette={work.palette} />;
  if (type === "custom") return <CustomMockup hovered={hovered} fg={fg} muted={muted} palette={work.palette} />;
  return <StorefrontMockup hovered={hovered} fg={fg} muted={muted} palette={work.palette} />;
}

function getProjectType(w: WorkMeta): "shopify" | "custom" | "brand" {
  const s = w.service ?? "";
  if (/logo|brand|identity|portfolio/i.test(s)) return "brand";
  if (/custom|e-commerce|ecommerce|merch/i.test(s) && !/shopify/i.test(s)) return "custom";
  return "shopify";
}

// Shopify storefront mockup: nav bar, hero image area, product row
function StorefrontMockup({ hovered, fg, muted, palette }: { hovered: boolean; fg: string; muted: string; palette?: string[] }) {
  const accent = palette?.[1] ?? "#333";
  return (
    <svg viewBox="0 0 148 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Nav */}
      <rect x="0" y="0" width="148" height="14" fill={fg} fillOpacity="0.04" />
      <rect x="6" y="5" width="18" height="4" rx="1" fill={fg} fillOpacity={hovered ? 0.4 : 0.2} />
      <rect x="108" y="5" width="10" height="4" rx="1" fill={fg} fillOpacity="0.12" />
      <rect x="122" y="5" width="10" height="4" rx="1" fill={fg} fillOpacity="0.12" />
      <rect x="136" y="5" width="6" height="4" rx="1" fill={fg} fillOpacity="0.12" />
      {/* Hero */}
      <rect x="0" y="14" width="148" height="38" fill={fg} fillOpacity="0.04" />
      <rect x="6" y="22" width="50" height="5" rx="1" fill={fg} fillOpacity={hovered ? 0.35 : 0.18} />
      <rect x="6" y="31" width="36" height="4" rx="1" fill={fg} fillOpacity="0.1" />
      <rect x="6" y="40" width="22" height="7" rx="1.5" fill={accent} fillOpacity={hovered ? 0.8 : 0.5} />
      {/* Product grid */}
      {[0, 1, 2].map((j) => (
        <g key={j}>
          <rect x={6 + j * 48} y="58" width="42" height="28" rx="1" fill={fg} fillOpacity="0.05" stroke={fg} strokeOpacity="0.08" strokeWidth="0.5" />
          <rect x={6 + j * 48} y="58" width="42" height="18" rx="1" fill={fg} fillOpacity={hovered ? 0.1 : 0.06} />
          <rect x={8 + j * 48} y="79" width="20" height="3" rx="0.5" fill={fg} fillOpacity="0.15" />
          <rect x={8 + j * 48} y="83" width="12" height="2.5" rx="0.5" fill={fg} fillOpacity="0.08" />
        </g>
      ))}
    </svg>
  );
}

// Custom build mockup: fullscreen hero, minimal nav, large type
function CustomMockup({ hovered, fg, muted, palette }: { hovered: boolean; fg: string; muted: string; palette?: string[] }) {
  const accent = palette?.[2] ?? "#ff3366";
  return (
    <svg viewBox="0 0 148 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Full bleed bg suggestion */}
      <rect x="0" y="0" width="148" height="96" fill={fg} fillOpacity="0.03" />
      {/* Minimal nav */}
      <rect x="6" y="7" width="14" height="3" rx="0.5" fill={fg} fillOpacity={hovered ? 0.4 : 0.2} />
      <rect x="130" y="7" width="12" height="3" rx="0.5" fill={fg} fillOpacity="0.15" />
      {/* Large editorial type lines */}
      <rect x="6" y="22" width="76" height="7" rx="1" fill={fg} fillOpacity={hovered ? 0.3 : 0.15} />
      <rect x="6" y="33" width="56" height="7" rx="1" fill={fg} fillOpacity={hovered ? 0.25 : 0.1} />
      <rect x="6" y="44" width="66" height="7" rx="1" fill={fg} fillOpacity={hovered ? 0.2 : 0.08} />
      {/* Accent stripe */}
      <rect x="6" y="58" width="4" height="24" rx="0.5" fill={accent} fillOpacity={hovered ? 0.7 : 0.4} />
      {/* Body text lines */}
      <rect x="16" y="59" width="48" height="2.5" rx="0.5" fill={fg} fillOpacity="0.1" />
      <rect x="16" y="64" width="40" height="2.5" rx="0.5" fill={fg} fillOpacity="0.08" />
      <rect x="16" y="69" width="52" height="2.5" rx="0.5" fill={fg} fillOpacity="0.08" />
      {/* CTA */}
      <rect x="16" y="76" width="30" height="7" rx="1" fill={fg} fillOpacity={hovered ? 0.18 : 0.1} stroke={fg} strokeOpacity="0.15" strokeWidth="0.5" />
    </svg>
  );
}

// Brand / identity mockup: logo mark area, color swatches, type specimen
function BrandMockup({ hovered, fg, muted, palette }: { hovered: boolean; fg: string; muted: string; palette?: string[] }) {
  const swatches = palette?.slice(0, 5) ?? ["#0a0a0a", "#f5f5f5", "#888"];
  return (
    <svg viewBox="0 0 148 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Logo area */}
      <rect x="6" y="8" width="58" height="44" rx="1" fill={fg} fillOpacity="0.04" stroke={fg} strokeOpacity="0.1" strokeWidth="0.5" />
      {/* Abstract mark */}
      <circle cx="35" cy="30" r={hovered ? 11 : 10} fill={fg} fillOpacity={hovered ? 0.18 : 0.1} style={{ transition: "all 200ms" }} />
      <rect x="30" y="25" width="10" height="10" rx="5" fill="none" stroke={fg} strokeOpacity={hovered ? 0.45 : 0.25} strokeWidth="1.2" style={{ transition: "all 200ms" }} />
      <line x1="35" y1="20" x2="35" y2="40" stroke={fg} strokeOpacity={hovered ? 0.3 : 0.15} strokeWidth="0.8" />
      <line x1="25" y1="30" x2="45" y2="30" stroke={fg} strokeOpacity={hovered ? 0.3 : 0.15} strokeWidth="0.8" />
      {/* Type specimen */}
      <rect x="6" y="58" width="40" height="6" rx="1" fill={fg} fillOpacity={hovered ? 0.3 : 0.15} />
      <rect x="6" y="67" width="28" height="4" rx="0.5" fill={fg} fillOpacity="0.08" />
      <rect x="6" y="73" width="34" height="4" rx="0.5" fill={fg} fillOpacity="0.08" />
      <rect x="6" y="79" width="22" height="4" rx="0.5" fill={fg} fillOpacity="0.06" />
      {/* Swatches */}
      <rect x="74" y="8" width="68" height="44" rx="1" fill={fg} fillOpacity="0.02" stroke={fg} strokeOpacity="0.08" strokeWidth="0.5" />
      {swatches.slice(0, 4).map((col, i) => (
        <rect
          key={i}
          x={74 + i * 17}
          y="8"
          width="17"
          height="44"
          fill={col}
          fillOpacity={hovered ? 0.85 : 0.6}
          style={{ transition: "fill-opacity 200ms" }}
        />
      ))}
      {/* Palette label */}
      <rect x="74" y="58" width="68" height="3" rx="0.5" fill={fg} fillOpacity="0.08" />
      <rect x="74" y="64" width="44" height="3" rx="0.5" fill={fg} fillOpacity="0.06" />
    </svg>
  );
}


/* ── Helpers ─────────────────────────────────────────────────────── */

function yearKey(year: string | undefined): string {
  if (!year) return "—";
  const m = year.match(/\d{4}/);
  return m ? m[0] : year;
}

function serviceTag(service: string | undefined): string {
  if (!service) return "";
  const stripped = service.replace(/^An?\s+/i, "").replace(/\s+for\s+.+$/i, "").trim();
  return stripped.replace(/\b\w/g, (c) => c.toUpperCase());
}

function cleanSummary(text: string): string {
  return text.replace(/—/g, ",").replace(/\s*,\s*/g, ", ").replace(/,\s*,/g, ",");
}

/* ── Highlight key phrases ───────────────────────────────────────── */

const HIGHLIGHT_TERMS = [
  "under 24 hours", "24 hours", "midnight", "no templates",
  "immersive", "editorial", "pixel-close", "custom animations", "product configurator",
  "bespoke", "mobile experience", "seamless",
  "wordmark", "colour system", "visual identity",
  "sold-out", "sold out", "headless Shopify", "Next.js",
  "72-hour", "mobile-first",
];

function highlightSummary(text: string): string {
  let out = text;
  for (const term of HIGHLIGHT_TERMS) {
    const re = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    out = out.replace(re, "<strong>$1</strong>");
  }
  return out;
}

/* ── Swatch row ──────────────────────────────────────────────────── */

function SwatchRow({ colors }: { colors: string[] }) {
  const [copied, setCopied] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const copy = useCallback((hex: string) => {
    navigator.clipboard.writeText(hex).then(() => {
      setCopied(hex);
      setTimeout(() => setCopied(null), 1400);
    });
  }, []);

  return (
    <div className="sheet__palette">
      {colors.map((color) => (
        <button
          key={color}
          className="sheet__swatch"
          style={{ background: color }}
          onClick={() => copy(color)}
          onMouseEnter={() => setHovered(color)}
          onMouseLeave={() => setHovered(null)}
          title={color}
          aria-label={`Copy ${color}`}
        >
          <span className="sheet__swatch-label">
            {copied === color ? "copied" : hovered === color ? color : ""}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ── Work sheet ──────────────────────────────────────────────────── */

const DRAG_CLOSE_THRESHOLD = 90;

function WorkSheet({ item, onClose }: { item: WorkMeta; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragCurrent = useRef(0);
  const dragging = useRef(false);

  const gallery = [
    ...(item.cover ? [item.cover] : []),
    ...(item.images ?? []).filter((src) => src !== item.cover),
  ];

  useEffect(() => { setMounted(true); }, []);

  // Lock page scroll while open; intercept wheel on scroll container so Lenis never sees it
  useEffect(() => {
    if (!mounted) return;
    window.dispatchEvent(new Event("lenis:lock"));
    document.body.classList.add("sheet-open");

    const el = scrollRef.current;
    // Stop wheel events reaching Lenis (desktop)
    const onWheel = (e: WheelEvent) => { e.stopPropagation(); };
    el?.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      window.dispatchEvent(new Event("lenis:unlock"));
      document.body.classList.remove("sheet-open");
      el?.removeEventListener("wheel", onWheel);
    };
  }, [mounted]);

  // Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") triggerClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const handleZoneRef = useRef<HTMLDivElement>(null);

  const triggerClose = () => {
    setClosing(true);
    setTimeout(onClose, 340);
  };

  const setSheetY = (y: number) => {
    if (sheetRef.current) sheetRef.current.style.transform = `translateY(${y}px)`;
  };

  // Native touch drag-to-dismiss on handle zone — avoids React synthetic event issues on iOS
  useEffect(() => {
    if (!mounted) return;
    const el = handleZoneRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      dragging.current = true;
      dragStartY.current = e.touches[0].clientY;
      dragCurrent.current = 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current) return;
      const dy = Math.max(0, e.touches[0].clientY - dragStartY.current);
      dragCurrent.current = dy;
      setSheetY(dy);
    };

    const onTouchEnd = () => {
      if (!dragging.current) return;
      dragging.current = false;
      if (dragCurrent.current > DRAG_CLOSE_THRESHOLD) {
        triggerClose();
      } else {
        if (sheetRef.current) {
          sheetRef.current.style.transition = "transform 400ms cubic-bezier(0.34,1.56,0.64,1)";
          setSheetY(0);
          setTimeout(() => {
            if (sheetRef.current) sheetRef.current.style.transition = "";
          }, 400);
        }
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [mounted]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="sheet-backdrop"
      data-closing={closing || undefined}
      aria-modal="true"
      role="dialog"
      aria-label={item.client}
    >
      {/* Tap-to-close zone — only the area outside the sheet */}
      <div
        className="sheet-backdrop__close"
        onClick={triggerClose}
        aria-label="Close"
      />
      <div
        ref={sheetRef}
        className="sheet"
        data-closing={closing || undefined}
      >
        {/* Handle zone — mobile drag-to-dismiss, native touch */}
        <div ref={handleZoneRef} className="sheet__handle-zone">
          <div className="sheet__handle" aria-hidden="true" />
        </div>

        {/* Scrollable body */}
        <div ref={scrollRef} className="sheet__scroll">

          {/* Image strip: cover full-width */}
          {gallery[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={gallery[0]} alt={item.client} className="sheet__hero" />
          )}

          {/* Header: client + meta + actions */}
          <div className="sheet__header">
            <div className="sheet__header-left">
              <span className="sheet__client">{item.client}</span>
              <div className="sheet__meta-row">
                {item.year && <span className="sheet__year">{item.year}</span>}
                {item.year && item.service && <span className="sheet__meta-sep" aria-hidden="true">·</span>}
                {item.service && <span className="sheet__meta-service">{serviceTag(item.service)}</span>}
              </div>
            </div>
            <div className="sheet__header-actions">
              {item.instagram && (
                <a href={`https://instagram.com/${item.instagram}`} target="_blank" rel="noreferrer" className="sheet__ig-btn" aria-label={`@${item.instagram} on Instagram`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
                  </svg>
                </a>
              )}
              {item.url && (
                <a href={item.url} target="_blank" rel="noreferrer" className="sheet__url-btn">
                  Visit site
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden="true">
                    <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          <div className="sheet__rule" />

          {/* Summary */}
          {item.summary && (
            <p className="sheet__summary" dangerouslySetInnerHTML={{ __html: highlightSummary(cleanSummary(item.summary)) }} />
          )}

          {/* Palette */}
          {item.palette && item.palette.length > 0 && (
            <SwatchRow colors={item.palette} />
          )}

          {/* Site preview screenshot */}
          {item.preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.preview} alt={`${item.client} preview`} className="sheet__preview" />
          )}

          {/* Extra images */}
          {gallery.slice(1).length > 0 && (
            <div className="sheet__body">
              {gallery.slice(1).map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt={`${item.client} ${i + 2}`} className="sheet__img" />
              ))}
            </div>
          )}

          {/* Footer: role */}
          {item.role && (
            <div className="sheet__footer">
              <span className="sheet__role">{item.role}</span>
            </div>
          )}

          <div style={{ height: "max(28px, env(safe-area-inset-bottom))" }} />
        </div>
      </div>
    </div>,
    document.body
  );
}
