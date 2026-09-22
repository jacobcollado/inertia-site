import type { CSSProperties } from "react";

interface Testimonial {
  quote: string;
  name: string;
  /** Avatar gradient (from, to) and initial color. Unique per person. */
  tone: [string, string, string];
}

/* PLACEHOLDER reviews, written as demo copy. They are not from real customers,
 * so the section only renders outside production (see below). Replace these
 * with real, attributable reviews, then set USING_PLACEHOLDERS to false. */
const USING_PLACEHOLDERS = true;

const TESTIMONIALS: Testimonial[] = [
  { quote: "super easy setup tbh. had it live before my coffee got cold", name: "maya", tone: ["#ffd6c9", "#f4a79a", "#7a2e22"] },
  { quote: "Immediately gave my site a facelift fr", name: "Jordan T.", tone: ["#2b2d42", "#4a4e69", "#f2e9e4"] },
  { quote: "ngl i was skeptical but the demo store sold me. what you see is what you get", name: "Priya", tone: ["#d8f3dc", "#95d5b2", "#1b4332"] },
  { quote: "Switched from Dawn and my store finally looks like the brand in my head", name: "Eli M.", tone: ["#cde4ff", "#8fb8f0", "#123a6b"] },
  { quote: "mobile looks insane. like actually insane", name: "sofia", tone: ["#ffe8a3", "#f6c453", "#5c4200"] },
  { quote: "Support replied in like 10 min and fixed my thing. unreal", name: "Marcus", tone: ["#3d2c2e", "#6b4f4f", "#f5e6d3"] },
  { quote: "the sections are so clean it's lowkey hard to make it look bad", name: "Ava K.", tone: ["#ecdcff", "#c3a6f0", "#3c1f6e"] },
  { quote: "people keep dming me asking who did my site 😭", name: "noah", tone: ["#c9f1f0", "#7ccfcb", "#0d4543"] },
  { quote: "Sticky cart is such a small thing but it just feels premium", name: "Chloe", tone: ["#ffd9ec", "#f29cc4", "#6b1840"] },
  { quote: "didn't need a single app to get it looking right. rare", name: "Liam P.", tone: ["#e6e6e1", "#b9b8ad", "#33332e"] },
];

function Card({ t }: { t: Testimonial }) {
  return (
    <figure className="mr-3 flex w-[16.5rem] shrink-0 flex-col justify-between gap-6 rounded-xl bg-[rgb(var(--surface)/0.45)] p-5 sm:mr-4 sm:w-[20rem] sm:p-6">
      <blockquote className="text-[15px] leading-snug tracking-tight text-[rgb(var(--fg))] [text-wrap:pretty] sm:text-[17px]">
        {t.quote}
      </blockquote>
      <figcaption className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex size-7 shrink-0 items-center justify-center rounded-full text-[12px] font-medium"
          style={{ background: `linear-gradient(135deg, ${t.tone[0]}, ${t.tone[1]})`, color: t.tone[2] }}
        >
          {t.name[0].toUpperCase()}
        </span>
        <span className="text-[13px] tracking-tight text-[rgb(var(--fg))]">{t.name}</span>
      </figcaption>
    </figure>
  );
}

/* One drifting row. The list is rendered twice and the shared `marquee`
 * keyframe moves it by -50%, so the loop point is seamless. The duplicate is
 * hidden from assistive tech. Hovering pauses the drift so a card can be read. */
function Row({ items, duration, reverse }: { items: Testimonial[]; duration: number; reverse?: boolean }) {
  return (
    <div
      className="flex w-max motion-reduce:!animate-none hover:[animation-play-state:paused]"
      // Longhands, not the `animation` shorthand: the shorthand would pin
      // play-state inline and override the hover pause.
      style={{
        animationName: "marquee",
        animationDuration: `${duration}s`,
        animationTimingFunction: "linear",
        animationIterationCount: "infinite",
        animationDirection: reverse ? "reverse" : "normal",
      } as CSSProperties}
    >
      {items.map((t) => (
        <Card key={t.name} t={t} />
      ))}
      <div aria-hidden="true" className="flex">
        {items.map((t) => (
          <Card key={`${t.name}-dup`} t={t} />
        ))}
      </div>
    </div>
  );
}

export function Testimonials() {
  if (USING_PLACEHOLDERS && process.env.NODE_ENV === "production") return null;

  const half = Math.ceil(TESTIMONIALS.length / 2);

  return (
    <>
      <div className="grid-rule grid-rule--dashed" aria-hidden="true" />
      <section className="py-16 sm:py-24" aria-label="What store owners say">
        <p className="rise rise--liquid mb-10 px-3 text-center text-[clamp(1.8rem,3vw,2.5rem)] font-normal leading-none tracking-[-0.03em] text-[rgb(var(--fg))]">
          From the people using it
        </p>
        {/* Full-bleed, with the edges fading out so cards drift in and out
            rather than being cut by the column. */}
        <div
          className="relative left-1/2 flex w-screen -translate-x-1/2 flex-col gap-3 overflow-hidden sm:gap-4"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <Row items={TESTIMONIALS.slice(0, half)} duration={60} />
          <Row items={TESTIMONIALS.slice(half)} duration={72} reverse />
        </div>
      </section>
    </>
  );
}
