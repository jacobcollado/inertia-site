"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { DemoButton } from "./demo-button";
import { HeroLooks } from "./hero-looks";
import { HeroPhones } from "./hero-phones";
import { Mark, STORES } from "./stores-on-aether";
import { ACTION_RADIUS_CLASS, CTA_SHELL_HEIGHT_CLASS } from "@/lib/cta-chrome";
import { AETHER_PRICING_ID, navigateToAetherCheckout } from "@/lib/scroll-to-hash";

/* Built for cold traffic: someone from an ad who has never heard of Aether
 * should see the stores, the promise and the price on the first screen.
 *
 * From lg up the hero splits: the copy on the left, the four example stores
 * on the right, crossfading on a laptop (hero-looks.tsx). Between sm and lg
 * the same pieces stack, centred. Phones stack too, with the short subhead
 * and the phone carousel (hero-phones.tsx), so the stores start on the first
 * screen there as well.
 *
 * Order in the copy: the product's name as a small mark, the promise in
 * large type, what it is, the two actions, then the price and the refund as
 * small print. From sm up, real stores on Aether close it as their marks;
 * phones get those in the strip after the hero (stores-on-aether.tsx). */
export function AetherHero({ demoUrl }: { demoUrl: string }) {
  return (
    <section className="grid items-center gap-y-6 pt-10 pb-10 sm:gap-y-10 sm:pt-16 sm:pb-16 lg:min-h-[min(46rem,calc(100svh-6rem))] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-x-6 lg:py-12">
      <div className="flex flex-col items-center px-4 text-center sm:px-6 lg:items-start lg:pl-8 lg:pr-0 lg:text-left xl:pl-12">
        <Image
          src="/work-logos/aether.png"
          alt="Aether"
          width={220}
          height={55}
          // The file pads its ink a little; pull it flush with the headline.
          className="theme-invert h-[1.15rem] sm:h-[1.35rem] w-auto opacity-80 lg:-ml-[5px]"
          priority
        />
        <h1 className="mt-5 sm:mt-6 max-w-[22rem] sm:max-w-[40rem] lg:max-w-[34rem] text-[clamp(2.4rem,6.2vw,4.25rem)] font-normal leading-[1.02] tracking-[-0.045em] text-[rgb(var(--fg))] [text-wrap:balance]">
          Look like the brand you&apos;re becoming.
        </h1>
        <p className="mt-4 max-w-[22rem] sm:max-w-[30rem] text-[16px] sm:text-[18px] leading-relaxed tracking-tight text-[rgb(var(--muted))] [text-wrap:balance] lg:[text-wrap:pretty]">
          {/* Phones get the short version; the hero has little room there. */}
          <span className="sm:hidden">A Shopify theme for fashion brands, installed for you today.</span>
          <span className="hidden sm:inline">A Shopify theme for fashion brands that turns more visits into orders. We install it for you, same day.</span>
        </p>

        <div className="mt-7 flex w-full max-w-sm gap-2 px-2 sm:px-0">
          <Link
            href={`/aether#${AETHER_PRICING_ID}`}
            data-aether-cta
            onClick={navigateToAetherCheckout}
            // Same raised fill as the checkout's buy button (.cta-buy).
            className={`cta-buy flex-1 min-w-0 inline-flex items-center justify-center gap-2 ${ACTION_RADIUS_CLASS} ${CTA_SHELL_HEIGHT_CLASS} px-3 sm:px-5 text-[16px] sm:text-[19px] font-medium tracking-tight leading-none`}
          >
            Get Aether
          </Link>
          <div className="flex-1 min-w-0">
            <DemoButton href={demoUrl} password="aether" />
          </div>
        </div>
        <p className="mt-3 text-[13px] sm:text-[14px] tracking-tight text-[rgb(var(--muted))]">
          $125 once. Full refund if we can&apos;t get it working.
        </p>

        {/* Proof, quiet: the marks of stores running Aether, every one
            confirmed in stores-on-aether.tsx. */}
        <div className="mt-10 hidden flex-col items-center gap-3 sm:flex lg:items-start">
          <p className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-80">Stores running Aether</p>
          <ul
            className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 lg:justify-start"
            style={{ "--mark": "1.9rem" } as CSSProperties}
          >
            {STORES.map((s) => (
              <li key={s.name} className="flex items-center">
                <Mark s={s} className="opacity-40" />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* The stores. The laptop floats slowly (.hero-bob, in HeroLooks);
          the phones stay still. */}
      <div className="rise rise--liquid min-w-0">
        <div className="px-2 sm:hidden">
          <HeroPhones />
        </div>
        <div className="hidden px-6 sm:block lg:px-0 lg:pr-4">
          <div className="mx-auto max-w-[44rem] lg:max-w-none">
            <HeroLooks />
          </div>
        </div>
      </div>
    </section>
  );
}
