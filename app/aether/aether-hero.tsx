"use client";

import Image from "next/image";
import Link from "next/link";
import { DemoButton } from "./demo-button";
import { ACTION_RADIUS_CLASS, CTA_SHELL_HEIGHT_CLASS } from "@/lib/cta-chrome";
import { AETHER_PRICING_ID, navigateToAetherCheckout } from "@/lib/scroll-to-hash";

export function AetherHero({ demoUrl }: { demoUrl: string }) {

  return (
    <section className="flex flex-col">
      <div
        className="flex flex-col items-center justify-center gap-4 px-4 sm:px-6 text-center pt-12 sm:pt-20 lg:pt-40"
        style={{ minHeight: 480, paddingBottom: 32 }}
      >
        <h1 className="font-normal tracking-[-0.04em] leading-none m-0">
          <Image
            src="/work-logos/aether.png"
            alt="Aether"
            width={220}
            height={55}
            className="h-[clamp(3.25rem,7.5vw,5rem)] sm:h-[clamp(2.9rem,6vw,4.25rem)] w-auto mx-auto"
            priority
          />
        </h1>
        <p className="text-[16.5px] sm:text-[21px] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-md sm:max-w-xl">
          A better Shopify theme for independent brands, made by real design engineers.
        </p>
        <div className="flex flex-col items-center justify-center gap-2 w-full max-w-sm px-2 sm:px-0 text-[13px] tracking-tight">
          <Link
            href={`/aether#${AETHER_PRICING_ID}`}
            data-aether-cta
            onClick={navigateToAetherCheckout}
            className={`w-full inline-flex items-center justify-center gap-2 ${ACTION_RADIUS_CLASS} ${CTA_SHELL_HEIGHT_CLASS} px-3 sm:px-5 text-[16px] sm:text-[19px] font-medium tracking-tight leading-none hover:opacity-80 transition-opacity`}
            style={{ background: "#000", color: "#ededed" }}
          >
            Get Aether
          </Link>
          <div className="w-full flex gap-2">
            <div className="flex-[3] min-w-0">
              <DemoButton href={demoUrl} password="aether" />
            </div>
            <Link
              href="/docs?from=aether"
              className={`flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 ${ACTION_RADIUS_CLASS} ${CTA_SHELL_HEIGHT_CLASS} border border-[rgb(var(--line))] px-3 sm:px-5 text-[16px] sm:text-[19px] font-medium tracking-tight leading-none text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] hover:border-[rgb(var(--fg)/0.3)] transition-colors whitespace-nowrap`}
            >
              Docs
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-12 sm:mt-14 pb-8 sm:pb-12 rise rise--liquid sm:w-screen sm:relative sm:left-1/2 sm:right-1/2 sm:-ml-[50vw] sm:-mr-[50vw]">
        <div className="sm:hidden flex items-center justify-center px-2">
          <Image
            src="/aether/hero-mobile-left.png"
            alt="Aether storefront on iPhone"
            width={1300}
            height={2642}
            sizes="(max-width: 639px) 28vw, 0px"
            quality={90}
            className="w-[28vw] shrink-0 h-auto relative z-0 mr-[-7vw]"
          />
          <Image
            src="/aether/hero-mobile-center-v2.png"
            alt="Aether storefront on iPhone"
            width={1349}
            height={2691}
            sizes="(max-width: 639px) 46vw, 0px"
            quality={100}
            className="w-[46vw] max-w-[15.5rem] shrink-0 h-auto relative z-10"
            priority
          />
          <Image
            src="/aether/nocturne-mobile.png"
            alt="Aether Nocturne variation on iPhone"
            width={1300}
            height={2642}
            sizes="(max-width: 639px) 28vw, 0px"
            quality={90}
            className="w-[28vw] shrink-0 h-auto relative z-0 ml-[-7vw]"
          />
        </div>
        <div className="hidden sm:block relative">
          <Image
            src="/aether/macbook-mockup.jpg"
            alt="Aether theme on MacBook"
            width={2048}
            height={1364}
            sizes="(min-width: 640px) 60vw"
            quality={90}
            className="w-[60vw] max-w-none h-auto mx-auto"
            priority
          />
          <Image
            src="/aether/macbook-cart.png"
            alt="Aether cart drawer on MacBook"
            width={4500}
            height={3000}
            sizes="(min-width: 1024px) 60vw, 0px"
            quality={90}
            className="hero-float hero-float--left hidden lg:block absolute left-0 top-[8%] w-[min(52rem,60vw)] h-auto pointer-events-none select-none"
            priority
          />
          <Image
            src="/aether/macbook-pdp-v2.png"
            alt="Aether product page on MacBook"
            width={4500}
            height={3000}
            sizes="(min-width: 1024px) 60vw, 0px"
            quality={90}
            className="hero-float hero-float--right hidden lg:block absolute right-0 top-[8%] w-[min(52rem,60vw)] h-auto pointer-events-none select-none"
            priority
          />
        </div>
      </div>
    </section>
  );
}
