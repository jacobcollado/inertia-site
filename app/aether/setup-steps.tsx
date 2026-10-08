import type { ReactNode } from "react";
import { INK } from "@/components/material-art";
import { Box, Flag, LineBoard } from "@/components/line-art";

// "How much work is this?" answered right before the bonuses. Install and
// setup are done for the buyer, same day, through a Shopify collaborator
// request.
//
// Laid out like the sections above it: the heading and one line on the left,
// then the three steps, each a line drawing on a plain tile (the site's line
// kit, components/line-art.tsx) with its number, title and time beside each
// other under it and the description indented below. Comes in with the
// site's staggered reveal.

const FONT = { fontFamily: "var(--font-satoshi), sans-serif", fontWeight: 450 } as const;

function Caption({ x, y, children, size = 13 }: { x: number; y: number; children: ReactNode; size?: number }) {
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={size} fill={INK} style={FONT}>
      {children}
    </text>
  );
}

// Step one: the envelope, with the license key card sliding out of it.
function Envelope() {
  return (
    <LineBoard>
      <Box x={138} y={78} w={124} h={60} d={0.04} />
      <Caption x={200} y={100} size={12}>License key</Caption>
      <Box x={110} y={140} w={180} h={100} d={0.06} />
      <polyline points="110,140 200,196 290,140" fill="none" stroke={INK} strokeWidth={1.1} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </LineBoard>
  );
}

// Step two: the collaborator request's two buttons, Accept pressed in.
function Accept() {
  return (
    <LineBoard>
      <Box x={86} y={168} w={104} h={42} d={0.06} light />
      <Caption x={138} y={189}>Decline</Caption>
      <Box x={210} y={174} w={104} h={42} d={0.03} />
      <Caption x={262} y={195}>Accept</Caption>
    </LineBoard>
  );
}

// Step three: the store, set on its plinth, with the flag up.
function Live() {
  return (
    <LineBoard>
      <Box x={110} y={208} w={180} h={32} d={0.24} />
      <Box x={150} y={140} w={100} h={68} d={0.17} />
      <Flag x={214} y={128} h={74} />
    </LineBoard>
  );
}

const STEPS: { title: string; desc: string; time: string; Art: () => ReactNode }[] = [
  { title: "You buy", desc: "Your license key arrives within a minute.", time: "1 min", Art: Envelope },
  { title: "You tap accept", desc: "We ask Shopify for access to your store. One tap lets us in.", time: "1 min", Art: Accept },
  { title: "We set it up", desc: "We install Aether and get it ready. Nothing for you to do.", time: "Same day", Art: Live },
];

/** `eyebrow` sits above the heading (the chapter mark on /aether). */
export function SetupSteps({ eyebrow }: { eyebrow?: ReactNode }) {
  return (
    <section className="rise rise-stagger mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] pt-20 pb-16 sm:pt-28 sm:pb-24">
      <div className="mb-10 sm:mb-12">
        {eyebrow}
        <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-[1.1] text-[rgb(var(--fg))]">
          Set up for you, same day
        </h2>
        <p className="mt-2 max-w-lg text-[15.5px] sm:text-[17px] leading-relaxed tracking-tight text-[rgb(var(--muted))] [text-wrap:pretty]">
          Buy, tap accept, and we install Aether for you. Your current theme stays live until you publish.
        </p>
      </div>

      {/* Phones: a row that swipes sideways, each step most of the screen
          wide so the next one peeks in. Three columns from sm up. */}
      <ol data-stagger className="no-scrollbar -mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-px-3 px-3 sm:mx-0 sm:grid sm:overflow-visible sm:px-0 sm:grid-cols-3 sm:gap-x-4">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex w-[80%] shrink-0 snap-start flex-col sm:w-auto">
            <div className="aspect-[4/3] overflow-hidden rounded-[6px] bg-[var(--tile)]">
              <step.Art />
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="w-4 shrink-0 text-[14px] tabular-nums tracking-tight text-[rgb(var(--muted))] opacity-70">{i + 1}</span>
              <p className="flex-1 text-[18px] sm:text-[21px] tracking-[-0.02em] leading-snug text-[rgb(var(--fg))]" style={{ fontWeight: 500 }}>
                {step.title}
              </p>
              <span className="text-[13px] sm:text-[14px] tracking-tight text-[rgb(var(--muted))]">{step.time}</span>
            </div>
            <p className="mt-1 pl-7 text-[15px] sm:text-[16px] leading-relaxed tracking-tight text-[rgb(var(--muted))] [text-wrap:pretty]">
              {step.desc}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
