"use client";

import React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

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
  | { type: "note"; accent?: [number, number, number]; text: string }
  | { type: "code"; text: string }
  | { type: "sketch"; name: string; accent: [number, number, number] };

function rgba([r, g, b]: [number, number, number], a = 1) {
  return `rgba(${r},${g},${b},${a})`;
}
// For sketch text labels — uses CSS var so it respects light/dark
const sketchText = (opacity = 0.4) => ({ fill: `rgb(var(--fg) / ${opacity})` } as React.SVGProps<SVGTextElement>);

// â"€â"€â"€ Aether sketches â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

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
      {/* Browser chrome */}
      <rect x="8" y="8" width="264" height="94" rx="4" stroke={rgba([160,160,160], 0.15)} strokeWidth="0.8" />
      <line x1="8" y1="20" x2="272" y2="20" stroke={rgba([160,160,160], 0.1)} strokeWidth="0.5" />
      {/* Center product image */}
      <rect x="86" y="26" width="108" height="56" rx="3" fill={rgba(accent, 0.05)} stroke={rgba([160,160,160], 0.12)} strokeWidth="0.6" />
      <ellipse cx="140" cy="54" rx="22" ry="22" fill={rgba(accent, 0.08)} stroke={rgba(accent, 0.2)} strokeWidth="0.7" />
      <ellipse cx="140" cy="54" rx="10" ry="10" fill={rgba(accent, 0.18)} stroke="none" />
      {/* Left col — product info + tabs */}
      <line x1="14" y1="30" x2="78" y2="30" stroke={rgba([160,160,160], 0.2)} strokeWidth="0.5" />
      <line x1="14" y1="36" x2="70" y2="36" stroke={rgba(accent, 0.5)} strokeWidth="0.8" />
      <line x1="14" y1="42" x2="60" y2="42" stroke={rgba(accent, 0.3)} strokeWidth="0.6" />
      {/* Tabs */}
      <line x1="14" y1="52" x2="82" y2="52" stroke={rgba([160,160,160], 0.12)} strokeWidth="0.4" />
      {["Details","Materials","Shipping"].map((t, i) => (
        <g key={t}>
          <line x1={14 + i * 24} y1="58" x2={30 + i * 24} y2="58"
            stroke={i === 0 ? rgba(accent, 0.6) : rgba([160,160,160], 0.2)}
            strokeWidth={i === 0 ? "0.8" : "0.5"} />
          {i === 0 && <line x1="14" y1="60" x2="30" y2="60" stroke={rgba(accent, 0.5)} strokeWidth="1" />}
        </g>
      ))}
      <line x1="14" y1="66" x2="80" y2="66" stroke={rgba([160,160,160], 0.12)} strokeWidth="0.4" />
      <line x1="14" y1="72" x2="74" y2="72" stroke={rgba([160,160,160], 0.1)} strokeWidth="0.4" />
      <line x1="14" y1="78" x2="76" y2="78" stroke={rgba([160,160,160], 0.1)} strokeWidth="0.4" />
      {/* Right col — price, variants, ATC, urgency */}
      <line x1="202" y1="30" x2="264" y2="30" stroke={rgba([160,160,160], 0.18)} strokeWidth="0.5" />
      <line x1="202" y1="36" x2="232" y2="36" stroke={rgba(accent, 0.7)} strokeWidth="1.1" />
      {/* Variant swatches */}
      {[0,1,2,3].map(i => (
        <circle key={i} cx={208 + i * 10} cy={46} r={3.5}
          fill={i === 0 ? rgba(accent, 0.7) : rgba([160,160,160], 0.1)}
          stroke={i === 0 ? rgba(accent, 0.5) : rgba([160,160,160], 0.2)} strokeWidth="0.5" />
      ))}
      {/* Variant size pills */}
      {[0,1,2].map(i => (
        <rect key={i} x={202 + i * 20} y="54" width="16" height="8" rx="2"
          fill={i === 1 ? rgba(accent, 0.1) : "none"}
          stroke={i === 1 ? rgba(accent, 0.45) : rgba([160,160,160], 0.18)} strokeWidth="0.5" />
      ))}
      {/* ATC button */}
      <rect x="202" y="67" width="62" height="11" rx="3" fill={rgba(accent, 0.88)} stroke="none" />
      {/* Urgency */}
      <line x1="202" y1="84" x2="244" y2="84" stroke={rgba([255,120,60], 0.55)} strokeWidth="0.7" />
      <line x1="202" y1="90" x2="236" y2="90" stroke={rgba([255,120,60], 0.35)} strokeWidth="0.55" />
    </svg>
  );
}

function SketchUpdate({ accent }: { accent: [number, number, number] }) {
  // Shows old zip → upload → new theme ready — a clear update flow
  return (
    <svg viewBox="0 0 280 110" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Old theme file */}
      <rect x="14" y="22" width="52" height="66" rx="3" fill={rgba([160,160,160], 0.04)} stroke={rgba([160,160,160], 0.2)} strokeWidth="0.8" />
      <polyline points="50,22 66,22 66,38" stroke={rgba([160,160,160], 0.2)} strokeWidth="0.8" />
      <line x1="50" y1="22" x2="66" y2="38" stroke={rgba([160,160,160], 0.14)} strokeWidth="0.6" />
      <line x1="22" y1="46" x2="58" y2="46" stroke={rgba([160,160,160], 0.16)} strokeWidth="0.55" />
      <line x1="22" y1="53" x2="52" y2="53" stroke={rgba([160,160,160], 0.12)} strokeWidth="0.5" />
      <line x1="22" y1="60" x2="56" y2="60" stroke={rgba([160,160,160], 0.12)} strokeWidth="0.5" />
      <text x="40" y="78" textAnchor="middle" fontSize="7" {...sketchText(0.35)} fontFamily="monospace">v1.3.zip</text>
      {/* Arrow */}
      <line x1="78" y1="55" x2="108" y2="55" stroke={rgba(accent, 0.35)} strokeWidth="1" strokeDasharray="3 3" />
      <polyline points="104,51 109,55 104,59" stroke={rgba(accent, 0.5)} strokeWidth="1" />
      {/* Upload box */}
      <rect x="114" y="36" width="52" height="38" rx="3" fill={rgba(accent, 0.05)} stroke={rgba(accent, 0.3)} strokeWidth="0.8" strokeDasharray="3 3" />
      <line x1="140" y1="61" x2="140" y2="46" stroke={rgba(accent, 0.45)} strokeWidth="1" />
      <polyline points="135,50 140,45 145,50" stroke={rgba(accent, 0.55)} strokeWidth="1" />
      <text x="140" y="72" textAnchor="middle" fontSize="7" fill={rgba(accent, 0.45)} fontFamily="monospace">Upload</text>
      {/* Arrow */}
      <line x1="178" y1="55" x2="208" y2="55" stroke={rgba(accent, 0.35)} strokeWidth="1" strokeDasharray="3 3" />
      <polyline points="204,51 209,55 204,59" stroke={rgba(accent, 0.5)} strokeWidth="1" />
      {/* New theme — accent highlighted */}
      <rect x="214" y="22" width="52" height="66" rx="3" fill={rgba(accent, 0.06)} stroke={rgba(accent, 0.4)} strokeWidth="0.9" />
      <polyline points="250,22 266,22 266,38" stroke={rgba(accent, 0.35)} strokeWidth="0.8" />
      <line x1="250" y1="22" x2="266" y2="38" stroke={rgba(accent, 0.25)} strokeWidth="0.6" />
      <line x1="222" y1="46" x2="258" y2="46" stroke={rgba(accent, 0.3)} strokeWidth="0.6" />
      <line x1="222" y1="53" x2="252" y2="53" stroke={rgba(accent, 0.2)} strokeWidth="0.5" />
      <line x1="222" y1="60" x2="256" y2="60" stroke={rgba(accent, 0.2)} strokeWidth="0.5" />
      <text x="240" y="78" textAnchor="middle" fontSize="7" fill={rgba(accent, 0.6)} fontFamily="monospace">v1.4.zip</text>
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
        <text key={i} x={45 + i * 95} y="108" textAnchor="middle" fontSize="6.5" {...sketchText(0.35)} fontFamily="inherit">{label}</text>
      ))}
    </svg>
  );
}

function SketchMegaMenu({ accent }: { accent: [number, number, number] }) {
  return (
    <svg viewBox="0 0 280 110" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Nav bar */}
      <rect x="8" y="8" width="264" height="18" rx="3" fill={rgba([160,160,160], 0.03)} stroke={rgba([160,160,160], 0.13)} strokeWidth="0.7" />
      {/* Logo */}
      <line x1="16" y1="17" x2="36" y2="17" stroke={rgba([160,160,160], 0.35)} strokeWidth="1.1" />
      {/* Nav items — second one active */}
      {["Home","Products","About","Contact"].map((label, i) => (
        <g key={i}>
          <line x1={64 + i * 46} y1="17" x2={82 + i * 46} y2="17"
            stroke={i === 1 ? rgba(accent, 0.75) : rgba([160,160,160], 0.2)}
            strokeWidth={i === 1 ? "0.9" : "0.55"} />
          {i === 1 && <circle cx={72 + i * 46} cy="25" r="1.2" fill={rgba(accent, 0.6)} stroke="none" />}
        </g>
      ))}
      {/* Dropdown panel */}
      <rect x="54" y="29" width="172" height="72" rx="3" fill={rgba([160,160,160], 0.02)} stroke={rgba([160,160,160], 0.14)} strokeWidth="0.7" />
      {/* Left col — nav links */}
      <line x1="64" y1="38" x2="130" y2="38" stroke={rgba(accent, 0.65)} strokeWidth="0.9" />
      <line x1="64" y1="43" x2="110" y2="43" stroke={rgba(accent, 0.25)} strokeWidth="0.5" />
      {[51,64,77].map(y => (
        <g key={y}>
          <line x1="64" y1={y} x2="128" y2={y} stroke={rgba([160,160,160], 0.2)} strokeWidth="0.55" />
          <line x1="64" y1={y + 5} x2={100 + y * 0.1} y2={y + 5} stroke={rgba([160,160,160], 0.1)} strokeWidth="0.4" />
        </g>
      ))}
      {/* Divider */}
      <line x1="142" y1="34" x2="142" y2="94" stroke={rgba([160,160,160], 0.1)} strokeWidth="0.5" />
      {/* Right col — featured image */}
      <rect x="150" y="34" width="68" height="56" rx="2" fill={rgba(accent, 0.05)} stroke={rgba(accent, 0.2)} strokeWidth="0.6" />
      <rect x="150" y="34" width="68" height="32" rx="2" fill={rgba(accent, 0.08)} stroke="none" />
      <line x1="158" y1="75" x2="210" y2="75" stroke={rgba(accent, 0.5)} strokeWidth="0.8" />
      <line x1="158" y1="81" x2="196" y2="81" stroke={rgba(accent, 0.28)} strokeWidth="0.55" />
      <rect x="158" y="86" width="32" height="6" rx="2" fill={rgba(accent, 0.8)} stroke="none" />
    </svg>
  );
}

function SketchDarkMode({ accent }: { accent: [number, number, number] }) {
  return (
    <svg viewBox="0 0 280 110" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Light mode storefront */}
      <rect x="12" y="8" width="116" height="94" rx="5" fill="rgba(250,250,248,0.9)" stroke={rgba([160,160,160], 0.2)} strokeWidth="0.8" />
      <rect x="12" y="8" width="116" height="20" rx="5" fill="rgba(245,245,242,1)" stroke="none" />
      <line x1="12" y1="28" x2="128" y2="28" stroke={rgba([160,160,160], 0.1)} strokeWidth="0.5" />
      <line x1="22" y1="18" x2="52" y2="18" stroke={rgba([80,80,80], 0.35)} strokeWidth="0.8" />
      <rect x="22" y="35" width="96" height="42" rx="2" fill="rgba(238,238,235,0.6)" stroke={rgba([160,160,160], 0.1)} strokeWidth="0.5" />
      <line x1="22" y1="84" x2="88" y2="84" stroke={rgba([60,60,60], 0.25)} strokeWidth="0.65" />
      <line x1="22" y1="90" x2="72" y2="90" stroke={rgba([60,60,60], 0.15)} strokeWidth="0.5" />
      <rect x="22" y="96" width="32" height="4" rx="1.5" fill={rgba([60,60,60], 0.75)} stroke="none" />
      {/* Sun icon */}
      <circle cx="116" cy="18" r="4" fill="rgba(255,200,60,0.2)" stroke="rgba(255,200,60,0.5)" strokeWidth="0.7" />
      {/* Arrow */}
      <line x1="136" y1="55" x2="150" y2="55" stroke={rgba([160,160,160], 0.2)} strokeWidth="0.8" strokeDasharray="2 2" />
      <polyline points="147,52 151,55 147,58" stroke={rgba([160,160,160], 0.3)} strokeWidth="0.8" />
      {/* Dark mode storefront */}
      <rect x="154" y="8" width="116" height="94" rx="5" fill="rgba(12,12,14,0.95)" stroke={rgba(accent, 0.3)} strokeWidth="0.9" />
      <rect x="154" y="8" width="116" height="20" rx="5" fill="rgba(8,8,10,0.95)" stroke="none" />
      <line x1="154" y1="28" x2="270" y2="28" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
      <line x1="164" y1="18" x2="194" y2="18" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
      <rect x="164" y="35" width="96" height="42" rx="2" fill={rgba(accent, 0.06)} stroke={rgba(accent, 0.14)} strokeWidth="0.5" />
      <line x1="164" y1="84" x2="230" y2="84" stroke={rgba(accent, 0.45)} strokeWidth="0.7" />
      <line x1="164" y1="90" x2="214" y2="90" stroke={rgba(accent, 0.25)} strokeWidth="0.5" />
      <rect x="164" y="96" width="32" height="4" rx="1.5" fill={rgba(accent, 0.8)} stroke="none" />
      {/* Moon icon */}
      <path d="M260 13 Q265 18 260 23 Q268 20 268 18 Q268 16 260 13Z" fill={rgba(accent, 0.25)} stroke={rgba(accent, 0.5)} strokeWidth="0.6" />
    </svg>
  );
}

function SketchLicense({ accent }: { accent: [number, number, number] }) {
  // Theme settings panel with license key input field
  return (
    <svg viewBox="0 0 280 110" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Shopify admin chrome */}
      <rect x="8" y="8" width="264" height="94" rx="4" stroke={rgba([160,160,160], 0.15)} strokeWidth="0.8" />
      <rect x="8" y="8" width="264" height="20" rx="4" fill={rgba([160,160,160], 0.04)} stroke="none" />
      <line x1="8" y1="28" x2="272" y2="28" stroke={rgba([160,160,160], 0.1)} strokeWidth="0.5" />
      <line x1="18" y1="18" x2="60" y2="18" stroke={rgba([160,160,160], 0.22)} strokeWidth="0.75" />
      {/* Left nav */}
      <rect x="8" y="28" width="56" height="74" rx="0" fill={rgba([160,160,160], 0.025)} stroke="none" />
      <line x1="64" y1="28" x2="64" y2="102" stroke={rgba([160,160,160], 0.08)} strokeWidth="0.5" />
      {[0,1,2,3,4].map(i => (
        <line key={i} x1="16" y1={38 + i * 11} x2="54" y2={38 + i * 11}
          stroke={i === 3 ? rgba(accent, 0.45) : rgba([160,160,160], 0.14)}
          strokeWidth={i === 3 ? "0.8" : "0.5"} />
      ))}
      {/* Main content — license key field */}
      <text x="78" y="42" fontSize="7" {...sketchText(0.45)} fontFamily="monospace">License Key</text>
      <rect x="76" y="47" width="140" height="14" rx="2" fill={rgba(accent, 0.04)} stroke={rgba(accent, 0.4)} strokeWidth="0.8" />
      <text x="84" y="57" fontSize="6.5" fill={rgba(accent, 0.6)} fontFamily="monospace">AETH-XXXX-XXXX-XXXX</text>
      {/* Activate button */}
      <rect x="76" y="68" width="48" height="12" rx="3" fill={rgba(accent, 0.85)} stroke="none" />
      <text x="100" y="76.5" textAnchor="middle" fontSize="6.5" fill="rgba(255,255,255,0.9)" fontFamily="inherit">Activate</text>
      {/* Success badge */}
      <rect x="134" y="68" width="50" height="12" rx="3" fill={rgba([50,200,100], 0.12)} stroke={rgba([50,200,100], 0.4)} strokeWidth="0.6" />
      <text x="159" y="76.5" textAnchor="middle" fontSize="6.5" fill={rgba([50,200,100], 0.75)} fontFamily="inherit">✓ Active</text>
    </svg>
  );
}

// â"€â"€â"€ Inertia sketches â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const INERTIA_ACCENT: [number, number, number] = [160, 140, 255];

function SketchStudio({ accent }: { accent: [number, number, number] }) {
  // Shows Inertia hub with three service spokes — storefront, brand, web
  return (
    <svg viewBox="0 0 280 110" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Center hub */}
      <circle cx="140" cy="55" r="18" fill={rgba(accent, 0.08)} stroke={rgba(accent, 0.4)} strokeWidth="1" />
      <circle cx="140" cy="55" r="10" fill={rgba(accent, 0.18)} stroke="none" />
      <text x="140" y="58.5" textAnchor="middle" fontSize="7" fontWeight="600" fill={rgba(accent, 0.85)} fontFamily="inherit">In</text>
      {/* Spokes */}
      {[
        { x: 34, y: 24, label: "Shopify", color: [56,180,255] as [number,number,number] },
        { x: 34, y: 86, label: "Brand", color: accent },
        { x: 246, y: 24, label: "Web", color: [0,200,170] as [number,number,number] },
        { x: 246, y: 86, label: "iOS", color: [255,100,80] as [number,number,number] },
      ].map(({ x, y, label, color }) => (
        <g key={label}>
          <line x1={x < 140 ? x + 26 : x - 26} y1={y} x2={x < 140 ? 124 : 156} y2={y < 55 ? 43 : 67}
            stroke={rgba(color, 0.3)} strokeWidth="0.8" strokeDasharray="3 3" />
          <rect x={x < 140 ? x - 26 : x - 26} y={y - 10} width="52" height="20" rx="4"
            fill={rgba(color, 0.06)} stroke={rgba(color, 0.3)} strokeWidth="0.7" />
          <text x={x} y={y + 3.5} textAnchor="middle" fontSize="7" fill={rgba(color, 0.65)} fontFamily="inherit">{label}</text>
        </g>
      ))}
    </svg>
  );
}

function SketchProcess({ accent }: { accent: [number, number, number] }) {
  // Kanban-style columns showing project phases
  const cols = [
    { label: "Brief", cards: ["Discovery call", "Brand audit"], done: true },
    { label: "Design", cards: ["Concepts", "Revisions"], done: true },
    { label: "Build", cards: ["Dev", "QA"], active: true },
    { label: "Ship", cards: ["Launch", "Support"], done: false },
  ];
  return (
    <svg viewBox="0 0 280 110" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {cols.map((col, ci) => {
        const x = 10 + ci * 68;
        const isActive = col.active;
        const isDone = col.done;
        const c = isDone ? accent : isActive ? accent : [160,160,160] as [number,number,number];
        return (
          <g key={ci}>
            {/* Column header */}
            <rect x={x} y="8" width="58" height="14" rx="2" fill={rgba(c, isDone || isActive ? 0.1 : 0.03)} stroke={rgba(c, isDone || isActive ? 0.35 : 0.15)} strokeWidth="0.7" />
            <text x={x + 29} y="18" textAnchor="middle" fontSize="6.5" fill={rgba(c, isDone || isActive ? 0.7 : 0.3)} fontFamily="inherit" fontWeight={isActive ? "600" : "400"}>{col.label}</text>
            {/* Cards */}
            {col.cards.map((card, ki) => (
              <g key={ki}>
                <rect x={x} y={28 + ki * 22} width="58" height="16" rx="2"
                  fill={rgba(c, isActive ? 0.07 : isDone ? 0.04 : 0.02)}
                  stroke={rgba(c, isActive ? 0.25 : isDone ? 0.18 : 0.1)} strokeWidth="0.6" />
                <line x1={x + 6} y1={36 + ki * 22} x2={x + 52} y2={36 + ki * 22} stroke={rgba(c, isDone || isActive ? 0.3 : 0.12)} strokeWidth="0.55" />
              </g>
            ))}
          </g>
        );
      })}
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
      {/* Content area -" section list */}
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
  // Gantt-style horizontal bar chart showing 5-week project
  const rows = [
    { label: "Brief", start: 0, len: 1, done: true },
    { label: "Design", start: 1, len: 1, done: true },
    { label: "Build", start: 2, len: 2, done: true },
    { label: "Launch", start: 4, len: 1, active: true },
  ];
  const colW = 42, startX = 60, startY = 18, rowH = 18;
  return (
    <svg viewBox="0 0 280 110" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Week headers */}
      {[1,2,3,4,5].map((w, i) => (
        <text key={w} x={startX + i * colW + colW / 2} y="13" textAnchor="middle" fontSize="6.5"
          {...sketchText(0.35)} fontFamily="monospace">Wk {w}</text>
      ))}
      {/* Grid lines */}
      {[0,1,2,3,4,5].map(i => (
        <line key={i} x1={startX + i * colW} y1="16" x2={startX + i * colW} y2={startY + rows.length * rowH + 4}
          stroke={rgba([160,160,160], 0.08)} strokeWidth="0.5" />
      ))}
      {/* Rows */}
      {rows.map((row, ri) => {
        const y = startY + ri * rowH;
        const c = row.active ? accent : row.done ? accent : [160,160,160] as [number,number,number];
        return (
          <g key={ri}>
            <text x="54" y={y + 11} textAnchor="end" fontSize="6.5" {...sketchText(0.5)} fontFamily="inherit">{row.label}</text>
            <rect x={startX + row.start * colW + 2} y={y + 3} width={row.len * colW - 4} height={rowH - 6} rx="2"
              fill={rgba(c, row.active ? 0.2 : row.done ? 0.12 : 0.06)}
              stroke={rgba(c, row.active ? 0.6 : row.done ? 0.35 : 0.2)} strokeWidth="0.7" />
          </g>
        );
      })}
    </svg>
  );
}

// â"€â"€â"€ Sketch registry â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

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

// â"€â"€â"€ Aether docs â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const AETHER_ACCENT: [number, number, number] = [50, 100, 240];

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
            "In your Shopify admin, go to Online Store -º Themes.",
            "Click Add theme -º Upload zip file.",
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
        title: "License and activation",
        body: [
          { type: "sketch", name: "license", accent: AETHER_ACCENT },
          { type: "p", text: "Each license covers a single Shopify store. After purchase you receive a license key by email in the format AETH-XXXX-XXXX-XXXX. You can also view your key any time at byinertia.com/dashboard." },
          { type: "h3", text: "Activating your license" },
          { type: "ol", items: [
            "In your Shopify admin, go to Online Store → Themes → Customize.",
            "Open Theme settings → License Key.",
            "Paste your key and save.",
            "The store reloads and the lock overlay disappears. Your store domain is assigned to the key automatically on first activation.",
          ]},
          { type: "h3", text: "Standard vs Lifetime" },
          { type: "ul", items: [
            "Standard: 1 year of updates, single store. The theme keeps working after the year ends — you just won't receive new releases.",
            "Lifetime: updates for life on a single store, no renewals ever.",
            "Custom: a bespoke version built around your brand. Includes direct access throughout.",
          ]},
          { type: "note", accent: AETHER_ACCENT, text: "Need to move the license to a different store? Reply to your purchase email and we'll handle it." },
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
          { type: "p", text: "The header supports a standard nav, a mega menu, and a transparent mode for hero sections. All options live in Theme settings -º Header." },
          { type: "h3", text: "Mega menu" },
          { type: "p", text: "Any top-level nav item with child links renders a two-column mega menu. The right panel can show a featured image, a collection tile, or nothing at all." },
          { type: "ul", items: [
            "Set up nav links in Shopify Admin -º Navigation -º Main menu.",
            "Add child links under any top-level item to trigger the mega menu.",
            "Assign a right-panel block to each item under Header -º Mega menu panels in the theme editor.",
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
      {
        id: "aether-announcement-bar",
        title: "Announcement bar",
        body: [
          { type: "p", text: "The announcement bar sits at the top of every page and supports multiple rotating messages. Each message can include an optional link." },
          { type: "h3", text: "Setting up rotation" },
          { type: "ol", items: [
            "In the theme editor, open the Announcement bar section.",
            "Add message blocks — each block has a message field and an optional link.",
            "Set the Rotate interval in seconds. The default is 4 seconds.",
            "Toggle Show close to let visitors dismiss the bar.",
          ]},
          { type: "note", accent: AETHER_ACCENT, text: "Background color, text color, font size, padding, and letter case are all configurable per-store in the section settings." },
        ],
      },
      {
        id: "aether-email-capture",
        title: "Email and SMS capture",
        body: [
          { type: "p", text: "Aether ships with three separate capture mechanisms so you can choose what fits your brand." },
          { type: "h3", text: "Signup notification card" },
          { type: "p", text: "A slide-in card that appears after a configurable delay. It supports both email and SMS signups, an optional discount code reveal on success, and a suppress-for-N-days cookie so repeat visitors aren't nagged." },
          { type: "h3", text: "Email popup" },
          { type: "p", text: "A centered modal with a full set of typography and color controls. Trigger it on page load or after a scroll percentage threshold. Configurable dismiss cookie duration." },
          { type: "h3", text: "SMS overlay widget" },
          { type: "p", text: "A corner-anchored tab that expands into a small panel with a heading, body copy, and a link to your SMS signup flow. Position is configurable: top-left, middle-right, etc." },
          { type: "note", accent: AETHER_ACCENT, text: "All three are independent sections. You can use one, two, or all three — just be mindful of how they layer for first-time visitors." },
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
          { type: "p", text: "All colors in Aether are defined as CSS custom properties. You set the base values in Theme settings -º Colors and everything else derives from them automatically." },
          { type: "h3", text: "Color roles" },
          { type: "ul", items: [
            "Primary: used for CTAs, links, and highlights. Should be your brand accent.",
            "Surface: the background color of cards and overlays.",
            "Foreground: text color, set automatically as a contrast-safe value relative to your background.",
            "Line: border and divider color. Derives from foreground at low opacity.",
          ]},
          { type: "h3", text: "Dark mode" },
          { type: "p", text: "Aether reads prefers-color-scheme and applies the right values on first load with no flash. You can expose a toggle to customers via Theme settings -º Colors. Both modes are fully designed, not just inverted." },
        ],
      },
      {
        id: "aether-custom-fonts",
        title: "Custom fonts",
        body: [
          { type: "p", text: "Aether supports custom fonts without any code changes. Enable them in Theme settings → Custom Font and provide a font name and a direct file URL for both heading and body typefaces." },
          { type: "h3", text: "Hosted on Shopify CDN" },
          { type: "ol", items: [
            "In your Shopify admin, go to Content → Files.",
            "Upload your font file (TTF, WOFF, or WOFF2).",
            "Copy the CDN URL from the file list.",
            "Paste it into Theme settings → Custom Font → Heading Font URL and/or Regular Font URL.",
            "Enter the font family name exactly as it appears in the file.",
          ]},
          { type: "h3", text: "Using Google Fonts or external CDN" },
          { type: "p", text: "Paste any direct font file URL into the URL fields. The theme uses @font-face to load it with font-display: swap, so body text stays visible while the font loads." },
          { type: "note", accent: AETHER_ACCENT, text: "The heading and body fields are independent. You can mix two different typefaces, or use the same font for both." },
        ],
      },
      {
        id: "aether-custom-css",
        title: "Custom CSS",
        body: [
          { type: "p", text: "For anything beyond the theme editor, use the Custom CSS field in Theme settings -º Advanced." },
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
            "In Shopify admin, go to Online Store -º Themes.",
            "Click Add theme -º Upload zip. This creates a new unpublished copy; your live theme is untouched.",
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
      onClick={copy}
      className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] tracking-tight transition-all opacity-0 group-hover:opacity-100"
      style={{ background: "rgb(var(--surface))", border: "1px solid rgb(var(--line))", color: copied ? "rgb(var(--accent))" : "rgb(var(--muted))" }}
      aria-label="Copy code"
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

function ArticleBody({ body, accent }: { body: ArticleBlock[]; accent: [number, number, number] }) {
  return (
    <div className="flex flex-col gap-6">
      {body.map((block, i) => {
        if (block.type === "sketch") {
          const Sketch = SKETCH_MAP[block.name];
          if (!Sketch) return null;
          return (
            <div key={i} className="w-full rounded-xl overflow-hidden border border-[rgb(var(--line))] py-8 px-6" style={{ background: "rgb(var(--fg) / 0.02)" }}>
              <Sketch accent={block.accent} />
            </div>
          );
        }
        if (block.type === "p") {
          return <p key={i} className="text-[16px] leading-[1.85] tracking-tight text-[rgb(var(--fg))]" style={{ opacity: 0.75 }}>{block.text}</p>;
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
            <ol key={i} className="flex flex-col gap-3 pl-4">
              {block.items.map((item, j) => (
                <li key={j} className="text-[16px] leading-[1.85] tracking-tight text-[rgb(var(--fg))] list-decimal pl-1" style={{ opacity: 0.75 }}>{item}</li>
              ))}
            </ol>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={i} className="flex flex-col gap-3 pl-4">
              {block.items.map((item, j) => (
                <li key={j} className="text-[16px] leading-[1.85] tracking-tight text-[rgb(var(--fg))] list-disc pl-1" style={{ opacity: 0.75 }}>{item}</li>
              ))}
            </ul>
          );
        }
        if (block.type === "note") {
          const na = block.accent ?? accent;
          return (
            <div key={i} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${rgba(na, 0.25)}`, background: rgba(na, 0.05) }}>
              {/* Label bar */}
              <div className="flex items-center gap-1.5 px-4 py-2" style={{ borderBottom: `1px solid ${rgba(na, 0.15)}`, background: rgba(na, 0.07) }}>
                <svg viewBox="0 0 14 14" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0" style={{ stroke: rgba(na, 0.8) }} strokeWidth="1.5" aria-hidden="true">
                  <circle cx="7" cy="7" r="5.5" />
                  <line x1="7" y1="6.5" x2="7" y2="9.5" />
                  <circle cx="7" cy="4.5" r="0.55" fill={rgba(na, 0.8)} stroke="none" />
                </svg>
                <span className="text-[11.5px] font-semibold tracking-tight" style={{ color: rgba(na, 0.85) }}>Note</span>
              </div>
              {/* Body */}
              <div className="px-4 py-3">
                <p className="text-[14.5px] leading-relaxed tracking-tight text-[rgb(var(--fg))]" style={{ opacity: 0.8 }}>{block.text}</p>
              </div>
            </div>
          );
        }
        if (block.type === "code") {
          return (
            <div key={i} className="relative group">
              <pre className="text-[14px] leading-relaxed font-mono rounded-xl border border-[rgb(var(--line))] px-5 py-4 overflow-x-auto whitespace-pre text-[rgb(var(--muted))]" style={{ background: "rgb(var(--fg) / 0.03)" }}>
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
              <span className="text-[13px] tracking-tight" style={{ color: active ? "rgb(var(--accent))" : "rgb(var(--fg))", opacity: active ? 1 : 0.6 }}>
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
                    color: active ? "rgb(var(--accent))" : "rgb(var(--fg))",
                    opacity: active ? 1 : 0.55,
                    background: active ? "rgb(var(--accent) / 0.1)" : undefined,
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
          .map((b) => b.text)
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

export default function DocsPage() {
  const [activeProductId, setActiveProductId] = useState(PRODUCTS[0].id);
  const [activeArticleId, setActiveArticleId] = useState<string>(INTRO_ID);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrollElRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 300);
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
    document.body.style.overflow = sheetOpen || searchOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sheetOpen, searchOpen]);

  return (
    <>
    <div className="min-h-screen flex flex-col" style={{ background: "rgb(var(--bg))" }}>

      {/* Docs header — desktop hidden, mobile only */}
      <header className="lg:hidden flex items-center justify-between px-3 shrink-0" style={{ height: 72, background: "rgb(var(--bg))" }}>
        <Link href="/" className="flex items-center gap-2 pl-3">
          <img src="/logo.png" alt="Inertia" className="h-5 w-auto dark:invert invert-0" />
        </Link>
        <Link href="/aether/buy" className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] tracking-tight font-medium transition-opacity hover:opacity-80" style={{ background: "rgb(var(--fg))", color: "rgb(var(--bg))" }}>
          Get Aether
        </Link>
      </header>

      <div className="flex flex-1 min-h-0">

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-56 xl:w-64 shrink-0 p-3">
          <div className="sticky top-3 max-h-[calc(100vh-24px)] overflow-y-auto rounded-2xl border border-[rgb(var(--line))] px-3 py-4 flex flex-col gap-4" style={{ background: "rgb(var(--surface))" }}>

            {/* Logo */}
            <div className="flex items-center justify-between px-3 py-2 mb-1">
              <Link href="/">
                <img src="/logo.png" alt="Inertia" className="h-5 w-auto dark:invert invert-0" />
              </Link>
              <Link href="/aether/buy" className="text-[11px] tracking-tight font-medium transition-opacity hover:opacity-70" style={{ color: "rgb(var(--muted))", opacity: 0.5 }}>
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
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors w-full hover:bg-[rgb(var(--fg)/0.05)]"
                    style={{ background: active ? "rgb(var(--accent) / 0.12)" : "transparent" }}
                  >
                    <span className="text-[14px] tracking-tight" style={{ color: "rgb(var(--fg))", fontWeight: active ? 600 : 400, opacity: active ? 1 : 0.5 }}>{p.name}</span>
                    <span className="text-[12px] tracking-tight" style={{ color: "rgb(var(--muted))", opacity: 0.5 }}>{p.description}</span>
                  </button>
                );
              })}
            </div>

            <div className="h-px" style={{ background: "rgb(var(--line))" }} />

            {/* Intro link */}
            <div className="flex flex-col gap-0.5">
              <a
                href={`#${INTRO_ID}`}
                className="px-3 py-1.5 rounded-lg text-[13.5px] tracking-tight transition-colors hover:bg-[rgb(var(--fg)/0.05)]"
                style={{
                  color: "rgb(var(--fg))",
                  background: activeArticleId === INTRO_ID ? "rgb(var(--accent) / 0.12)" : "transparent",
                  fontWeight: activeArticleId === INTRO_ID ? 600 : 400,
                }}
              >
                Introduction
              </a>
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
                    <a
                      key={article.id}
                      href={`#${article.id}`}
                      className="px-3 py-1.5 rounded-lg text-[13.5px] tracking-tight transition-all hover:bg-[rgb(var(--fg)/0.05)] hover:opacity-100"
                      style={{
                        color: "rgb(var(--fg))",
                        background: active ? "rgb(var(--accent) / 0.12)" : "transparent",
                        fontWeight: active ? 600 : 400,
                        opacity: active ? 1 : 0.5,
                      }}
                    >
                      {article.title}
                    </a>
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
              <p className="text-[14px] tracking-tight mb-4 font-medium" style={{ color: "rgb(var(--accent))" }}>
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
                      <span className="text-[13px] tracking-tight mt-1 transition-colors" style={{ color: "rgb(var(--accent))" }}>
                        Start with {first.title} →
                      </span>
                    </a>
                  );
                })}
              </div>

              {product.id === "aether" && (
                <div className="flex flex-wrap gap-2">
                  <Link href="/aether/buy" className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium tracking-tight transition-opacity hover:opacity-80" style={{ background: "rgb(var(--accent) / 0.12)", color: "rgb(var(--accent))" }}>
                    Buy a license
                  </Link>
                  <Link href="/aether/changelog" className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] tracking-tight border border-[rgb(var(--line))] text-[rgb(var(--muted))] transition-colors hover:text-[rgb(var(--fg))]">
                    Changelog
                  </Link>
                  <Link href="/contact" className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] tracking-tight border border-[rgb(var(--line))] text-[rgb(var(--muted))] transition-colors hover:text-[rgb(var(--fg))]">
                    Get support
                  </Link>
                </div>
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
                  <p className="text-[14px] tracking-tight mb-3 font-medium" style={{ color: "rgb(var(--accent))" }}>
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
          </div>
        </div>
      </div>


    </div>

    {mounted && createPortal(<>
      {/* Back to top */}
      {scrolled && !sheetOpen && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed z-40 flex items-center justify-center [-webkit-tap-highlight-color:transparent] transition-opacity hover:opacity-70"
          style={{
            bottom: 24,
            right: 24,
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "rgb(var(--fg) / 0.08)",
            border: "1px solid rgb(var(--line))",
          }}
          aria-label="Back to top"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[rgb(var(--fg))]">
            <polyline points="3 10 8 5 13 10" />
          </svg>
        </button>
      )}

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
              background: "rgba(18,18,20,0.88)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
              maxHeight: "72vh",
            }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-5 py-4">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} aria-hidden="true">
                <circle cx="6.5" cy="6.5" r="4" /><path d="M11 11l2.5 2.5" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documentation..."
                className="flex-1 bg-transparent text-[15px] tracking-tight outline-none"
                style={{ color: "rgba(255,255,255,0.75)", caretColor: "white" }}
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{ color: "rgba(255,255,255,0.3)" }}
                  className="hover:text-white transition-colors"
                  aria-label="Clear"
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-3.5 h-3.5">
                    <line x1="12" y1="4" x2="4" y2="12" /><line x1="4" y1="4" x2="12" y2="12" />
                  </svg>
                </button>
              ) : (
                <span
                  className="text-[11px] tracking-tight px-1.5 py-0.5 rounded"
                  style={{ color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.12)" }}
                >
                  Esc
                </span>
              )}
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} />

            {/* Results list */}
            <div className="overflow-y-auto flex-1 py-3">
              {searchQuery.trim().length === 0 ? (
                PRODUCTS.map((p) => (
                  <div key={p.id} className="mb-2">
                    <p
                      className="text-[11px] tracking-tight font-medium px-5 py-2"
                      style={{ color: "rgba(255,255,255,0.35)" }}
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
                        style={{ color: "rgba(255,255,255,0.75)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0" style={{ color: "rgba(255,255,255,0.25)" }} aria-hidden="true">
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
                <p className="px-5 py-8 text-[13px] tracking-tight text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
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
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0 mt-[3px]" style={{ color: "rgba(255,255,255,0.25)" }} aria-hidden="true">
                        <rect x="3" y="2" width="10" height="12" rx="1.5" />
                        <line x1="5.5" y1="6" x2="10.5" y2="6" />
                        <line x1="5.5" y1="9" x2="9" y2="9" />
                      </svg>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-[13.5px] tracking-tight" style={{ color: "rgba(255,255,255,0.72)" }}>{r.articleTitle}</span>
                        <span className="text-[11.5px] tracking-tight" style={{ color: "rgba(255,255,255,0.28)" }}>{r.productName} / {r.sectionTitle}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile floating nav */}
      <div
        className="fixed z-50 lg:hidden flex flex-col"
        style={{
          inset: "12px",
          background: "rgb(var(--surface))",
          border: "1px solid rgb(var(--line))",
          borderRadius: "20px",
          display: sheetOpen ? "flex" : "none",
          boxShadow: "0 20px 60px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.12)",
        }}
      >
        {/* Fixed header */}
        <div className="shrink-0">
          <div className="flex items-center justify-between px-5" style={{ height: 52 }}>
            <div className="flex items-center gap-2">
              {PRODUCTS.map((p) => {
                const active = p.id === activeProductId;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProduct(p.id)}
                    className="px-3 py-1.5 rounded-full text-[13px] tracking-tight [-webkit-tap-highlight-color:transparent]"
                    style={{
                      background: active ? "rgb(var(--accent) / 0.1)" : "rgb(var(--fg) / 0.06)",
                      color: active ? "rgb(var(--accent))" : "rgb(var(--fg))",
                      opacity: active ? 1 : 0.6,
                    }}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setSheetOpen(false)}
              className="h-8 w-8 flex items-center justify-center [-webkit-tap-highlight-color:transparent]"
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" style={{ color: "rgb(var(--muted))" }}>
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Search trigger */}
          <button
            onClick={() => { setSheetOpen(false); setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 50); }}
            className="flex items-center gap-2.5 mx-5 mb-4 px-3 py-2.5 rounded-lg border border-[rgb(var(--line))] w-[calc(100%-2.5rem)] text-left [-webkit-tap-highlight-color:transparent]"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0 text-[rgb(var(--muted))]" aria-hidden="true">
              <circle cx="6.5" cy="6.5" r="4" /><path d="M11 11l2.5 2.5" />
            </svg>
            <span className="text-[14px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.5 }}>Search...</span>
          </button>
        </div>

        {/* Scrollable nav */}
        <div className="overflow-y-auto flex-1 px-5 py-5 flex flex-col gap-5" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 32px)" }}>
          <a
            href={`#${INTRO_ID}`}
            onClick={() => setSheetOpen(false)}
            className="text-[15px] tracking-tight [-webkit-tap-highlight-color:transparent] px-2 py-1.5 rounded-lg transition-colors hover:bg-[rgb(var(--fg)/0.05)]"
            style={{ color: "rgb(var(--fg))", fontWeight: activeArticleId === INTRO_ID ? 600 : 400, opacity: activeArticleId === INTRO_ID ? 1 : 0.55 }}
          >
            Introduction
          </a>

          <div className="h-px" style={{ background: "rgb(var(--line))" }} />

          {product.sections.map((section) => (
            <div key={section.id} className="flex flex-col gap-1">
              <p className="text-[12px] tracking-tight font-semibold mb-1.5" style={{ color: "rgb(var(--fg))" }}>
                {section.title}
              </p>
              {section.articles.map((article) => {
                const active = activeArticleId === article.id;
                return (
                  <a
                    key={article.id}
                    href={`#${article.id}`}
                    onClick={() => setSheetOpen(false)}
                    className="px-2 py-2 rounded-lg text-[14px] tracking-tight [-webkit-tap-highlight-color:transparent] transition-colors hover:bg-[rgb(var(--fg)/0.05)]"
                    style={{ color: "rgb(var(--fg))", fontWeight: active ? 600 : 400, opacity: active ? 1 : 0.5 }}
                  >
                    {article.title}
                  </a>
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

