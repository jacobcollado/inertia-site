"use client";

import { ChipPlate } from "@/components/chip-plate";
import { ClientLinks } from "@/components/client-links";
import { Close } from "@/components/close";
import { WhatWeDo } from "@/components/what-we-do";
import { WhyUs } from "@/components/why-us";
import { About } from "@/components/about";

// The homepage on white. It opens on a plate: an AI accelerator package drawn as an
// exploded technical drawing, filling the first screen. Then what we do in
// one sentence beside the chip closed, our mark engraved into its lid, the
// work as the clients' names left the way it
// arrived, links in the default serif, what we do as a sheet of three drawn
// figures, why us, and the way in.

export default function HomeIndex() {
  return (
    <main className="index-page">
      <section className="index-col index-plate" data-hero>
        <ChipPlate />
      </section>

      <About />

      <section className="index-work" aria-label="Work">
        <ClientLinks />
      </section>

      <WhatWeDo />

      <WhyUs />

      <Close />
    </main>
  );
}
