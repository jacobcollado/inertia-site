"use client";

import Image from "next/image";
import Link from "next/link";
import { DemoButton } from "./demo-button";
import { ACTION_RADIUS_CLASS, CTA_SHELL_HEIGHT_CLASS } from "@/lib/cta-chrome";

export function AetherHero({ demoUrl }: { demoUrl: string }) {

  return (
    <section className="flex flex-col">
      <div
        className="flex flex-col items-center justify-center gap-4 px-4 sm:px-6 text-center pt-12 sm:pt-20"
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
          Design is the product. A Shopify theme for independent brands that treat how the store looks as part of what they sell.
        </p>
        <div className="flex flex-col items-center justify-center gap-2 w-full max-w-sm px-2 sm:px-0 text-[13px] tracking-tight">
          <Link
            href="/aether#pricing"
            className={`w-full inline-flex items-center justify-center gap-2 ${ACTION_RADIUS_CLASS} ${CTA_SHELL_HEIGHT_CLASS} px-3 sm:px-5 text-[16px] sm:text-[19px] font-medium tracking-tight leading-none hover:opacity-80 transition-opacity`}
            style={{ background: "#000", color: "#ededed" }}
          >
            Buy a license
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
      <div className="px-3 mt-12 sm:mt-14 pb-8 sm:pb-12 rise rise--liquid">
        <Image
          src="/aether/iphone-mockup.png"
          alt="Aether theme on iPhone"
          width={503}
          height={1024}
          sizes="(max-width: 639px) 72vw, 0px"
          quality={90}
          unoptimized
          className="sm:hidden w-full max-w-[16.5rem] h-auto mx-auto"
          priority
        />
        <Image
          src="/aether/macbook-mockup.jpg"
          alt="Aether theme on MacBook"
          width={2048}
          height={1364}
          sizes="(min-width: 640px) min(80rem, 100vw), 0px"
          quality={90}
          className="hidden sm:block w-full h-auto"
          priority
        />
      </div>
    </section>
  );
}
