"use client";

import Link from "next/link";
import type { TileWork } from "@/components/work-tile";
import { MovementPlate } from "@/components/movement-plate";
import { WorkPlates } from "@/components/work-plates";
import { Close } from "@/components/close";
import { WhatWeDo } from "@/components/what-we-do";
import { WhyUs } from "@/components/why-us";

// The homepage on white. It opens on a plate: a watch movement drawn as an
// exploded technical drawing, filling the first screen. Then one sentence
// saying what we do, the work as a row of logo plates, what we do as a
// sheet of three drawn figures, why us, and the way in.

export default function HomeIndex({ work }: { work: TileWork[] }) {
  return (
    <main className="index-page">
      <section className="index-col index-plate" data-hero>
        <MovementPlate />
      </section>

      <section className="index-col index-opening">
        <h1 className="index-sentence">
          Inertia designs identities and websites for founders as one system, so you look like{" "}
          <span className="index-sentence__drawn">the company you&apos;re becoming.</span>
        </h1>
      </section>

      <section className="index-work" aria-label="Work">
        <WorkPlates work={work} />
        <div className="index-col index-more-row">
          <Link href="/work" className="index-more">
            <span>All work</span>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>

      <WhatWeDo />

      <WhyUs />

      <Close />
    </main>
  );
}
