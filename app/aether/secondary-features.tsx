"use client";

import { type ReactNode } from "react";

export interface SecondaryFeature {
  name: string;
  desc: string;
  icon: ReactNode;
}

const FEATURE_ACCENTS = [
  "text-[#0a84ff]",
  "text-[#16a34a]",
  "text-[#ea580c]",
  "text-[#7c3aed]",
  "text-[#db2777]",
  "text-[#0891b2]",
] as const;

/* Bento spans, keyed by the feature's index in the source list.
 *
 * Two features carry the pitch and get double-width tiles at every breakpoint:
 * "41 sections" (the number buyers actually compare on) and "Sticky cart" (the
 * conversion mechanic). The other four are supporting detail and stay single.
 * Two wide plus four narrow fills 8 columns, so the set resolves with no
 * orphan gap at 2 columns (mobile/tablet) or 4 (desktop).
 *
 * On mobile the wide tiles span the full 2-column width, which gives the grid
 * its rhythm: a full-bleed band, two pairs, then another band.
 */
const SPANS: Record<number, string> = {
  0: "col-span-2 lg:col-span-2", // Sticky cart
  5: "col-span-2 lg:col-span-2", // 41 sections
};

function FeatureCard({ feature, index }: { feature: SecondaryFeature; index: number }) {
  const accent = FEATURE_ACCENTS[index % FEATURE_ACCENTS.length];
  const span = SPANS[index] ?? "";
  const isWide = Boolean(SPANS[index]);

  return (
    <div
      role="listitem"
      className={`rise rise--liquid group relative flex flex-col items-start overflow-hidden rounded-xl bg-[rgb(var(--surface)/0.45)] px-4 py-5 text-left transition-colors duration-500 hover:bg-[rgb(var(--surface)/0.75)] sm:px-5 sm:py-6 ${
        isWide
          ? "min-h-[8rem] justify-end sm:min-h-[13rem]"
          : "min-h-[9.5rem] justify-center sm:min-h-[10.5rem]"
      } ${span}`}
      style={{ "--rise-delay": `${120 + index * 40}ms` } as React.CSSProperties}
    >
      {/* A wide tile has room to breathe, so it gets a soft accent wash bled in
          from the top-left corner. It reads as depth rather than decoration at
          this opacity, and it's what separates the two hero tiles from the
          supporting four at a glance. */}
      {isWide && (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -left-12 -top-12 size-36 rounded-full opacity-[0.07] blur-2xl transition-opacity duration-700 group-hover:opacity-[0.13] sm:-left-16 sm:-top-16 sm:size-48 ${accent}`}
          style={{ background: "currentColor" }}
        />
      )}

      <span
        className={`relative mb-5 flex shrink-0 items-center sm:mb-6 ${accent} ${
          isWide ? "mt-auto [&_svg]:size-5 sm:[&_svg]:size-6" : "[&_svg]:size-5"
        }`}
        aria-hidden="true"
      >
        {feature.icon}
      </span>
      <p
        className={`relative font-normal tracking-tight leading-snug text-[rgb(var(--muted))] [text-wrap:pretty] ${
          isWide ? "text-[16px] sm:text-[19px]" : "text-[16px] sm:text-[17px]"
        }`}
      >
        <span className={`font-medium ${accent}`}>{feature.name}.</span> {feature.desc}
      </p>
    </div>
  );
}

export function SecondaryFeatures({ features }: { features: SecondaryFeature[] }) {
  return (
    <div
      role="list"
      aria-label="Included features"
      className="grid auto-rows-auto grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4"
    >
      {features.map((feature, index) => (
        <FeatureCard key={feature.name} feature={feature} index={index} />
      ))}
    </div>
  );
}
