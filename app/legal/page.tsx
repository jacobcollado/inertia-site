import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Legal — Inertia",
  description: "Terms of engagement, IP ownership, and everything worth knowing before we work together.",
};

const EFFECTIVE = "May 1, 2026";

/* ── Sketches ─────────────────────────────────────────────────────── */

// Before we start — two hands meeting, clean line art
function SketchHandshake() {
  const m = "rgb(var(--muted))";
  const a = "rgb(var(--blue))";
  return (
    <svg viewBox="0 0 200 120" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Left forearm */}
      <line x1="14" y1="100" x2="72" y2="68" stroke={m} strokeWidth="2.5" opacity="0.5" />
      {/* Right forearm */}
      <line x1="186" y1="100" x2="128" y2="68" stroke={m} strokeWidth="2.5" opacity="0.5" />
      {/* Left hand knuckles */}
      <path d="M 72 68 L 78 62 L 84 65 L 88 60 L 94 63 L 98 58 L 100 66" stroke={a} strokeWidth="1.8" opacity="0.75" />
      {/* Right hand knuckles — mirrored */}
      <path d="M 128 68 L 122 62 L 116 65 L 112 60 L 106 63 L 102 58 L 100 66" stroke={a} strokeWidth="1.8" opacity="0.75" />
      {/* Grip join */}
      <path d="M 72 68 Q 86 76 100 74 Q 114 76 128 68" stroke={a} strokeWidth="2" opacity="0.65" />
      {/* Wrist cuffs */}
      <line x1="66" y1="72" x2="78" y2="64" stroke={m} strokeWidth="1.2" opacity="0.35" />
      <line x1="134" y1="72" x2="122" y2="64" stroke={m} strokeWidth="1.2" opacity="0.35" />
      {/* Spark above */}
      <line x1="100" y1="52" x2="100" y2="42" stroke={a} strokeWidth="1.5" opacity="0.7" />
      <line x1="91" y1="55" x2="84" y2="47" stroke={a} strokeWidth="1.2" opacity="0.55" />
      <line x1="109" y1="55" x2="116" y2="47" stroke={a} strokeWidth="1.2" opacity="0.55" />
      <line x1="87" y1="46" x2="95" y2="44" stroke={a} strokeWidth="1" opacity="0.4" />
      <line x1="113" y1="46" x2="105" y2="44" stroke={a} strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

// Ownership — document with "YOURS" label, key transferring
function SketchOwnership() {
  const m = "rgb(var(--muted))";
  const a = "rgb(var(--purple))";
  return (
    <svg viewBox="0 0 200 120" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Document body */}
      <rect x="30" y="10" width="80" height="100" rx="3" stroke={m} strokeWidth="1.5" opacity="0.5" />
      {/* Dog-ear fold */}
      <polyline points="90,10 110,10 110,30 90,10" stroke={m} strokeWidth="1.2" opacity="0.4" />
      {/* Text lines */}
      <line x1="44" y1="40" x2="96" y2="40" stroke={m} strokeWidth="1.2" opacity="0.35" />
      <line x1="44" y1="52" x2="96" y2="52" stroke={m} strokeWidth="1.2" opacity="0.35" />
      <line x1="44" y1="64" x2="80" y2="64" stroke={m} strokeWidth="1.2" opacity="0.3" />
      {/* Ownership stamp circle */}
      <circle cx="65" cy="90" r="16" stroke={a} strokeWidth="1.8" opacity="0.7" fill={a} fillOpacity="0.07" />
      {/* Tick inside stamp */}
      <polyline points="56,90 62,97 76,82" stroke={a} strokeWidth="2.2" opacity="0.8" />
      {/* Arrow transferring to owner */}
      <line x1="118" y1="60" x2="158" y2="60" stroke={a} strokeWidth="1.5" opacity="0.65" strokeDasharray="4 3" />
      <polyline points="152,53 160,60 152,67" stroke={a} strokeWidth="1.8" opacity="0.7" />
      {/* Owner box */}
      <rect x="162" y="46" width="28" height="28" rx="2" stroke={a} strokeWidth="1.4" opacity="0.55" fill={a} fillOpacity="0.06" />
      <line x1="168" y1="57" x2="184" y2="57" stroke={a} strokeWidth="1.1" opacity="0.5" />
      <line x1="168" y1="63" x2="178" y2="63" stroke={a} strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

// Payment — invoice split cleanly 50/50 with a coin
function SketchPayment() {
  const m = "rgb(var(--muted))";
  const a = "rgb(var(--green))";
  return (
    <svg viewBox="0 0 200 120" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Invoice card */}
      <rect x="20" y="16" width="160" height="88" rx="3" stroke={m} strokeWidth="1.4" opacity="0.4" />
      {/* Header stripe */}
      <rect x="20" y="16" width="160" height="20" rx="3" stroke="none" fill={a} fillOpacity="0.1" />
      <line x1="20" y1="36" x2="180" y2="36" stroke={a} strokeWidth="1.2" opacity="0.45" />
      {/* Header text line */}
      <line x1="32" y1="27" x2="90" y2="27" stroke={a} strokeWidth="1.4" opacity="0.55" />
      {/* 50% divider */}
      <line x1="100" y1="36" x2="100" y2="104" stroke={m} strokeWidth="1" strokeDasharray="4 3" opacity="0.3" />
      {/* Left half — paid */}
      <rect x="20" y="36" width="80" height="68" rx="0" fill={a} fillOpacity="0.06" stroke="none" />
      {/* Left label lines */}
      <line x1="32" y1="54" x2="88" y2="54" stroke={a} strokeWidth="1.2" opacity="0.5" />
      <line x1="32" y1="64" x2="76" y2="64" stroke={a} strokeWidth="1" opacity="0.4" />
      {/* Checkmark left */}
      <polyline points="36,82 42,89 56,74" stroke={a} strokeWidth="2" opacity="0.75" />
      {/* Right label lines */}
      <line x1="110" y1="54" x2="170" y2="54" stroke={m} strokeWidth="1.2" opacity="0.3" />
      <line x1="110" y1="64" x2="158" y2="64" stroke={m} strokeWidth="1" opacity="0.25" />
      {/* Right half indicator — dashed */}
      <line x1="110" y1="82" x2="170" y2="82" stroke={m} strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
      {/* 50 / 50 labels */}
      <line x1="32" y1="98" x2="60" y2="98" stroke={a} strokeWidth="1.2" opacity="0.45" />
      <line x1="110" y1="98" x2="138" y2="98" stroke={m} strokeWidth="1.2" opacity="0.25" />
    </svg>
  );
}

// Revisions — document with numbered v1 / v2 marks and a pencil
function SketchRevisions() {
  const m = "rgb(var(--muted))";
  const a = "rgb(var(--amber))";
  return (
    <svg viewBox="0 0 200 120" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Background doc v1 */}
      <rect x="22" y="22" width="80" height="90" rx="2" stroke={m} strokeWidth="1.2" opacity="0.3" />
      {/* Foreground doc v2 */}
      <rect x="36" y="12" width="80" height="90" rx="2" stroke={a} strokeWidth="1.6" opacity="0.65" fill={a} fillOpacity="0.04" />
      {/* Doc lines */}
      <line x1="50" y1="34" x2="104" y2="34" stroke={m} strokeWidth="1.2" opacity="0.35" />
      <line x1="50" y1="46" x2="104" y2="46" stroke={m} strokeWidth="1.2" opacity="0.35" />
      <line x1="50" y1="58" x2="88" y2="58" stroke={m} strokeWidth="1.2" opacity="0.3" />
      {/* Pencil — rotated 45° */}
      <rect x="118" y="30" width="10" height="52" rx="2" transform="rotate(-45 118 30)" stroke={a} strokeWidth="1.6" opacity="0.7" fill={a} fillOpacity="0.07" />
      <polyline points="144,72 152,80 138,82" stroke={a} strokeWidth="1.4" opacity="0.6" />
      {/* Edit line being drawn */}
      <line x1="106" y1="68" x2="140" y2="68" stroke={a} strokeWidth="1.4" opacity="0.55" strokeDasharray="4 3" />
      {/* Round counters */}
      <circle cx="160" cy="30" r="10" stroke={a} strokeWidth="1.5" opacity="0.65" fill={a} fillOpacity="0.08" />
      <circle cx="160" cy="56" r="10" stroke={a} strokeWidth="1.5" opacity="0.65" fill={a} fillOpacity="0.08" />
      {/* 1 inside first circle */}
      <line x1="160" y1="24" x2="160" y2="36" stroke={a} strokeWidth="1.8" opacity="0.7" />
      {/* 2 inside second circle — simplified */}
      <path d="M 154 51 Q 154 48 160 48 Q 166 48 166 53 Q 166 57 154 62 L 166 62" stroke={a} strokeWidth="1.6" opacity="0.7" />
    </svg>
  );
}

// After launch — flag planted, 14-day window calendar
function SketchLaunch() {
  const m = "rgb(var(--muted))";
  const a = "rgb(var(--blue))";
  return (
    <svg viewBox="0 0 200 120" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Ground / horizon */}
      <line x1="10" y1="96" x2="190" y2="96" stroke={m} strokeWidth="1.2" opacity="0.35" />
      {/* Flag pole */}
      <line x1="72" y1="96" x2="72" y2="20" stroke={m} strokeWidth="1.8" opacity="0.55" />
      {/* Flag */}
      <path d="M 72 20 L 122 32 L 72 48 Z" stroke={a} strokeWidth="1.5" opacity="0.7" fill={a} fillOpacity="0.1" />
      {/* Ground bump */}
      <path d="M 52 96 Q 72 88 92 96" stroke={m} strokeWidth="1.2" opacity="0.3" />
      {/* Calendar — 14-day window */}
      <rect x="116" y="30" width="68" height="58" rx="3" stroke={a} strokeWidth="1.5" opacity="0.6" />
      <line x1="116" y1="46" x2="184" y2="46" stroke={a} strokeWidth="1.2" opacity="0.5" />
      {/* Calendar header rings */}
      <line x1="136" y1="26" x2="136" y2="34" stroke={a} strokeWidth="1.8" opacity="0.6" />
      <line x1="164" y1="26" x2="164" y2="34" stroke={a} strokeWidth="1.8" opacity="0.6" />
      {/* Calendar cells — 2 rows of 7 */}
      {[0,1,2,3,4,5,6].map(d => (
        <rect key={`r1-${d}`} x={120 + d * 9} y={50} width="7" height="7" rx="1"
          stroke={d < 2 ? a : m} strokeWidth={d < 2 ? 1.2 : 0.8}
          fill={d < 2 ? a : "none"} fillOpacity="0.2"
          opacity={d < 2 ? 0.7 : 0.3} />
      ))}
      {[0,1,2,3,4,5,6].map(d => (
        <rect key={`r2-${d}`} x={120 + d * 9} y={62} width="7" height="7" rx="1"
          stroke={d < 7 ? a : m} strokeWidth={d < 7 ? 1.2 : 0.8}
          fill={d < 7 ? a : "none"} fillOpacity="0.15"
          opacity={d < 7 ? 0.65 : 0.3} />
      ))}
      {/* "14" label */}
      <line x1="122" y1="80" x2="178" y2="80" stroke={a} strokeWidth="1" opacity="0.4" strokeDasharray="3 2" />
    </svg>
  );
}

// Confidentiality — large padlock, clean and readable
function SketchLock() {
  const m = "rgb(var(--muted))";
  const a = "rgb(var(--green))";
  return (
    <svg viewBox="0 0 200 120" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Lock body */}
      <rect x="58" y="56" width="84" height="58" rx="6" stroke={a} strokeWidth="2" opacity="0.75" fill={a} fillOpacity="0.07" />
      {/* Shackle — U shape */}
      <path d="M 76 56 L 76 38 Q 76 18 100 18 Q 124 18 124 38 L 124 56" stroke={a} strokeWidth="2" opacity="0.7" />
      {/* Keyhole circle */}
      <circle cx="100" cy="80" r="9" stroke={a} strokeWidth="1.8" opacity="0.7" fill={a} fillOpacity="0.1" />
      {/* Keyhole stem */}
      <line x1="100" y1="89" x2="100" y2="101" stroke={a} strokeWidth="2.2" opacity="0.65" />
      {/* Horizontal key crossbar */}
      <line x1="95" y1="96" x2="105" y2="96" stroke={a} strokeWidth="2" opacity="0.6" />
      {/* NDA label lines */}
      <line x1="20" y1="50" x2="46" y2="50" stroke={m} strokeWidth="1.2" opacity="0.4" />
      <line x1="20" y1="60" x2="46" y2="60" stroke={m} strokeWidth="1.2" opacity="0.3" />
      <line x1="20" y1="70" x2="40" y2="70" stroke={m} strokeWidth="1" opacity="0.25" />
      {/* Lock icon on data */}
      <line x1="48" y1="44" x2="56" y2="56" stroke={a} strokeWidth="1.4" opacity="0.55" />
      <line x1="56" y1="44" x2="48" y2="56" stroke={a} strokeWidth="1.4" opacity="0.55" />
      {/* Right side — same */}
      <line x1="154" y1="50" x2="180" y2="50" stroke={m} strokeWidth="1.2" opacity="0.4" />
      <line x1="154" y1="60" x2="180" y2="60" stroke={m} strokeWidth="1.2" opacity="0.3" />
      <line x1="160" y1="70" x2="180" y2="70" stroke={m} strokeWidth="1" opacity="0.25" />
      <line x1="144" y1="44" x2="152" y2="56" stroke={a} strokeWidth="1.4" opacity="0.55" />
      <line x1="152" y1="44" x2="144" y2="56" stroke={a} strokeWidth="1.4" opacity="0.55" />
    </svg>
  );
}

// Liability cap — two bar chart columns, one with a hard ceiling
function SketchCap() {
  const m = "rgb(var(--muted))";
  const a = "rgb(var(--amber))";
  return (
    <svg viewBox="0 0 200 120" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Baseline */}
      <line x1="20" y1="100" x2="180" y2="100" stroke={m} strokeWidth="1.4" opacity="0.4" />
      {/* Left bar — uncapped, tall, faded */}
      <rect x="40" y="20" width="44" height="80" rx="2" stroke={m} strokeWidth="1.4" opacity="0.35" fill={m} fillOpacity="0.06" />
      {/* Arrow continuing above — unbounded */}
      <line x1="62" y1="20" x2="62" y2="10" stroke={m} strokeWidth="1.2" opacity="0.3" strokeDasharray="3 2" />
      <polyline points="57,14 62,8 67,14" stroke={m} strokeWidth="1.2" opacity="0.3" />
      {/* Right bar — capped */}
      <rect x="116" y="50" width="44" height="50" rx="2" stroke={a} strokeWidth="1.8" opacity="0.7" fill={a} fillOpacity="0.08" />
      {/* Cap line — horizontal ceiling */}
      <line x1="108" y1="50" x2="168" y2="50" stroke={a} strokeWidth="2.5" opacity="0.8" />
      {/* Cap tick marks */}
      <line x1="108" y1="44" x2="108" y2="56" stroke={a} strokeWidth="1.8" opacity="0.7" />
      <line x1="168" y1="44" x2="168" y2="56" stroke={a} strokeWidth="1.8" opacity="0.7" />
      {/* Arrow stopped by cap */}
      <line x1="138" y1="10" x2="138" y2="48" stroke={a} strokeWidth="1.4" opacity="0.55" strokeDasharray="4 3" />
      <line x1="130" y1="20" x2="138" y2="10" stroke={a} strokeWidth="1.2" opacity="0.45" />
      <line x1="146" y1="20" x2="138" y2="10" stroke={a} strokeWidth="1.2" opacity="0.45" />
      {/* Column labels */}
      <line x1="36" y1="108" x2="88" y2="108" stroke={m} strokeWidth="1" opacity="0.25" />
      <line x1="112" y1="108" x2="164" y2="108" stroke={a} strokeWidth="1.2" opacity="0.45" />
    </svg>
  );
}

// Disputes — two speech bubbles + a bridge/handoff between them
function SketchMediation() {
  const m = "rgb(var(--muted))";
  const a = "rgb(var(--blue))";
  return (
    <svg viewBox="0 0 200 120" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Left speech bubble */}
      <path d="M 10 14 Q 10 8 16 8 L 74 8 Q 80 8 80 14 L 80 44 Q 80 50 74 50 L 36 50 L 24 62 L 28 50 L 16 50 Q 10 50 10 44 Z"
        stroke={m} strokeWidth="1.5" opacity="0.5" fill={m} fillOpacity="0.04" />
      {/* Left bubble lines */}
      <line x1="22" y1="22" x2="68" y2="22" stroke={m} strokeWidth="1.1" opacity="0.4" />
      <line x1="22" y1="32" x2="68" y2="32" stroke={m} strokeWidth="1.1" opacity="0.4" />
      <line x1="22" y1="42" x2="52" y2="42" stroke={m} strokeWidth="1.1" opacity="0.35" />
      {/* Right speech bubble — accent */}
      <path d="M 120 14 Q 120 8 126 8 L 184 8 Q 190 8 190 14 L 190 44 Q 190 50 184 50 L 172 50 L 176 62 L 164 50 L 126 50 Q 120 50 120 44 Z"
        stroke={a} strokeWidth="1.6" opacity="0.65" fill={a} fillOpacity="0.06" />
      {/* Right bubble lines */}
      <line x1="132" y1="22" x2="178" y2="22" stroke={a} strokeWidth="1.1" opacity="0.5" />
      <line x1="132" y1="32" x2="178" y2="32" stroke={a} strokeWidth="1.1" opacity="0.5" />
      <line x1="132" y1="42" x2="162" y2="42" stroke={a} strokeWidth="1.1" opacity="0.45" />
      {/* Bridge / resolution line */}
      <line x1="80" y1="85" x2="120" y2="85" stroke={a} strokeWidth="2" opacity="0.6" />
      <circle cx="100" cy="85" r="6" stroke={a} strokeWidth="1.8" opacity="0.7" fill={a} fillOpacity="0.12" />
      {/* Connector from bubbles to bridge */}
      <line x1="45" y1="62" x2="45" y2="80" stroke={m} strokeWidth="1.2" opacity="0.3" strokeDasharray="3 3" />
      <line x1="45" y1="80" x2="80" y2="85" stroke={m} strokeWidth="1.2" opacity="0.3" strokeDasharray="3 3" />
      <line x1="155" y1="62" x2="155" y2="80" stroke={m} strokeWidth="1.2" opacity="0.3" strokeDasharray="3 3" />
      <line x1="155" y1="80" x2="120" y2="85" stroke={m} strokeWidth="1.2" opacity="0.3" strokeDasharray="3 3" />
      {/* Resolution tick */}
      <polyline points="94,85 98,90 108,79" stroke={a} strokeWidth="2" opacity="0.8" />
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
          This page covers how Inertia operates — what you own, what we retain, how payment works, and what happens when things go sideways. It&apos;s written to be read, not skimmed by lawyers.
        </p>
        <p>
          By engaging Inertia for any paid work, you agree to the terms below. If something here doesn&apos;t work for your situation, raise it before we start — not after.
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
          When you pay in full, you own the final deliverable. That includes code, design files, and written content produced specifically for your project.
        </p>
        <p>
          We retain ownership of anything we built before your project started — frameworks, base components, tooling, internal libraries, and unreleased work. If we use those as a starting point (which we often do — it&apos;s why we&apos;re fast), you get a perpetual licence to use them inside your project, but you don&apos;t own them outright.
        </p>
        <p>
          We reserve the right to show the work in our portfolio unless you explicitly ask otherwise before signing. We will never publish anything marked confidential, share source code, or reveal your business details.
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
          All projects require a 50% deposit before work begins. The remaining 50% is due before final files are handed over or a site goes live — whichever comes first.
        </p>
        <p>
          Invoices are due within 7 days of issue. Late payments accrue a 1.5% monthly fee after 14 days. If payment is more than 30 days overdue, we reserve the right to pause or terminate the project without refund of work already completed.
        </p>
        <p>
          Deposits are non-refundable once work has begun. If you cancel after we&apos;ve started, you owe for all work completed to that point, billed at our standard rate.
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
          Every project includes two rounds of revisions. A revision is a change to something already built within the original brief — not a new feature, a change of direction, or a design overhaul.
        </p>
        <p>
          Additional revisions are billed at our current hourly rate. Scope changes — meaning work outside the original agreement — require a new estimate and written sign-off before we proceed.
        </p>
        <p>
          If a project stalls on your end for more than 30 days without communication, we reserve the right to close it out and bill for completed work. Re-opening a stalled project is treated as a new engagement.
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
          Once a project is handed over, ongoing support is not included unless we&apos;ve agreed to a retainer. We offer a 14-day correction window for bugs that are clearly our fault — things that were supposed to work and don&apos;t. This does not cover new requests, platform updates, or changes made by your team after handover.
        </p>
        <p>
          Theme purchases (Aether and any future releases) include updates for the version purchased. Major version upgrades may be offered at a reduced rate for existing customers.
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
          Anything you share with us — business plans, unreleased products, financials, customer data — stays between us. We don&apos;t discuss client work publicly, share access credentials with third parties, or use your information for anything outside the scope of your project.
        </p>
        <p>
          If your project requires an NDA, send one over before we begin. We&apos;re generally fine signing reasonable NDAs.
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
          We build things carefully and stand behind our work. But we cannot be held liable for lost revenue, missed opportunities, or downstream business impacts resulting from a delay, bug, or change in direction.
        </p>
        <p>
          Our total liability for any claim related to a project is capped at the amount you paid us for that project. We are not liable for issues caused by third-party platforms (Shopify, hosting providers, payment processors), your team&apos;s modifications, or circumstances outside our control.
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
          If something goes wrong, talk to us first. Most issues get resolved in a single conversation. We&apos;re a small studio and we have a genuine interest in making things right.
        </p>
        <p>
          If a dispute can&apos;t be resolved directly, it will be handled under the laws of Illinois, United States. Both parties agree to attempt mediation before pursuing legal action.
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
          className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          ← back
        </Link>
      </div>

      <div className="grid-rule" aria-hidden="true" />

      {/* Header */}
      <div className="px-8 pt-12 pb-10">
        <p className="text-[11px] tracking-widest uppercase text-[rgb(var(--muted))] opacity-50 mb-4">Legal</p>
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

        {/* TOC — desktop sticky sidebar */}
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
                <h2 className="text-[11px] font-medium tracking-widest uppercase text-[rgb(var(--muted))] opacity-50 mb-7">
                  {s.title}
                </h2>
                {/* Sketch + text side by side on desktop, stacked on mobile */}
                <div className="flex flex-col sm:flex-row gap-8 sm:gap-10 items-start">
                  {/* Sketch */}
                  <div className="w-full sm:w-[180px] shrink-0 opacity-80">
                    {s.sketch}
                  </div>
                  {/* Text */}
                  <div className="flex-1 space-y-4 text-[15px] tracking-tight leading-[1.8] text-[rgb(var(--fg))] [&_p]:text-[rgb(var(--fg))]">
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
