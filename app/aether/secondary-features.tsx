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

function FeatureCard({ feature, index }: { feature: SecondaryFeature; index: number }) {
  const accent = FEATURE_ACCENTS[index % FEATURE_ACCENTS.length];

  return (
    <div
      className="rise rise--liquid flex min-h-[9.5rem] w-[min(17.5rem,calc(100vw-2.5rem))] shrink-0 snap-start flex-col items-start justify-center rounded-xl bg-[rgb(var(--surface)/0.45)] px-4 py-5 text-left sm:min-h-[10.5rem] sm:w-auto sm:shrink sm:px-5 sm:py-6"
      style={{ "--rise-delay": `${120 + index * 40}ms` } as React.CSSProperties}
    >
      <span
        className={`mb-5 flex shrink-0 items-center sm:mb-6 [&_svg]:size-5 ${accent}`}
        aria-hidden="true"
      >
        {feature.icon}
      </span>
      <p className="text-[16px] sm:text-[17px] font-normal tracking-tight leading-snug text-[rgb(var(--muted))] [text-wrap:pretty]">
        <span className={`font-medium ${accent}`}>{feature.name}.</span> {feature.desc}
      </p>
    </div>
  );
}

export function SecondaryFeatures({ features }: { features: SecondaryFeature[] }) {
  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Included features"
      className="no-scrollbar -mx-3 flex gap-3 overflow-x-auto overscroll-x-contain px-3 pb-1 snap-x snap-proximity sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {features.map((feature, index) => (
        <FeatureCard key={feature.name} feature={feature} index={index} />
      ))}
    </div>
  );
}
