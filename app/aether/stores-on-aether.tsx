import type { CSSProperties } from "react";

/* The first thing after the hero, so it asks for nothing: one quiet line and
 * the marks of brands that run Aether on their live store. Every brand here
 * is confirmed as a current Aether store; don't add one that isn't.
 *
 * The marks are ink-only PNGs (public/aether/stores), trimmed tight to the
 * ink and drawn as CSS masks, so they all take the page's own text color in
 * light and dark mode. `w`/`h` are each file's pixel size. */
const STORES: { name: string; src: string; w: number; h: number; optical?: number }[] = [
  { name: "Ellora LA", src: "/aether/stores/ellora-la.png", w: 400, h: 89 },
  // Solid, dense ink reads heavier than the rest at the same area.
  { name: "vora.archive", src: "/aether/stores/vora-archive.png", w: 116, h: 109, optical: 0.84 },
  { name: "Awoken Dreams", src: "/aether/stores/ad.png", w: 324, h: 288 },
  { name: "Defy", src: "/aether/stores/defy.png", w: 400, h: 389 },
  // Widest mark, so it closes the row.
  { name: "Allure New York", src: "/aether/stores/allure-new-york.png", w: 1000, h: 135 },
];

// Every mark gets the same area, the square of --mark: height scales by
// 1/sqrt(aspect ratio), so wide wordmarks sit short and square badges sit
// tall, and none of them reads louder than the rest.
// `optical` nudges a mark whose ink density makes it read off at equal area.
const markHeight = (w: number, h: number, optical = 1) =>
  `calc(var(--mark) * ${(optical / Math.sqrt(w / h)).toFixed(3)})`;

function Mark({ s }: { s: (typeof STORES)[number] }) {
  return (
    <span
      role="img"
      aria-label={s.name}
      className="block shrink-0 bg-[rgb(var(--fg))] opacity-60"
      style={{
        height: markHeight(s.w, s.h, s.optical),
        aspectRatio: `${s.w} / ${s.h}`,
        WebkitMaskImage: `url(${s.src})`,
        maskImage: `url(${s.src})`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}

/* A slow marquee under the label: the marks drift sideways in a continuous
 * loop (the set is drawn twice, the track slides by one set), fading out at
 * both edges, and pause while hovered. With reduced motion the track stands
 * still and the one set sits centred. CSS in globals.css (.stores-marquee). */
export function StoresOnAether() {
  return (
    <section className="rise rise--liquid py-14 sm:py-20" aria-label="Stores running Aether">
      <p className="px-3 text-center text-[14px] sm:text-[15px] tracking-tight text-[rgb(var(--muted))]">
        Stores running Aether
      </p>
      <div
        className="stores-marquee mt-8 sm:mt-10 overflow-hidden"
        style={{ "--mark": "clamp(3rem, 6.5vw, 4rem)" } as CSSProperties}
      >
        <div className="stores-marquee__track flex w-max items-center">
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center gap-16 pr-16 sm:gap-24 sm:pr-24">
              {STORES.map((s) => (
                <li key={s.name} className="flex items-center">
                  <Mark s={s} />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
