import Image from "next/image";
import Link from "next/link";
import { ACTION_RADIUS_CLASS } from "@/lib/cta-chrome";

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
          <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))] text-center">
            Where sales are won and lost
          </p>
        </div>

        <div className="flex flex-col gap-16 sm:gap-24">
          {moments.map((moment, i) => {
            return (
              <article
                key={moment.outcome}
                className="rise rise--liquid flex flex-col gap-6 sm:gap-8"
                style={{ "--rise-delay": `${i * 80}ms` } as React.CSSProperties}
              >
                <div className="relative overflow-hidden rounded-xl">
                  <Image
                    src={moment.image}
                    alt={moment.alt}
                    width={SHOT_W}
                    height={SHOT_H}
                    sizes="(max-width: 640px) 100vw, min(80rem, 92vw)"
                    quality={90}
                    className="block h-auto w-full"
                  />
                </div>

                <div className="flex flex-col gap-4 sm:gap-5">
                  <h3 className="text-[clamp(1.35rem,2.5vw,1.75rem)] font-normal tracking-[-0.03em] leading-tight [text-wrap:pretty] text-[rgb(var(--fg))]">
                    {moment.headline}
                  </h3>
                  {/* Collapsed by default so the three moments read as three
                      headlines rather than three paragraphs. Native <details>
                      rather than state: this section is a server component,
                      and the element already handles toggling, keyboard, and
                      screen-reader expanded/collapsed announcements. */}
                  <details className="moment-detail group w-fit">
                    <summary
                      // display:flex is set explicitly because <summary>
                      // defaults to display:list-item, which survives
                      // list-none and reserves marker space that knocks the
                      // glyph off centre. leading-none drops the inherited
                      // line-height so the flex box is exactly size-7 tall.
                      className="flex size-7 cursor-pointer list-none items-center justify-center rounded-full bg-[rgb(var(--fg)/0.06)] leading-none text-[rgb(var(--muted))] transition-colors hover:bg-[rgb(var(--fg)/0.12)] hover:text-[rgb(var(--fg))] [&::-webkit-details-marker]:hidden"
                      aria-label={`How it works: ${moment.headline}`}
                    >
                      {/* Two strokes, with the vertical one collapsing to a
                          minus on open. Cheaper than swapping icons and it
                          animates rather than cutting. */}
                      {/* block, not the default inline: an inline SVG sits on
                          the text baseline, which leaves descender space below
                          it and pushes the glyph a fraction above centre. The
                          path itself is symmetric about the viewBox centre, so
                          taking it out of the text flow is all that's needed. */}
                      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="block size-3 shrink-0" aria-hidden="true">
                        <line x1="2.5" y1="6" x2="9.5" y2="6" />
                        <line
                          x1="6"
                          y1="2.5"
                          x2="6"
                          y2="9.5"
                          className="origin-center transition-transform duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-open:scale-y-0"
                        />
                      </svg>
                    </summary>
                    <p className="mt-4 max-w-[28rem] text-[15px] sm:text-[16px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">
                      {moment.detail}
                    </p>
                  </details>
                </div>
              </article>
            );
          })}
        </div>

        <div
          className="rise rise--liquid mt-16 sm:mt-20 rounded-xl bg-[rgb(var(--surface)/0.45)] p-5 sm:p-7"
          style={{ "--rise-delay": "240ms" } as React.CSSProperties}
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[clamp(1.35rem,2.5vw,1.75rem)] font-normal leading-tight tracking-[-0.03em] text-[rgb(var(--fg))]">
                Aether, complete
              </p>
              <p className="mt-2 max-w-[32rem] text-[15px] sm:text-[16px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">
                41 sections, lifetime updates, and installation help. Your key
                arrives by email the moment you check out, and the theme is
                waiting in your account.
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-[clamp(2rem,4vw,2.75rem)] font-normal leading-none tracking-[-0.04em] text-[rgb(var(--fg))]">
                $125
              </p>
              <p className="mt-1 text-[13px] tracking-tight text-[rgb(var(--muted))]">
                One-time payment
              </p>
            </div>
          </div>
          <div className="mt-6">
            <Link
              href="/aether#pricing"
              className={`inline-flex w-full items-center justify-center ${ACTION_RADIUS_CLASS} px-5 py-2.5 text-[17px] sm:text-[18px] font-medium tracking-tight hover:opacity-80 transition-opacity whitespace-nowrap`}
              style={{ background: "#000", color: "#ededed" }}
            >
              See what&apos;s included
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
