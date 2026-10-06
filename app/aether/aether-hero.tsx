"use client";

import Image from "next/image";
import Link from "next/link";
import { DemoButton } from "./demo-button";
import { HeroPhones } from "./hero-phones";
import { ACTION_RADIUS_CLASS, CTA_SHELL_HEIGHT_CLASS } from "@/lib/cta-chrome";
import { AETHER_PRICING_ID, navigateToAetherCheckout } from "@/lib/scroll-to-hash";

export function AetherHero({ demoUrl }: { demoUrl: string }) {

  return (
    <section className="flex flex-col">
      <div
        className="flex flex-col items-center justify-center gap-4 px-4 sm:px-6 text-center pt-14 sm:pt-20 lg:pt-40 sm:min-h-[480px]"
        style={{ paddingBottom: 32 }}
      >
        <h1 className="font-normal tracking-[-0.04em] leading-none m-0">
          <Image
            src="/work-logos/aether.png"
            alt="Aether"
            width={220}
            height={55}
            className="theme-invert h-[clamp(3.25rem,7.5vw,5rem)] sm:h-[clamp(2.9rem,6vw,4.25rem)] w-auto mx-auto"
            priority
          />
        </h1>
        {/* One clear line under the logo, in the page's ink, balanced so it
            breaks evenly. The practical details (price, install) move under
            the buttons as small print, so the stack reads logo, promise,
            action, reassurance. */}
        <p className="max-w-[20rem] sm:max-w-[30rem] text-[19px] sm:text-[24px] leading-snug tracking-[-0.02em] text-[rgb(var(--fg))] [text-wrap:balance]">
          A Shopify theme for brands that care how their store looks.
        </p>
        <div className="mt-3 flex flex-col items-center justify-center gap-2 w-full max-w-sm px-2 sm:px-0 text-[13px] tracking-tight">
          <Link
            href={`/aether#${AETHER_PRICING_ID}`}
            data-aether-cta
            onClick={navigateToAetherCheckout}
            className={`w-full inline-flex items-center justify-center gap-2 ${ACTION_RADIUS_CLASS} ${CTA_SHELL_HEIGHT_CLASS} px-3 sm:px-5 text-[16px] sm:text-[19px] font-medium tracking-tight leading-none hover:opacity-80 transition-opacity`}
            style={{ background: "var(--cta-fill)", color: "var(--cta-fg)" }}
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
          <p className="mt-1.5 text-[13px] sm:text-[14px] tracking-tight text-[rgb(var(--muted))]">
            $125 once, installed for you the same day.
          </p>
          {/* Scroll cue: says there's more below, and takes you past the
              hero picture to the features. A real link, so it works without
              JS; the handler only smooths it with the site's Lenis scroll. */}
          <a
            href="#features"
            onClick={(e) => {
              const el = document.getElementById("features");
              if (!el) return;
              e.preventDefault();
              const y = window.scrollY + el.getBoundingClientRect().top - 24;
              const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number, o?: object) => void } }).__lenis;
              if (lenis) lenis.scrollTo(y, { duration: 1.1 });
              else window.scrollTo({ top: y, behavior: "smooth" });
            }}
            className="group mt-8 inline-flex flex-col items-center gap-1 text-[15px] sm:text-[16px] tracking-tight text-[rgb(var(--fg)/0.75)] transition-colors hover:text-[rgb(var(--fg))]"
          >
            See what&apos;s inside
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
                src="/aether/macbook-mockup.jpg"
                alt="Aether theme on MacBook"
                width={2048}
                height={1364}
                sizes="(min-width: 640px) 60vw"
                quality={90}
                className="w-[60vw] max-w-none h-auto mx-auto"
                priority
              />
            </div>
          </div>
          <div className="hero-par hero-par--left hidden 2xl:block absolute left-0 top-[8%] w-[min(52rem,60vw)] pointer-events-none select-none">
            <Image
              src="/aether/macbook-cart.png"
              alt="Aether cart drawer on MacBook"
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
            src="/aether/macbook-pdp-v2.png"
            alt="Aether product page on MacBook"
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
