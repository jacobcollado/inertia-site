/* Shared between the homepage blog card and the post page header, so a post
   has exactly one mark and the card the reader clicked is the header they
   land on. Pure SVG with no hooks, so it renders fine in a server component. */

/* Panel tint per post. Every post now has its own cover drawing (see
   PostCover in post-figures.tsx), so the tint no longer needs to carry
   per-post identity through hue - that job moved to the drawing. One flat neutral
   grey for every card keeps the row calm and lets the drawings read as the
   actual point of difference. Flattened rgba(26,26,26,0.06) on white (the
   Pill highlight's own background, see home-client.tsx) to a solid hex -
   at pill size the wash reads grey against dark body text, but the same
   translucent value over a whole card's white backdrop reads as plain
   white, so it needs to be opaque here to actually match. */
export function postTint(_slug?: string): string {
  return "#f1f1f1";
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
  const stroke = "rgba(26,26,26,0.46)";
  const common = {
    viewBox: "0 0 64 64",
    fill: "none" as const,
    stroke,
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (slug) {
    // A steady grid of frames with one deliberately, visibly identical to the
    // rest. The regularity is the argument, so the mark is a regular field.
    case "consistency-beats-novelty":
      return (
        <svg {...common}>
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => (
              <rect
                key={`${r}-${c}`}
                x={14 + c * 13}
                y={14 + r * 13}
                width="10"
                height="10"
                rx="2"
                strokeOpacity={0.85}
              />
            )),
          )}
        </svg>
      );

    // Lines of copy that draw the page's own margins: the writing is doing
    // the layout work, so it forms the frame instead of sitting inside one.
    // Heavier rules, fewer of them, so the block reads as type at 96px.
    case "copy-is-design":
      return (
        <svg {...common}>
          <line x1="18" y1="20" x2="46" y2="20" />
          <line x1="18" y1="28" x2="46" y2="28" />
          <line x1="18" y1="36" x2="38" y2="36" />
          <line x1="18" y1="44" x2="46" y2="44" />
          <line x1="12" y1="14" x2="12" y2="50" strokeOpacity={0.5} />
          <line x1="52" y1="14" x2="52" y2="50" strokeOpacity={0.5} />
        </svg>
      );

    // One module holding its proportion as it grows: three nested steps
    // stepping out from a single corner, so growth reads as scale, not sprawl.
    case "design-systems-that-scale":
      return (
        <svg {...common}>
          <rect x="14" y="34" width="16" height="16" rx="2.5" />
          <rect x="14" y="22" width="28" height="28" rx="3" strokeOpacity={0.62} />
          <rect x="14" y="14" width="36" height="36" rx="3.5" strokeOpacity={0.38} />
        </svg>
      );

    // Many candidates, one chosen. The unpicked options stay light and the
    // selected one is ringed and solid: the choice is the whole mark.
    case "someone-still-has-to-pick":
      return (
        <svg {...common}>
          <circle cx="18" cy="20" r="4.5" strokeOpacity={0.32} />
          <circle cx="32" cy="20" r="4.5" strokeOpacity={0.32} />
          <circle cx="46" cy="20" r="4.5" strokeOpacity={0.32} />
          <circle cx="18" cy="34" r="4.5" strokeOpacity={0.32} />
          <circle cx="46" cy="34" r="4.5" strokeOpacity={0.32} />
          <circle cx="32" cy="38" r="7" />
          <circle cx="32" cy="38" r="2.4" fill={stroke} stroke="none" />
        </svg>
      );

    // Load times collapsing to almost nothing. Fewer, heavier bars with a
    // clear descending silhouette, so it reads as a fall rather than hatching.
    case "speed-is-a-feature":
      return (
        <svg {...common}>
          <line x1="11" y1="50" x2="53" y2="50" strokeOpacity={0.5} />
          <line x1="17" y1="50" x2="17" y2="16" strokeOpacity={0.5} />
          <line x1="26" y1="50" x2="26" y2="27" strokeOpacity={0.68} />
          <line x1="35" y1="50" x2="35" y2="35" strokeOpacity={0.85} />
          <line x1="44" y1="50" x2="44" y2="42" />
          <circle cx="44" cy="38.5" r="2.4" fill={stroke} stroke="none" />
        </svg>
      );

    // The same judgment made repeatedly, converging on a centre. Concentric
    // frames tightening inward, the innermost solid: arrival by repetition.
    case "taste-is-trained":
      return (
        <svg {...common}>
          <rect x="10" y="10" width="44" height="44" rx="3" strokeOpacity={0.3} />
          <rect x="18" y="18" width="28" height="28" rx="2.5" strokeOpacity={0.58} />
          <rect x="26" y="26" width="12" height="12" rx="2" strokeOpacity={0.9} />
          <circle cx="32" cy="32" r="2.2" fill={stroke} stroke="none" />
        </svg>
      );

    // A small brief at the top determining everything built beneath it. One
    // input, one bracket, three outcomes inheriting from it.
    case "most-projects-fail-before-figma":
      return (
        <svg {...common}>
          <rect x="24" y="11" width="16" height="11" rx="2" />
          <line x1="32" y1="22" x2="32" y2="30" strokeOpacity={0.7} />
          <path d="M15 36 L15 32 L49 32 L49 36" strokeOpacity={0.55} />
          <rect x="10" y="38" width="12" height="15" rx="2" strokeOpacity={0.5} />
          <rect x="26" y="38" width="12" height="15" rx="2" strokeOpacity={0.5} />
          <rect x="42" y="38" width="12" height="15" rx="2" strokeOpacity={0.5} />
        </svg>
      );

    // A hundred decisions too small to name, and the shape they add up to.
    // The outline is barely there; the dots doing the work are solid.
    case "the-difference-you-feel":
      return (
        <svg {...common}>
          <rect x="12" y="12" width="40" height="40" rx="4" strokeOpacity={0.28} strokeDasharray="3 5" />
          {[0, 1, 2, 3].map((r) =>
            [0, 1, 2, 3].map((c) => (
              <circle
                key={`${r}-${c}`}
                cx={20 + c * 8}
                cy={20 + r * 8}
                r="1.7"
                fill={stroke}
                stroke="none"
                fillOpacity={(r + c) % 2 === 0 ? 1 : 0.42}
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

