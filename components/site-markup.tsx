"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode, type RefObject } from "react";
import { AnimatePresence, motion, useAnimate, useReducedMotion } from "motion/react";
import { spring } from "@/lib/springs";

// The homepage hero's canvas: a browser window holding a dated startup site,
// and our cursor marking it up the way a teardown does. It selects what's
// wrong one thing at a time and leaves a short note on each, then clicks
// After and the fixes land in order. Visitors can flip Before and After
// themselves, or put their own site in the address bar, which opens the
// teardown request with it filled in.
//
// The sample is drawn once per variant at a fixed size (SPACE) and scaled to
// the frame. The marks sit in an unscaled layer over it, so lines stay 1px
// and notes stay readable at any width. The sample keeps its own light
// palette in both themes: it's their site, not ours.

type Variant = "desktop" | "mobile";
type Side = "above" | "below" | "left" | "inside";
type Rect = { l: number; t: number; w: number; h: number };
export type View = "before" | "after";

const SPACE = { desktop: { w: 1200, h: 660 }, mobile: { w: 360, h: 620 } } as const;
// Frames narrower than this get the phone layout of the sample.
const MOBILE_BELOW = 576;
const CHROME_H = 44;
// Selections stand off their target by PAD, the way a design tool's do;
// notes sit GAP from their selection.
const PAD = 6;
const GAP = 8;
const NOTE_H = 28;
const DEFAULT_URL = "yourstartup.com";

// One per fix, in the order they're marked and fixed. Each note's target in
// the sample carries data-target={index}.
const NOTES: { text: string; side: Record<Variant, Side> }[] = [
  { text: "Logo and site don't match.", side: { desktop: "below", mobile: "below" } },
  { text: "Eight type sizes in one view.", side: { desktop: "above", mobile: "below" } },
  { text: "Three buttons. Which one first?", side: { desktop: "left", mobile: "above" } },
  { text: "The tilt hides the product.", side: { desktop: "inside", mobile: "inside" } },
];

// From the canvas coming into view, after the hero copy has landed.
const START_MS = 700;
const HOLD_MS = 420; // a finished note sits this long before the cursor moves on
const READ_MS = 1100; // every note up, before the cursor goes to After
const FIX_STEP_MS = 320;
const MOVE = { ...spring.scene, duration: 0.75 };
const DRAG = { ...spring.scene, duration: 0.55 };
const SWAP = { ...spring.scene, duration: 0.7 };
const { exit: markExit, ...markIn } = spring.slow;

const CURSOR = "[data-cursor]";
const NOTE_SHADOW = "0 0 0 1px rgb(0 0 0 / 0.1), 0 2px 4px rgb(0 0 0 / 0.06), 0 8px 20px -6px rgb(0 0 0 / 0.22)";
const FRAME_SHADOW = "0 0 0 1px rgb(var(--ink-rgb) / 0.1), 0 30px 70px -30px rgb(0 0 0 / 0.3)";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

// Layout position inside the sample, ignoring transforms, so a target can be
// measured whichever state its region is showing.
function offsetRect(el: HTMLElement, root: HTMLElement): Rect {
  let l = 0;
  let t = 0;
  for (let n: HTMLElement | null = el; n && n !== root; n = n.offsetParent as HTMLElement | null) {
    l += n.offsetLeft;
    t += n.offsetTop;
  }
  return { l, t, w: el.offsetWidth, h: el.offsetHeight };
}

const toFrame = (r: Rect, s: number): Rect => ({
  l: r.l * s - PAD,
  t: CHROME_H + r.t * s - PAD,
  w: r.w * s + PAD * 2,
  h: r.h * s + PAD * 2,
});

export function SiteMarkup({
  play,
  onTry,
  style,
}: {
  play: boolean;
  onTry: (url: string, from: Element) => void;
  style?: CSSProperties;
}) {
  const reduce = useReducedMotion() ?? false;
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const viewRef = useRef<HTMLDivElement>(null);
  const siteRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLButtonElement>(null);
  const inviteRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [width, setWidth] = useState(0);
  const [targets, setTargets] = useState<Rect[]>([]);
  const [notes, setNotes] = useState(0); // notes the cursor has started
  const [drawn, setDrawn] = useState(0); // notes fully drawn
  const [fixed, setFixed] = useState(0);
  const [view, setView] = useState<View>("before");
  const [invite, setInvite] = useState(false);
  const [url, setUrl] = useState(DEFAULT_URL);
  const [inView, setInView] = useState(false);

  // Bumped to stop whatever sequence is running.
  const run = useRef(0);
  const started = useRef(false);
  const latest = useRef({ targets, scale: 0 });

  const variant: Variant = width > 0 && width < MOBILE_BELOW ? "mobile" : "desktop";
  const space = SPACE[variant];
  const scale = width / space.w;
  const sized = width > 0;

  useLayoutEffect(() => {
    latest.current = { targets, scale };
  });

  useLayoutEffect(() => {
    const el = viewRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  // Targets in the sample's own units, so they hold at any scale. Measured
  // again once the sample's fonts are in, since they set its line breaks.
  useLayoutEffect(() => {
    const root = siteRef.current;
    if (!root || !sized) return;
    let live = true;
    const measure = () => {
      if (!live) return;
      setTargets(
        NOTES.map((_, i) => {
          const el = root.querySelector<HTMLElement>(`[data-target="${i}"]`);
          if (!el) return { l: 0, t: 0, w: 0, h: 0 };
          const r = offsetRect(el, root);
          // The product shot runs off the foot of the sample; select what shows.
          return { ...r, h: Math.min(r.h, SPACE[variant].h - 12 - r.t) };
        }),
      );
    };
    measure();
    document.fonts?.ready.then(measure);
    return () => {
      live = false;
    };
  }, [variant, sized]);

  useEffect(() => {
    const el = scope.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setInView(true);
        io.disconnect();
      },
      { threshold: 0.55 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [scope]);

  useEffect(() => () => void run.current++, []);

  // Centre of a control, in the frame's coordinates.
  const centreOf = (el: Element | null) => {
    const f = scope.current?.getBoundingClientRect();
    const r = el?.getBoundingClientRect();
    if (!f || !r) return { x: 0, y: 0 };
    return { x: r.left - f.left + r.width / 2, y: r.top - f.top + r.height / 2 };
  };

  const cascade = async (from: number, live: () => boolean) => {
    for (let i = from; i < NOTES.length; i++) {
      setFixed(i + 1);
      await wait(FIX_STEP_MS);
      if (!live()) return;
    }
  };

  // The autoplay: mark everything, read, click After, fix in order, then
  // point at the address bar. Reduced motion lands on the fixed site.
  useEffect(() => {
    if (!play || !inView || !targets.length || started.current) return;
    started.current = true;
    if (reduce) {
      setNotes(NOTES.length);
      setDrawn(NOTES.length);
      setView("after");
      setFixed(NOTES.length);
      setInvite(true);
      return;
    }
    const id = ++run.current;
    const live = () => run.current === id;
    const box = (i: number) => toFrame(latest.current.targets[i], latest.current.scale);

    (async () => {
      await wait(START_MS);
      if (!live() || !scope.current) return;
      const f = scope.current;
      animate(CURSOR, { x: f.offsetWidth * 0.62, y: f.offsetHeight + 12, opacity: 1 }, { duration: 0 });
      for (let i = 0; i < NOTES.length; i++) {
        const b = box(i);
        await animate(CURSOR, { x: b.l, y: b.t }, MOVE);
        if (!live()) return;
        setNotes(i + 1);
        await nextFrame();
        if (!live()) return;
        // The selection follows the cursor from corner to corner.
        await Promise.all([
          animate(CURSOR, { x: b.l + b.w, y: b.t + b.h }, DRAG),
          animate(`[data-box="${i}"]`, { width: b.w, height: b.h }, DRAG),
        ]);
        if (!live()) return;
        setDrawn(i + 1);
        await wait(HOLD_MS);
        if (!live()) return;
      }
      await wait(READ_MS);
      if (!live()) return;
      const a = centreOf(afterRef.current);
      await animate(CURSOR, { x: a.x, y: a.y }, MOVE);
      if (!live()) return;
      await animate(CURSOR, { scale: 0.86 }, spring.moderate);
      animate(CURSOR, { scale: 1 }, spring.slow);
      setView("after");
      await cascade(0, live);
      if (!live()) return;
      setInvite(true);
      await nextFrame();
      await wait(240);
      if (!live()) return;
      const v = centreOf(inviteRef.current);
      await animate(CURSOR, { x: v.x, y: v.y + 6 }, MOVE);
      await wait(700);
      if (!live()) return;
      animate(CURSOR, { opacity: 0 }, markIn);
    })();
    // `targets` only gates the start; the run reads the latest through `latest`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play, inView, targets.length > 0, reduce]);

  // Before shows every note on the dated site; After fixes them in order.
  // Either one takes over from the autoplay.
  const choose = (next: View) => {
    const id = ++run.current;
    const live = () => run.current === id;
    started.current = true;
    animate(CURSOR, { opacity: 0 }, { ...markExit, duration: 0.2 });
    setInvite(true);
    setView(next);
    setNotes(NOTES.length);
    setDrawn(NOTES.length);
    if (next === "before") setFixed(0);
    else if (reduce) setFixed(NOTES.length);
    else void cascade(fixed, live);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = url.trim();
    if (!v || v === DEFAULT_URL) {
      inputRef.current?.focus();
      inputRef.current?.select();
      return;
    }
    onTry(v, inviteRef.current ?? e.currentTarget);
  };

  return (
    <div
      ref={scope}
      data-site-markup
      className="relative w-full overflow-hidden rounded-[6px]"
      style={{ background: "var(--paper)", boxShadow: FRAME_SHADOW, ...style }}
    >
      <div
        className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-2 sm:grid-cols-[1fr_minmax(0,26rem)_1fr] sm:px-4"
        style={{ height: CHROME_H, background: "var(--tile)", boxShadow: "inset 0 -1px 0 rgb(var(--ink-rgb) / 0.08)" }}
      >
        <div aria-hidden="true" className="hidden gap-1.5 sm:flex">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2.5 rounded-full" style={{ background: "rgb(var(--ink-rgb) / 0.14)" }} />
          ))}
        </div>

        <form
          onSubmit={submit}
          className="flex h-7 min-w-0 items-center rounded-[6px] p-0.5"
          style={{ background: "var(--paper)", boxShadow: "inset 0 0 0 1px rgb(var(--ink-rgb) / 0.08)" }}
        >
          <LockIcon />
          <input
            ref={inputRef}
            aria-label="Your website"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={(e) => e.currentTarget.select()}
            placeholder="yoursite.com"
            inputMode="url"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="h-full min-w-0 flex-1 bg-transparent pl-1.5 pr-2 text-[16px] leading-none tracking-tight outline-none placeholder:opacity-50 sm:text-[13px]"
            style={{ color: "var(--ink)" }}
          />
          <AnimatePresence initial={false}>
            {invite && (
              <motion.button
                ref={inviteRef}
                type="submit"
                className="flex h-6 shrink-0 items-center whitespace-nowrap rounded-[4px] px-2 text-[12px] font-medium leading-none tracking-tight"
                style={{ background: "var(--cta-fill)", color: "var(--cta-fg)" }}
                initial={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)", transition: markIn }}
                exit={{ opacity: 0, transition: markExit }}
              >
                Mark up yours
              </motion.button>
            )}
          </AnimatePresence>
        </form>

        <Segments value={view} onChange={choose} afterRef={afterRef} />
      </div>

      <div
        ref={viewRef}
        aria-hidden="true"
        className={`relative overflow-hidden ${sized ? "" : "aspect-[360/620] sm:aspect-[1200/660]"}`}
        style={sized ? { height: space.h * scale } : undefined}
      >
        <div
          ref={siteRef}
          className="absolute left-0 top-0 origin-top-left"
          style={{ width: space.w, height: space.h, transform: `scale(${scale})`, visibility: sized ? "visible" : "hidden" }}
        >
          <SampleSite variant={variant} fixed={fixed} reduce={reduce} />
        </div>
      </div>

      {/* The review layer: selections, notes and our cursor. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2]" style={{ color: "var(--signal)" }}>
        <AnimatePresence>
          {sized &&
            targets.length > 0 &&
            NOTES.map((note, i) => {
              if (i >= notes || i < fixed) return null;
              const b = toFrame(targets[i], scale);
              const done = i < drawn;
              return (
                <motion.div
                  key={i}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: markIn }}
                  exit={{ opacity: 0, filter: "blur(2px)", transition: { ...markExit, duration: 0.32 } }}
                >
                  <div
                    data-box={i}
                    className="absolute"
                    style={{ left: b.l, top: b.t, width: done ? b.w : 0, height: done ? b.h : 0, boxShadow: "inset 0 0 0 1px currentColor" }}
                  >
                    {done && <Handles />}
                  </div>
                  {done && <Note n={i + 1} text={note.text} box={b} side={note.side[variant]} frameW={width} />}
                </motion.div>
              );
            })}
        </AnimatePresence>
        <Cursor />
      </div>
    </div>
  );
}

// Shared with components/art-markup.tsx, which floats it over its artboard.
export function Segments({
  value,
  onChange,
  afterRef,
  label = "Sample site",
  layoutId = "site-markup-view",
  style,
}: {
  value: View;
  onChange: (v: View) => void;
  afterRef: RefObject<HTMLButtonElement | null>;
  label?: string;
  layoutId?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex h-7 items-center justify-self-end rounded-[6px] p-0.5"
      style={{ background: "rgb(var(--ink-rgb) / 0.06)", ...style }}
    >
      {(["before", "after"] as const).map((v) => (
        <button
          key={v}
          ref={v === "after" ? afterRef : undefined}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className="relative flex h-6 items-center rounded-[4px] px-2.5 text-[13px] leading-none tracking-tight transition-colors duration-200"
          style={{ color: value === v ? "var(--cta-fg)" : "var(--ink-2)" }}
        >
          {value === v && (
            <motion.span
              layoutId={layoutId}
              className="absolute inset-0 rounded-[4px]"
              style={{ background: "var(--cta-fill)" }}
              transition={spring.moderate}
            />
          )}
          <span className="relative capitalize">{v}</span>
        </button>
      ))}
    </div>
  );
}

function LockIcon() {
  // 12px in the 28px field, as far from its left edge as from the top.
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12" className="ml-1.5 size-3 shrink-0" style={{ color: "var(--ink-3)" }}>
      <rect x="2" y="5.25" width="8" height="5.75" rx="1.25" fill="currentColor" />
      <path d="M3.9 5.25V3.9a2.1 2.1 0 0 1 4.2 0v1.35" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

// Square handles on a selection's corners, the same as figma-frame's.
export function Handles() {
  const corners: CSSProperties[] = [
    { left: -3, top: -3 },
    { right: -3, top: -3 },
    { right: -3, bottom: -3 },
    { left: -3, bottom: -3 },
  ];
  return (
    <>
      {corners.map((pos, i) => (
        <motion.span
          key={i}
          className="absolute block size-[6px]"
          style={{ ...pos, background: "#fff", boxShadow: "inset 0 0 0 1px currentColor" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: markIn }}
        />
      ))}
    </>
  );
}

// A review note beside its selection. Where the preferred side has no room
// it goes above instead. Widths are estimated, which is all placement needs.
function Note({ n, text, box, side, frameW }: { n: number; text: string; box: Rect; side: Side; frameW: number }) {
  const w = text.length * 6.6 + 44;
  const fits = side !== "left" || box.l - GAP - w >= 8;
  const s: Side = fits ? side : "above";
  const clampX = (x: number) => Math.max(8, Math.min(x, frameW - w - 8));
  const pos =
    s === "left"
      ? { left: box.l - GAP - w, top: box.t }
      : s === "inside"
        ? { left: box.l + GAP + PAD, top: box.t + GAP + PAD }
        : s === "below"
          ? { left: clampX(box.l), top: box.t + box.h + GAP }
          : { left: clampX(box.l), top: box.t - GAP - NOTE_H };
  return (
    <span className="absolute" style={pos}>
      <motion.span
        className="flex items-center gap-2 whitespace-nowrap rounded-[6px] pl-[5px] pr-2.5 text-[13px] font-medium leading-none tracking-tight"
        style={{ height: NOTE_H, background: "#fff", color: "#1a1a1a", boxShadow: NOTE_SHADOW }}
        initial={{ y: 6, opacity: 0, filter: "blur(3px)" }}
        animate={{ y: 0, opacity: 1, filter: "blur(0px)", transition: { ...DRAG, delay: 0.05 } }}
      >
        <span
          className="flex size-[18px] items-center justify-center rounded-full text-[11px] tabular-nums"
          style={{ background: "var(--signal)", color: "#fff" }}
        >
          {n}
        </span>
        {text}
      </motion.span>
    </span>
  );
}

// Our cursor. Its tip is the element's origin, so moving it to a point puts
// the tip there.
export function Cursor() {
  return (
    <div data-cursor className="absolute left-0 top-0" style={{ opacity: 0 }}>
      <svg viewBox="0 0 18 20" className="absolute left-0 top-0 h-5 w-[18px] overflow-visible">
        <path
          d="M0 0V15.2L4.1 11.3L6.9 17.6L9.6 16.4L6.9 10.3H12.4Z"
          fill="currentColor"
          stroke="#fff"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className="absolute left-3.5 top-[18px] flex h-5 items-center whitespace-nowrap rounded-[4px] px-1.5 text-[12px] font-medium leading-none tracking-tight"
        style={{ background: "currentColor" }}
      >
        <span style={{ color: "#fff" }}>Inertia</span>
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The sample site. Each fix swaps one region from the dated version to the
// finished one: identity (logo, nav and the gradient), type, buttons, then
// the product shot, which stands up flat rather than swapping.

const DATED = {
  display: '"Trebuchet MS", "Lucida Grande", "Segoe UI", Arial, sans-serif',
  body: 'Verdana, Geneva, Tahoma, sans-serif',
  ink: "#1e1b4b",
  purple: "#7c3aed",
  gray: "#6b7280",
  grad: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
};
const CLEAN = {
  sans: "var(--font-satoshi), ui-sans-serif, system-ui, sans-serif",
  ink: "#111111",
  ink2: "#5c5c5c",
  accent: "#ff5c35",
};
const gradText: CSSProperties = {
  background: DATED.grad,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

// A region showing its dated or finished version. The outgoing one rises
// out and the incoming one rises in, the way changing text does elsewhere.
function Swap({ on, reduce, before, after }: { on: boolean; reduce: boolean; before: ReactNode; after: ReactNode }) {
  const t = reduce ? { duration: 0 } : SWAP;
  const shown = { opacity: 1, y: 0, filter: "blur(0px)" };
  return (
    <>
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={on ? { opacity: 0, y: -12, filter: "blur(6px)" } : shown}
        transition={t}
      >
        {before}
      </motion.div>
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={on ? shown : { opacity: 0, y: 12, filter: "blur(6px)" }}
        transition={t}
      >
        {after}
      </motion.div>
    </>
  );
}

function SampleSite({ variant, fixed, reduce }: { variant: Variant; fixed: number; reduce: boolean }) {
  const m = variant === "mobile";
  const t = reduce ? { duration: 0 } : SWAP;
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "#fff" }}>
      {/* The borrowed gradient goes with the identity fix. */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: fixed >= 1 ? 0 : 1 }}
        transition={t}
        style={{
          background:
            "radial-gradient(60% 50% at 12% 8%, rgb(124 58 237 / 0.22), transparent 70%), radial-gradient(50% 45% at 92% 18%, rgb(236 72 153 / 0.18), transparent 70%), radial-gradient(60% 40% at 50% 100%, rgb(124 58 237 / 0.14), transparent 70%)",
        }}
      />
      <Swap on={fixed >= 1} reduce={reduce} before={<DatedNav m={m} />} after={<CleanNav m={m} />} />
      <Swap on={fixed >= 2} reduce={reduce} before={<DatedHeroText m={m} />} after={<CleanHeroText m={m} />} />
      <Swap on={fixed >= 3} reduce={reduce} before={<DatedButtons m={m} />} after={<CleanButtons m={m} />} />
      <Shot m={m} on={fixed >= 4} reduce={reduce} />
    </div>
  );
}

function Chevron({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
      <path d="M4.5 2.5 8 6 4.5 9.5" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DatedNav({ m }: { m: boolean }) {
  const icon = m ? 28 : 34;
  return (
    <div className="absolute inset-x-0 top-0 flex items-center justify-between" style={{ height: m ? 60 : 76, padding: `0 ${m ? 18 : 48}px` }}>
      <span data-target="0" className="flex items-center" style={{ gap: m ? 8 : 10 }}>
        <span
          className="flex items-center justify-center"
          style={{ width: icon, height: icon, borderRadius: m ? 8 : 10, background: DATED.grad, boxShadow: "0 4px 12px rgb(124 58 237 / 0.35)" }}
        >
          <svg viewBox="0 0 24 24" width={icon * 0.56} height={icon * 0.56} fill="#fff">
            <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </span>
        <span style={{ fontFamily: DATED.display, fontSize: m ? 18 : 22, fontWeight: 700, color: DATED.ink }}>
          Your<span style={{ color: DATED.purple }}>Startup</span>
        </span>
      </span>
      {!m && (
        <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 gap-7" style={{ fontFamily: DATED.body, fontSize: 15, color: "#4b5563" }}>
          {["Home", "Features", "Solutions", "Pricing", "Resources", "About", "Contact"].map((l) => (
            <span key={l}>{l}</span>
          ))}
        </span>
      )}
      <span className="flex items-center" style={{ gap: m ? 10 : 12, fontFamily: DATED.display, fontWeight: 700 }}>
        {!m && (
          <span className="flex items-center" style={{ height: 38, padding: "0 16px", borderRadius: 4, boxShadow: `inset 0 0 0 1.5px ${DATED.purple}`, color: DATED.purple, fontSize: 14 }}>
            Log in
          </span>
        )}
        <span
          className="flex items-center"
          style={{
            height: m ? 34 : 40,
            padding: m ? "0 14px" : "0 20px",
            borderRadius: 999,
            background: DATED.grad,
            color: "#fff",
            fontSize: m ? 13 : 14,
            boxShadow: "0 6px 16px rgb(124 58 237 / 0.4)",
          }}
        >
          {m ? "Sign Up" : "Sign Up Free!"}
        </span>
        {m && (
          <svg viewBox="0 0 22 22" width="22" height="22" aria-hidden="true">
            <path d="M3 6h16M3 11h16M3 16h16" stroke={DATED.ink} strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        )}
      </span>
    </div>
  );
}

function Mark({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <rect width="24" height="24" rx="6" fill={CLEAN.ink} />
      <rect x="12" y="12" width="7" height="7" rx="1.5" fill={CLEAN.accent} />
    </svg>
  );
}

function CleanNav({ m }: { m: boolean }) {
  return (
    <div
      className="absolute inset-x-0 top-0 flex items-center justify-between"
      style={{ height: m ? 56 : 72, padding: `0 ${m ? 18 : 48}px`, fontFamily: CLEAN.sans, letterSpacing: "-0.01em" }}
    >
      <span className="flex items-center gap-2">
        <Mark size={m ? 20 : 22} />
        <span style={{ fontSize: m ? 17 : 19, fontWeight: 600, letterSpacing: "-0.045em", color: CLEAN.ink }}>yourstartup</span>
      </span>
      {!m && (
        <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 gap-8" style={{ fontSize: 14, color: CLEAN.ink2 }}>
          {["Product", "Pricing", "Customers"].map((l) => (
            <span key={l}>{l}</span>
          ))}
        </span>
      )}
      <span className="flex items-center gap-5" style={{ fontSize: m ? 13 : 14 }}>
        {!m && <span style={{ color: CLEAN.ink }}>Log in</span>}
        <span
          className="flex items-center leading-none"
          style={{ height: m ? 32 : 36, padding: "0 14px", borderRadius: 6, background: CLEAN.ink, color: "#fff", fontWeight: 500 }}
        >
          Start free
        </span>
      </span>
    </div>
  );
}

function DatedHeroText({ m }: { m: boolean }) {
  return (
    <div className="absolute inset-x-0 flex flex-col items-center text-center" style={{ top: m ? 88 : 112, padding: m ? "0 18px" : 0 }}>
      <span
        className="flex items-center gap-2"
        style={{ height: m ? 28 : 32, padding: "0 12px 0 4px", borderRadius: 999, background: "rgb(124 58 237 / 0.1)", boxShadow: "inset 0 0 0 1px rgb(124 58 237 / 0.25)" }}
      >
        <span
          className="flex items-center"
          style={{ height: m ? 20 : 24, padding: "0 8px", borderRadius: 999, background: DATED.grad, color: "#fff", fontFamily: DATED.body, fontSize: m ? 12 : 13, fontWeight: 700 }}
        >
          NEW
        </span>
        <span style={{ fontFamily: DATED.body, fontSize: m ? 12 : 13, color: "#6d28d9" }}>{m ? "AI Insights Are Here" : "AI-Powered Insights Are Here"}</span>
        <Chevron color="#6d28d9" />
      </span>
      <div
        data-target="1"
        style={{ marginTop: m ? 16 : 22, maxWidth: m ? "none" : 1000, fontFamily: DATED.display, fontSize: m ? 30 : 52, lineHeight: 1.15, fontWeight: 700, color: DATED.ink }}
      >
        The All-In-One Platform To <span style={gradText}>Supercharge</span> Your Team&apos;s Workflow
      </div>
      <div style={{ marginTop: m ? 14 : 18, maxWidth: m ? "none" : 720, fontFamily: DATED.body, fontSize: m ? 15 : 19, lineHeight: 1.6, color: DATED.gray }}>
        Streamline your processes and unlock your team&apos;s full potential with our powerful, easy-to-use solution.
      </div>
    </div>
  );
}

function CleanHeroText({ m }: { m: boolean }) {
  return (
    <div
      className="absolute inset-x-0 flex flex-col items-center text-center"
      style={{ top: m ? 92 : 124, padding: m ? "0 18px" : 0, fontFamily: CLEAN.sans }}
    >
      <span
        className="flex items-center gap-1.5 leading-none"
        style={{ height: m ? 26 : 28, padding: "0 8px 0 10px", borderRadius: 6, boxShadow: "inset 0 0 0 1px rgb(0 0 0 / 0.1)", fontSize: 13, color: CLEAN.ink2 }}
      >
        Insights are live
        <Chevron color="#9a9a9a" />
      </span>
      <div
        style={{
          marginTop: m ? 14 : 20,
          fontSize: m ? 36 : 64,
          lineHeight: 1.04,
          fontWeight: 500,
          letterSpacing: "-0.045em",
          color: CLEAN.ink,
          textWrap: "balance",
        }}
      >
        Your team&apos;s work, in one place.
      </div>
      <div style={{ marginTop: m ? 12 : 18, maxWidth: m ? 280 : "none", fontSize: m ? 15.5 : 18, lineHeight: 1.5, letterSpacing: "-0.01em", color: CLEAN.ink2 }}>
        Plan, track and ship together, without the busywork.
      </div>
    </div>
  );
}

function DatedButtons({ m }: { m: boolean }) {
  const primary: CSSProperties = {
    height: m ? 50 : 54,
    padding: "0 30px",
    borderRadius: 999,
    background: DATED.grad,
    color: "#fff",
    fontSize: 17,
    boxShadow: "0 10px 24px rgb(124 58 237 / 0.4)",
  };
  const secondary: CSSProperties = {
    height: m ? 46 : 48,
    padding: "0 22px",
    borderRadius: 4,
    background: "#fff",
    boxShadow: `inset 0 0 0 2px ${DATED.purple}`,
    color: DATED.purple,
    fontSize: 16,
  };
  return (
    <div className="absolute inset-x-0 flex justify-center" style={{ top: m ? 386 : 400, padding: m ? "0 18px" : 0 }}>
      <div
        data-target="2"
        className={`flex ${m ? "w-full flex-col items-stretch" : "items-center"}`}
        style={{ gap: m ? 0 : 14, fontFamily: DATED.display, fontWeight: 700 }}
      >
        <span className="flex items-center justify-center" style={primary}>
          Get Started Free
        </span>
        <span className="flex items-center justify-center" style={{ ...secondary, marginTop: m ? 10 : 0 }}>
          Book a Demo
        </span>
        <span className="flex items-center justify-center gap-2" style={{ height: m ? 36 : 48, marginTop: m ? 6 : 0, fontSize: m ? 14 : 15, color: DATED.ink }}>
          <span className="flex items-center justify-center rounded-full" style={{ width: m ? 26 : 32, height: m ? 26 : 32, background: "#fff", boxShadow: "0 2px 8px rgb(0 0 0 / 0.15)" }}>
            <svg viewBox="0 0 12 12" width={m ? 10 : 12} height={m ? 10 : 12} fill={DATED.purple} aria-hidden="true">
              <path d="M3 1.5v9l7.5-4.5z" />
            </svg>
          </span>
          Watch Video
        </span>
      </div>
    </div>
  );
}

function CleanButtons({ m }: { m: boolean }) {
  const base: CSSProperties = { height: 44, padding: "0 18px", borderRadius: 6, fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em" };
  return (
    <div className="absolute inset-x-0 flex justify-center" style={{ top: m ? 290 : 320, padding: m ? "0 18px" : 0, fontFamily: CLEAN.sans }}>
      <div className={`flex ${m ? "w-full" : ""}`} style={{ gap: m ? 8 : 12 }}>
        <span className={`flex items-center justify-center leading-none ${m ? "flex-1" : ""}`} style={{ ...base, background: CLEAN.ink, color: "#fff" }}>
          Start free
        </span>
        <span
          className={`flex items-center justify-center leading-none ${m ? "flex-1" : ""}`}
          style={{ ...base, boxShadow: "inset 0 0 0 1px rgb(0 0 0 / 0.12)", color: CLEAN.ink }}
        >
          Book a demo
        </span>
      </div>
    </div>
  );
}

// The product shot is one object through both versions: it stands up from
// the tilt, squares its corners and moves up under the tighter hero, while
// its screen changes from the dashboard to the product.
function Shot({ m, on, reduce }: { m: boolean; on: boolean; reduce: boolean }) {
  const w = m ? 324 : 980;
  const lift = m ? -190 : -86;
  return (
    <motion.div
      data-target="3"
      className="absolute overflow-hidden"
      style={{
        left: (m ? 360 : 1200) / 2 - w / 2,
        top: m ? 552 : 498,
        width: w,
        height: m ? 360 : 460,
        background: "#fff",
        transformPerspective: 1400,
        transformOrigin: "50% 0%",
      }}
      initial={false}
      animate={
        on
          ? { rotateX: 0, y: lift, borderRadius: 6, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08), 0 24px 48px -16px rgba(0,0,0,0.18)" }
          : { rotateX: 26, y: 0, borderRadius: 16, boxShadow: "inset 0 0 0 1px rgba(124,58,237,0.25), 0 40px 80px -20px rgba(124,58,237,0.45)" }
      }
      transition={reduce ? { duration: 0 } : { ...spring.scene, duration: 1.1 }}
    >
      <motion.div className="absolute inset-0" initial={false} animate={{ opacity: on ? 0 : 1 }} transition={reduce ? { duration: 0 } : SWAP}>
        <DatedScreen m={m} />
      </motion.div>
      <motion.div className="absolute inset-0" initial={false} animate={{ opacity: on ? 1 : 0 }} transition={reduce ? { duration: 0 } : SWAP}>
        <CleanScreen m={m} />
      </motion.div>
    </motion.div>
  );
}

function DatedScreen({ m }: { m: boolean }) {
  const kpis = [
    { label: "Total Users", value: "12,480", color: "#22c55e" },
    { label: "Growth", value: "+38%", color: "#f97316" },
    { label: "Revenue", value: "$94K", color: "#3b82f6" },
  ].slice(0, m ? 2 : 3);
  const bars = [62, 80, 45, 90, 70, 100, 55, 85, 66, 95, 50, 78];
  const colors = ["#7c3aed", "#ec4899", "#f97316", "#22c55e", "#3b82f6", "#eab308"];
  return (
    <div className="absolute inset-0" style={{ background: "#faf5ff", fontFamily: DATED.display }}>
      <div className="flex items-center justify-between" style={{ height: m ? 40 : 52, padding: m ? "0 14px" : "0 22px", background: DATED.grad }}>
        <span style={{ color: "#fff", fontSize: m ? 13 : 16, fontWeight: 700 }}>Dashboard</span>
        <span className="rounded-full" style={{ width: m ? 22 : 28, height: m ? 22 : 28, background: "rgb(255 255 255 / 0.5)" }} />
      </div>
      <div style={{ padding: m ? 14 : 24 }}>
        <div className="grid" style={{ gridTemplateColumns: `repeat(${kpis.length}, 1fr)`, gap: m ? 10 : 16 }}>
          {kpis.map((k) => (
            <div key={k.label} style={{ height: m ? 84 : 110, padding: m ? 12 : 18, borderRadius: 14, background: "#fff", boxShadow: "0 6px 18px rgb(124 58 237 / 0.12)" }}>
              <div className="flex items-center gap-2">
                <span className="rounded-full" style={{ width: m ? 20 : 30, height: m ? 20 : 30, background: k.color, opacity: 0.85 }} />
                <span style={{ fontSize: m ? 11 : 13, color: DATED.gray }}>{k.label}</span>
              </div>
              <div style={{ marginTop: m ? 8 : 14, fontSize: m ? 20 : 28, fontWeight: 700, color: DATED.ink }}>{k.value}</div>
            </div>
          ))}
        </div>
        <div className="flex items-end" style={{ marginTop: m ? 10 : 16, height: m ? 150 : 220, padding: m ? 12 : 20, gap: m ? 6 : 14, borderRadius: 14, background: "#fff", boxShadow: "0 6px 18px rgb(124 58 237 / 0.12)" }}>
          {bars.slice(0, m ? 8 : 12).map((h, i) => (
            <span key={i} className="flex-1" style={{ height: `${h}%`, borderRadius: 6, background: colors[i % colors.length] }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CleanScreen({ m }: { m: boolean }) {
  const rows = [
    { title: "Onboarding checklist", status: "In progress", live: true },
    { title: "Usage-based billing", status: "Planned" },
    { title: "Slack integration", status: "Shipped" },
    { title: "Team permissions", status: "Planned" },
    { title: "Audit log", status: "Planned" },
    { title: "SSO", status: "Planned" },
  ];
  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: "#fff", fontFamily: CLEAN.sans, letterSpacing: "-0.01em" }}>
      <div className="flex shrink-0 items-center justify-between" style={{ height: m ? 40 : 44, padding: m ? "0 14px" : "0 16px", boxShadow: "inset 0 -1px 0 rgb(0 0 0 / 0.06)" }}>
        <span className="flex items-center gap-2" style={{ fontSize: m ? 13 : 14, fontWeight: 500, color: CLEAN.ink }}>
          <Mark size={16} />
          Roadmap
        </span>
        <span className="flex items-center leading-none" style={{ height: 28, padding: "0 10px", borderRadius: 4, background: CLEAN.ink, color: "#fff", fontSize: 13, fontWeight: 500 }}>
          New
        </span>
      </div>
      <div className="flex min-h-0 flex-1">
        {!m && (
          <div className="flex shrink-0 flex-col gap-0.5" style={{ width: 200, padding: 12, background: "#fafafa", boxShadow: "inset -1px 0 0 rgb(0 0 0 / 0.06)" }}>
            {["Inbox", "Roadmap", "Projects", "Team", "Settings"].map((l) => (
              <span
                key={l}
                className="flex items-center leading-none"
                style={{ height: 32, padding: "0 10px", borderRadius: 4, fontSize: 13.5, color: l === "Roadmap" ? CLEAN.ink : CLEAN.ink2, background: l === "Roadmap" ? "#ececec" : "transparent" }}
              >
                {l}
              </span>
            ))}
          </div>
        )}
        <div className="min-w-0 flex-1" style={{ padding: m ? "16px 14px" : "22px 28px" }}>
          <div style={{ fontSize: m ? 17 : 20, fontWeight: 500, letterSpacing: "-0.03em", color: CLEAN.ink }}>Q4 roadmap</div>
          <div className="flex flex-col" style={{ marginTop: m ? 10 : 14 }}>
            {rows.slice(0, m ? 5 : 6).map((r) => (
              <div key={r.title} className="flex items-center justify-between" style={{ height: m ? 40 : 44 }}>
                <span className="flex items-center gap-3" style={{ fontSize: m ? 13.5 : 14, color: CLEAN.ink }}>
                  <span
                    className="rounded-full"
                    style={{ width: 10, height: 10, background: r.live ? CLEAN.accent : "transparent", boxShadow: r.live ? "none" : "inset 0 0 0 1.5px #c4c4c4" }}
                  />
                  {r.title}
                </span>
                <span className="flex items-center leading-none" style={{ height: 24, padding: "0 8px", borderRadius: 4, background: "#f4f4f4", fontSize: 12.5, color: CLEAN.ink2 }}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
