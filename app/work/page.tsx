import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { getAllWork } from "@/lib/work";
import { getWorkIndexThumb } from "@/lib/work-thumb";
import { FrameRails, FrameRule } from "@/components/page-frame";
import { TeardownButton } from "@/components/teardown-dialog";

// Homepage-style liquid reveal, staggered by a delay in ms.
const reveal = (delay = 0) =>
  ({ "--rise-delay": `${delay}ms` }) as React.CSSProperties;

// Per-project crop nudge for thumbnails that sit lower in frame. Default is
// the top of the shot.
const THUMB_POSITION: Record<string, string> = {
  "trippie-redd": "center 35%",
  "allure-new-york": "center 50%",
};

// A split between cells. The page pads its content in from the cell edges,
// so the split steps back out across that padding to meet the rails.
function Split() {
  return (
    <div className="-mx-3 sm:-mx-8">
      <FrameRule tone="light" className="py-8 sm:py-12" />
    </div>
  );
}

export default function WorkIndexPage() {
  const work = getAllWork();

  return (
    <main className="relative mx-auto w-full max-w-[80rem] min-h-screen flex flex-col px-3 sm:px-8">
      <FrameRails tone="light" />

      <section className="w-full px-3 pt-12 pb-2 sm:px-0 sm:pt-16">
        <h1
          className="rise rise--liquid max-w-3xl text-[clamp(2.4rem,10vw,3.2rem)] sm:text-[clamp(3rem,6vw,4.75rem)] tracking-[-0.045em] leading-[0.98] text-balance"
          style={{ ...reveal(0), color: "var(--ink)", fontWeight: 450 }}
        >
          Every project, built in-house.
        </h1>
      </section>

      <Split />

      <ul className="grid w-full gap-x-4 gap-y-10 px-3 sm:grid-cols-2 sm:gap-y-14 sm:px-0">
        {work.map((w, i) => {
          const thumb = getWorkIndexThumb(w);
          // With an odd count the first project runs full width, so the rest
          // pair up with no empty slot at the end.
          const feature = i === 0 && work.length % 2 === 1;
          return (
            <li key={w.slug} className={`rise rise--liquid${feature ? " sm:col-span-2" : ""}`} style={reveal(Math.min(i, 3) * 80)}>
              <Link href={`/work/${w.slug}`} className="group block">
                <div className={`relative w-full overflow-hidden rounded-[12px] aspect-[3/2]${feature ? " sm:aspect-[21/9]" : ""}`} style={{ background: "var(--tile)" }}>
                  {thumb && (
                    <Image
                      src={thumb}
                      alt={w.client}
                      fill
                      sizes={feature ? "(max-width: 640px) 100vw, 1280px" : "(max-width: 640px) 100vw, 640px"}
                      quality={90}
                      priority={i < 2}
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025]"
                      style={{ objectPosition: THUMB_POSITION[w.slug] ?? "center top" }}
                    />
                  )}
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <h2 className="min-w-0 truncate text-[19px] sm:text-[22px] leading-tight tracking-[-0.02em]" style={{ color: "var(--ink)", fontWeight: 450 }}>
                    {w.client}
                  </h2>
                  {w.service && (
                    <span className="shrink-0 text-[14px] sm:text-[15px] tracking-tight" style={{ color: "var(--ink-4)" }}>
                      {w.service}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <Split />

      {/* The same first step the homepage and every case study offer. */}
      <section className="w-full px-3 sm:px-0">
        <div className="flex flex-col gap-6 rounded-[12px] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-10" style={{ background: "var(--tile)" }}>
          <div>
            <p className="text-[clamp(1.8rem,3.4vw,2.5rem)] leading-[1.05] tracking-[-0.03em]" style={{ color: "var(--ink)", fontWeight: 450 }}>
              Your name could be next.
            </p>
          </div>
          <div className="shrink-0">
            <TeardownButton />
          </div>
        </div>
      </section>

      <Split />
    </main>
  );
}
