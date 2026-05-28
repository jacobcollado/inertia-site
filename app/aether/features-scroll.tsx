"use client";

import { useEffect, useRef, useState } from "react";

const g = (a: number) => `rgba(120,120,120,${a})`;
const acc = "rgb(var(--accent))";

function SketchUpsell() {
  return (
    <svg viewBox="0 0 400 320" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" aria-hidden="true">
      <rect x="24" y="24" width="168" height="272" rx="8" fill={g(0.04)} stroke={g(0.12)} strokeWidth="0.8" />
      <rect x="24" y="24" width="168" height="150" rx="8" fill={g(0.06)} />
      <rect x="36" y="190" width="100" height="8" rx="2" fill={g(0.5)} />
      <rect x="36" y="204" width="56" height="6" rx="1.5" fill={g(0.22)} />
      <rect x="36" y="240" width="144" height="32" rx="16" fill={acc} fillOpacity="0.9" />
      <rect x="80" y="253" width="72" height="6" rx="1.5" fill="#fff" fillOpacity="0.8" />
      <rect x="208" y="60" width="168" height="196" rx="8" fill={g(0.03)} stroke={acc} strokeOpacity="0.3" strokeWidth="0.8" />
      <rect x="208" y="60" width="168" height="104" rx="8" fill={g(0.05)} />
      <rect x="220" y="178" width="80" height="7" rx="2" fill={g(0.4)} />
      <rect x="220" y="191" width="48" height="5" rx="1.5" fill={g(0.18)} />
      <rect x="220" y="216" width="144" height="26" rx="13" fill={acc} fillOpacity="0.15" stroke={acc} strokeOpacity="0.4" strokeWidth="0.7" />
      <rect x="258" y="225" width="68" height="6" rx="1.5" fill={acc} fillOpacity="0.6" />
      <rect x="330" y="56" width="46" height="20" rx="10" fill={acc} fillOpacity="0.9" />
      <rect x="339" y="63" width="28" height="5" rx="1.5" fill="#fff" fillOpacity="0.85" />
    </svg>
  );
}

function SketchScarcity() {
  return (
    <svg viewBox="0 0 400 320" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" aria-hidden="true">
      <rect x="24" y="24" width="352" height="160" rx="8" fill={g(0.05)} stroke={g(0.1)} strokeWidth="0.8" />
      <rect x="36" y="36" width="96" height="22" rx="11" fill={acc} fillOpacity="0.12" stroke={acc} strokeOpacity="0.35" strokeWidth="0.7" />
      <circle cx="53" cy="47" r="4" fill={acc} fillOpacity="0.9" />
      <rect x="63" y="43" width="56" height="8" rx="2" fill={acc} fillOpacity="0.55" />
      <rect x="24" y="200" width="352" height="6" rx="3" fill={g(0.08)} />
      <rect x="24" y="200" width="120" height="6" rx="3" fill={acc} fillOpacity="0.7" />
      <rect x="24" y="216" width="80" height="7" rx="1.5" fill={g(0.45)} />
      <rect x="296" y="216" width="80" height="7" rx="1.5" fill={g(0.2)} />
      <rect x="24" y="240" width="352" height="56" rx="8" fill={g(0.04)} stroke={g(0.1)} strokeWidth="0.7" />
      <g key="c0"><rect x="44" y="250" width="40" height="36" rx="6" fill={g(0.08)} /><rect x="52" y="261" width="24" height="14" rx="3" fill={g(0.3)} /></g>
      <g key="c1"><rect x="108" y="250" width="40" height="36" rx="6" fill={g(0.08)} /><rect x="116" y="261" width="24" height="14" rx="3" fill={g(0.3)} /></g>
      <g key="c2"><rect x="172" y="250" width="40" height="36" rx="6" fill={g(0.08)} /><rect x="180" y="261" width="24" height="14" rx="3" fill={g(0.3)} /></g>
      <rect x="232" y="261" width="10" height="14" rx="2" fill={g(0.18)} />
    </svg>
  );
}

function SketchGuided() {
  return (
    <svg viewBox="0 0 400 320" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" aria-hidden="true">
      <rect x="24" y="24" width="352" height="60" rx="6" fill={g(0.05)} stroke={g(0.1)} strokeWidth="0.7" />
      <rect x="36" y="38" width="130" height="9" rx="2" fill={g(0.45)} />
      <rect x="36" y="53" width="80" height="6" rx="1.5" fill={g(0.2)} />
      <line x1="200" y1="84" x2="200" y2="104" stroke={acc} strokeOpacity="0.4" strokeWidth="1" strokeDasharray="2 2" />
      <circle cx="200" cy="94" r="4" fill={acc} fillOpacity="0.8" />
      <rect x="24" y="104" width="352" height="60" rx="6" fill={g(0.05)} stroke={g(0.1)} strokeWidth="0.7" />
      <rect x="36" y="118" width="110" height="9" rx="2" fill={g(0.4)} />
      <rect x="36" y="133" width="68" height="6" rx="1.5" fill={g(0.18)} />
      <line x1="200" y1="164" x2="200" y2="184" stroke={acc} strokeOpacity="0.4" strokeWidth="1" strokeDasharray="2 2" />
      <circle cx="200" cy="174" r="4" fill={acc} fillOpacity="0.8" />
      <rect x="24" y="184" width="352" height="60" rx="6" fill={g(0.05)} stroke={g(0.1)} strokeWidth="0.7" />
      <rect x="36" y="198" width="90" height="9" rx="2" fill={g(0.35)} />
      <rect x="36" y="213" width="56" height="6" rx="1.5" fill={g(0.15)} />
      <rect x="24" y="264" width="352" height="48" rx="8" fill={g(0.06)} stroke={acc} strokeOpacity="0.25" strokeWidth="0.8" />
      <rect x="36" y="276" width="88" height="7" rx="2" fill={g(0.4)} />
      <rect x="36" y="289" width="56" height="5" rx="1.5" fill={g(0.2)} />
      <rect x="284" y="270" width="80" height="36" rx="18" fill={acc} fillOpacity="0.9" />
      <rect x="298" y="284" width="52" height="8" rx="2" fill="#fff" fillOpacity="0.8" />
    </svg>
  );
}

const SKETCHES = [SketchUpsell, SketchScarcity, SketchGuided];

interface Feature {
  title: string;
  desc: string;
  points: string[];
  icon: React.ReactNode;
}

export function FeaturesScroll({ features }: { features: Feature[] }) {
  const [active, setActive] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stickyRef = useRef<HTMLDivElement>(null);

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

  const Sketch = SKETCHES[active];

  return (
    <div className="flex flex-col sm:flex-row px-3 py-16 sm:py-24">
      {/* Left: scrolling text */}
      <div className="flex flex-col flex-1 pr-0 sm:pr-16">
        {features.map((f, i) => {
          const MobileSketch = SKETCHES[i];
          return (
            <div
              key={f.title}
              ref={(el) => { itemRefs.current[i] = el; }}
              className="flex flex-col gap-5 justify-center"
              style={{ opacity: active === i ? 1 : 0.35, transition: "opacity 300ms ease", minHeight: 520, paddingTop: 80, paddingBottom: 80 }}
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
              {/* Mobile sketch — shown inline below each feature */}
              <div className="sm:hidden rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] overflow-hidden mt-4" style={{ height: 280 }}>
                <MobileSketch />
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: sticky visual — desktop only */}
      <div className="hidden sm:block w-[50%] shrink-0">
        <div style={{ position: "sticky", top: "calc(50vh - 210px)" }}>
          <div className="rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] overflow-hidden" style={{ height: 420 }}>
            <Sketch />
          </div>
        </div>
      </div>
    </div>
  );
}
