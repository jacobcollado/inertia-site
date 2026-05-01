"use client";

import React from "react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  | { type: "note"; accent?: [number, number, number]; text: string }
  | { type: "code"; text: string }
  | { type: "sketch"; name: string; accent: [number, number, number] };

function rgba([r, g, b]: [number, number, number], a = 1) {
  return `rgba(${r},${g},${b},${a})`;
}

// ─── Aether sketches ──────────────────────────────────────────────────────────

function SketchInstall({ accent }: { accent: [number, number, number] }) {
  return (
    <svg viewBox="0 0 280 110" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <rect x="8" y="8" width="156" height="94" rx="4" stroke={rgba([160,160,160], 0.15)} strokeWidth="0.8" />
      <rect x="8" y="8" width="156" height="22" rx="4" fill={rgba([160,160,160], 0.04)} stroke="none" />
      <line x1="8" y1="30" x2="164" y2="30" stroke={rgba([160,160,160], 0.1)} strokeWidth="0.6" />
      <rect x="8" y="30" width="34" height="72" rx="0" fill={rgba([160,160,160], 0.03)} stroke="none" />
      <line x1="42" y1="30" x2="42" y2="102" stroke={rgba([160,160,160], 0.09)} strokeWidth="0.6" />
      {[0,1,2,3,4].map(i => (
        <line key={i} x1="14" y1={42 + i * 11} x2="36" y2={42 + i * 11} stroke={rgba([160,160,160], 0.16)} strokeWidth="0.6" />
      ))}
      <rect x="50" y="38" width="106" height="24" rx="2" fill={rgba([160,160,160], 0.04)} stroke={rgba([160,160,160], 0.12)} strokeWidth="0.6" />
      <line x1="58" y1="47" x2="104" y2="47" stroke={rgba([160,160,160], 0.22)} strokeWidth="0.7" />
      <line x1="58" y1="54" x2="88" y2="54" stroke={rgba([160,160,160], 0.13)} strokeWidth="0.5" />
      <rect x="50" y="70" width="106" height="24" rx="2" fill={rgba(accent, 0.06)} stroke={rgba(accent, 0.4)} strokeWidth="0.8" />
      <line x1="58" y1="79" x2="96" y2="79" stroke={rgba(accent, 0.65)} strokeWidth="0.9" />
      <line x1="58" y1="86" x2="78" y2="86" stroke={rgba(accent, 0.35)} strokeWidth="0.5" />
      <line x1="188" y1="66" x2="188" y2="38" stroke={rgba(accent, 0.45)} strokeWidth="1.1" strokeDasharray="3 3" />
      <polyline points="183,43 188,38 193,43" stroke={rgba(accent, 0.65)} strokeWidth="1.1" />
      <rect x="172" y="72" width="34" height="26" rx="2" fill={rgba(accent, 0.07)} stroke={rgba(accent, 0.35)} strokeWidth="0.8" />
      <line x1="178" y1="82" x2="200" y2="82" stroke={rgba(accent, 0.3)} strokeWidth="0.5" />
      <line x1="178" y1="87" x2="196" y2="87" stroke={rgba(accent, 0.2)} strokeWidth="0.5" />
      <line x1="178" y1="92" x2="190" y2="92" stroke={rgba(accent, 0.15)} strokeWidth="0.5" />
    </svg>
  );
}

function SketchColors({ accent }: { accent: [number, number, number] }) {
  return (
    <svg viewBox="0 0 280 110" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <rect x="8" y="10" width="116" height="90" rx="4" stroke={rgba([160,160,160], 0.15)} strokeWidth="0.8" />
      <line x1="8" y1="28" x2="124" y2="28" stroke={rgba([160,160,160], 0.1)} strokeWidth="0.6" />
      <line x1="16" y1="19" x2="56" y2="19" stroke={rgba([160,160,160], 0.22)} strokeWidth="0.8" />
      {[
        { color: accent, y: 44 },
        { color: [200,200,200] as [number,number,number], y: 62 },
        { color: [110,120,255] as [number,number,number], y: 80 },
      ].map(({ color, y }) => (
        <g key={y}>
          <rect x="16" y={y - 6} width="92" height="13" rx="2" fill={rgba([160,160,160], 0.03)} stroke={rgba([160,160,160], 0.1)} strokeWidth="0.5" />
          <circle cx="100" cy={y + 0.5} r="4.5" fill={rgba(color, 0.75)} stroke={rgba([160,160,160], 0.18)} strokeWidth="0.5" />
          <line x1="22" y1={y + 0.5} x2="85" y2={y + 0.5} stroke={rgba([160,160,160], 0.18)} strokeWidth="0.6" />
        </g>
      ))}
      <line x1="128" y1="55" x2="143" y2="55" stroke={rgba(accent, 0.3)} strokeWidth="0.7" strokeDasharray="2 2" />
      <polyline points="140,52 143,55 140,58" stroke={rgba(accent, 0.45)} strokeWidth="0.8" />
      <rect x="148" y="10" width="124" height="90" rx="4" stroke={rgba([160,160,160], 0.15)} strokeWidth="0.8" />
      <rect x="148" y="10" width="124" height="20" rx="4" fill={rgba(accent, 0.06)} stroke="none" />
      <line x1="148" y1="30" x2="272" y2="30" stroke={rgba([160,160,160], 0.1)} strokeWidth="0.6" />
      <line x1="158" y1="20" x2="186" y2="20" stroke={rgba(accent, 0.45)} strokeWidth="0.9" />
      <rect x="222" y="15" width="36" height="9" rx="3" fill={rgba(accent, 0.85)} stroke="none" />
      <rect x="156" y="37" width="106" height="40" rx="2" fill={rgba(accent, 0.04)} stroke={rgba([160,160,160], 0.1)} strokeWidth="0.5" />
      <line x1="164" y1="50" x2="216" y2="50" stroke={rgba(accent, 0.65)} strokeWidth="1.1" />
      <line x1="164" y1="57" x2="198" y2="57" stroke={rgba(accent, 0.38)} strokeWidth="0.8" />
      <rect x="164" y="65" width="30" height="7" rx="2.5" fill={rgba(accent, 0.88)} stroke="none" />
    </svg>
  );
}

function SketchProductPage({ accent }: { accent: [number, number, number] }) {
  return (
    <svg viewBox="0 0 280 110" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <rect x="8" y="8" width="264" height="94" rx="4" stroke={rgba([160,160,160], 0.15)} strokeWidth="0.8" />
      <line x1="8" y1="22" x2="272" y2="22" stroke={rgba([160,160,160], 0.1)} strokeWidth="0.6" />
      <rect x="16" y="30" width="138" height="64" rx="2" fill={rgba(accent, 0.04)} stroke={rgba([160,160,160], 0.11)} strokeWidth="0.6" />
      <line x1="16" y1="30" x2="154" y2="94" stroke={rgba([160,160,160], 0.06)} strokeWidth="0.5" />
      <line x1="154" y1="30" x2="16" y2="94" stroke={rgba([160,160,160], 0.06)} strokeWidth="0.5" />
      <line x1="164" y1="36" x2="256" y2="36" stroke={rgba(accent, 0.72)} strokeWidth="1.3" />
      <line x1="164" y1="43" x2="240" y2="43" stroke={rgba(accent, 0.42)} strokeWidth="0.85" />
      <line x1="164" y1="50" x2="206" y2="50" stroke={rgba([160,160,160], 0.2)} strokeWidth="0.55" />
      {[0,1,2,3].map(i => (
        <circle key={i} cx={164 + i * 10} cy={59} r={3.2}
          fill={i === 0 ? rgba(accent, 0.68) : rgba([160,160,160], 0.11)}
          stroke={i === 0 ? rgba(accent, 0.45) : rgba([160,160,160], 0.18)} strokeWidth="0.5" />
      ))}
      <rect x="164" y="67" width="88" height="10" rx="3" fill={rgba(accent, 0.88)} stroke="none" />
      {[0,1,2].map(i => (
        <g key={i}>
          <rect x={164 + i * 31} y="83" width="27" height="8" rx="1.5" fill={rgba([160,160,160], 0.04)} stroke={rgba([160,160,160], 0.11)} strokeWidth="0.5" />
          <line x1={168 + i * 31} y1="87" x2={185 + i * 31} y2="87" stroke={rgba([160,160,160], 0.16)} strokeWidth="0.5" />
        </g>
      ))}
    </svg>
  );
}

function SketchUpdate({ accent }: { accent: [number, number, number] }) {
  return (
    <svg viewBox="0 0 280 110" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <line x1="36" y1="56" x2="244" y2="56" stroke={rgba([160,160,160], 0.16)} strokeWidth="0.8" />
      <circle cx="56" cy="56" r="5.5" fill={rgba([160,160,160], 0.07)} stroke={rgba([160,160,160], 0.26)} strokeWidth="0.8" />
      <line x1="56" y1="50" x2="56" y2="30" stroke={rgba([160,160,160], 0.16)} strokeWidth="0.6" />
      <rect x="34" y="18" width="44" height="12" rx="2" fill="none" stroke={rgba([160,160,160], 0.14)} strokeWidth="0.6" />
      <line x1="40" y1="24" x2="72" y2="24" stroke={rgba([160,160,160], 0.18)} strokeWidth="0.6" />
      <circle cx="120" cy="56" r="5.5" fill={rgba([160,160,160], 0.07)} stroke={rgba([160,160,160], 0.26)} strokeWidth="0.8" />
      <line x1="120" y1="62" x2="120" y2="82" stroke={rgba([160,160,160], 0.16)} strokeWidth="0.6" />
      <rect x="96" y="82" width="48" height="12" rx="2" fill="none" stroke={rgba([160,160,160], 0.14)} strokeWidth="0.6" />
      <line x1="102" y1="88" x2="138" y2="88" stroke={rgba([160,160,160], 0.18)} strokeWidth="0.6" />
      <circle cx="200" cy="56" r="7.5" fill={rgba(accent, 0.1)} stroke={rgba(accent, 0.65)} strokeWidth="1.1" />
      <circle cx="200" cy="56" r="2.5" fill={rgba(accent, 0.6)} stroke="none" />
      <line x1="200" y1="48" x2="200" y2="26" stroke={rgba(accent, 0.4)} strokeWidth="0.8" />
      <rect x="172" y="14" width="56" height="14" rx="2" fill={rgba(accent, 0.07)} stroke={rgba(accent, 0.38)} strokeWidth="0.8" />
      <line x1="178" y1="20" x2="220" y2="20" stroke={rgba(accent, 0.55)} strokeWidth="0.85" />
      <line x1="178" y1="25" x2="208" y2="25" stroke={rgba(accent, 0.3)} strokeWidth="0.5" />
      <line x1="200" y1="64" x2="200" y2="78" stroke={rgba(accent, 0.3)} strokeWidth="0.7" strokeDasharray="2 2" />
      <polyline points="195,74 200,80 205,74" stroke={rgba(accent, 0.48)} strokeWidth="0.9" />
    </svg>
  );
}

function SketchHero({ accent }: { accent: [number, number, number] }) {
  return (
    <svg viewBox="0 0 280 110" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <rect x="6" y="10" width="78" height="90" rx="3" fill={rgba(accent, 0.035)} stroke={rgba([160,160,160], 0.14)} strokeWidth="0.7" />
      <line x1="6" y1="10" x2="84" y2="100" stroke={rgba([160,160,160], 0.05)} strokeWidth="0.5" />
      <line x1="84" y1="10" x2="6" y2="100" stroke={rgba([160,160,160], 0.05)} strokeWidth="0.5" />
      <line x1="14" y1="46" x2="68" y2="46" stroke={rgba(accent, 0.75)} strokeWidth="1.3" />
      <line x1="14" y1="53" x2="54" y2="53" stroke={rgba(accent, 0.42)} strokeWidth="0.85" />
      <rect x="14" y="60" width="26" height="8" rx="2.5" fill={rgba(accent, 0.85)} stroke="none" />
      <line x1="28" y1="19" x2="52" y2="19" stroke={rgba([160,160,160], 0.16)} strokeWidth="0.5" />
      <rect x="101" y="10" width="78" height="90" rx="3" stroke={rgba([160,160,160], 0.14)} strokeWidth="0.7" />
      <line x1="140" y1="10" x2="140" y2="100" stroke={rgba([160,160,160], 0.11)} strokeWidth="0.6" />
      <rect x="101" y="10" width="39" height="90" rx="3" fill={rgba([160,160,160], 0.035)} stroke="none" />
      <line x1="101" y1="10" x2="140" y2="100" stroke={rgba([160,160,160], 0.04)} strokeWidth="0.5" />
      <line x1="140" y1="10" x2="101" y2="100" stroke={rgba([160,160,160], 0.04)} strokeWidth="0.5" />
      <line x1="147" y1="45" x2="172" y2="45" stroke={rgba(accent, 0.65)} strokeWidth="1.1" />
      <line x1="147" y1="52" x2="168" y2="52" stroke={rgba(accent, 0.38)} strokeWidth="0.8" />
      <rect x="147" y="59" width="22" height="7" rx="2.5" fill={rgba(accent, 0.85)} stroke="none" />
      <rect x="196" y="10" width="78" height="90" rx="3" stroke={rgba([160,160,160], 0.14)} strokeWidth="0.7" />
      <line x1="204" y1="42" x2="266" y2="42" stroke={rgba(accent, 0.65)} strokeWidth="1.3" />
      <line x1="210" y1="50" x2="260" y2="50" stroke={rgba(accent, 0.45)} strokeWidth="1.0" />
      <line x1="214" y1="57" x2="252" y2="57" stroke={rgba([160,160,160], 0.18)} strokeWidth="0.55" />
      <rect x="220" y="64" width="34" height="8" rx="2.5" fill={rgba(accent, 0.85)} stroke="none" />
      {["full-bleed", "split", "text"].map((label, i) => (
        <text key={i} x={45 + i * 95} y="108" textAnchor="middle" fontSize="6.5" fill={rgba([160,160,160], 0.3)} fontFamily="inherit">{label}</text>
      ))}
    </svg>
  );
}

function SketchMegaMenu({ accent }: { accent: [number, number, number] }) {
  return (
    <svg viewBox="0 0 280 110" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <rect x="8" y="8" width="264" height="20" rx="3" fill={rgba([160,160,160], 0.03)} stroke={rgba([160,160,160], 0.13)} strokeWidth="0.7" />
      <line x1="18" y1="18" x2="46" y2="18" stroke={rgba([160,160,160], 0.28)} strokeWidth="1.0" />
      {[0,1,2].map(i => (
        <line key={i} x1={72 + i * 48} y1="18" x2={90 + i * 48} y2="18"
          stroke={i === 1 ? rgba(accent, 0.7) : rgba([160,160,160], 0.18)}
          strokeWidth={i === 1 ? "0.85" : "0.55"} />
      ))}
      <circle cx={96} cy={18} r={1.4} fill={rgba(accent, 0.5)} stroke="none" />
      <rect x="58" y="30" width="196" height="72" rx="3" fill={rgba([160,160,160], 0.025)} stroke={rgba([160,160,160], 0.14)} strokeWidth="0.7" />
      {[0,1,2,3].map(i => (
        <g key={i}>
          <line x1="70" y1={44 + i * 13} x2="148" y2={44 + i * 13}
            stroke={i === 0 ? rgba(accent, 0.6) : rgba([160,160,160], 0.18)}
            strokeWidth={i === 0 ? "0.85" : "0.55"} />
          <line x1="70" y1={49 + i * 13} x2={106 + i * 5} y2={49 + i * 13} stroke={rgba([160,160,160], 0.11)} strokeWidth="0.45" />
        </g>
      ))}
      <line x1="156" y1="36" x2="156" y2="94" stroke={rgba([160,160,160], 0.11)} strokeWidth="0.55" />
      <rect x="164" y="38" width="78" height="48" rx="2" fill={rgba(accent, 0.05)} stroke={rgba(accent, 0.18)} strokeWidth="0.6" />
      <line x1="164" y1="38" x2="242" y2="86" stroke={rgba([160,160,160], 0.05)} strokeWidth="0.4" />
      <line x1="242" y1="38" x2="164" y2="86" stroke={rgba([160,160,160], 0.05)} strokeWidth="0.4" />
      <line x1="170" y1="74" x2="228" y2="74" stroke={rgba(accent, 0.45)} strokeWidth="0.75" />
      <line x1="170" y1="80" x2="214" y2="80" stroke={rgba(accent, 0.28)} strokeWidth="0.55" />
    </svg>
  );
}

function SketchDarkMode({ accent }: { accent: [number, number, number] }) {
  return (
    <svg viewBox="0 0 280 110" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <rect x="28" y="8" width="88" height="94" rx="7" fill="rgba(248,248,248,0.05)" stroke={rgba([160,160,160], 0.18)} strokeWidth="0.9" />
      <rect x="28" y="8" width="88" height="22" rx="7" fill={rgba([200,200,200], 0.06)} stroke="none" />
      <line x1="28" y1="30" x2="116" y2="30" stroke={rgba([160,160,160], 0.09)} strokeWidth="0.5" />
      <line x1="38" y1="19" x2="64" y2="19" stroke={rgba([160,160,160], 0.28)} strokeWidth="0.75" />
      <rect x="38" y="38" width="68" height="34" rx="2" fill={rgba([190,190,190], 0.07)} stroke={rgba([160,160,160], 0.11)} strokeWidth="0.5" />
      <line x1="38" y1="38" x2="106" y2="72" stroke={rgba([160,160,160], 0.04)} strokeWidth="0.4" />
      <line x1="38" y1="80" x2="98" y2="80" stroke={rgba([160,160,160], 0.22)} strokeWidth="0.65" />
      <line x1="38" y1="86" x2="84" y2="86" stroke={rgba([160,160,160], 0.16)} strokeWidth="0.5" />
      <rect x="38" y="93" width="28" height="6" rx="2" fill={rgba(accent, 0.28)} stroke={rgba(accent, 0.45)} strokeWidth="0.55" />
      <circle cx="100" cy="19" r="4.5" fill={rgba([255,200,60], 0.18)} stroke={rgba([255,200,60], 0.45)} strokeWidth="0.65" />
      <line x1="120" y1="55" x2="154" y2="55" stroke={rgba([160,160,160], 0.18)} strokeWidth="0.75" strokeDasharray="2 2" />
      <polyline points="151,52 154,55 151,58" stroke={rgba([160,160,160], 0.28)} strokeWidth="0.75" />
      <rect x="160" y="8" width="88" height="94" rx="7" fill="rgba(10,10,16,0.45)" stroke={rgba(accent, 0.28)} strokeWidth="0.9" />
      <rect x="160" y="8" width="88" height="22" rx="7" fill="rgba(6,6,12,0.55)" stroke="none" />
      <line x1="160" y1="30" x2="248" y2="30" stroke={rgba([255,255,255], 0.05)} strokeWidth="0.5" />
      <line x1="170" y1="19" x2="196" y2="19" stroke={rgba([255,255,255], 0.18)} strokeWidth="0.75" />
      <rect x="170" y="38" width="68" height="34" rx="2" fill={rgba(accent, 0.05)} stroke={rgba(accent, 0.16)} strokeWidth="0.5" />
      <line x1="170" y1="38" x2="238" y2="72" stroke={rgba([255,255,255], 0.025)} strokeWidth="0.4" />
      <line x1="170" y1="80" x2="230" y2="80" stroke={rgba(accent, 0.48)} strokeWidth="0.75" />
      <line x1="170" y1="86" x2="216" y2="86" stroke={rgba(accent, 0.28)} strokeWidth="0.5" />
      <rect x="170" y="93" width="28" height="6" rx="2" fill={rgba(accent, 0.72)} stroke="none" />
      <path d="M228 13 Q234 18 228 23 Q238 20 238 18 Q238 16 228 13Z" fill={rgba(accent, 0.22)} stroke={rgba(accent, 0.45)} strokeWidth="0.55" />
    </svg>
  );
}

function SketchLicense({ accent }: { accent: [number, number, number] }) {
  return (
    <svg viewBox="0 0 280 110" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <rect x="14" y="14" width="108" height="82" rx="4" fill={rgba([160,160,160], 0.035)} stroke={rgba([160,160,160], 0.16)} strokeWidth="0.8" />
      <line x1="14" y1="34" x2="122" y2="34" stroke={rgba([160,160,160], 0.09)} strokeWidth="0.5" />
      <line x1="24" y1="24" x2="64" y2="24" stroke={rgba([160,160,160], 0.28)} strokeWidth="0.85" />
      <line x1="24" y1="46" x2="78" y2="46" stroke={rgba([160,160,160], 0.18)} strokeWidth="0.55" />
      <line x1="24" y1="54" x2="112" y2="54" stroke={rgba([160,160,160], 0.12)} strokeWidth="0.5" />
      <line x1="24" y1="61" x2="102" y2="61" stroke={rgba([160,160,160], 0.1)} strokeWidth="0.5" />
      <line x1="24" y1="68" x2="106" y2="68" stroke={rgba([160,160,160], 0.1)} strokeWidth="0.5" />
      <rect x="24" y="78" width="70" height="11" rx="3" fill={rgba([160,160,160], 0.07)} stroke={rgba([160,160,160], 0.18)} strokeWidth="0.65" />
      <line x1="36" y1="83.5" x2="78" y2="83.5" stroke={rgba([160,160,160], 0.22)} strokeWidth="0.55" />
      <rect x="158" y="14" width="108" height="82" rx="4" fill={rgba(accent, 0.045)} stroke={rgba(accent, 0.38)} strokeWidth="0.95" />
      <line x1="158" y1="34" x2="266" y2="34" stroke={rgba(accent, 0.11)} strokeWidth="0.5" />
      <line x1="168" y1="24" x2="220" y2="24" stroke={rgba(accent, 0.6)} strokeWidth="1.0" />
      <line x1="168" y1="46" x2="226" y2="46" stroke={rgba(accent, 0.38)} strokeWidth="0.65" />
      <line x1="168" y1="54" x2="252" y2="54" stroke={rgba(accent, 0.18)} strokeWidth="0.5" />
      <line x1="168" y1="61" x2="242" y2="61" stroke={rgba(accent, 0.16)} strokeWidth="0.5" />
      <line x1="168" y1="68" x2="246" y2="68" stroke={rgba(accent, 0.16)} strokeWidth="0.5" />
      <rect x="168" y="78" width="80" height="11" rx="3" fill={rgba(accent, 0.82)} stroke="none" />
      <path d="M188 24 Q192 20 196 24 Q200 28 204 24 Q208 20 212 24" stroke={rgba(accent, 0.45)} strokeWidth="0.6" fill="none" />
    </svg>
  );
}

// ─── Inertia sketches ─────────────────────────────────────────────────────────

const INERTIA_ACCENT: [number, number, number] = [160, 140, 255];

function SketchStudio({ accent }: { accent: [number, number, number] }) {
  return (
    <svg viewBox="0 0 280 110" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Three service cards side by side */}
      {[
        { x: 10, label: "Shopify", accent: [56,180,255] as [number,number,number] },
        { x: 104, label: "Brand", accent: accent },
        { x: 198, label: "Web", accent: [0,210,180] as [number,number,number] },
      ].map(({ x, label, accent: a }) => (
        <g key={x}>
          <rect x={x} y="14" width="76" height="82" rx="4" fill={rgba(a, 0.04)} stroke={rgba(a, 0.28)} strokeWidth="0.8" />
          <rect x={x} y="14" width="76" height="28" rx="4" fill={rgba(a, 0.07)} stroke="none" />
          <line x1={x} y1="42" x2={x + 76} y2="42" stroke={rgba(a, 0.12)} strokeWidth="0.5" />
          <circle cx={x + 20} cy={28} r="7" fill={rgba(a, 0.12)} stroke={rgba(a, 0.4)} strokeWidth="0.8" />
          <line x1={x + 10} y1="54" x2={x + 66} y2="54" stroke={rgba(a, 0.5)} strokeWidth="0.85" />
          <line x1={x + 10} y1="62" x2={x + 58} y2="62" stroke={rgba(a, 0.28)} strokeWidth="0.55" />
          <line x1={x + 10} y1="70" x2={x + 62} y2="70" stroke={rgba([160,160,160], 0.16)} strokeWidth="0.5" />
          <line x1={x + 10} y1="77" x2={x + 54} y2="77" stroke={rgba([160,160,160], 0.12)} strokeWidth="0.5" />
          <text x={x + 44} y="32" fontSize="6.5" fill={rgba(a, 0.55)} fontFamily="inherit" textAnchor="middle">{label}</text>
        </g>
      ))}
    </svg>
  );
}

function SketchProcess({ accent }: { accent: [number, number, number] }) {
  return (
    <svg viewBox="0 0 280 110" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Horizontal process flow */}
      <line x1="20" y1="55" x2="260" y2="55" stroke={rgba([160,160,160], 0.14)} strokeWidth="0.7" />
      {[
        { cx: 44, label: "Brief", done: true },
        { cx: 104, label: "Design", done: true },
        { cx: 164, label: "Build", done: false, active: true },
        { cx: 224, label: "Ship", done: false },
      ].map(({ cx, label, done, active }) => (
        <g key={cx}>
          <circle cx={cx} cy={55} r={active ? 8 : 6}
            fill={done ? rgba(accent, 0.15) : active ? rgba(accent, 0.12) : rgba([160,160,160], 0.06)}
            stroke={done || active ? rgba(accent, active ? 0.7 : 0.45) : rgba([160,160,160], 0.22)}
            strokeWidth={active ? "1.2" : "0.8"} />
          {done && (
            <polyline points={`${cx - 3},${55} ${cx - 0.5},${58} ${cx + 4},${51}`}
              stroke={rgba(accent, 0.7)} strokeWidth="1.1" fill="none" />
          )}
          {active && <circle cx={cx} cy={55} r={2.5} fill={rgba(accent, 0.65)} stroke="none" />}
          <text x={cx} y="72" textAnchor="middle" fontSize="6.5" fill={rgba([160,160,160], done || active ? 0.5 : 0.28)} fontFamily="inherit">{label}</text>
        </g>
      ))}
    </svg>
  );
}

function SketchShopifyBuild({ accent }: { accent: [number, number, number] }) {
  return (
    <svg viewBox="0 0 280 110" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Shopify admin + theme editor layout */}
      <rect x="8" y="8" width="130" height="94" rx="4" stroke={rgba([160,160,160], 0.15)} strokeWidth="0.8" />
      <line x1="8" y1="24" x2="138" y2="24" stroke={rgba([160,160,160], 0.1)} strokeWidth="0.6" />
      <line x1="18" y1="16" x2="54" y2="16" stroke={rgba([160,160,160], 0.25)} strokeWidth="0.8" />
      {/* Sidebar nav */}
      <rect x="8" y="24" width="32" height="78" rx="0" fill={rgba([160,160,160], 0.03)} stroke="none" />
      <line x1="40" y1="24" x2="40" y2="102" stroke={rgba([160,160,160], 0.09)} strokeWidth="0.5" />
      {[0,1,2,3,4,5].map(i => (
        <line key={i} x1="14" y1={34 + i * 10} x2="36" y2={34 + i * 10}
          stroke={i === 2 ? rgba(accent, 0.45) : rgba([160,160,160], 0.15)}
          strokeWidth={i === 2 ? "0.75" : "0.55"} />
      ))}
      {/* Content area — section list */}
      {[0,1,2,3].map(i => (
        <rect key={i} x="47" y={30 + i * 17} width="84" height="12" rx="2"
          fill={i === 1 ? rgba(accent, 0.07) : rgba([160,160,160], 0.03)}
          stroke={i === 1 ? rgba(accent, 0.35) : rgba([160,160,160], 0.1)} strokeWidth="0.6" />
      ))}
      {/* Preview panel */}
      <rect x="152" y="8" width="120" height="94" rx="4" stroke={rgba([160,160,160], 0.15)} strokeWidth="0.8" />
      <rect x="152" y="8" width="120" height="24" rx="4" fill={rgba(accent, 0.05)} stroke="none" />
      <line x1="152" y1="32" x2="272" y2="32" stroke={rgba([160,160,160], 0.1)} strokeWidth="0.5" />
      <line x1="162" y1="20" x2="188" y2="20" stroke={rgba(accent, 0.45)} strokeWidth="0.85" />
      <rect x="240" y="15" width="26" height="8" rx="3" fill={rgba(accent, 0.82)} stroke="none" />
      <rect x="160" y="38" width="104" height="38" rx="2" fill={rgba(accent, 0.04)} stroke={rgba([160,160,160], 0.1)} strokeWidth="0.5" />
      <line x1="160" y1="38" x2="264" y2="76" stroke={rgba([160,160,160], 0.05)} strokeWidth="0.4" />
      <line x1="168" y1="84" x2="232" y2="84" stroke={rgba(accent, 0.5)} strokeWidth="0.8" />
      <line x1="168" y1="91" x2="212" y2="91" stroke={rgba(accent, 0.28)} strokeWidth="0.55" />
    </svg>
  );
}

function SketchBrandIdentity({ accent }: { accent: [number, number, number] }) {
  return (
    <svg viewBox="0 0 280 110" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Logo mark center */}
      <circle cx="80" cy="55" r="28" fill={rgba(accent, 0.05)} stroke={rgba(accent, 0.28)} strokeWidth="0.9" />
      <circle cx="80" cy="55" r="16" fill={rgba(accent, 0.08)} stroke={rgba(accent, 0.45)} strokeWidth="0.8" />
      <circle cx="80" cy="55" r="6" fill={rgba(accent, 0.5)} stroke="none" />
      {/* Type specimen */}
      <line x1="128" y1="32" x2="230" y2="32" stroke={rgba(accent, 0.65)} strokeWidth="2.2" />
      <line x1="128" y1="42" x2="212" y2="42" stroke={rgba(accent, 0.4)} strokeWidth="1.4" />
      <line x1="128" y1="52" x2="196" y2="52" stroke={rgba([160,160,160], 0.22)} strokeWidth="0.7" />
      {/* Color swatches */}
      {[accent, [110,120,255] as [number,number,number], [0,210,180] as [number,number,number], [160,160,160] as [number,number,number]].map((c, i) => (
        <rect key={i} x={128 + i * 22} y="62" width="18" height="18" rx="3"
          fill={rgba(c, 0.7)} stroke={rgba([160,160,160], 0.12)} strokeWidth="0.5" />
      ))}
      {/* Grid lines */}
      <line x1="128" y1="90" x2="268" y2="90" stroke={rgba([160,160,160], 0.14)} strokeWidth="0.55" />
      <line x1="128" y1="97" x2="220" y2="97" stroke={rgba([160,160,160], 0.1)} strokeWidth="0.5" />
    </svg>
  );
}

function SketchWebProject({ accent }: { accent: [number, number, number] }) {
  return (
    <svg viewBox="0 0 280 110" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Desktop + mobile side by side */}
      <rect x="8" y="12" width="182" height="86" rx="4" stroke={rgba([160,160,160], 0.15)} strokeWidth="0.8" />
      <line x1="8" y1="26" x2="190" y2="26" stroke={rgba([160,160,160], 0.1)} strokeWidth="0.6" />
      <line x1="18" y1="19" x2="50" y2="19" stroke={rgba([160,160,160], 0.22)} strokeWidth="0.75" />
      <rect x="164" y="17" width="22" height="8" rx="3" fill={rgba(accent, 0.8)} stroke="none" />
      {/* Desktop content */}
      <rect x="16" y="33" width="90" height="57" rx="2" fill={rgba(accent, 0.04)} stroke={rgba([160,160,160], 0.1)} strokeWidth="0.5" />
      <line x1="16" y1="33" x2="106" y2="90" stroke={rgba([160,160,160], 0.05)} strokeWidth="0.4" />
      <line x1="116" y1="40" x2="180" y2="40" stroke={rgba(accent, 0.65)} strokeWidth="1.1" />
      <line x1="116" y1="48" x2="172" y2="48" stroke={rgba(accent, 0.38)} strokeWidth="0.75" />
      <line x1="116" y1="56" x2="166" y2="56" stroke={rgba([160,160,160], 0.18)} strokeWidth="0.55" />
      <line x1="116" y1="63" x2="174" y2="63" stroke={rgba([160,160,160], 0.14)} strokeWidth="0.5" />
      <rect x="116" y="72" width="44" height="9" rx="3" fill={rgba(accent, 0.82)} stroke="none" />
      {/* Mobile */}
      <rect x="206" y="8" width="66" height="94" rx="6" stroke={rgba(accent, 0.28)} strokeWidth="0.85" />
      <line x1="206" y1="24" x2="272" y2="24" stroke={rgba([160,160,160], 0.1)} strokeWidth="0.5" />
      <rect x="214" y="30" width="50" height="32" rx="2" fill={rgba(accent, 0.04)} stroke={rgba([160,160,160], 0.1)} strokeWidth="0.5" />
      <line x1="214" y1="30" x2="264" y2="62" stroke={rgba([160,160,160], 0.04)} strokeWidth="0.4" />
      <line x1="214" y1="70" x2="260" y2="70" stroke={rgba(accent, 0.5)} strokeWidth="0.75" />
      <line x1="214" y1="77" x2="252" y2="77" stroke={rgba(accent, 0.28)} strokeWidth="0.55" />
      <rect x="222" y="84" width="28" height="8" rx="3" fill={rgba(accent, 0.75)} stroke="none" />
    </svg>
  );
}

function SketchTimeline({ accent }: { accent: [number, number, number] }) {
  return (
    <svg viewBox="0 0 280 110" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Week-by-week project timeline */}
      <line x1="20" y1="55" x2="260" y2="55" stroke={rgba([160,160,160], 0.14)} strokeWidth="0.7" />
      {[
        { x: 40, week: "Wk 1", label: "Brief + discovery" },
        { x: 100, week: "Wk 2", label: "Concepts" },
        { x: 160, week: "Wk 3–4", label: "Build" },
        { x: 230, week: "Wk 5", label: "Launch" },
      ].map(({ x, week, label }, i) => {
        const isLast = i === 3;
        return (
          <g key={x}>
            <circle cx={x} cy={55} r={isLast ? 7 : 5}
              fill={isLast ? rgba(accent, 0.14) : rgba([160,160,160], 0.06)}
              stroke={isLast ? rgba(accent, 0.65) : rgba([160,160,160], 0.22)}
              strokeWidth={isLast ? "1.1" : "0.7"} />
            {isLast && <circle cx={x} cy={55} r={2.5} fill={rgba(accent, 0.6)} stroke="none" />}
            <text x={x} y="42" textAnchor="middle" fontSize="6" fill={rgba([160,160,160], 0.35)} fontFamily="inherit">{week}</text>
            <text x={x} y="72" textAnchor="middle" fontSize="6" fill={rgba([160,160,160], isLast ? 0.5 : 0.28)} fontFamily="inherit">{label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Sketch registry ──────────────────────────────────────────────────────────

const SKETCH_MAP: Record<string, (p: { accent: [number, number, number] }) => React.ReactElement> = {
  install: SketchInstall,
  colors: SketchColors,
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

// ─── Aether docs ──────────────────────────────────────────────────────────────

const AETHER_ACCENT: [number, number, number] = [56, 180, 255];

const AETHER_DOCS: DocSection[] = [
  {
    id: "aether-getting-started",
    title: "Getting started",
    articles: [
      {
        id: "aether-installation",
        title: "Installation",
        body: [
          { type: "sketch", name: "install", accent: AETHER_ACCENT },
          { type: "p", text: "Aether is delivered as a standard Shopify theme zip. After purchase you receive a download link via email. No accounts, no dashboards. Installation takes under two minutes." },
          { type: "h3", text: "Steps" },
          { type: "ol", items: [
            "In your Shopify admin, go to Online Store › Themes.",
            "Click Add theme › Upload zip file.",
            "Select the Aether .zip from your download.",
            "Click Customize to configure, or Publish to go live.",
          ]},
          { type: "note", accent: AETHER_ACCENT, text: "Your existing live theme stays untouched until you explicitly publish Aether. It's safe to upload and preview first." },
        ],
      },
      {
        id: "aether-first-setup",
        title: "First-time setup",
        body: [
          { type: "p", text: "After installing, a short setup sequence gets you from a blank install to something that looks like yours, before you touch a single section." },
          { type: "h3", text: "Recommended order" },
          { type: "ol", items: [
            "Open the theme editor and go to Theme settings.",
            "Set your brand colors under Colors.",
            "Upload your logo under Header.",
            "Choose your type scale under Typography. The defaults work for most brands.",
            "Review the Homepage template. Most sections already have presets loaded.",
          ]},
          { type: "p", text: "From here, most stores are ready to publish. The default section presets are designed to look good with any brand color out of the box." },
        ],
      },
      {
        id: "aether-license",
        title: "License and stores",
        body: [
          { type: "sketch", name: "license", accent: AETHER_ACCENT },
          { type: "p", text: "Each license covers a single Shopify store. If you need Aether on more than one store, purchase additional licenses." },
          { type: "h3", text: "Standard vs Lifetime" },
          { type: "ul", items: [
            "Standard: 1 year of updates, single store. The theme keeps working after the year; you just won't receive new releases.",
            "Lifetime: updates for life on a single store, no renewals.",
            "Custom: a bespoke version built around your brand. Includes direct access to us throughout.",
          ]},
          { type: "note", accent: AETHER_ACCENT, text: "Transferring a license to a different store is handled on request, at no extra charge." },
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
          { type: "sketch", name: "megaMenu", accent: AETHER_ACCENT },
          { type: "p", text: "The header supports a standard nav, a mega menu, and a transparent mode for hero sections. All options live in Theme settings › Header." },
          { type: "h3", text: "Mega menu" },
          { type: "p", text: "Any top-level nav item with child links renders a two-column mega menu. The right panel can show a featured image, a collection tile, or nothing at all." },
          { type: "ul", items: [
            "Set up nav links in Shopify Admin › Navigation › Main menu.",
            "Add child links under any top-level item to trigger the mega menu.",
            "Assign a right-panel block to each item under Header › Mega menu panels in the theme editor.",
          ]},
          { type: "h3", text: "Transparent mode" },
          { type: "p", text: "Enable the transparent header when your homepage hero has a full-bleed image or dark background. The header becomes opaque on scroll." },
        ],
      },
      {
        id: "aether-hero",
        title: "Hero",
        body: [
          { type: "sketch", name: "hero", accent: AETHER_ACCENT },
          { type: "p", text: "Aether ships with three hero variants: full-bleed, split, and text-only. Each has its own block options." },
          { type: "h3", text: "Full-bleed" },
          { type: "p", text: "A full-width media block with an overlay text column. Supports images and video. The overlay position is adjustable in six grid positions." },
          { type: "h3", text: "Split" },
          { type: "p", text: "50/50 or 60/40 split between media and text. Best for product-focused hero shots. The media side can be a product image, static image, or video." },
          { type: "h3", text: "Text-only" },
          { type: "p", text: "A centered or left-aligned headline with optional subtext and CTA. Good for campaign announcements or editorial intros." },
          { type: "note", accent: AETHER_ACCENT, text: "All hero variants support the announcement bar above them. The bar inherits the brand color set in Theme settings." },
        ],
      },
      {
        id: "aether-product-page",
        title: "Product page",
        body: [
          { type: "sketch", name: "productPage", accent: AETHER_ACCENT },
          { type: "p", text: "The product page is the most performance-tuned part of Aether. The layout follows a 7/5 media-to-form split with a sticky form column." },
          { type: "h3", text: "Sticky add-to-cart" },
          { type: "p", text: "A sticky bar appears once the native ATC button scrolls out of view. It shows the product title, selected variant, and a minimal button. Disable it per-template in the theme editor." },
          { type: "h3", text: "Trust badges" },
          { type: "p", text: "A trust badge row sits directly beneath the ATC button. Upload up to four icons with short labels in the product page blocks." },
          { type: "h3", text: "Tabs" },
          { type: "p", text: "Details, materials, shipping, and returns render as accordion tabs to keep the page compact. Reorder or rename tabs in the product page template." },
        ],
      },
      {
        id: "aether-collection",
        title: "Collection page",
        body: [
          { type: "p", text: "Collection pages support two layouts: a standard grid and an editorial masonry mode. Both are configurable per template." },
          { type: "h3", text: "Filters" },
          { type: "p", text: "Aether uses Shopify's native Search & Discovery app for filtering. Enable it in your Shopify admin and the filter panel appears automatically. No code changes needed." },
          { type: "h3", text: "Product card options" },
          { type: "ul", items: [
            "Quick-add: an add-to-cart button on hover. Works for single-variant products or with a variant flyout.",
            "Color swatch: shows variant swatches on the card. Hovering prefetches the variant image.",
            "Sold-out badge: overlaid on the card image when all variants are unavailable.",
          ]},
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
          { type: "sketch", name: "colors", accent: AETHER_ACCENT },
          { type: "p", text: "All colors in Aether are defined as CSS custom properties. You set the base values in Theme settings › Colors and everything else derives from them automatically." },
          { type: "h3", text: "Color roles" },
          { type: "ul", items: [
            "Primary: used for CTAs, links, and highlights. Should be your brand accent.",
            "Surface: the background color of cards and overlays.",
            "Foreground: text color, set automatically as a contrast-safe value relative to your background.",
            "Line: border and divider color. Derives from foreground at low opacity.",
          ]},
          { type: "h3", text: "Dark mode" },
          { type: "p", text: "Aether reads prefers-color-scheme and applies the right values on first load with no flash. You can expose a toggle to customers via Theme settings › Colors. Both modes are fully designed, not just inverted." },
        ],
      },
      {
        id: "aether-dark-mode",
        title: "Dark mode",
        body: [
          { type: "sketch", name: "darkMode", accent: AETHER_ACCENT },
          { type: "p", text: "Aether ships with a complete dark mode: every section, every component, every state. It's not an inversion filter. The dark palette was designed separately to feel intentional." },
          { type: "h3", text: "How it activates" },
          { type: "ul", items: [
            "On first load, Aether reads the visitor's OS preference via prefers-color-scheme.",
            "The correct mode is applied before any content renders. No flash of the wrong colors.",
            "If you've enabled the manual toggle, the visitor's choice is stored in localStorage.",
          ]},
          { type: "note", accent: AETHER_ACCENT, text: "The manual toggle is optional. Most stores leave it off and let the OS preference decide." },
        ],
      },
      {
        id: "aether-custom-css",
        title: "Custom CSS",
        body: [
          { type: "p", text: "For anything beyond the theme editor, use the Custom CSS field in Theme settings › Advanced." },
          { type: "h3", text: "Available tokens" },
          { type: "code", text: `--color-primary     your brand accent
--color-surface     card and overlay background
--color-fg          foreground text
--color-bg          page background
--color-line        borders and dividers
--radius-sm / -md / -lg   border radii` },
          { type: "note", accent: AETHER_ACCENT, text: "Custom CSS is preserved across theme updates as long as you don't overwrite the base files." },
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
          { type: "p", text: "Updates are delivered as a new .zip attached to an email from your license. Nothing updates automatically; you apply updates when you're ready." },
          { type: "h3", text: "Update process" },
          { type: "ol", items: [
            "Download the new .zip from the update email.",
            "In Shopify admin, go to Online Store › Themes.",
            "Click Add theme › Upload zip. This creates a new unpublished copy; your live theme is untouched.",
            "Preview the new version. If it looks right, publish.",
            "Re-apply any custom code changes to the new version's files.",
          ]},
          { type: "note", accent: AETHER_ACCENT, text: "Check the changelog before updating. Major releases list every changed file so you know exactly where to re-apply custom edits." },
        ],
      },
      {
        id: "aether-backup",
        title: "Backing up",
        body: [
          { type: "p", text: "Shopify automatically keeps your previous theme as an unpublished copy when you publish a new one. Re-publish the old version from the theme list instantly if you need to roll back." },
          { type: "p", text: "For custom code changes, keep a copy of your modified files outside Shopify. A private GitHub repo works well; it makes diffing an update against your version straightforward." },
        ],
      },
      {
        id: "aether-merging",
        title: "Merging custom code",
        body: [
          { type: "p", text: "If you've edited theme files directly, you'll need to re-apply those changes after updating. The changelog lists every touched file per release to keep this scoped." },
          { type: "h3", text: "Workflow" },
          { type: "ol", items: [
            "Note which files you edited. The diff between your version and stock Aether shows you this.",
            "Download the new release zip.",
            "Open both versions side by side.",
            "Re-apply your changes to the new files, cross-referencing the changelog for that release.",
            "Upload the merged version.",
          ]},
          { type: "note", accent: AETHER_ACCENT, text: "For significant custom development, consider using Shopify CLI with a Git-based workflow. It makes merging updates much easier." },
        ],
      },
    ],
  },
];

// ─── Inertia docs ─────────────────────────────────────────────────────────────

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

// ─── Products registry ────────────────────────────────────────────────────────

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

// ─── Components ───────────────────────────────────────────────────────────────

function ArticleBody({ body, accent }: { body: ArticleBlock[]; accent: [number, number, number] }) {
  return (
    <div className="flex flex-col gap-5">
      {body.map((block, i) => {
        if (block.type === "sketch") {
          const Sketch = SKETCH_MAP[block.name];
          if (!Sketch) return null;
          return (
            <div key={i} className="w-full rounded-lg overflow-hidden border border-[rgb(var(--line))] py-6 px-4 mb-1" style={{ background: rgba(accent, 0.022) }}>
              <Sketch accent={block.accent} />
            </div>
          );
        }
        if (block.type === "p") {
          return <p key={i} className="text-[14px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">{block.text}</p>;
        }
        if (block.type === "h3") {
          return (
            <h3 key={i} className="text-[13px] font-medium tracking-tight mt-2" style={{ color: rgba(accent, 0.88) }}>
              {block.text}
            </h3>
          );
        }
        if (block.type === "ol") {
          return (
            <ol key={i} className="flex flex-col gap-2.5 pl-5">
              {block.items.map((item, j) => (
                <li key={j} className="text-[14px] leading-relaxed tracking-tight text-[rgb(var(--muted))] list-decimal">{item}</li>
              ))}
            </ol>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={i} className="flex flex-col gap-2.5 pl-5">
              {block.items.map((item, j) => (
                <li key={j} className="text-[14px] leading-relaxed tracking-tight text-[rgb(var(--muted))] list-disc">{item}</li>
              ))}
            </ul>
          );
        }
        if (block.type === "note") {
          const na = block.accent ?? accent;
          return (
            <div key={i} className="rounded-lg px-4 py-3.5 flex gap-3" style={{ background: rgba(na, 0.06), border: `1px solid ${rgba(na, 0.18)}` }}>
              <svg viewBox="0 0 16 16" fill="none" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 mt-[1px]" style={{ stroke: rgba(na, 0.7) }} strokeWidth="1.5" aria-hidden="true">
                <circle cx="8" cy="8" r="6" />
                <line x1="8" y1="7" x2="8" y2="11" />
                <circle cx="8" cy="5" r="0.5" fill="currentColor" stroke="none" />
              </svg>
              <p className="text-[13px] leading-relaxed tracking-tight" style={{ color: rgba(na, 0.78) }}>{block.text}</p>
            </div>
          );
        }
        if (block.type === "code") {
          return (
            <pre key={i} className="text-[12px] leading-relaxed tracking-tight rounded-lg border border-[rgb(var(--line))] px-4 py-4 overflow-x-auto whitespace-pre-wrap text-[rgb(var(--muted))]" style={{ background: rgba(accent, 0.022) }}>
              <code>{block.text}</code>
            </pre>
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
              <span className="text-[13px] tracking-tight" style={{ color: active ? rgba(p.accent, 0.9) : "rgb(var(--muted))" }}>
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
                    color: active ? rgba(product.accent, 0.9) : "rgb(var(--muted))",
                    background: active ? rgba(product.accent, 0.07) : undefined,
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

function Divider() {
  return <div className="h-px bg-[rgb(var(--line))]" />;
}

export default function DocsPage() {
  const [activeProductId, setActiveProductId] = useState(PRODUCTS[0].id);
  const [activeArticleId, setActiveArticleId] = useState(PRODUCTS[0].sections[0].articles[0].id);
  const [sheetOpen, setSheetOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const product = PRODUCTS.find((p) => p.id === activeProductId)!;
  const allArticles = product.sections.flatMap((s) => s.articles);

  const handleSelectProduct = (id: string) => {
    setActiveProductId(id);
    const p = PRODUCTS.find((x) => x.id === id)!;
    setActiveArticleId(p.sections[0].articles[0].id);
    const lenis = (window as any).__lenis;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
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
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
    allArticles.forEach((a) => {
      const el = document.getElementById(a.id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [activeProductId]);

  useEffect(() => {
    document.body.style.overflow = sheetOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sheetOpen]);

  const sidebarProps = { products: PRODUCTS, activeProductId, activeArticleId, onSelectProduct: handleSelectProduct };

  return (
    <div className="page-container mx-auto w-full max-w-5xl min-h-screen flex flex-col">

      <header className="px-6 sm:px-8 pt-6 sm:pt-8 pb-10 sm:pb-12 rise" style={{ ["--rise-delay" as any]: "0ms" }}>
        <Link href="/" className="text-sm tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
          ← Inertia
        </Link>
      </header>

      <Divider />

      <div className="px-6 sm:px-8 py-8 sm:py-10 rise" style={{ ["--rise-delay" as any]: "60ms" }}>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tighter leading-none mb-3">Docs</h1>
        <p className="text-[15px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">
          Everything you need to set up, configure, and get the most out of Inertia products.
        </p>
      </div>

      <Divider />


      <div className="rise flex flex-1" style={{ ["--rise-delay" as any]: "120ms" }}>

        <aside className="hidden lg:block w-52 xl:w-60 shrink-0 border-r border-[rgb(var(--line))]">
          <div className="sticky top-0 px-6 max-h-screen overflow-y-auto">
            <SidebarNav {...sidebarProps} />
          </div>
        </aside>

        <div className="flex-1 min-w-0 pb-32 lg:pb-0">
          {product.sections.map((section) =>
            section.articles.map((article) => (
              <article
                key={article.id}
                id={article.id}
                className="scroll-mt-8 px-6 sm:px-10 py-10 sm:py-12 border-b border-[rgb(var(--line))]"
              >
                <h2 className="text-[1.4rem] sm:text-2xl font-medium tracking-tighter leading-tight text-[rgb(var(--fg))] mb-7">
                  {article.title}
                </h2>
                <ArticleBody body={article.body} accent={product.accent} />
              </article>
            ))
          )}
        </div>
      </div>

      {/* Mobile sticky TOC bar */}
      {(() => {
        const activeArticle = allArticles.find((a) => a.id === activeArticleId);
        const articleIndex = allArticles.findIndex((a) => a.id === activeArticleId);
        const progress = allArticles.length > 1 ? (articleIndex + 1) / allArticles.length : 1;
        return (
          <button
            onClick={() => setSheetOpen(true)}
            className="lg:hidden fixed bottom-0 inset-x-0 z-40 w-full flex items-center gap-3 px-5 [-webkit-tap-highlight-color:transparent]"
            style={{
              height: 56,
              background: "rgb(var(--bg))",
              borderTop: "1px solid rgb(var(--line))",
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
          >
            {/* Progress ring / dot */}
            <svg width="20" height="20" viewBox="0 0 20 20" className="shrink-0" aria-hidden="true">
              <circle cx="10" cy="10" r="8" fill="none" stroke={rgba(product.accent, 0.12)} strokeWidth="1.5" />
              <circle cx="10" cy="10" r="8" fill="none"
                stroke={rgba(product.accent, 0.75)} strokeWidth="1.5"
                strokeDasharray={`${2 * Math.PI * 8}`}
                strokeDashoffset={`${2 * Math.PI * 8 * (1 - progress)}`}
                strokeLinecap="round"
                style={{ transform: "rotate(-90deg)", transformOrigin: "10px 10px" }}
              />
              <circle cx="10" cy="10" r="2.5" fill={rgba(product.accent, 0.7)} />
            </svg>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[11px] tracking-tight text-[rgb(var(--muted))] leading-none mb-0.5" style={{ opacity: 0.5 }}>
                {articleIndex + 1} of {allArticles.length}
              </p>
              <p className="text-[13px] tracking-tight text-[rgb(var(--fg))] truncate leading-snug">
                {activeArticle?.title ?? "Contents"}
              </p>
            </div>
            <div className="flex items-center gap-1 text-[12px] tracking-tight shrink-0" style={{ color: rgba(product.accent, 0.7) }}>
              <span>Contents</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </button>
        );
      })()}

      {/* Mobile sheet — always mounted, transitions in/out */}
      <div
        className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end"
        style={{
          pointerEvents: sheetOpen ? "auto" : "none",
        }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          onClick={() => setSheetOpen(false)}
          style={{
            background: "rgba(0,0,0,0.35)",
            opacity: sheetOpen ? 1 : 0,
            transition: "opacity 260ms cubic-bezier(0.22,1,0.36,1)",
          }}
        />
        {/* Sheet */}
        <div
          className="relative z-10 rounded-t-2xl border-t border-[rgb(var(--line))] flex flex-col"
          style={{
            background: "rgb(var(--bg))",
            maxHeight: "78vh",
            transform: sheetOpen ? "translateY(0)" : "translateY(105%)",
            transition: "transform 360ms cubic-bezier(0.32,0.72,0,1)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[rgb(var(--line))] shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: rgba(product.accent, 0.8) }} />
              <p className="text-[13px] font-medium tracking-tight text-[rgb(var(--fg))]">{product.name} docs</p>
            </div>
            <button
              onClick={() => setSheetOpen(false)}
              className="h-7 w-7 flex items-center justify-center rounded-full text-[rgb(var(--muted))] transition-colors"
              style={{ background: "rgba(128,128,128,0.08)" }}
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1" style={{ paddingBottom: "env(safe-area-inset-bottom, 24px)" }}>
            {/* Product switcher */}
            <div className="px-5 pt-4 pb-3 border-b border-[rgb(var(--line))] flex gap-2">
              {PRODUCTS.map((p) => {
                const active = p.id === activeProductId;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProduct(p.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] tracking-tight transition-colors [-webkit-tap-highlight-color:transparent]"
                    style={{
                      background: active ? rgba(p.accent, 0.1) : "rgba(128,128,128,0.06)",
                      color: active ? rgba(p.accent, 0.9) : "rgb(var(--muted))",
                      border: `1px solid ${active ? rgba(p.accent, 0.25) : "rgb(var(--line))"}`,
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: rgba(p.accent, active ? 0.9 : 0.3) }} />
                    {p.name}
                  </button>
                );
              })}
            </div>

            {/* Sections + articles */}
            <div className="px-4 py-4 flex flex-col gap-4">
              {product.sections.map((section) => (
                <div key={section.id}>
                  <p className="text-[11px] tracking-tight font-medium text-[rgb(var(--muted))] mb-1.5 px-2" style={{ opacity: 0.45 }}>
                    {section.title}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {section.articles.map((article) => {
                      const active = activeArticleId === article.id;
                      return (
                        <a
                          key={article.id}
                          href={`#${article.id}`}
                          onClick={() => setSheetOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] tracking-tight [-webkit-tap-highlight-color:transparent]"
                          style={{
                            background: active ? rgba(product.accent, 0.08) : undefined,
                            color: active ? rgba(product.accent, 0.9) : "rgb(var(--muted))",
                            transition: "background 150ms ease, color 150ms ease",
                          }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full shrink-0"
                            style={{ background: active ? rgba(product.accent, 0.8) : "transparent" }}
                          />
                          {article.title}
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes sheet-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
}
