import type { ReactNode } from "react";
import { SetupArt, type SetupArtKind } from "./setup-art";

// "How much work is this?" answered right before the bonuses. Install and
// setup are done for the buyer, same day, through a Shopify collaborator
// request.
//
// Laid out like the sections above it: the heading and one line on the left,
// then the three steps, each a line drawing on a plain tile that acts the
// step out when it comes on screen (setup-art.tsx), with its number, title
// and time beside each other under it and the description indented below.
// Comes in with the site's staggered reveal.

const STEPS: { title: string; desc: string; time: string; art: SetupArtKind }[] = [
  { title: "You buy", desc: "Your license key arrives within a minute.", time: "1 min", art: "buy" },
  { title: "You tap accept", desc: "We ask Shopify for access to your store. One tap lets us in.", time: "1 min", art: "accept" },
  { title: "We set it up", desc: "We install Aether and get it ready. Nothing for you to do.", time: "Same day", art: "live" },
];

/** `eyebrow` sits above the heading (the chapter mark on /aether). */
export function SetupSteps({ eyebrow }: { eyebrow?: ReactNode }) {
  return (
    <section className="rise rise-stagger mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] pt-20 pb-16 sm:pt-28 sm:pb-24">
      <div className="mb-10 sm:mb-12">
        {eyebrow}
        <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-[1.1] text-[rgb(var(--fg))]">
          Selling on Aether today
        </h2>
        <p className="mt-2 max-w-lg text-[15.5px] sm:text-[17px] leading-relaxed tracking-tight text-[rgb(var(--muted))] [text-wrap:pretty]">
          You don&apos;t lose a weekend to setup. Buy, tap accept, and we install Aether for you. Your current theme stays live until you publish.
        </p>
      </div>

      {/* Phones: a row that swipes sideways, each step most of the screen
          wide so the next one peeks in. Three columns from sm up. */}
      <ol data-stagger className="no-scrollbar -mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-px-3 px-3 sm:mx-0 sm:grid sm:overflow-visible sm:px-0 sm:grid-cols-3 sm:gap-x-4">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex w-[80%] shrink-0 snap-start flex-col sm:w-auto">
            <SetupArt kind={step.art} />
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
