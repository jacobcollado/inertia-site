"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const g = (a: number) => `rgba(120,120,120,${a})`;
const acc = "rgb(var(--accent))";

function SketchUpsell() {
  // "Frequently bought together" — a main product plus add-ons, joined by + signs,
  // with a bundle total and an add-all button.
  return (
    <svg viewBox="0 0 400 320" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" aria-hidden="true">
      {/* heading: Frequently bought together */}
      <rect x="24" y="28" width="150" height="9" rx="2" fill={g(0.45)} />

      {/* three product thumbnails joined by + */}
      <rect x="24" y="60" width="92" height="92" rx="8" fill={g(0.06)} stroke={g(0.12)} strokeWidth="0.8" />
      <circle cx="70" cy="100" r="20" fill={g(0.14)} />
      <text x="139" y="112" fill={g(0.35)} fontSize="22" textAnchor="middle">+</text>

      <rect x="162" y="60" width="92" height="92" rx="8" fill={g(0.06)} stroke={g(0.12)} strokeWidth="0.8" />
      <rect x="190" y="80" width="36" height="44" rx="4" fill={g(0.14)} />
      <text x="277" y="112" fill={g(0.35)} fontSize="22" textAnchor="middle">+</text>

      <rect x="300" y="60" width="76" height="92" rx="8" fill={g(0.03)} stroke={acc} strokeOpacity="0.35" strokeWidth="0.9" />
      <rect x="324" y="80" width="28" height="44" rx="4" fill={acc} fillOpacity="0.18" />
      {/* "add-on" tag on the last item */}
      <rect x="300" y="48" width="50" height="18" rx="9" fill={acc} fillOpacity="0.9" />
      <rect x="310" y="54" width="30" height="5" rx="1.5" fill="#fff" fillOpacity="0.85" />

      {/* per-item checkboxes / price lines */}
      <rect x="24" y="170" width="64" height="6" rx="1.5" fill={g(0.3)} />
      <rect x="162" y="170" width="64" height="6" rx="1.5" fill={g(0.3)} />
      <rect x="300" y="170" width="52" height="6" rx="1.5" fill={acc} fillOpacity="0.55" />

      {/* bundle total + add-all bundle button */}
      <rect x="24" y="206" width="352" height="0.8" fill={g(0.1)} />
      <rect x="24" y="228" width="96" height="9" rx="2" fill={g(0.4)} />
      <rect x="24" y="244" width="60" height="7" rx="2" fill={acc} fillOpacity="0.6" />
      <rect x="216" y="220" width="160" height="40" rx="20" fill={acc} fillOpacity="0.9" />
      <rect x="248" y="236" width="96" height="8" rx="2" fill="#fff" fillOpacity="0.85" />
    </svg>
  );
}

function SketchScarcity() {
  // Low-stock badge, a near-empty inventory bar, and a countdown timer in HH:MM:SS blocks.
  return (
    <svg viewBox="0 0 400 320" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" aria-hidden="true">
      {/* low stock pill */}
      <rect x="24" y="28" width="132" height="24" rx="12" fill={acc} fillOpacity="0.12" stroke={acc} strokeOpacity="0.35" strokeWidth="0.7" />
      <circle cx="42" cy="40" r="4" fill={acc} fillOpacity="0.9" />
      <rect x="54" y="36" width="90" height="8" rx="2" fill={acc} fillOpacity="0.55" />

      {/* "Only 3 left" inventory counter */}
      <rect x="24" y="76" width="78" height="9" rx="2" fill={g(0.45)} />
      {/* near-empty stock bar */}
      <rect x="24" y="98" width="352" height="8" rx="4" fill={g(0.08)} />
      <rect x="24" y="98" width="58" height="8" rx="4" fill={acc} fillOpacity="0.8" />

      {/* countdown timer label */}
      <rect x="24" y="146" width="110" height="8" rx="2" fill={g(0.35)} />
      {/* HH : MM : SS blocks */}
      <rect x="24" y="166" width="56" height="64" rx="8" fill={g(0.06)} stroke={g(0.12)} strokeWidth="0.8" />
      <rect x="38" y="190" width="28" height="16" rx="3" fill={g(0.4)} />
      <text x="92" y="206" fill={g(0.3)} fontSize="20" textAnchor="middle">:</text>
      <rect x="104" y="166" width="56" height="64" rx="8" fill={g(0.06)} stroke={g(0.12)} strokeWidth="0.8" />
      <rect x="118" y="190" width="28" height="16" rx="3" fill={g(0.4)} />
      <text x="172" y="206" fill={g(0.3)} fontSize="20" textAnchor="middle">:</text>
      <rect x="184" y="166" width="56" height="64" rx="8" fill={acc} fillOpacity="0.1" stroke={acc} strokeOpacity="0.4" strokeWidth="0.9" />
      <rect x="198" y="190" width="28" height="16" rx="3" fill={acc} fillOpacity="0.6" />

      {/* sold-out swatch row — one disabled/crossed-out */}
      <rect x="280" y="166" width="28" height="28" rx="6" fill={g(0.1)} stroke={g(0.14)} strokeWidth="0.8" />
      <rect x="318" y="166" width="28" height="28" rx="6" fill={g(0.1)} stroke={g(0.14)} strokeWidth="0.8" />
      <rect x="280" y="202" width="28" height="28" rx="6" fill={g(0.05)} stroke={g(0.12)} strokeWidth="0.8" />
      <line x1="282" y1="228" x2="306" y2="204" stroke={g(0.3)} strokeWidth="1" />
    </svg>
  );
}

function SketchGuided() {
  // A vertical progress rail with completed/active steps pulling down the page,
  // and a sticky add-to-cart bar pinned at the bottom edge.
  const rail = 48;
  return (
    <svg viewBox="0 0 400 320" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" aria-hidden="true">
      {/* progress rail */}
      <line x1={rail} y1="40" x2={rail} y2="232" stroke={g(0.12)} strokeWidth="1.2" />

      {/* step 1 — done */}
      <circle cx={rail} cy="48" r="9" fill={acc} fillOpacity="0.9" />
      <polyline points="44 48 47 51 52 45" stroke="#fff" strokeWidth="1.6" />
      <rect x="76" y="38" width="160" height="9" rx="2" fill={g(0.4)} />
      <rect x="76" y="53" width="100" height="6" rx="1.5" fill={g(0.18)} />

      {/* step 2 — done */}
      <circle cx={rail} cy="120" r="9" fill={acc} fillOpacity="0.9" />
      <polyline points="44 120 47 123 52 117" stroke="#fff" strokeWidth="1.6" />
      <rect x="76" y="110" width="140" height="9" rx="2" fill={g(0.4)} />
      <rect x="76" y="125" width="84" height="6" rx="1.5" fill={g(0.18)} />

      {/* step 3 — active */}
      <circle cx={rail} cy="192" r="9" fill={acc} fillOpacity="0.15" stroke={acc} strokeOpacity="0.6" strokeWidth="1.4" />
      <circle cx={rail} cy="192" r="3.5" fill={acc} fillOpacity="0.9" />
      <rect x="76" y="182" width="120" height="9" rx="2" fill={g(0.45)} />
      <rect x="76" y="197" width="72" height="6" rx="1.5" fill={g(0.2)} />

      {/* sticky add-to-cart bar pinned to bottom */}
      <rect x="20" y="262" width="360" height="50" rx="10" fill={g(0.07)} stroke={acc} strokeOpacity="0.3" strokeWidth="0.9" />
      <rect x="34" y="278" width="28" height="18" rx="4" fill={g(0.14)} />
      <rect x="74" y="280" width="90" height="8" rx="2" fill={g(0.4)} />
      <rect x="232" y="272" width="132" height="30" rx="15" fill={acc} fillOpacity="0.9" />
      <rect x="262" y="283" width="72" height="8" rx="2" fill="#fff" fillOpacity="0.85" />
      {/* "sticky" pin tab */}
      <rect x="170" y="250" width="60" height="14" rx="7" fill={acc} fillOpacity="0.85" />
    </svg>
  );
}

const SKETCHES = [SketchUpsell, SketchScarcity, SketchGuided];

interface Feature {
  title: string;
  desc: string;
  points: string[];
  icon: React.ReactNode;
  /** Optional screenshot of real work. Falls back to the SVG sketch when empty. */
  image?: string;
}

// Native dimensions of the work screenshots — the container adapts to this ratio.
const SHOT_W = 1365;
const SHOT_H = 858;

// Renders a real screenshot (container adapts to its aspect ratio) when one is
// provided, otherwise the fixed-height SVG sketch.
function Visual({ feature, index, alt }: { feature: Feature; index: number; alt: string }) {
  if (feature.image) {
    return (
      <div className="relative rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] overflow-hidden">
        <Image
          src={feature.image}
          alt={alt}
          width={SHOT_W}
          height={SHOT_H}
          sizes="(max-width: 640px) 100vw, 40vw"
          className="w-full h-auto"
        />
      </div>
    );
  }
  const Sketch = SKETCHES[index];
  return (
    <div className="rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] overflow-hidden" style={{ height: 420 }}>
      <Sketch />
    </div>
  );
}

export function FeaturesScroll({ features }: { features: Feature[] }) {
  const [active, setActive] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const onScroll = () => {
      const mid = window.innerHeight / 2;
      let closest = 0;
      let closestDist = Infinity;
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const dist = Math.abs(center - mid);
        if (dist < closestDist) { closestDist = dist; closest = i; }
      });
      setActive(closest);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row px-3 py-16 sm:py-0 sm:pb-8 sm:-mt-[8vh]">
      {/* Left: scrolling text */}
      <div className="flex flex-col flex-1 pr-0 sm:pr-16">
        {features.map((f, i) => {
          return (
            <div
              key={f.title}
              ref={(el) => { itemRefs.current[i] = el; }}
              className="flex flex-col gap-5 justify-center min-h-[520px] sm:h-[85vh] sm:min-h-0 py-12 sm:py-0"
              style={{ opacity: active === i ? 1 : 0.35, transition: "opacity 300ms ease" }}
            >
              <div className="flex items-center gap-3 text-[rgb(var(--muted))]">
                {f.icon}
                <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))]">
                  {f.title}
                </h2>
              </div>
              <p className="text-[17px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">
                {f.desc}
              </p>
              <ul className="flex flex-col gap-2.5">
                {f.points.map((p) => (
                  <li key={`${f.title}-${p}`} className="flex items-center gap-2.5 text-[15px] tracking-tight text-[rgb(var(--muted))]">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 shrink-0" style={{ color: "rgb(var(--accent))" }} aria-hidden="true">
                      <polyline points="2 8 6 12 14 4" />
                    </svg>
                    {p}
                  </li>
                ))}
              </ul>
              {/* Mobile visual — shown inline below each feature */}
              <div className="sm:hidden mt-4">
                <Visual feature={f} index={i} alt={`${f.title} example`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: sticky visual — desktop only. Pinned over the full viewport and
          vertically centered, matching the active text block (also h-screen,
          centered), so the two track together as you scroll. */}
      <div className="hidden sm:block w-[50%] shrink-0">
        <div className="sticky top-0 flex items-center" style={{ height: "100vh" }}>
          <div className="w-full">
            <Visual feature={features[active]} index={active} alt={`${features[active]?.title ?? ""} example`} />
          </div>
        </div>
      </div>
    </div>
  );
}
