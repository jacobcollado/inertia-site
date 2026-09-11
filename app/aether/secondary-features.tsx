"use client";

import { useState, type ReactNode } from "react";

const MOBILE_INITIAL = 6;

export interface SecondaryFeature {
  name: string;
  desc: string;
  icon: ReactNode;
}

export function SecondaryFeatures({ features }: { features: SecondaryFeature[] }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = features.length > MOBILE_INITIAL;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
        {features.map((f, i) => (
          <div
            key={f.name}
            className={`items-start py-4 rise rise--liquid ${!expanded && i >= MOBILE_INITIAL ? "hidden sm:flex" : "flex"}`}
            style={{ "--rise-delay": `${120 + i * 40}ms` } as React.CSSProperties}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-[17px] tracking-tight font-normal text-[rgb(var(--fg))]">{f.name}</span>
              <span className="text-[15px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.5 }}>
                {f.desc}
              </span>
            </div>
          </div>
        ))}
      </div>

      {hasMore && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-4 sm:hidden text-[15px] font-medium tracking-tight text-primary underline underline-offset-4 decoration-primary/35 hover:decoration-primary/70 transition-colors [-webkit-tap-highlight-color:transparent]"
        >
          View more
        </button>
      )}
    </>
  );
}
