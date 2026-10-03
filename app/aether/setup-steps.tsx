import type { ReactNode } from "react";
import { IllustratedCard } from "@/components/illustrated-card";

// "How much work is this?" answered right before the bonuses. Install and
// setup are done for the buyer, same day, through a Shopify collaborator
// request.
//
// Same IllustratedCard as the bonuses, with its own covers, so the two
// sections read as one family instead of a timeline dropped into a page of
// cards.

const LIVE_GREEN = "22 163 74";
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const BAR = "block h-[5px] rounded-full bg-[rgb(var(--fg)/0.12)]";
const BAR_STRONG = "block h-[5px] rounded-full bg-[rgb(var(--fg)/0.22)]";
const SHEET =
  "rounded-[6px] bg-[rgb(var(--bg))] shadow-[0_0_0_1px_rgb(var(--line)),0_10px_24px_-12px_rgb(0_0_0/0.25)]";

// Step one: the license email landing on top of an older message. The new
// one lifts a little on hover.
function InboxCover() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 px-3 sm:px-6">
      <div
        className={`${SHEET} flex w-full max-w-[15rem] items-center gap-2.5 px-3 py-2.5 motion-safe:group-hover:-translate-y-1 motion-safe:group-data-[play]:-translate-y-1`}
        style={{ transition: `transform 500ms ${EASE}` }}
      >
        <span className="flex size-6 shrink-0 items-center justify-center rounded-[6px] bg-[rgb(var(--surface))] text-[rgb(var(--fg))] [&_svg]:size-[50%]">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="5" cy="8" r="3" />
            <path d="M8 8h6.5M12 8v2.5M14.5 8v2" />
          </svg>
        </span>
        <span className="flex-1">
          <span className={`${BAR_STRONG} w-[62%]`} />
          <span className={`${BAR} mt-1.5 w-[84%]`} />
        </span>
        <span className="text-[10px] tracking-tight text-[rgb(var(--muted))]">now</span>
      </div>
      <div className={`${SHEET} flex w-[88%] max-w-[13.25rem] items-center gap-2.5 px-3 py-2 opacity-50`}>
        <span className="size-5 shrink-0 rounded-[6px] bg-[rgb(var(--surface))]" />
        <span className="flex-1">
          <span className={`${BAR} w-[48%]`} />
        </span>
      </div>
    </div>
  );
}

// Step two: the collaborator request, reduced to a title, a line of copy and
// the one button that matters. The button presses in on hover.
function RequestCover() {
  return (
    <div className="flex h-full w-full items-center justify-center px-3 sm:px-6">
      <div className={`${SHEET} w-full max-w-[15rem] p-3`}>
        <span className={`${BAR_STRONG} w-[58%]`} />
        <span className={`${BAR} mt-2 w-full`} />
        <span className={`${BAR} mt-1.5 w-[76%]`} />
        <div className="mt-3.5 flex justify-end gap-1.5">
          <span className="flex h-6 items-center rounded-[6px] px-2.5 text-[10px] tracking-tight text-[rgb(var(--muted))] shadow-[0_0_0_1px_rgb(var(--line))]">
            Decline
          </span>
          <span
            className="flex h-6 items-center rounded-[6px] bg-[rgb(var(--fg))] px-2.5 text-[10px] tracking-tight text-[rgb(var(--bg))] motion-safe:group-hover:scale-95 motion-safe:group-data-[play]:scale-95"
            style={{ transition: `transform 300ms ${EASE}` }}
          >
            Accept
          </span>
        </div>
      </div>
    </div>
  );
}

// Step three: a store in a small window, with the install bar that finishes
// and turns the dot green on hover.
function InstallCover() {
  return (
    <div className="flex h-full w-full items-center justify-center px-3 sm:px-6">
      <div className={`${SHEET} w-full max-w-[15rem] overflow-hidden`}>
        <div className="flex items-center gap-1 border-b border-[rgb(var(--line))] px-2.5 py-1.5">
          <span className="size-1.5 rounded-full bg-[rgb(var(--fg)/0.15)]" />
          <span className="size-1.5 rounded-full bg-[rgb(var(--fg)/0.15)]" />
          <span className="size-1.5 rounded-full bg-[rgb(var(--fg)/0.15)]" />
        </div>
        <div className="flex gap-2.5 p-2.5">
          <span className="h-10 w-12 shrink-0 rounded-[6px] bg-[rgb(var(--surface))]" />
          <span className="flex-1 pt-0.5">
            <span className={`${BAR_STRONG} w-[70%]`} />
            <span className={`${BAR} mt-1.5 w-full`} />
            <span className={`${BAR} mt-1.5 w-[55%]`} />
          </span>
        </div>
        <div className="flex items-center gap-2 px-2.5 pb-2.5">
          <span className="relative h-[5px] flex-1 overflow-hidden rounded-full bg-[rgb(var(--fg)/0.08)]">
            <span
              className="absolute inset-y-0 left-0 w-[68%] rounded-full bg-[rgb(var(--fg)/0.35)] motion-safe:group-hover:w-full motion-safe:group-data-[play]:w-full"
              style={{ transition: `width 700ms ${EASE}` }}
            />
          </span>
          <span
            className="size-2 shrink-0 rounded-full bg-[rgb(var(--fg)/0.15)] motion-safe:group-hover:bg-[rgb(22_163_74)] motion-safe:group-data-[play]:bg-[rgb(22_163_74)]"
            style={{ transition: "background-color 300ms ease 500ms" }}
          />
        </div>
      </div>
    </div>
  );
}

const STEPS: { title: string; desc: string; time: string; cover: ReactNode }[] = [
  {
    title: "You buy",
    desc: "Your license key arrives within a minute.",
    time: "1 min",
    cover: <InboxCover />,
  },
  {
    title: "You tap accept",
    desc: "We ask Shopify for access to your store. One tap lets us in.",
    time: "1 min",
    cover: <RequestCover />,
  },
  {
    title: "We set it up",
    desc: "We install Aether and get it ready. Nothing for you to do.",
    time: "Same day",
    cover: <InstallCover />,
  },
];

export function SetupSteps() {
  return (
    <div className="w-full">
      {/* Phones: two up, step one full width so the three fill two rows.
          Three columns from sm up. */}
      <ol className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        {STEPS.map((step, i) => (
          <IllustratedCard
            key={step.title}
            as="li"
            compactOnMobile
            className={`rise rise--liquid ${i === 0 ? "col-span-2 sm:col-span-1" : ""}`}
            style={{ "--rise-delay": `${80 + i * 60}ms` } as React.CSSProperties}
            cover={step.cover}
            eyebrow={`Step ${i + 1}`}
            meta={step.time}
            title={step.title}
            desc={step.desc}
          />
        ))}
      </ol>

      <p
        className="rise rise--liquid mt-6 flex items-center justify-center gap-2 text-[14px] sm:text-[15px] tracking-tight text-[rgb(var(--muted))]"
        style={{ "--rise-delay": "280ms" } as React.CSSProperties}
      >
        <span
          aria-hidden="true"
          className="size-2 shrink-0 rounded-full"
          style={{ background: `rgb(${LIVE_GREEN})`, boxShadow: `0 0 0 3px rgb(${LIVE_GREEN} / 0.15)` }}
        />
        You publish when ready. Your current theme stays live until you do.
      </p>
    </div>
  );
}
