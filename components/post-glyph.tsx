/* Shared between the homepage blog card and the post page header, so a post
   has exactly one mark and the card the reader clicked is the header they
   land on. Pure SVG with no hooks, so it renders fine in a server component. */

/* Panel tint per post. The hero heading's selection-frame blue (#6bb8ef,
   hue 205) is still the anchor, but half the set now sits opposite it - amber,
   sand, clay, rose - so the carousel alternates warm and cool instead of
   reading as one blue wash. An all-blue palette kept the cards related at the
   cost of telling them apart; the warm tones are the contrast, the cool ones
   keep the frame's colour leading.

   Assignments follow the carousel's real order (newest-first, then
   interleaved by tag) rather than this file's order, so warm and cool land
   alternately on screen. Each post owns its tone; a tag no longer implies
   a colour. */
export const POST_TINT: Record<string, string> = {
  // Carousel order: cool, warm, cool, warm ...
  "taste-is-trained": "#a9cce5",          // frame blue
  "the-invisible-details": "#efd9c2",     // amber
  "speed-is-a-feature": "#b3e0e6",        // cyan
  "the-brief-is-the-product": "#eccfc6",  // clay
  "copy-is-design": "#c9e3ee",            // pale blue
  "design-systems-that-scale": "#e8c9d2", // rose
  "judgment-over-output": "#bac6e8",      // periwinkle
  "consistency-beats-novelty": "#e5dcc4", // sand
};

/* The tone a post's card and header should use. There is no tag-level
   fallback any more - a tag no longer implies a colour - so a post with no
   step of its own gets a neutral blue until it is given one above. */
export function postTint(slug?: string): string {
  return (slug ? POST_TINT[slug] : undefined) ?? "#dfe6ec";
}

/* ── Post glyphs ─────────────────────────────────────────
   One line-drawn mark per post, keyed to the slug and drawn from the same
   vocabulary as the card arrow: 64 viewBox, 1.25 stroke, round caps, muted
   ink, rectilinear wherever the idea allows. Each mark argues the post's
   actual point rather than labelling its category, so the carousel reads as
   eight specific ideas instead of three repeated families.

   A new post with no mark here falls back to its tag's mark below, so
   nothing ever renders blank, but a post is only finished once it has its
   own drawing. */
export function PostGlyph({
  slug,
  tag,
  className = "w-20 h-20 sm:w-24 sm:h-24",
}: {
  slug?: string;
  tag?: string;
  className?: string;
}) {
  const stroke = "rgba(26,26,26,0.30)";
  const common = {
    viewBox: "0 0 64 64",
    fill: "none" as const,
    stroke,
    strokeWidth: 1.25,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (slug) {
    // Ten identical frames on a strict grid, every one the same. The tenth
    // page matching the first is literally the argument.
    case "consistency-beats-novelty":
      return (
        <svg {...common}>
          {[0, 1, 2, 3, 4].map((c) => (
            <rect key={`a${c}`} x={9 + c * 10} y="22" width="7" height="9" rx="1.5" />
          ))}
          {[0, 1, 2, 3, 4].map((c) => (
            <rect key={`b${c}`} x={9 + c * 10} y="35" width="7" height="9" rx="1.5" />
          ))}
        </svg>
      );

    // Lines of copy that draw the page's own margins: the writing is doing
    // the layout work, so it forms the frame instead of sitting inside one.
    case "copy-is-design":
      return (
        <svg {...common}>
          <line x1="16" y1="18" x2="48" y2="18" />
          <line x1="16" y1="25" x2="48" y2="25" />
          <line x1="16" y1="32" x2="40" y2="32" />
          <line x1="16" y1="39" x2="48" y2="39" />
          <line x1="16" y1="46" x2="34" y2="46" />
          <line x1="11" y1="14" x2="11" y2="50" strokeOpacity={0.45} />
          <line x1="53" y1="14" x2="53" y2="50" strokeOpacity={0.45} />
        </svg>
      );

    // One module repeated outward at increasing scale: the system keeps its
    // proportion as it grows, which is the only real test of a system.
    case "design-systems-that-scale":
      return (
        <svg {...common}>
          <rect x="12" y="34" width="12" height="12" rx="1.5" />
          <rect x="27" y="27" width="19" height="19" rx="2" strokeOpacity={0.7} />
          <rect x="27" y="12" width="19" height="12" rx="2" strokeOpacity={0.45} />
          <rect x="12" y="20" width="12" height="11" rx="1.5" strokeOpacity={0.45} />
        </svg>
      );

    // Many candidates on the table, one selected and ringed. The rest are
    // equally well made and simply not shipped.
    case "judgment-over-output":
      return (
        <svg {...common}>
          {[0, 1, 2, 3].map((c) => (
            <rect key={`t${c}`} x={12 + c * 11} y="16" width="8" height="8" rx="1.5" strokeOpacity={0.4} />
          ))}
          {[0, 1, 2, 3].map((c) => (
            <rect key={`m${c}`} x={12 + c * 11} y="28" width="8" height="8" rx="1.5" strokeOpacity={0.4} />
          ))}
          <rect x="23" y="40" width="8" height="8" rx="1.5" />
          <rect x="19.5" y="36.5" width="15" height="15" rx="3" strokeOpacity={0.55} />
        </svg>
      );

    // Load times collapsing bar by bar to almost nothing, the fastest one
    // carried to a marker. Speed as a measured result, not a side effect.
    case "speed-is-a-feature":
      return (
        <svg {...common}>
          <line x1="12" y1="48" x2="52" y2="48" strokeOpacity={0.45} />
          <line x1="17" y1="48" x2="17" y2="20" strokeOpacity={0.35} />
          <line x1="25" y1="48" x2="25" y2="27" strokeOpacity={0.45} />
          <line x1="33" y1="48" x2="33" y2="34" strokeOpacity={0.6} />
          <line x1="41" y1="48" x2="41" y2="41" strokeOpacity={0.8} />
          <line x1="49" y1="48" x2="49" y2="45" />
          <circle cx="49" cy="43" r="1.9" fill={stroke} stroke="none" />
        </svg>
      );

    // The same judgment made over and over, tightening each pass, converging
    // on a centre rather than arriving there by instinct.
    case "taste-is-trained":
      return (
        <svg {...common}>
          <rect x="10" y="10" width="44" height="44" rx="2.5" strokeOpacity={0.3} />
          <rect x="16" y="16" width="32" height="32" rx="2.5" strokeOpacity={0.5} />
          <rect x="22" y="22" width="20" height="20" rx="2" strokeOpacity={0.7} />
          <rect x="28" y="28" width="8" height="8" rx="1.5" />
        </svg>
      );

    // A small brief at the top determining everything built below it. The
    // narrow input is what the whole outcome inherits.
    case "the-brief-is-the-product":
      return (
        <svg {...common}>
          <rect x="25" y="11" width="14" height="10" rx="1.5" />
          <line x1="32" y1="21" x2="32" y2="28" strokeOpacity={0.6} />
          <path d="M18 34 L32 28 L46 34" strokeOpacity={0.5} />
          <rect x="11" y="34" width="14" height="18" rx="1.5" strokeOpacity={0.55} />
          <rect x="25" y="34" width="14" height="18" rx="1.5" strokeOpacity={0.55} />
          <rect x="39" y="34" width="14" height="18" rx="1.5" strokeOpacity={0.55} />
        </svg>
      );

    // A hundred decisions too small to name, and the shape they add up to.
    // The outline is barely there; the dots doing the work are solid.
    case "the-invisible-details":
      return (
        <svg {...common}>
          <rect x="13" y="13" width="38" height="38" rx="3" strokeOpacity={0.22} strokeDasharray="2 4" />
          {[0, 1, 2, 3, 4].map((r) =>
            [0, 1, 2, 3, 4].map((c) => (
              <circle
                key={`${r}-${c}`}
                cx={19 + c * 6.5}
                cy={19 + r * 6.5}
                r="1"
                fill={stroke}
                stroke="none"
                fillOpacity={(r + c) % 3 === 0 ? 1 : 0.4}
              />
            )),
          )}
        </svg>
      );
  }

  // No per-post mark yet: fall back to the post's tag so the card still
  // reads as part of a family rather than rendering empty.
  const key = (tag ?? "").toLowerCase();

  if (key === "standards") {
    return (
      <svg {...common}>
        <rect x="13" y="13" width="16" height="16" rx="2" />
        <rect x="35" y="13" width="16" height="16" rx="2" />
        <rect x="13" y="35" width="16" height="16" rx="2" />
        <rect x="35" y="35" width="16" height="16" rx="2" />
      </svg>
    );
  }

  if (key === "infrastructure") {
    return (
      <svg {...common}>
        <rect x="9" y="9" width="46" height="46" rx="3" />
        <rect x="19" y="19" width="26" height="26" rx="2.5" />
        <rect x="28.5" y="28.5" width="7" height="7" rx="1.5" />
      </svg>
    );
  }

  if (key === "practice") {
    return (
      <svg {...common}>
        <rect x="18" y="18" width="28" height="28" rx="2" strokeOpacity={0.55} transform="rotate(-18 32 32)" />
        <rect x="18" y="18" width="28" height="28" rx="2" strokeOpacity={0.7} transform="rotate(11 32 32)" />
        <rect x="18" y="18" width="28" height="28" rx="2" strokeOpacity={0.85} transform="rotate(-5 32 32)" />
        <rect x="18" y="18" width="28" height="28" rx="2" />
      </svg>
    );
  }

  // Unknown tag and unknown slug: a single centered rule keeps the card's
  // vertical rhythm without inventing a mark the reader cannot decode.
  return (
    <svg {...common}>
      <line x1="20" y1="32" x2="44" y2="32" />
    </svg>
  );
}

