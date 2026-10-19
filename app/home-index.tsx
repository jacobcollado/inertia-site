"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import { TileGlass, WorkTile, type TileWork } from "@/components/work-tile";
import { Close } from "@/components/close";
import { Spotlight } from "@/components/spotlight";

// The homepage as one sentence on white. Small frames of the work sit inside
// the words; scrolling lifts each frame out of its word and grows it into the
// work below, so the page never cuts from "what we do" to "what we've done".
// Then what we do, why us, and the way in.

const SIZES = "(max-width: 640px) 50vw, 320px";

// The frames, staggered so they leave the sentence one after another.
const STAGGER = 0.08;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

type Box = { x: number; y: number; w: number; h: number };

function boxIn(el: Element, origin: DOMRect): Box {
  const r = el.getBoundingClientRect();
  return { x: r.left - origin.left, y: r.top - origin.top, w: r.width, h: r.height };
}

export default function HomeIndex({ work }: { work: TileWork[] }) {
  const reduce = useReducedMotion();
  const [flying, setFlying] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const frameRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const flyerRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Flight only runs with motion allowed; without it (or without JS) the
  // frames simply sit in the sentence and the work sits below.
  useEffect(() => setFlying(reduce === false), [reduce]);

  // ?glass=pane shows the cards' glass as the earlier crisp-edged pane, kept
  // to compare against.
  const [glass, setGlass] = useState<string | undefined>();
  useEffect(() => {
    setGlass(new URLSearchParams(window.location.search).get("glass") ?? undefined);
  }, []);

  useLayoutEffect(() => {
    if (!flying) return;
    const stage = stageRef.current;
    if (!stage) return;

    let from: Box[] = [];
    let to: Box[] = [];
    let raf = 0;

    const measure = () => {
      const origin = stage.getBoundingClientRect();
      from = chipRefs.current.map((el) => (el ? boxIn(el, origin) : { x: 0, y: 0, w: 0, h: 0 }));
      to = frameRefs.current.map((el) => {
        const frame = el?.querySelector("[data-frame]");
        return frame ? boxIn(frame, origin) : { x: 0, y: 0, w: 0, h: 0 };
      });
    };

    const paint = () => {
      raf = 0;
      if (!to.length) return;
      const vh = window.innerHeight;
      const stageTop = stage.getBoundingClientRect().top;
      // Where the first frame's top sits with the page at the very top, and
      // where it should be when the flight ends: a little below the top of
      // the screen, so the whole row lands in view.
      const start = stageTop + window.scrollY + to[0].y;
      const end = vh * 0.14;
      const now = stageTop + to[0].y;
      const span = Math.max(1, start - end);
      const p = Math.min(1, Math.max(0, (start - now) / span));

      const n = to.length;
      flyerRefs.current.forEach((el, i) => {
        if (!el) return;
        const local = Math.min(1, Math.max(0, (p - i * STAGGER) / (1 - (n - 1) * STAGGER)));
        const t = easeInOutCubic(local);
        const a = from[i];
        const b = to[i];
        el.style.transform = `translate3d(${a.x + (b.x - a.x) * t}px, ${a.y + (b.y - a.y) * t}px, 0)`;
        el.style.width = `${a.w + (b.w - a.w) * t}px`;
        el.style.height = `${a.h + (b.h - a.h) * t}px`;
        const landed = local >= 1;
        el.style.visibility = landed ? "hidden" : "visible";
        const tile = frameRefs.current[i];
        if (tile) tile.dataset.landed = landed ? "true" : "false";
        const chip = chipRefs.current[i];
        if (chip) chip.dataset.left = local > 0 ? "true" : "false";
      });
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const remeasure = () => {
      measure();
      schedule();
    };

    // Paint now, not next frame, so the frames never blink out of the line.
    measure();
    paint();
    document.fonts?.ready.then(remeasure);
    const ro = new ResizeObserver(remeasure);
    ro.observe(stage);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
    };
  }, [flying]);

  const chip = (i: number) => {
    const w = work[i];
    if (!w) return null;
    return (
      <span
        ref={(el) => {
          chipRefs.current[i] = el;
        }}
        className="index-chip"
        data-flying={flying ? "true" : "false"}
        aria-hidden
      >
        <Image src={w.image} alt="" fill sizes={SIZES} className="object-cover" priority />
      </span>
    );
  };

  // A word and its frame never break apart across lines.
  const held = (word: string, i: number, after = "") => (
    <span className="whitespace-nowrap">
      {word} {chip(i)}
      {after}
    </span>
  );

  return (
    <main className="index-page">
      <div ref={stageRef} className="relative">
        <section className="index-col index-opening" data-hero>
          <h1 className="index-sentence">
            Inertia designs {held("identities", 0)} and {held("websites", 1)} for{" "}
            {held("founders", 2, ",")} as one system, so you look like the company you&apos;re{" "}
            {held("becoming", 3, ".")}
          </h1>
        </section>

        <section className="index-col index-work" aria-label="Work" data-glass={glass}>
          <div className="index-work__grid">
            {work.slice(0, 4).map((w, i) => (
              <WorkTile
                key={w.slug}
                work={w}
                sizes={SIZES}
                landed={!flying}
                pane={glass === "pane"}
                ref={(el) => {
                  frameRefs.current[i] = el;
                }}
              />
            ))}
          </div>
          <TileGlass />
          <Link href="/work" className="index-more">
            All work
          </Link>
        </section>

        {flying && (
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            {work.slice(0, 4).map((w, i) => (
              <div
                key={w.slug}
                ref={(el) => {
                  flyerRefs.current[i] = el;
                }}
                className="index-flyer"
              >
                <Image src={w.image} alt="" fill sizes={SIZES} className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      <Spotlight
        label="What we do"
        items={[
          { word: "Up to date.", line: "Design dates within a year. We bring how you look back in line with the company you are now." },
          { word: "In one piece.", line: "Your identity and your site are made together, so everywhere people meet you, it feels like the same company." },
          { word: "What’s next.", line: "We try new ideas on our own work first, so you get what’s coming, not what everyone already has." },
        ]}
      />

      <Reasons
        label="Why us"
        lead="Because"
        items={[
          { clause: "we see what’s off.", line: "Something can feel wrong before anyone can say why. We find it, and we fix it." },
          { clause: "close enough isn’t done.", line: "If it doesn’t look right, it isn’t finished. Every detail gets the same care as the whole." },
          { clause: "one team does both.", line: "The people who design your identity build your site, so nothing gets lost between them." },
        ]}
      />

      <Close />
    </main>
  );
}

// One sentence that answers the question and rewrites its ending as the page
// scrolls. The section pins while its reasons pass: the lead word stays put
// and the rest flips upward to the next reason, its supporting line with it.
// Without motion, the reasons are simply listed.
function Reasons({
  label,
  lead,
  items,
}: {
  label: string;
  lead: string;
  items: { clause: string; line: string }[];
}) {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  // Decided after mount: the server can't know the visitor's motion setting,
  // and the list is the right first render without it.
  const [pinned, setPinned] = useState(false);
  useEffect(() => setPinned(reduce === false), [reduce]);

  useEffect(() => {
    if (!pinned) return;
    const section = sectionRef.current;
    if (!section) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      const r = section.getBoundingClientRect();
      const run = Math.max(1, r.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -r.top / run));
      setActive(Math.min(items.length - 1, Math.floor(p * items.length)));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pinned, items.length]);

  if (!pinned) {
    return (
      <section className="index-col index-why index-why--list">
        <h2 className="index-why__label">{label}</h2>
        <ul className="index-why__list">
          {items.map((it) => (
            <li key={it.clause} className="index-why__item">
              <span className="index-why__sentence">
                {lead} {it.clause}
              </span>
              <span className="index-why__line">{it.line}</span>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  const pos = (i: number) => (i < active ? "before" : i > active ? "after" : "on");
  return (
    <section ref={sectionRef} className="index-why" style={{ height: `${items.length * 80 + 20}svh` }}>
      <div className="index-why__pin">
        <h2 className="index-why__label">{label}</h2>
        <p className="index-why__sentence">
          <span className="index-why__lead">{lead}</span>
          <span className="index-why__stack">
            {items.map((it, i) => (
              <span key={it.clause} className="index-why__clause" data-pos={pos(i)} aria-hidden={i !== active}>
                {it.clause}
              </span>
            ))}
          </span>
        </p>
        <span className="index-why__stack index-why__stack--line">
          {items.map((it, i) => (
            <span key={it.clause} className="index-why__line" data-pos={pos(i)} aria-hidden={i !== active}>
              {it.line}
            </span>
          ))}
        </span>
      </div>
    </section>
  );
}
