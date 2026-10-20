"use client";

import { scrollToElementById } from "@/lib/scroll-to-hash";

export const REVIEWS_ID = "reviews";

function Star() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 1.2l2.03 4.3 4.67.6-3.43 3.25.87 4.65L8 11.72 3.86 14l.87-4.65L1.3 6.1l4.67-.6L8 1.2z" />
    </svg>
  );
}

/* Under the hero's buttons: five stars and the line that goes with them.
 * Every owner's review of Aether has been five stars; keep it true. A tap
 * glides down to the reviews themselves, landing their heading just under
 * the header. Styles are .ae-rating in globals.css. */
export function Rating() {
  return (
    <a
      href={`#${REVIEWS_ID}`}
      className="ae-rating"
      onClick={(e) => {
        e.preventDefault();
        const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 0;
        scrollToElementById(REVIEWS_ID, { immediate: false, offset: -(header + 24) });
      }}
    >
      <span className="ae-rating__stars" role="img" aria-label="5 out of 5 stars">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} />
        ))}
      </span>
      Every review, 5 stars
    </a>
  );
}
