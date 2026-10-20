"use client";

import type { TileWork } from "@/components/work-tile";
import { MovementPlate } from "@/components/movement-plate";
import { WorkPlates } from "@/components/work-plates";
import { Close } from "@/components/close";
import { WhatWeDo } from "@/components/what-we-do";
import { WhyUs } from "@/components/why-us";
import { useReveal, Words } from "@/components/reveal";

// The homepage on white. It opens on a plate: a watch movement drawn as an
// exploded technical drawing, filling the first screen. Then one sentence
// saying what we do, the work as a row of logo plates ending on the
// archive of all of it, what we do as a
// sheet of three drawn figures, why us, and the way in.

export default function HomeIndex({ work }: { work: TileWork[] }) {
  const sentence = useReveal<HTMLHeadingElement>();

  return (
    <main className="index-page">
      <section className="index-col index-plate" data-hero>
        <MovementPlate />
      </section>

      <section className="index-col index-opening">
        <h1 ref={sentence} className="index-sentence">
          <Words text="Inertia designs identities and websites for founders as one system, so you look like" />{" "}
          <span className="index-sentence__drawn">
            <Words text="the company you’re becoming." from={14} />
          </span>
        </h1>
      </section>

      <section className="index-work" aria-label="Work">
        <WorkPlates work={work} />
      </section>

      <WhatWeDo />

      <WhyUs />

      <Close />
    </main>
  );
}
