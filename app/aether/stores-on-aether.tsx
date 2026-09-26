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
  { name: "AD", src: "/aether/stores/ad.png", w: 324, h: 288 },
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

export function StoresOnAether() {
  return (
    <section className="px-3 py-14 sm:py-20" aria-label="Stores running Aether">
      <p className="rise rise--liquid text-center text-[14px] sm:text-[15px] tracking-tight text-[rgb(var(--muted))]">
        Stores running Aether
      </p>
      <ul
        className="mt-7 sm:mt-9 flex flex-wrap items-center justify-center gap-x-10 gap-y-8 sm:gap-x-16"
        style={{ "--mark": "clamp(3rem, 9vw, 4rem)" } as CSSProperties}
      >
        {STORES.map((s, i) => (
          <li
            key={s.name}
            className="rise rise--liquid"
            style={{ "--rise-delay": `${80 + i * 70}ms` } as CSSProperties}
          >
            <span
              role="img"
              aria-label={s.name}
              className="block bg-[rgb(var(--fg))] opacity-80"
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
          </li>
        ))}
      </ul>
    </section>
  );
}
