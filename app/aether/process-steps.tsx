"use client";

import Link from "next/link";
import { useState } from "react";

const STEPS = [
  {
    step: "Buy",
    desc: "One license, lifetime or annual",
    detail: "From $85. Pay once and keep it forever, or $85 a year if you'd rather spread it out. One license covers one store, and the price you see is the whole price. No monthly charges underneath.",
  },
  {
    step: "Install",
    desc: "Live the same afternoon",
    detail: "Download the .zip, upload it in Shopify admin, publish. All 41 sections are ready to drag onto any page, and none of it needs a developer.",
  },
  {
    step: "Sell",
    desc: "Tuned on live stores, not mockups",
    detail: "Every layout decision, from the trust badges to the sticky cart to the product gallery, was tested on real stores before it shipped. Nothing in the theme is a guess.",
  },
];

export function ProcessSteps() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="px-3 sm:px-8 py-14 sm:py-20 rise">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
        {STEPS.map((s, i) => {
          const isOpen = open === i;
          return (
            <button
              key={s.step}
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="text-left rounded-2xl p-6 transition-colors duration-300"
              style={{
                background: isOpen ? "rgb(var(--surface))" : "rgb(var(--surface) / 0.4)",
              }}
            >
              <p
                className="text-[clamp(2rem,4vw,2.8rem)] font-normal tracking-[-0.04em] leading-none mb-3 transition-opacity duration-300"
                style={{ color: "rgb(var(--fg))", opacity: isOpen ? 1 : 0.4 }}
              >
                {s.step}
              </p>
              <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] mb-3" style={{ opacity: 0.6 }}>
                {s.desc}
              </p>
              <div
                style={{
                  maxHeight: isOpen ? 200 : 0,
                  overflow: "hidden",
                  transition: "max-height 400ms cubic-bezier(0.22,1,0.36,1)",
                }}
              >
                <p className="text-[13px] leading-relaxed tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.7 }}>
                  {s.detail}
                </p>
                {i === 2 && (
                  <Link
                    href="/aether/buy"
                    onClick={e => e.stopPropagation()}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-medium tracking-tight bg-[var(--btn-bg)] text-[var(--btn-fg)] hover:opacity-80 transition-opacity"
                  >
                    Get Aether
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </Link>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
