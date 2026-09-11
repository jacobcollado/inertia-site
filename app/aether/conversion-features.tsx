import Image from "next/image";
import Link from "next/link";
import { ACTION_RADIUS_CLASS } from "@/lib/cta-chrome";
import { PolicyDisclaimer } from "./policy-disclaimer";

const SHOT_W = 1365;
const SHOT_H = 858;

export interface ConversionMoment {
  outcome: string;
  headline: string;
  detail: string;
  image: string;
  alt: string;
}

export function ConversionFeatures({ moments }: { moments: ConversionMoment[] }) {
  return (
    <section className="px-3 py-16 sm:py-24">
      <div className="max-w-[80rem] mx-auto">
        <div className="mb-12 sm:mb-16 rise rise--liquid">
          <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))]">
            How it converts
          </p>
        </div>

        <div className="flex flex-col gap-16 sm:gap-24">
          {moments.map((moment, i) => {
            const reversed = i % 2 === 1;

            return (
              <article
                key={moment.outcome}
                className={`rise rise--liquid grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center ${reversed ? "sm:[&>*:first-child]:order-2" : ""}`}
                style={{ "--rise-delay": `${i * 80}ms` } as React.CSSProperties}
              >
                <div className="flex flex-col gap-4 sm:gap-5">
                  <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[rgb(var(--fg)/0.06)] p-1 pr-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--bg))] text-[11px] leading-none tabular-nums text-[rgb(var(--muted))] ring-1 ring-[rgb(var(--fg)/0.05)]">
                      {i + 1}
                    </span>
                    <span className="text-[12px] sm:text-[13px] leading-none tracking-tight text-[rgb(var(--fg))]">
                      {moment.outcome}
                    </span>
                  </div>
                  <h3 className="text-[clamp(1.35rem,2.5vw,1.75rem)] font-normal tracking-[-0.03em] leading-tight [text-wrap:pretty] text-[rgb(var(--fg))]">
                    {moment.headline}
                  </h3>
                  <p className="text-[15px] sm:text-[16px] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-[28rem]">
                    {moment.detail}
                  </p>
                </div>

                <div className="relative rounded-xl bg-[rgb(var(--surface)/0.45)] overflow-hidden p-4 sm:p-6">
                  <Image
                    src={moment.image}
                    alt={moment.alt}
                    width={SHOT_W}
                    height={SHOT_H}
                    sizes="(max-width: 640px) 100vw, min(40rem, 90vw)"
                    quality={90}
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              </article>
            );
          })}
        </div>

        <div
          className="rise rise--liquid mt-16 sm:mt-20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-[rgb(var(--surface)/0.45)] px-6 py-6 sm:px-8 sm:py-7"
          style={{ "--rise-delay": "240ms" } as React.CSSProperties}
        >
          <div className="flex flex-col gap-1.5">
            <p className="text-[17px] sm:text-[19px] font-normal tracking-[-0.02em] text-[rgb(var(--fg))]">
              The whole path, included
            </p>
            <p className="text-[14px] sm:text-[15px] tracking-tight text-[rgb(var(--muted))]">
              $125 once / lifetime updates / single store
            </p>
          </div>
          <div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:shrink-0">
            <Link
              href="/aether#pricing"
              className={`inline-flex w-full items-center justify-center sm:w-auto ${ACTION_RADIUS_CLASS} px-5 py-2.5 text-[17px] sm:text-[18px] font-medium tracking-tight hover:opacity-80 transition-opacity whitespace-nowrap`}
              style={{ background: "#000", color: "#ededed" }}
            >
              Get Aether
            </Link>
            <PolicyDisclaimer />
          </div>
        </div>
      </div>
    </section>
  );
}
