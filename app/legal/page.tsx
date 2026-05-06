import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Legal · Inertia",
  description: "Terms of engagement, IP ownership, and everything worth knowing before we work together.",
};

const EFFECTIVE = "May 1, 2026";

/* ── Sketches ─────────────────────────────────────────────────────── */

// Two hands clasping — side profile, fingers interlocked
function SketchHandshake() {
  const m = "rgb(var(--muted))";
  const a = "rgb(var(--blue))";
  return (
    <svg viewBox="0 0 220 140" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Left forearm */}
      <path d="M 10 118 L 58 88 L 72 82" stroke={m} strokeWidth="3" opacity="0.45" />
      {/* Right forearm */}
      <path d="M 210 118 L 162 88 L 148 82" stroke={m} strokeWidth="3" opacity="0.45" />
      {/* Left palm */}
      <path d="M 72 82 L 76 96 L 84 100 L 110 96" stroke={m} strokeWidth="2" opacity="0.4" />
      {/* Right palm */}
      <path d="M 148 82 L 144 96 L 136 100 L 110 96" stroke={m} strokeWidth="2" opacity="0.4" />
      {/* Left fingers — 4 fingers extending right */}
      <path d="M 84 80 L 96 68 L 100 72" stroke={a} strokeWidth="2" opacity="0.7" />
      <path d="M 90 76 L 104 62 L 108 67" stroke={a} strokeWidth="2" opacity="0.7" />
      <path d="M 96 74 L 112 60 L 115 65" stroke={a} strokeWidth="2" opacity="0.7" />
      <path d="M 100 76 L 116 64 L 118 70" stroke={a} strokeWidth="2" opacity="0.65" />
      {/* Right fingers — 4 fingers extending left, interlocking */}
      <path d="M 136 80 L 124 68 L 120 72" stroke={a} strokeWidth="2" opacity="0.7" />
      <path d="M 130 76 L 116 62 L 112 67" stroke={a} strokeWidth="2" opacity="0.7" />
      <path d="M 124 74 L 108 60 L 105 65" stroke={a} strokeWidth="2" opacity="0.7" />
      <path d="M 120 76 L 104 64 L 102 70" stroke={a} strokeWidth="2" opacity="0.65" />
      {/* Grip band */}
      <path d="M 72 88 Q 110 78 148 88" stroke={a} strokeWidth="2.5" opacity="0.6" />
      {/* Agreement sparks */}
      <line x1="110" y1="52" x2="110" y2="38" stroke={a} strokeWidth="1.8" opacity="0.75" />
      <line x1="98" y1="56" x2="88" y2="44" stroke={a} strokeWidth="1.5" opacity="0.6" />
      <line x1="122" y1="56" x2="132" y2="44" stroke={a} strokeWidth="1.5" opacity="0.6" />
      <line x1="93" y1="42" x2="103" y2="40" stroke={a} strokeWidth="1.2" opacity="0.4" />
      <line x1="127" y1="42" x2="117" y2="40" stroke={a} strokeWidth="1.2" opacity="0.4" />
      {/* Ground */}
      <line x1="20" y1="128" x2="200" y2="128" stroke={m} strokeWidth="0.8" opacity="0.2" />
    </svg>
  );
}

// Document with a wax seal transferring to a person icon
function SketchOwnership() {
  const m = "rgb(var(--muted))";
  const a = "rgb(var(--purple))";
  return (
    <svg viewBox="0 0 220 140" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Document */}
      <rect x="18" y="12" width="84" height="108" rx="3" stroke={m} strokeWidth="1.8" opacity="0.5" />
      {/* Dog-ear */}
      <polyline points="82,12 102,12 102,32 82,12" stroke={m} strokeWidth="1.4" opacity="0.4" />
      {/* Title line */}
      <line x1="30" y1="44" x2="90" y2="44" stroke={m} strokeWidth="1.8" opacity="0.4" />
      {/* Body lines */}
      <line x1="30" y1="56" x2="90" y2="56" stroke={m} strokeWidth="1.2" opacity="0.3" />
      <line x1="30" y1="66" x2="90" y2="66" stroke={m} strokeWidth="1.2" opacity="0.3" />
      <line x1="30" y1="76" x2="74" y2="76" stroke={m} strokeWidth="1.2" opacity="0.25" />
      {/* Wax seal */}
      <circle cx="58" cy="102" r="18" stroke={a} strokeWidth="2" opacity="0.7" fill={a} fillOpacity="0.08" />
      <circle cx="58" cy="102" r="13" stroke={a} strokeWidth="1" opacity="0.4" />
      {/* Check in seal */}
      <polyline points="48,102 55,110 70,93" stroke={a} strokeWidth="2.5" opacity="0.85" />
      {/* Transfer arrow */}
      <line x1="112" y1="72" x2="156" y2="72" stroke={a} strokeWidth="1.8" opacity="0.6" strokeDasharray="5 3" />
      <polyline points="149,64 158,72 149,80" stroke={a} strokeWidth="2" opacity="0.7" />
      {/* Person / recipient */}
      <circle cx="180" cy="48" r="14" stroke={a} strokeWidth="1.8" opacity="0.65" fill={a} fillOpacity="0.06" />
      <path d="M 156 100 Q 156 78 180 78 Q 204 78 204 100" stroke={a} strokeWidth="1.8" opacity="0.6" />
      {/* "YOURS" underlining the person */}
      <line x1="158" y1="108" x2="202" y2="108" stroke={a} strokeWidth="1.4" opacity="0.45" />
    </svg>
  );
}

// Invoice card — two clear columns: deposit paid, balance pending
function SketchPayment() {
  const m = "rgb(var(--muted))";
  const a = "rgb(var(--green))";
  return (
    <svg viewBox="0 0 220 140" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Card */}
      <rect x="14" y="16" width="192" height="108" rx="4" stroke={m} strokeWidth="1.6" opacity="0.4" />
      {/* Header */}
      <rect x="14" y="16" width="192" height="26" rx="4" fill={a} fillOpacity="0.08" stroke="none" />
      <line x1="14" y1="42" x2="206" y2="42" stroke={a} strokeWidth="1.4" opacity="0.45" />
      <line x1="28" y1="30" x2="100" y2="30" stroke={a} strokeWidth="1.6" opacity="0.55" />
      {/* Vertical divider */}
      <line x1="110" y1="42" x2="110" y2="124" stroke={m} strokeWidth="1" strokeDasharray="4 3" opacity="0.35" />
      {/* Left col — deposit paid */}
      <rect x="14" y="42" width="96" height="82" rx="0" fill={a} fillOpacity="0.05" stroke="none" />
      <line x1="26" y1="60" x2="96" y2="60" stroke={a} strokeWidth="1.4" opacity="0.5" />
      <line x1="26" y1="71" x2="82" y2="71" stroke={a} strokeWidth="1.1" opacity="0.4" />
      {/* Big checkmark left */}
      <polyline points="30,96 42,108 70,82" stroke={a} strokeWidth="2.8" opacity="0.8" />
      {/* Left label */}
      <line x1="26" y1="118" x2="66" y2="118" stroke={a} strokeWidth="1.2" opacity="0.45" />
      {/* Right col — balance due */}
      <line x1="122" y1="60" x2="196" y2="60" stroke={m} strokeWidth="1.4" opacity="0.3" />
      <line x1="122" y1="71" x2="176" y2="71" stroke={m} strokeWidth="1.1" opacity="0.25" />
      {/* Clock / pending icon */}
      <circle cx="159" cy="97" r="14" stroke={m} strokeWidth="1.6" opacity="0.4" />
      <line x1="159" y1="87" x2="159" y2="97" stroke={m} strokeWidth="1.8" opacity="0.45" />
      <line x1="159" y1="97" x2="168" y2="102" stroke={m} strokeWidth="1.8" opacity="0.45" />
      {/* Right label */}
      <line x1="122" y1="118" x2="162" y2="118" stroke={m} strokeWidth="1.2" opacity="0.25" />
    </svg>
  );
}

// Two document versions, pencil editing the top one, two circled counters
function SketchRevisions() {
  const m = "rgb(var(--muted))";
  const a = "rgb(var(--amber))";
  return (
    <svg viewBox="0 0 220 140" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Doc v1 — behind */}
      <rect x="14" y="26" width="86" height="104" rx="3" stroke={m} strokeWidth="1.4" opacity="0.3" />
      {/* Doc v2 — front, accented */}
      <rect x="30" y="12" width="86" height="104" rx="3" stroke={a} strokeWidth="1.8" opacity="0.65" fill={a} fillOpacity="0.04" />
      {/* Lines on front doc */}
      <line x1="44" y1="34" x2="104" y2="34" stroke={m} strokeWidth="1.3" opacity="0.35" />
      <line x1="44" y1="46" x2="104" y2="46" stroke={m} strokeWidth="1.3" opacity="0.35" />
      <line x1="44" y1="58" x2="88" y2="58" stroke={m} strokeWidth="1.3" opacity="0.3" />
      {/* Pencil body — diagonal */}
      <rect x="104" y="44" width="12" height="52" rx="3"
        transform="rotate(-42 104 44)"
        stroke={a} strokeWidth="1.8" opacity="0.7" fill={a} fillOpacity="0.07" />
      {/* Pencil tip */}
      <polyline points="138,88 148,100 132,104" stroke={a} strokeWidth="1.6" opacity="0.65" />
      {/* Line being drawn */}
      <line x1="80" y1="78" x2="130" y2="78" stroke={a} strokeWidth="1.5" opacity="0.5" strokeDasharray="4 3" />
      {/* Round 1 badge */}
      <circle cx="172" cy="36" r="14" stroke={a} strokeWidth="1.8" opacity="0.7" fill={a} fillOpacity="0.08" />
      {/* "1" */}
      <line x1="172" y1="27" x2="172" y2="45" stroke={a} strokeWidth="2.2" opacity="0.75" />
      <line x1="167" y1="31" x2="172" y2="27" stroke={a} strokeWidth="1.6" opacity="0.6" />
      {/* Round 2 badge */}
      <circle cx="172" cy="76" r="14" stroke={a} strokeWidth="1.8" opacity="0.7" fill={a} fillOpacity="0.08" />
      {/* "2" */}
      <path d="M 164 70 Q 164 66 172 66 Q 180 66 180 72 Q 180 78 164 84 L 180 84"
        stroke={a} strokeWidth="2" opacity="0.75" />
      {/* Connector between rounds */}
      <line x1="172" y1="50" x2="172" y2="62" stroke={a} strokeWidth="1.2" opacity="0.4" strokeDasharray="3 2" />
      {/* Scope boundary line */}
      <line x1="14" y1="124" x2="116" y2="124" stroke={a} strokeWidth="1.2" opacity="0.35" strokeDasharray="4 2" />
    </svg>
  );
}

// Planted flag (launched) + 14-cell calendar with bracket
function SketchLaunch() {
  const m = "rgb(var(--muted))";
  const a = "rgb(var(--blue))";
  return (
    <svg viewBox="0 0 220 140" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Horizon */}
      <line x1="10" y1="110" x2="210" y2="110" stroke={m} strokeWidth="1.2" opacity="0.3" />
      {/* Pole */}
      <line x1="68" y1="110" x2="68" y2="22" stroke={m} strokeWidth="2.2" opacity="0.55" />
      {/* Flag waving */}
      <path d="M 68 22 C 96 18 112 28 108 36 C 104 44 88 44 68 46 Z"
        stroke={a} strokeWidth="1.8" opacity="0.75" fill={a} fillOpacity="0.12" />
      {/* Ground mound */}
      <path d="M 44 110 Q 68 100 92 110" stroke={m} strokeWidth="1.4" opacity="0.35" />
      {/* Calendar frame */}
      <rect x="108" y="26" width="96" height="76" rx="4" stroke={a} strokeWidth="1.8" opacity="0.65" />
      {/* Header */}
      <line x1="108" y1="44" x2="204" y2="44" stroke={a} strokeWidth="1.4" opacity="0.5" />
      {/* Ring hooks */}
      <line x1="134" y1="22" x2="134" y2="30" stroke={a} strokeWidth="2.2" opacity="0.65" />
      <line x1="178" y1="22" x2="178" y2="30" stroke={a} strokeWidth="2.2" opacity="0.65" />
      {/* Header label line */}
      <line x1="120" y1="35" x2="160" y2="35" stroke={a} strokeWidth="1.2" opacity="0.4" />
      {/* 14 cells — 2 rows of 7 */}
      {Array.from({length: 14}, (_, i) => {
        const col = i % 7;
        const row = Math.floor(i / 7);
        return (
          <rect key={i}
            x={113 + col * 13} y={49 + row * 14}
            width="10" height="10" rx="1.5"
            stroke={a} strokeWidth={i < 14 ? 1.2 : 0.8}
            fill={a} fillOpacity={i < 14 ? 0.18 : 0}
            opacity={0.75 - i * 0.02}
          />
        );
      })}
      {/* 14-day bracket */}
      <path d="M 108 102 L 104 102 L 104 110 L 108 110" stroke={a} strokeWidth="1.4" opacity="0.55" />
      <path d="M 204 102 L 208 102 L 208 110 L 204 110" stroke={a} strokeWidth="1.4" opacity="0.55" />
      <line x1="104" y1="106" x2="208" y2="106" stroke={a} strokeWidth="1" opacity="0.35" strokeDasharray="3 2" />
    </svg>
  );
}

// Large padlock centered, document lines feeding in, blocked on both sides
function SketchLock() {
  const m = "rgb(var(--muted))";
  const a = "rgb(var(--green))";
  return (
    <svg viewBox="0 0 220 140" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Lock body */}
      <rect x="72" y="66" width="76" height="62" rx="8" stroke={a} strokeWidth="2.2" opacity="0.8" fill={a} fillOpacity="0.07" />
      {/* Shackle — proper U, sitting on top of body */}
      <path d="M 88 66 L 88 46 Q 88 22 110 22 Q 132 22 132 46 L 132 66"
        stroke={a} strokeWidth="2.2" opacity="0.75" />
      {/* Keyhole circle */}
      <circle cx="110" cy="90" r="10" stroke={a} strokeWidth="2" opacity="0.75" fill={a} fillOpacity="0.1" />
      {/* Keyhole teardrop stem */}
      <path d="M 106 98 L 106 106 L 114 106 L 114 98" stroke={a} strokeWidth="2" opacity="0.65" />
      {/* Left data lines */}
      <line x1="12" y1="64" x2="56" y2="64" stroke={m} strokeWidth="1.4" opacity="0.45" />
      <line x1="12" y1="76" x2="56" y2="76" stroke={m} strokeWidth="1.4" opacity="0.4" />
      <line x1="12" y1="88" x2="46" y2="88" stroke={m} strokeWidth="1.4" opacity="0.3" />
      {/* Left barrier */}
      <line x1="60" y1="56" x2="60" y2="98" stroke={a} strokeWidth="2" opacity="0.6" />
      <line x1="56" y1="60" x2="64" y2="68" stroke={a} strokeWidth="1.6" opacity="0.5" />
      <line x1="56" y1="84" x2="64" y2="92" stroke={a} strokeWidth="1.6" opacity="0.5" />
      {/* Right data lines */}
      <line x1="164" y1="64" x2="208" y2="64" stroke={m} strokeWidth="1.4" opacity="0.45" />
      <line x1="164" y1="76" x2="208" y2="76" stroke={m} strokeWidth="1.4" opacity="0.4" />
      <line x1="174" y1="88" x2="208" y2="88" stroke={m} strokeWidth="1.4" opacity="0.3" />
      {/* Right barrier */}
      <line x1="160" y1="56" x2="160" y2="98" stroke={a} strokeWidth="2" opacity="0.6" />
      <line x1="164" y1="60" x2="156" y2="68" stroke={a} strokeWidth="1.6" opacity="0.5" />
      <line x1="164" y1="84" x2="156" y2="92" stroke={a} strokeWidth="1.6" opacity="0.5" />
    </svg>
  );
}

// Two bar chart columns — left tall/unbounded, right shorter with hard cap line
function SketchCap() {
  const m = "rgb(var(--muted))";
  const a = "rgb(var(--amber))";
  return (
    <svg viewBox="0 0 220 140" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Axis */}
      <line x1="28" y1="116" x2="196" y2="116" stroke={m} strokeWidth="1.6" opacity="0.4" />
      <line x1="28" y1="20" x2="28" y2="116" stroke={m} strokeWidth="1.2" opacity="0.3" />
      {/* Left bar — uncapped, tall */}
      <rect x="48" y="22" width="52" height="94" rx="3" stroke={m} strokeWidth="1.6" opacity="0.4" fill={m} fillOpacity="0.07" />
      {/* Unbounded arrow up */}
      <line x1="74" y1="22" x2="74" y2="10" stroke={m} strokeWidth="1.4" opacity="0.35" strokeDasharray="3 2" />
      <polyline points="68,16 74,8 80,16" stroke={m} strokeWidth="1.4" opacity="0.35" />
      {/* Left label */}
      <line x1="42" y1="124" x2="106" y2="124" stroke={m} strokeWidth="1.1" opacity="0.3" />
      {/* Right bar — capped */}
      <rect x="124" y="58" width="52" height="58" rx="3" stroke={a} strokeWidth="2" opacity="0.75" fill={a} fillOpacity="0.09" />
      {/* Cap line — thick horizontal */}
      <line x1="114" y1="58" x2="186" y2="58" stroke={a} strokeWidth="3" opacity="0.85" />
      {/* Cap end ticks */}
      <line x1="114" y1="50" x2="114" y2="66" stroke={a} strokeWidth="2" opacity="0.75" />
      <line x1="186" y1="50" x2="186" y2="66" stroke={a} strokeWidth="2" opacity="0.75" />
      {/* Arrow coming down, stopped by cap */}
      <line x1="150" y1="8" x2="150" y2="54" stroke={a} strokeWidth="1.6" opacity="0.55" strokeDasharray="4 3" />
      <polyline points="143,18 150,8 157,18" stroke={a} strokeWidth="1.6" opacity="0.55" />
      {/* Stop symbol on cap */}
      <line x1="144" y1="52" x2="156" y2="52" stroke={a} strokeWidth="2.5" opacity="0.7" />
      {/* Right label */}
      <line x1="118" y1="124" x2="182" y2="124" stroke={a} strokeWidth="1.2" opacity="0.45" />
    </svg>
  );
}

// Two speech bubbles pointing at each other, handshake resolution below
function SketchMediation() {
  const m = "rgb(var(--muted))";
  const a = "rgb(var(--blue))";
  return (
    <svg viewBox="0 0 220 140" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Left bubble */}
      <path d="M 8 10 Q 8 4 14 4 L 84 4 Q 90 4 90 10 L 90 48 Q 90 54 84 54 L 42 54 L 28 68 L 32 54 L 14 54 Q 8 54 8 48 Z"
        stroke={m} strokeWidth="1.6" opacity="0.5" fill={m} fillOpacity="0.04" />
      <line x1="20" y1="20" x2="78" y2="20" stroke={m} strokeWidth="1.2" opacity="0.4" />
      <line x1="20" y1="32" x2="78" y2="32" stroke={m} strokeWidth="1.2" opacity="0.4" />
      <line x1="20" y1="44" x2="56" y2="44" stroke={m} strokeWidth="1.2" opacity="0.35" />
      {/* Right bubble — accent, facing left (tail on left) */}
      <path d="M 130 10 Q 130 4 136 4 L 206 4 Q 212 4 212 10 L 212 48 Q 212 54 206 54 L 188 54 L 192 68 L 178 54 L 136 54 Q 130 54 130 48 Z"
        stroke={a} strokeWidth="1.8" opacity="0.7" fill={a} fillOpacity="0.06" />
      <line x1="142" y1="20" x2="200" y2="20" stroke={a} strokeWidth="1.2" opacity="0.5" />
      <line x1="142" y1="32" x2="200" y2="32" stroke={a} strokeWidth="1.2" opacity="0.5" />
      <line x1="142" y1="44" x2="176" y2="44" stroke={a} strokeWidth="1.2" opacity="0.45" />
      {/* Dashed lines converging to resolution */}
      <line x1="48" y1="68" x2="90" y2="98" stroke={m} strokeWidth="1.2" opacity="0.3" strokeDasharray="4 3" />
      <line x1="172" y1="68" x2="130" y2="98" stroke={m} strokeWidth="1.2" opacity="0.3" strokeDasharray="4 3" />
      {/* Resolution handshake circle */}
      <circle cx="110" cy="108" r="20" stroke={a} strokeWidth="2" opacity="0.65" fill={a} fillOpacity="0.07" />
      {/* Checkmark inside */}
      <polyline points="100,108 107,116 122,100" stroke={a} strokeWidth="2.5" opacity="0.85" />
    </svg>
  );
}

/* ── Sections ─────────────────────────────────────────────────────── */

interface Section {
  id: string;
  title: string;
  sketch: React.ReactNode;
  body: React.ReactNode;
}

const SECTIONS: Section[] = [
  {
    id: "overview",
    title: "Before we start",
    sketch: <SketchHandshake />,
    body: (
      <>
        <p>
          This page covers how Inertia operates: what you own, what we retain, how payment works, and what happens when things go sideways. It&apos;s written to be read, not skimmed by lawyers.
        </p>
        <p>
          Most projects run without ever needing to reference this. We&apos;re a small studio and we have a genuine interest in doing right by the people we work with. But clear terms protect both sides, and ambiguity tends to create problems that goodwill alone can&apos;t fix.
        </p>
        <p>
          By engaging Inertia for any paid work, you agree to the terms below. If something here doesn&apos;t work for your situation, raise it before we start. Not after.
        </p>
      </>
    ),
  },
  {
    id: "ip",
    title: "Ownership and IP",
    sketch: <SketchOwnership />,
    body: (
      <>
        <p>
          When you pay in full, you own the final deliverable. That includes code, design files, copy, and any other material produced specifically for your project. It&apos;s yours to use, modify, and build on however you like.
        </p>
        <p>
          We retain ownership of anything that existed before your project started: base themes, component libraries, tooling, build systems, and internal frameworks. If we use those as a foundation (which we often do, and it&apos;s a large part of why we&apos;re fast), you receive a perpetual, irrevocable licence to use them within your project. You can&apos;t sell them separately or claim ownership over the underlying code, but you&apos;ll never be restricted from using what we built for you.
        </p>
        <p>
          We reserve the right to include finished work in our portfolio unless you ask us not to before we sign. We will never show anything marked confidential, share access credentials, publish source code, or disclose details about your business.
        </p>
      </>
    ),
  },
  {
    id: "payment",
    title: "Payment terms",
    sketch: <SketchPayment />,
    body: (
      <>
        <p>
          All projects are split 50/50. Half is due before we start. The other half is due before the site goes live or final files are delivered, whichever comes first. Work does not begin until the deposit clears.
        </p>
        <p>
          Invoices are payable within 7 days. After 14 days, a 1.5% monthly late fee applies to the outstanding balance. If an invoice goes unpaid past 30 days, we reserve the right to pause work, pull deliverables from staging, or terminate the project entirely. Work completed to that point is still owed at our standard rate.
        </p>
        <p>
          Deposits are non-refundable once we&apos;ve started. If you cancel mid-project, you owe for all work completed to date. We won&apos;t charge for work that wasn&apos;t done, but we will charge for work that was.
        </p>
      </>
    ),
  },
  {
    id: "revisions",
    title: "Revisions and scope",
    sketch: <SketchRevisions />,
    body: (
      <>
        <p>
          Every project includes two rounds of revisions against the original brief. A revision means changing something we built. It does not mean adding a new feature, changing the design concept, or rebuilding a section from scratch. If you&apos;re not sure whether something counts as a revision, ask before assuming it&apos;s included.
        </p>
        <p>
          Additional revision rounds are billed at our hourly rate. Scope changes — anything outside what was agreed in the brief — require a new written estimate and your sign-off before we proceed. We won&apos;t silently absorb extra work and present a surprise invoice later.
        </p>
        <p>
          If a project goes quiet on your end for more than 30 consecutive days without a scheduled pause agreed in advance, we treat it as stalled. We&apos;ll invoice for completed work and close the project out. Re-engaging after that point is a new engagement, and our availability isn&apos;t guaranteed.
        </p>
      </>
    ),
  },
  {
    id: "post-launch",
    title: "After launch",
    sketch: <SketchLaunch />,
    body: (
      <>
        <p>
          Handover means the project is complete. Ongoing support, updates, and changes are not included unless we&apos;ve agreed to a separate retainer. We don&apos;t disappear after launch, but continued work is continued work and it gets scoped and priced accordingly.
        </p>
        <p>
          We offer a 14-day correction window after handover. If something we built doesn&apos;t work the way it was supposed to, we&apos;ll fix it at no charge. This window covers genuine bugs: things that were specified and built incorrectly. It does not cover new feature requests, Shopify platform updates, browser changes, or modifications made by your team after you took ownership.
        </p>
        <p>
          Theme purchases include updates for the version you purchased. We&apos;ll notify existing customers of major upgrades and offer a discounted upgrade path where we can.
        </p>
      </>
    ),
  },
  {
    id: "confidentiality",
    title: "Confidentiality",
    sketch: <SketchLock />,
    body: (
      <>
        <p>
          Everything you share with us stays with us. Business plans, product roadmaps, financials, customer data, unreleased work — none of it gets discussed outside the project, shared with third parties, or used for anything other than the work you hired us to do.
        </p>
        <p>
          We use professional tooling and don&apos;t store client credentials beyond what&apos;s needed to complete the work. Access is revoked on handover unless you instruct otherwise.
        </p>
        <p>
          If your project requires a formal NDA, send it over before we begin. We sign reasonable NDAs without issue.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    sketch: <SketchCap />,
    body: (
      <>
        <p>
          We build carefully and stand behind our work. If we make a mistake, we want to know and we want to fix it. But there are limits to what we can reasonably be held responsible for.
        </p>
        <p>
          Our total liability for any claim arising from a project is capped at the total amount you paid us for that project. We are not liable for lost revenue, lost customers, missed launches, reputational harm, or any other downstream business impact — even if a bug or delay was on our end.
        </p>
        <p>
          We are also not liable for issues caused by third-party platforms (Shopify, payment processors, hosting providers, CDNs), changes to those platforms after handover, or modifications made by your team to code we delivered. Once you or someone you authorise touches the codebase, that portion is outside our warranty.
        </p>
      </>
    ),
  },
  {
    id: "disputes",
    title: "Disputes",
    sketch: <SketchMediation />,
    body: (
      <>
        <p>
          If something goes wrong, message us first. We&apos;re a small studio and most issues resolve in a single conversation. We don&apos;t have a legal team waiting to fire back — we have a genuine interest in making things right and keeping the relationship intact where possible.
        </p>
        <p>
          If a dispute can&apos;t be resolved between us directly, both parties agree to attempt mediation before pursuing any legal action. Formal proceedings, if it comes to that, will be governed by the laws of Illinois, United States.
        </p>
        <p>
          We&apos;ve never had a dispute reach that stage and we intend to keep it that way.
        </p>
      </>
    ),
  },
];

/* ── Page ─────────────────────────────────────────────────────────── */

export default function LegalPage() {
  return (
    <main className="page-container mx-auto w-full max-w-5xl min-h-screen flex flex-col pb-16 sm:pb-24">

      {/* Nav */}
      <div className="flex items-center px-8 py-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true"><path d="M10 3L5 8l5 5" /></svg>
          back
        </Link>
      </div>

      <div className="grid-rule" aria-hidden="true" />

      {/* Header */}
      <div className="px-8 pt-12 pb-10">
        <p className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-50 mb-4">Legal</p>
        <h1 className="text-[clamp(2rem,5vw,3.25rem)] font-medium tracking-[-0.04em] leading-[1.05] text-[rgb(var(--fg))] mb-4">
          Terms of engagement.
        </h1>
        <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] leading-relaxed max-w-md">
          Plain-language terms covering IP, payment, revisions, and everything worth knowing before we work together.
        </p>
        <p className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-40 mt-4 tabular-nums">
          Effective {EFFECTIVE}
        </p>
      </div>

      <div className="grid-rule" aria-hidden="true" />

      {/* Body */}
      <div className="flex flex-col sm:flex-row">

        {/* TOC sidebar */}
        <aside className="hidden sm:flex sm:w-56 shrink-0 flex-col gap-1 px-8 pt-10 sticky top-8 self-start">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-[12px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors py-1"
            >
              {s.title}
            </a>
          ))}
        </aside>

        <div className="hidden sm:block w-px bg-[rgb(var(--line))] shrink-0 self-stretch" />

        {/* Sections */}
        <div className="flex-1 min-w-0">
          {SECTIONS.map((s, i) => (
            <div key={s.id}>
              <section id={s.id} className="px-8 sm:px-12 py-10">
                <h2 className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))] mb-7">
                  {s.title}
                </h2>
                <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 items-start">
                  <div className="w-full sm:w-[200px] shrink-0">
                    {s.sketch}
                  </div>
                  <div className="flex-1 space-y-4 text-[15px] tracking-tight leading-[1.8] text-[rgb(var(--muted))] [&_p]:text-[rgb(var(--muted))]">
                    {s.body}
                  </div>
                </div>
              </section>
              {i < SECTIONS.length - 1 && <div className="grid-rule" aria-hidden="true" />}
            </div>
          ))}
        </div>

      </div>

      <div className="grid-rule" aria-hidden="true" />

      {/* Footer note */}
      <div className="px-8 sm:px-12 py-8 flex items-center justify-between gap-6">
        <p className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-40 max-w-sm leading-relaxed">
          Questions about any of this?{" "}
          <Link href="/contact" className="underline underline-offset-2 hover:opacity-70 transition-opacity">
            Get in touch
          </Link>{" "}
          before we start.
        </p>
        <p className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-30 tabular-nums shrink-0">
          © {new Date().getFullYear()} Inertia
        </p>
      </div>

    </main>
  );
}
