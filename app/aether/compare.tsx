"use client";

import { useEffect, useRef, useState } from "react";

// What the free theme leaves out, as rows a phone can read at a glance.
// Only list what Shopify's free themes (Dawn and its family) really don't
// do out of the box; this table is a claim about them.
const COMPARE = [
  "Upsells on cards, products and cart",
  "Back-in-stock signups",
  "Free shipping tracker",
  "In-stock labels",
  "Made for clothing brands",
  "New features, free for life",
  "Installed for you, today",
];

/* Aether's column stands on a tile; the free theme's sits on the paper in
 * grey dashes. When the table comes into view Aether's checks draw in, top
 * to bottom, and each row's feature goes to ink as its check lands, so the
 * list fills in as Aether's. Styles are .ae-vs in globals.css. */
export function Compare() {
  const ref = useRef<HTMLTableElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setOn(true);
        io.disconnect();
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    // Aether's tile is one panel behind its column, not each cell's own
    // background, so its inner shadow runs unbroken from top to bottom.
    <div className="ae-vs__wrap">
      <span className="ae-vs__col" aria-hidden="true" />
    <table ref={ref} className="ae-vs__table" data-on={on || undefined}>
      <thead>
        <tr>
          <td />
          <th scope="col">Free theme</th>
          <th scope="col">Aether</th>
        </tr>
      </thead>
      <tbody>
        {COMPARE.map((row, i) => (
          <tr key={row} style={{ "--i": i } as React.CSSProperties}>
            <th scope="row">{row}</th>
            <td>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="ae-vs__no" aria-hidden="true">
                <path d="M5 8h6" />
              </svg>
              <span className="sr-only">No</span>
            </td>
            <td>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="ae-vs__yes" aria-hidden="true">
                <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" pathLength={1} />
              </svg>
              <span className="sr-only">Yes</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}
