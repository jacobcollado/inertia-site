"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DemoButton } from "./demo-button";
import { aetherLiquidReveal } from "./motion";

export function AetherHero({ demoUrl }: { demoUrl: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Same rAF gate as the homepage hero — guarantees the hidden state paints
    // once before the liquid dissolve runs.
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const liquid = (delay: number, opts?: { blur?: number; scaleFrom?: number }) =>
    aetherLiquidReveal(visible, delay, opts);

  return (
    <section
      className="flex flex-col items-center justify-center gap-4 px-4 sm:px-6 text-center pt-12 sm:pt-20"
      style={{ minHeight: 480, paddingBottom: 40 }}
    >
      <h1 className="font-normal tracking-[-0.04em] leading-none m-0" style={liquid(0, { blur: 12, scaleFrom: 0.99 })}>
        <Image
          src="/work-logos/aether.png"
          alt="Aether"
          width={220}
          height={55}
          className="h-[clamp(3.6rem,8.5vw,5.5rem)] sm:h-[clamp(3.2rem,6.5vw,4.75rem)] w-auto mx-auto"
          priority
        />
      </h1>
      <p
        className="text-[clamp(1rem,1.8vw,1.1rem)] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-sm sm:max-w-md"
        style={liquid(90, { blur: 8, scaleFrom: 0.994 })}
      >
        Design is the product. A Shopify theme for independent brands that treat how the store looks as part of what they sell.
      </p>
      <div
        className="flex flex-col items-center justify-center gap-2 w-full max-w-sm px-2 sm:px-0 text-[13px] tracking-tight"
        style={liquid(180)}
      >
        <Link
          href="/aether#pricing"
          className="w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium tracking-tight hover:opacity-80 transition-opacity"
          style={{ background: "#000", color: "#ededed" }}
        >
          Buy a license
        </Link>
        <div className="w-full flex gap-2">
          <div className="flex-[2]">
            <DemoButton href={demoUrl} password="aether" />
          </div>
          <Link
            href="/docs?from=aether"
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-[rgb(var(--line))] px-5 py-2 text-[13px] font-medium tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] hover:border-[rgb(var(--fg)/0.3)] transition-colors"
          >
            Docs
          </Link>
        </div>
      </div>
    </section>
  );
}
