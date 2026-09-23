"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2Icon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ACTION_RADIUS_CLASS } from "@/lib/cta-chrome";

/* A small line drawing of the dashboard itself: sidebar, one row lit up
   the way the tour will light it, and the content area as quiet skeleton
   lines. It previews what "Take the tour" does rather than decorating. */
function DashboardSketch() {
  const rows = [0, 1, 2, 3, 4];
  return (
    <div
      aria-hidden
      className="relative -mx-4 -mt-4 mb-1 h-40 overflow-hidden rounded-t-xl border-b"
      style={{ backgroundColor: "var(--sh-sidebar)" }}
    >
      <svg viewBox="0 0 240 160" className="absolute inset-0 h-full w-full" fill="none">
        {/* window */}
        <rect x="30" y="22" width="180" height="124" rx="7" fill="var(--sh-background)" stroke="var(--sh-border)" />
        {/* sidebar */}
        <line x1="84" y1="22" x2="84" y2="146" stroke="var(--sh-border)" />
        <rect x="40" y="32" width="22" height="5" rx="2.5" fill="var(--sh-foreground)" fillOpacity="0.5" />
        {rows.map((i) => (
          <rect
            key={i}
            x="40"
            y={50 + i * 14}
            width={i === 2 ? 36 : 30 - (i % 2) * 6}
            height="4"
            rx="2"
            fill="var(--sh-muted-foreground)"
            fillOpacity={i === 2 ? 0 : 0.35}
          />
        ))}
        {/* the highlighted row, with a spotlight ring */}
        <rect x="36" y="74" width="44" height="12" rx="4" fill="var(--sh-primary)" fillOpacity="0.14" />
        <rect x="33.5" y="71.5" width="49" height="17" rx="6" stroke="var(--sh-primary)" strokeOpacity="0.55" />
        <rect x="40" y="78" width="30" height="4" rx="2" fill="var(--sh-primary)" fillOpacity="0.9" />
        {/* callout card pointing at it */}
        <path d="M86 80 L94 76 L94 84 Z" fill="var(--sh-popover)" stroke="var(--sh-border)" strokeLinejoin="round" />
        <rect x="93" y="62" width="70" height="36" rx="5" fill="var(--sh-popover)" stroke="var(--sh-border)" />
        <rect x="101" y="70" width="34" height="4" rx="2" fill="var(--sh-foreground)" fillOpacity="0.6" />
        <rect x="101" y="79" width="52" height="3" rx="1.5" fill="var(--sh-muted-foreground)" fillOpacity="0.4" />
        <rect x="101" y="86" width="40" height="3" rx="1.5" fill="var(--sh-muted-foreground)" fillOpacity="0.4" />
        {/* content skeleton */}
        <rect x="176" y="32" width="24" height="5" rx="2.5" fill="var(--sh-muted-foreground)" fillOpacity="0.25" />
        <rect x="96" y="110" width="48" height="26" rx="4" stroke="var(--sh-border)" />
        <rect x="152" y="110" width="48" height="26" rx="4" stroke="var(--sh-border)" />
      </svg>
    </div>
  );
}

export function WelcomeDialog({ open, onOpenChange, firstName, onStartTour }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  firstName?: string;
  onStartTour: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm text-center" showCloseButton={false}>
        <DashboardSketch />
        <DialogHeader className="items-center">
          <DialogTitle className="text-[1.4rem] font-semibold tracking-[-0.03em]">
            Welcome{firstName ? `, ${firstName}` : ""}
          </DialogTitle>
          <DialogDescription className="text-[13.5px] tracking-tight leading-relaxed max-w-[18rem]">
            Everything you have with Inertia lives here. Want a quick look around?
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="lg" className={ACTION_RADIUS_CLASS} onClick={() => onOpenChange(false)}>
            Skip
          </Button>
          <Button
            size="lg"
            className={ACTION_RADIUS_CLASS}
            onClick={() => {
              onOpenChange(false);
              onStartTour();
            }}
          >
            Take the tour
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const START_EVENT = "dashboard:tour-start";

// Opens the tour from anywhere in the dashboard (welcome dialog, account
// menus). The tour itself lives in the shell so it survives page changes.
export function startDashboardTour() {
  window.dispatchEvent(new Event(START_EVENT));
}

type TourStep = {
  // Sidebar row for the page (data-tour="<page>" in client-sidebar-shell.tsx),
  // spotlit instead when the page element below isn't there.
  page: string;
  href: string;
  // data-tour="<target>" on an element inside the page itself.
  target: string;
  title: string;
  body: string;
};

// Each step opens its page and points at the thing on it that matters most.
const STEPS: TourStep[] = [
  { page: "overview", href: "/dashboard", target: "overview-actions", title: "Your shortcuts", body: "Whatever needs doing next, like paying an invoice or replying to support, shows up here as a shortcut." },
  { page: "overview", href: "/dashboard", target: "overview-summary", title: "Everything at a glance", body: "Your projects, balance, files and support cases. Click any card to jump to it." },
  { page: "projects", href: "/dashboard/projects", target: "projects-list", title: "Projects", body: "Each project shows its status and target date. Open one to follow its timeline and updates." },
  { page: "licenses", href: "/dashboard/licenses", target: "licenses-list", title: "Licenses", body: "Your Aether license key and the store it's linked to. Open a license to download the theme and every new version." },
  { page: "support", href: "/dashboard/support", target: "support-new", title: "Get help", body: "Start a new case whenever you need us. We reply right here." },
  { page: "support", href: "/dashboard/support", target: "support-list", title: "Your cases", body: "Every conversation with us, with its status. A badge in the menu shows when there's a new reply." },
  { page: "invoices", href: "/dashboard/invoices", target: "invoices-list", title: "Invoices", body: "See what you owe and what's paid. Unpaid invoices have a Pay button right in the row." },
];

const PAD = 6;
const CARD_W = 300;
const GAP = 14;
const EDGE = 16;
// Mobile keeps clear of the fixed bottom nav dock.
const DOCK_CLEARANCE = 88;
const FIND_TIMEOUT_MS = 2500;

type Rect = { top: number; left: number; width: number; height: number };

function findVisible(name: string): HTMLElement | null {
  const el = document.querySelector<HTMLElement>(`[data-tour="${name}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  // Hidden (the sidebar is display:none on mobile) measures as zero.
  return r.width === 0 || r.height === 0 ? null : el;
}

function toRect(el: HTMLElement): Rect {
  const r = el.getBoundingClientRect();
  return { top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 };
}

// Beside the highlight when there's room (sidebar rows), otherwise below or
// above it, otherwise pinned to the bottom of the screen.
function placeCard(rect: Rect | null, cardH: number): React.CSSProperties {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const bottomLimit = vw < 768 ? vh - DOCK_CLEARANCE : vh - EDGE;
  const width = Math.min(CARD_W, vw - EDGE * 2);
  const clampLeft = (x: number) => Math.max(EDGE, Math.min(x, vw - width - EDGE));
  const clampTop = (y: number) => Math.max(EDGE, Math.min(y, bottomLimit - cardH));

  if (!rect) return { width, left: (vw - width) / 2, top: bottomLimit - cardH };

  const right = rect.left + rect.width + GAP;
  if (right + width <= vw - EDGE) {
    return { width, left: right, top: clampTop(rect.top + rect.height / 2 - cardH / 2) };
  }
  const below = rect.top + rect.height + GAP;
  if (below + cardH <= bottomLimit) return { width, left: clampLeft(rect.left), top: below };
  const above = rect.top - GAP - cardH;
  if (above >= EDGE) return { width, left: clampLeft(rect.left), top: above };
  return { width, left: clampLeft(rect.left), top: bottomLimit - cardH };
}

type Pos = { left: number; top: number; width: number };

// "finding": waiting for the step's element to render.
// "settling": found, scrolling it into view.
// "ready": spotlit.
type Phase = "finding" | "settling" | "ready";

// Moves longer than this fade out and back in at the new spot rather than
// sliding across the screen.
const FADE_DISTANCE = 220;
const SLIDE = "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)";
const SPOT_EASE = "420ms cubic-bezier(0.22, 1, 0.36, 1)";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Page changes cross-fade: the dashboard's content area fades out before
// navigating and back in once the next page's highlight is found, so pages
// don't swap under the spotlight in a single frame.
const PAGE_OUT_MS = 180;
const PAGE_IN_MS = 320;

function pageContent() {
  return document.querySelector<HTMLElement>("[data-tour-page]");
}

function fadePage(visible: boolean) {
  const main = pageContent();
  if (!main) return;
  if (visible && main.style.opacity !== "0") return;
  main.style.transition = `opacity ${visible ? PAGE_IN_MS : PAGE_OUT_MS}ms ease`;
  main.style.opacity = visible ? "1" : "0";
}

function resetPage() {
  const main = pageContent();
  if (!main) return;
  main.style.transition = "";
  main.style.opacity = "";
}

export function DashboardTour() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [phase, setPhase] = useState<Phase>("finding");
  // animate: false for updates driven by scroll or resize, so the spotlight
  // and card track the page exactly instead of easing after it.
  const [spot, setSpot] = useState<{ rect: Rect; animate: boolean } | null>(null);
  const animateNextRef = useRef(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardH, setCardH] = useState(170);
  const [pos, setPos] = useState<Pos | null>(null);
  const [cardShown, setCardShown] = useState(true);
  const [slide, setSlide] = useState(false);

  const step = STEPS[index];
  const last = index === STEPS.length - 1;
  const onPage = pathname === step.href;
  const loading = open && (!onPage || phase === "finding");
  const busy = open && (!onPage || phase !== "ready");

  useEffect(() => {
    const start = () => {
      setIndex(0);
      setPos(null);
      setOpen(true);
    };
    window.addEventListener(START_EVENT, start);
    return () => window.removeEventListener(START_EVENT, start);
  }, []);

  useEffect(() => {
    if (!open || pathname === step.href) return;
    // Leaving the page: the old element is about to unmount.
    setAnchor(null);
    if (prefersReducedMotion()) {
      router.push(step.href);
      return;
    }
    fadePage(false);
    const t = setTimeout(() => router.push(step.href), PAGE_OUT_MS);
    return () => clearTimeout(t);
    // Only on step changes: following pathname here would fight the user if
    // a page redirects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step.href]);

  // Once on the right page, wait for the step's element to render (page data
  // streams in after navigation), scroll it into view and let the scroll
  // finish, then spotlight it. If it never shows (empty page, or hidden at
  // this size) fall back to the page's sidebar row, or no spotlight on mobile.
  useEffect(() => {
    if (!open || !onPage) return;
    setPhase("finding");
    const started = performance.now();
    let frame = 0;

    const settle = (el: HTMLElement | null) => {
      setPhase("settling");
      fadePage(true);
      if (!el) {
        setAnchor(null);
        setPhase("ready");
        return;
      }
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const bottomLimit = window.innerWidth < 768 ? vh - DOCK_CLEARANCE : vh - EDGE;
      if (r.top < EDGE || r.bottom > bottomLimit) {
        el.scrollIntoView({
          block: r.height > vh * 0.6 ? "start" : "center",
          behavior: prefersReducedMotion() ? "auto" : "smooth",
        });
      }
      let lastTop = Number.NaN;
      let stableFrames = 0;
      const settledAt = performance.now();
      const wait = () => {
        const top = el.getBoundingClientRect().top;
        stableFrames = Math.abs(top - lastTop) < 0.5 ? stableFrames + 1 : 0;
        lastTop = top;
        if (stableFrames >= 3 || performance.now() - settledAt > 900) {
          animateNextRef.current = true;
          setAnchor(el);
          setPhase("ready");
          return;
        }
        frame = requestAnimationFrame(wait);
      };
      wait();
    };

    const look = () => {
      const el = findVisible(step.target);
      if (el) return settle(el);
      if (performance.now() - started > FIND_TIMEOUT_MS) return settle(findVisible(step.page));
      frame = requestAnimationFrame(look);
    };
    look();
    return () => cancelAnimationFrame(frame);
  }, [open, onPage, step.target, step.page]);

  // Follow the anchor. The first measurement after a new anchor animates;
  // everything after it (scroll, resize) tracks instantly.
  useLayoutEffect(() => {
    if (!open || !anchor) {
      setSpot(null);
      return;
    }
    const sync = () => {
      setSpot({ rect: toRect(anchor), animate: animateNextRef.current });
      animateNextRef.current = false;
    };
    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
    };
  }, [open, anchor]);

  // The card's height changes with its copy; placement needs the real value.
  useLayoutEffect(() => {
    const h = cardRef.current?.offsetHeight;
    if (h && h !== cardH) setCardH(h);
  });

  // Card placement. Holds still while a page loads (no detour to the
  // fallback spot and back), slides for short moves, and fades out and back
  // in for long ones.
  useLayoutEffect(() => {
    if (!open) return;
    const rect = spot?.rect ?? null;
    if (!rect && busy && pos) return;
    const target = placeCard(rect, cardH) as Pos;
    if (!pos) {
      setSlide(false);
      setPos(target);
      return;
    }
    const dist = Math.hypot(target.left - pos.left, target.top - pos.top);
    if (dist < 0.5 && target.width === pos.width) return;
    if (!spot?.animate || prefersReducedMotion()) {
      setSlide(false);
      setCardShown(true);
      setPos(target);
      return;
    }
    if (dist > FADE_DISTANCE) {
      setCardShown(false);
      const t = setTimeout(() => {
        setSlide(false);
        setPos(target);
        requestAnimationFrame(() => setCardShown(true));
      }, 140);
      return () => clearTimeout(t);
    }
    setSlide(true);
    setCardShown(true);
    setPos(target);
    // pos is the previous placement being moved from, not an input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, spot, cardH, busy]);

  const close = useCallback(() => {
    resetPage();
    setOpen(false);
    setIndex(0);
    setAnchor(null);
    setPos(null);
  }, []);

  const next = useCallback(() => {
    if (busy) return;
    if (last) close();
    else setIndex((i) => i + 1);
  }, [busy, last, close]);

  const back = useCallback(() => {
    if (busy) return;
    setIndex((i) => Math.max(0, i - 1));
  }, [busy]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, next, back]);

  if (!open) return null;

  const rect = spot?.rect ?? null;
  const spotMotion = spot?.animate
    ? `top ${SPOT_EASE}, left ${SPOT_EASE}, width ${SPOT_EASE}, height ${SPOT_EASE}, opacity 200ms ease`
    : "opacity 200ms ease";
  const pageName = step.page.charAt(0).toUpperCase() + step.page.slice(1);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Dashboard tour">
      {/* Full dim while nothing is spotlit, so the page behind never flashes
          undimmed between steps. */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity duration-200 motion-reduce:transition-none"
        style={{ opacity: rect ? 0 : 1 }}
      />
      <div
        className="pointer-events-none fixed rounded-[10px] ring-1 ring-[var(--sh-primary)]/60 motion-reduce:transition-none"
        style={{
          ...(rect ?? { top: 0, left: 0, width: 0, height: 0 }),
          opacity: rect ? 1 : 0,
          boxShadow: "0 0 0 9999px rgb(0 0 0 / 0.4)",
          transition: spotMotion,
        }}
      />
      {/* Clicks on the dimmed page are swallowed so the tour can't be half
          left behind; Skip, Esc or finishing are the ways out. */}
      <div className="fixed inset-0" onClick={(e) => e.stopPropagation()} />

      <div
        ref={cardRef}
        className="fixed left-0 top-0 rounded-xl border bg-popover p-4 text-left text-popover-foreground shadow-xl will-change-transform motion-reduce:transition-none"
        style={{
          width: pos?.width ?? CARD_W,
          transform: pos ? `translate3d(${pos.left}px, ${pos.top}px, 0)` : undefined,
          visibility: pos ? "visible" : "hidden",
          opacity: cardShown ? 1 : 0,
          transition: `${slide ? `${SLIDE}, ` : ""}opacity 140ms ease`,
        }}
        aria-busy={busy}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-[12px] tabular-nums tracking-tight text-muted-foreground">
            {index + 1} of {STEPS.length}
          </span>
          <button
            type="button"
            onClick={close}
            aria-label="Skip tour"
            className="-mr-1 flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <XIcon className="size-3.5" />
          </button>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 py-3 text-[13.5px] tracking-tight text-muted-foreground animate-in fade-in-0 duration-200" role="status">
            <Loader2Icon className="size-4 animate-spin" />
            Opening {pageName}…
          </div>
        ) : (
          <div key={index} className="animate-in fade-in-0 duration-300">
            <p className="mt-1.5 text-[15px] font-semibold tracking-tight">{step.title}</p>
            <p className="mt-1 text-[13.5px] leading-relaxed tracking-tight text-muted-foreground">{step.body}</p>
          </div>
        )}
        <div className="mt-4 flex items-center justify-end gap-2">
          {index > 0 && (
            <Button variant="outline" size="sm" className={ACTION_RADIUS_CLASS} onClick={back} disabled={busy}>
              Back
            </Button>
          )}
          <Button size="sm" className={ACTION_RADIUS_CLASS} onClick={next} disabled={busy}>
            {last ? "Done" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
