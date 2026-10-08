"use client";

import Image from "next/image";
import Link from "next/link";
import { DemoButton } from "./demo-button";
import { HeroPhones } from "./hero-phones";
import { ACTION_RADIUS_CLASS, CTA_SHELL_HEIGHT_CLASS } from "@/lib/cta-chrome";
import { AETHER_PRICING_ID, navigateToAetherCheckout } from "@/lib/scroll-to-hash";
import { scrollToId } from "./motion";

export function AetherHero({ demoUrl }: { demoUrl: string }) {

  return (
    <section className="flex flex-col">
      <div
        className="flex flex-col items-center justify-center gap-3 px-4 sm:px-6 text-center pt-14 sm:pt-20 lg:pt-40 sm:min-h-[480px]"
        style={{ paddingBottom: 32 }}
      >
        {/* Logo, then the promise in large type, then two actions and the
            practical details as small print. The scroll cue goes to the
            values, the page's spine. */}
        <h1 className="m-0 font-normal leading-none">
          <Image
            src="/work-logos/aether.png"
            alt="Aether"
            width={220}
            height={55}
            className="theme-invert h-[clamp(1.6rem,3vw,2rem)] w-auto mx-auto opacity-90"
            priority
          />
        </h1>
        <p className="mt-4 sm:mt-6 max-w-[22rem] sm:max-w-[44rem] text-[clamp(2.4rem,6.2vw,4.75rem)] leading-[1.02] tracking-[-0.045em] text-[rgb(var(--fg))] [text-wrap:balance]">
          Look like the brand you&apos;re becoming.
        </p>
        <p className="max-w-[22rem] sm:max-w-[30rem] text-[16px] sm:text-[18px] leading-relaxed tracking-tight text-[rgb(var(--muted))] [text-wrap:balance]">
          A Shopify theme by Inertia, for brands ready for their next level.
        </p>
        <div className="mt-4 flex flex-col items-center justify-center gap-2 w-full max-w-sm px-2 sm:px-0 text-[13px] tracking-tight">
          <div className="w-full flex gap-2">
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
          <p className="mt-1.5 text-[13px] sm:text-[14px] tracking-tight text-[rgb(var(--muted))]">
            $125 once. Installed for you, with lifetime updates and support.
          </p>
          {/* A real link, so it works without JS; the handler only smooths
              it with the site's Lenis scroll. */}
          <a
            href="#values"
            onClick={(e) => scrollToId("values", e)}
            className="group mt-8 inline-flex flex-col items-center gap-1 text-[15px] sm:text-[16px] tracking-tight text-[rgb(var(--fg)/0.75)] transition-colors hover:text-[rgb(var(--fg))]"
          >
            What we stand for
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="scroll-cue size-5" aria-hidden="true">
              <polyline points="4 6 8 10 12 6" />
            </svg>
          </a>
        </div>
      </div>
      <div className="mt-12 sm:mt-14 pb-8 sm:pb-12 rise rise--liquid sm:w-screen sm:relative sm:left-1/2 sm:right-1/2 sm:-ml-[50vw] sm:-mr-[50vw]">
        {/* The mockups move two ways, transform only: a slow float
            (.hero-bob), and a scroll parallax as the hero leaves
            (.hero-par, a scroll-driven animation), the side laptops rising at
            their own rates for depth. See "Aether hero mockups" in
            globals.css. */}
        <div className="sm:hidden px-2">
          <div className="hero-bob">
            <HeroPhones />
          </div>
        </div>
        <div className="hidden sm:block relative">
          <div className="hero-par hero-par--main">
            <div className="hero-bob">
              <Image
                src="/aether/rosso-macbook-v2.png"
                alt="An Aether store, Rosso, on MacBook"
                width={4500}
                height={3000}
                sizes="(min-width: 640px) 60vw"
                quality={90}
                className="w-[60vw] max-w-none h-auto mx-auto"
                priority
              />
            </div>
          </div>
          <div className="hero-par hero-par--left hidden 2xl:block absolute left-0 top-[8%] w-[min(52rem,60vw)] pointer-events-none select-none">
            <Image
              src="/aether/argent-macbook.png"
              alt="An Aether store, Argent, on MacBook"
              width={4500}
              height={3000}
              sizes="(min-width: 1536px) 52rem, 0px"
              quality={90}
              className="hero-float hero-float--left w-full h-auto"
              priority
            />
          </div>
          <div className="hero-par hero-par--right hidden 2xl:block absolute right-0 top-[8%] w-[min(52rem,60vw)] pointer-events-none select-none">
          <Image
            src="/aether/relics-macbook.png"
            alt="An Aether store, Relics, on MacBook"
            width={4500}
            height={3000}
            sizes="(min-width: 1536px) 52rem, 0px"
            quality={90}
            className="hero-float hero-float--right w-full h-auto"
            priority
          />
          </div>
        </div>
      </div>
    </section>
  );
}
