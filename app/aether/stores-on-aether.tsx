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

/* Laid out as a logo wall: one even cell per store, split by hairlines, so
 * the marks line up instead of wrapping into a ragged row. Five across from
 * sm up; two across on phones, with Allure's wide wordmark taking the last
 * row on its own. */
export function StoresOnAether() {
  return (
    <section className="px-3 py-14 sm:py-20" aria-label="Stores running Aether">
      <p className="rise rise--liquid text-center text-[14px] sm:text-[15px] tracking-tight text-[rgb(var(--muted))]">
        Stores running Aether
      </p>
      <ul
        className="rise rise--liquid mx-auto mt-6 sm:mt-8 grid max-w-[64rem] grid-cols-2 gap-px overflow-hidden rounded-[6px] bg-[rgb(var(--line))] shadow-[0_0_0_1px_rgb(var(--line))] sm:grid-cols-5"
        style={{ "--mark": "clamp(2.6rem, 7vw, 3.4rem)" } as CSSProperties}
      >
        {STORES.map((s, i) => (
          <li
            key={s.name}
            className={`group flex h-24 items-center justify-center bg-[rgb(var(--bg))] px-4 sm:h-28 ${
              i === STORES.length - 1 ? "col-span-2 sm:col-span-1" : ""
            }`}
          >
            <span
              role="img"
              aria-label={s.name}
              className="block max-w-full bg-[rgb(var(--fg))] opacity-70 transition-opacity duration-300 group-hover:opacity-100"
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