"use client";

// Reusable SVG filter ID for the liquid glass backdrop effect.
// Drop <GlassFilterDef /> once anywhere in the tree, then apply with:
//   backdropFilter: "url(#glass-lens) blur(12px)"
//   WebkitBackdropFilter: "url(#glass-lens) blur(12px)"
export const GLASS_FILTER_ID = "glass-lens";

export function GlassFilterDef() {
  return (
    <svg
      aria-hidden="true"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", pointerEvents: "none" }}
    >
      <defs>
        <filter id={GLASS_FILTER_ID} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
          {/* Slight barrel distortion via turbulence-seeded displacement */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.015 0.012"
            numOctaves="2"
            seed="4"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="6"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          {/* Gentle blur on top to sell the frosted glass depth */}
          <feGaussianBlur in="displaced" stdDeviation="1.5" result="blurred" />
          {/* Boost saturation slightly — real glass saturates colours at rim */}
          <feColorMatrix in="blurred" type="saturate" values="1.15" />
        </filter>
      </defs>
    </svg>
  );
}
