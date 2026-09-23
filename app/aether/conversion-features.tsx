import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { DemoButton } from "./demo-button";
import { RevealDetail } from "./reveal-detail";

const ASSURANCES = [
  {
    title: "Before you buy",
    body: "Test the live store on your own phone. Browse every page and run the cart before you spend a cent.",
  },
  {
    title: "When you buy",
    body: "Pay securely through Stripe. Your license key usually lands in your inbox within a minute.",
  },
  {
    title: "After you buy",
    body: "We install Aether for you the same day, or you can do it yourself. Priority support and every future update, included.",
  },
];

export function ConversionFeatures({ demoUrl }: { demoUrl: string }) {

  return (
    <section className="px-3 py-16 sm:py-24">
      <div className="max-w-[80rem] mx-auto">
        <div className="rise rise--liquid overflow-hidden rounded-2xl bg-[rgb(var(--surface)/0.45)]">
          <div className="grid lg:grid-cols-[minmax(19rem,0.72fr)_minmax(0,1.28fr)]">
            <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
              <div>
                <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.035em] leading-[1.1] text-[rgb(var(--fg))] [text-wrap:pretty]">
                  Don&apos;t trust the screenshots.
                  <br aria-hidden="true" />
                  Test the real store.
                </p>
                <div className="mt-5">
                  <RevealDetail label="What you can test">
                    <p className="max-w-[27rem] pt-3 text-[15px] leading-relaxed tracking-tight text-[rgb(var(--muted))] sm:text-[17px]">
                      Aether is running on a live Shopify store right now. Tap through every page, add to cart, and try it on your phone. What you test is exactly what you install.
                    </p>
                  </RevealDetail>
                </div>
              </div>

              <div className="mt-8 max-w-[20rem]">
                <DemoButton href={demoUrl} password="aether" />
                <p className="mt-3 text-[12px] leading-relaxed tracking-tight text-[rgb(var(--muted))] sm:text-[13px]">
                  We copy the store password for you. Just paste it when the demo opens.
                </p>
              </div>
            </div>

            <div className="relative min-h-[22rem] overflow-hidden bg-[#dfe8f5] sm:min-h-[32rem] lg:min-h-[36rem]">
              <Image
                src="/aether/live-storefront.jpg"
                alt="Aether storefront fashion homepage"
                fill
                sizes="(max-width: 1023px) 100vw, min(52rem, 62vw)"
                quality={92}
                className="object-cover object-[center_38%]"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[min(52%,14rem)] bg-gradient-to-t from-black/80 via-black/55 to-transparent sm:h-[min(48%,16rem)]" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:p-7">
                <p
                  className="max-w-[26rem] text-[14px] leading-relaxed tracking-tight text-white sm:text-[15px]"
                  style={{ textShadow: "0 1px 14px rgba(0,0,0,0.65)" }}
                >
                  Nothing in the demo is mocked up. Product pages, variants, cart, navigation and mobile all work.
                </p>
                <Link
                  href="/docs?from=aether"
                  className="shrink-0 text-[14px] font-medium tracking-tight text-white transition-opacity hover:opacity-80 sm:text-[15px]"
                  style={{ textShadow: "0 1px 14px rgba(0,0,0,0.65)" }}
                >
                  Read the setup docs
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: the same three columns as a sideways swipe row, bleeding
            to the screen edge so the next column peeks in. sm+: static grid. */}
        <div className="no-scrollbar -mx-3 mt-8 snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-px-3 px-3 sm:mx-0 sm:snap-none sm:overflow-visible sm:px-0">
          <div className="flex w-max border-y border-dashed border-[rgb(var(--line))] sm:grid sm:w-auto sm:grid-cols-3">
            {ASSURANCES.map((item, index) => (
              <div
                key={item.title}
                className={`rise rise--liquid w-[72vw] max-w-[18rem] shrink-0 snap-start py-6 pr-6 sm:w-auto sm:max-w-none sm:px-7 sm:py-8 ${
                  index > 0 ? "border-l border-dashed border-[rgb(var(--line))] pl-6" : ""
                }`}
                style={{ "--rise-delay": `${120 + index * 70}ms` } as CSSProperties}
              >
                <p className="text-[16px] font-normal tracking-tight text-[rgb(var(--fg))] sm:text-[18px]">
                  {item.title}
                </p>
                <p className="mt-2 text-[14px] leading-relaxed tracking-tight text-[rgb(var(--muted))] sm:text-[15px]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
