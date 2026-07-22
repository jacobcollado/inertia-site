"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useCallback, useEffect } from "react";
import { ThemeToggle } from "./theme-toggle";
import { HeaderAuth } from "./dashboard/header-auth";
import { TOC_ITEMS } from "./components/shared";
import { useWebHaptics } from "web-haptics/react";
import { SiShopify } from "react-icons/si";
import {
  HiOutlineSparkles,
  HiOutlineChatBubbleLeftRight,
  HiOutlineNewspaper,
  HiOutlineBookOpen,
  HiOutlineClipboardDocumentList,
  HiOutlineBuildingOffice,
  HiOutlinePuzzlePiece,
  HiOutlineQuestionMarkCircle,
  HiOutlineShieldCheck,
  HiOutlineSwatch,
  HiOutlineUser,
} from "react-icons/hi2";

const CAL_LINK = "https://cal.com/jacob-c-99otvp/15min";

type Child = {
  label: string;
  description: string;
  href?: string;
  disabled?: boolean;
  icon: React.ReactNode;
  external?: boolean;
};

type NavItem = {
  label: string;
  children?: Child[];
  href?: string;
  external?: boolean;
};

const NAV: NavItem[] = [
  {
    label: "Products",
    children: [
      { label: "Aether theme", description: "One-time purchase, lifetime updates.", href: "/aether", icon: <SiShopify /> },
      { label: "Live demo", description: "See Aether running on a real store.", href: "https://aether-starter.myshopify.com", icon: <HiOutlineSparkles />, external: true },
      { label: "Commercial", description: "Licensing for agencies and studios building client stores.", href: "/aether/commercial", icon: <HiOutlineBuildingOffice /> },
      { label: "Add-ons", description: "Extend your theme with optional modules.", disabled: true, icon: <HiOutlinePuzzlePiece /> },
    ],
  },
  {
    label: "Work",
    children: [
      { label: "Work with us", description: "Custom builds, shipped on time.", href: CAL_LINK, icon: <HiOutlineChatBubbleLeftRight />, external: true },
      { label: "Shipped using Inertia", description: "Real stores built on our themes.", href: "/work", icon: <HiOutlineSparkles /> },
    ],
  },
  {
    label: "Resources",
    children: [
      { label: "Blog", description: "Thoughts on building things that work.", href: "/blog", icon: <HiOutlineNewspaper /> },
      { label: "Docs", description: "Guides, references, and how-tos.", href: "/docs", icon: <HiOutlineBookOpen /> },
      { label: "Changelog", description: "Every update, documented.", href: "/aether/changelog", icon: <HiOutlineClipboardDocumentList /> },
      { label: "Components", description: "The design system this site is built from.", href: "/components", icon: <HiOutlineSwatch /> },
    ],
  },
  {
    label: "Company",
    children: [
      { label: "Help", description: "Get support for anything we've shipped.", href: CAL_LINK, icon: <HiOutlineQuestionMarkCircle />, external: true },
      { label: "Policies", description: "Terms, licenses, and policies.", href: "/policies", icon: <HiOutlineShieldCheck /> },
    ],
  },
  { label: "Contact", href: CAL_LINK, external: true },
];

/* ── Desktop mega menu ───────────────────────────────────────────── */

function DropdownItem({ child, onClose, index, stagger }: { child: Child; onClose: () => void; index?: number; stagger?: boolean }) {
  // When the menu's content swaps, each item eases in with a small per-item
  // delay so the new links cascade rather than appearing all at once.
  const animStyle: React.CSSProperties = stagger
    ? { animation: `dropdown-item-in 420ms cubic-bezier(0.22,1,0.36,1) ${(index ?? 0) * 45}ms both` }
    : {};

  const inner = (
    <>
      <span className="site-header__dropdown-icon" aria-hidden="true">{child.icon}</span>
      <span className="site-header__dropdown-text">
        <span className="site-header__dropdown-label">
          {child.label}
          {child.disabled && <span className="site-header__soon">soon</span>}
          {child.external && <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10, opacity: 0.4, flexShrink: 0 }}><path d="M4 12L12 4M7 4h5v5"/></svg>}
        </span>
        {child.description && <span className="site-header__dropdown-desc">{child.description}</span>}
      </span>
    </>
  );

  if (child.disabled) return (
    <span className="site-header__dropdown-item site-header__dropdown-item--disabled" style={animStyle}>{inner}</span>
  );
  if (child.external) return (
    <a href={child.href} target="_blank" rel="noreferrer" className="site-header__dropdown-item" style={animStyle}>{inner}</a>
  );
  return (
    <Link href={child.href!} className="site-header__dropdown-item" onClick={onClose} style={animStyle}>{inner}</Link>
  );
}

function NavTrigger({
  item,
  index,
  openIndex,
  onEnter,
  onLeave,
  triggerRef,
}: {
  item: NavItem;
  index: number;
  openIndex: number | null;
  onEnter: (i: number) => void;
  onLeave: () => void;
  triggerRef: (el: HTMLDivElement | null) => void;
}) {
  const open = openIndex === index;

  if (item.href) {
    return (
      <div className="site-header__menu-root" ref={triggerRef}>
        <Link
          href={item.href}
          target={item.external ? "_blank" : undefined}
          rel={item.external ? "noreferrer" : undefined}
          className="site-header__link site-header__link--pricing"
        >
          {item.label}
        </Link>
      </div>
    );
  }

  return (
    <div
      className="site-header__menu-root"
      onMouseEnter={() => onEnter(index)}
      onMouseLeave={onLeave}
      ref={triggerRef}
    >
      <button
        className="site-header__link"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {item.label}
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
          className="site-header__chevron" aria-hidden="true"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <polyline points="2 4 6 8 10 4" />
        </svg>
      </button>
    </div>
  );
}

function DropdownContent({ phase, enterX, style, item, onClose }: {
  phase: "idle" | "exit" | "enter";
  enterX: number;
  style: React.CSSProperties;
  item: NavItem | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase !== "enter") return;
    const el = ref.current;
    if (!el) return;
    // Slide the block in from the travel direction. Opacity/blur is handled
    // per-item (staggered) so the links cascade in instead of popping together.
    el.style.transition = "none";
    el.style.transform = `translateX(${enterX}px)`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = "";
        el.style.transform = "";
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", width: "100%", ...style }}>
      {item?.children?.map((child, i) => (
        <DropdownItem key={child.label} child={child} onClose={onClose} index={i} stagger={phase === "enter"} />
      ))}
    </div>
  );
}

function SharedDropdown({
  openIndex,
  triggerEls,
  navRef,
  onLeave,
  onEnter,
  onClose,
}: {
  openIndex: number | null;
  triggerEls: (HTMLDivElement | null)[];
  navRef: React.RefObject<HTMLElement | null>;
  onLeave: () => void;
  onEnter: () => void;
  onClose: () => void;
}) {
  const isOpen = openIndex !== null;
  const item = openIndex !== null ? NAV[openIndex] : null;
  const prevItemRef = useRef<NavItem | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tabRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const prevOpenIndex = useRef<number | null>(null);

  // Keyed content for exit/enter animation
  const [contentKey, setContentKey] = useState(0);
  const [visibleItem, setVisibleItem] = useState<NavItem | null>(null);
  const [contentPhase, setContentPhase] = useState<"idle" | "exit" | "enter">("idle");
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = moving right, -1 = moving left
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visibleIndexRef = useRef<number | null>(null);

  // Keep rendering last item while closing so content doesn't vanish mid-fade
  const displayItem = item ?? prevItemRef.current;
  if (item) prevItemRef.current = item;

  // Drive content exit → swap → enter when sliding between items
  useEffect(() => {
    if (openIndex === null) {
      setContentPhase("idle");
      return;
    }
    const incoming = NAV[openIndex];
    if (visibleItem === null) {
      // First open — no exit needed
      setVisibleItem(incoming);
      visibleIndexRef.current = openIndex;
      setContentPhase("enter");
      setContentKey(k => k + 1);
      return;
    }
    if (visibleItem === incoming) return;

    const dir = visibleIndexRef.current !== null && openIndex > visibleIndexRef.current ? 1 : -1;
    setDirection(dir);

    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    setContentPhase("exit");
    phaseTimerRef.current = setTimeout(() => {
      setVisibleItem(incoming);
      visibleIndexRef.current = openIndex;
      setContentKey(k => k + 1);
      setContentPhase("enter");
    }, 230);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIndex]);

  // Clear visibleItem when panel fully closes
  useEffect(() => {
    if (!isOpen) {
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
      setContentPhase("idle");
      setVisibleItem(null);
      visibleIndexRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    const panel = panelRef.current;
    const tab = tabRef.current;
    if (!panel) return;

    if (openIndex === null) {
      panel.style.width = "0px";
      panel.style.height = "0px";
      if (tab) tab.removeAttribute("data-open");
      prevOpenIndex.current = null;
      return;
    }

    const trigger = triggerEls[openIndex];
    const nav = navRef.current;
    if (!trigger || !nav || !measureRef.current) return;

    const navRect = nav.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    const newLeft = triggerRect.left - navRect.left;
    const triggerWidth = triggerRect.width;
    const isSliding = prevOpenIndex.current !== null && prevOpenIndex.current !== openIndex;

    prevOpenIndex.current = openIndex;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const { offsetWidth: w, offsetHeight: h } = measureRef.current;

    if (isSliding) {
      // Sliding between menus — panel AND tab animate left/width together.
      panel.style.transition = "left 460ms cubic-bezier(0.22,1,0.36,1), width 460ms cubic-bezier(0.22,1,0.36,1), height 460ms cubic-bezier(0.22,1,0.36,1), opacity 320ms cubic-bezier(0.22,1,0.36,1), transform 460ms cubic-bezier(0.22,1,0.36,1)";
      if (tab) tab.style.transition = "left 460ms cubic-bezier(0.22,1,0.36,1), width 460ms cubic-bezier(0.22,1,0.36,1)";
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => {
          if (!panelRef.current) return;
          panelRef.current.style.left = `${newLeft}px`;
          panelRef.current.style.width = `${w}px`;
          panelRef.current.style.height = `${h}px`;
          if (tabRef.current) {
            tabRef.current.style.left = `${newLeft}px`;
            tabRef.current.style.width = `${triggerWidth}px`;
          }
        });
      });
    } else {
      // First open — size panel + tab instantly, then fade/slide both in
      // together as one connected shape.
      panel.style.transition = "none";
      panel.style.left = `${newLeft}px`;
      panel.style.width = `${w}px`;
      panel.style.height = `${h}px`;
      if (tab) {
        tab.style.transition = "none";
        tab.style.left = `${newLeft}px`;
        tab.style.width = `${triggerWidth}px`;
      }

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => {
          if (!panelRef.current) return;
          panelRef.current.style.transition = "opacity 180ms cubic-bezier(0.22,1,0.36,1), transform 220ms cubic-bezier(0.22,1,0.36,1)";
          if (tabRef.current) {
            tabRef.current.style.transition = "opacity 180ms cubic-bezier(0.22,1,0.36,1), transform 220ms cubic-bezier(0.22,1,0.36,1)";
            // Reveal on the SAME frame the panel opens, so tab + menu sync.
            tabRef.current.setAttribute("data-open", "true");
          }
        });
      });
    }
  }, [openIndex, triggerEls, navRef]);

  const exitX = direction * 16;
  const enterX = direction * -12;
  const contentStyle: React.CSSProperties = contentPhase === "exit"
    ? {
        opacity: 0,
        transform: `translateX(${exitX}px)`,
        filter: "blur(5px)",
        transition: "opacity 300ms cubic-bezier(0.4,0,0.2,1), transform 300ms cubic-bezier(0.4,0,0.2,1), filter 300ms cubic-bezier(0.4,0,0.2,1)",
      }
    : contentPhase === "enter"
    ? {
        opacity: 1,
        transform: "translateX(0)",
        filter: "blur(0px)",
        transition: "opacity 520ms cubic-bezier(0.22,1,0.36,1), transform 560ms cubic-bezier(0.22,1,0.36,1), filter 520ms cubic-bezier(0.22,1,0.36,1)",
      }
    : {
        opacity: 1,
        transform: "translateX(0)",
        filter: "blur(0px)",
      };

  return (
    <>
      {/* Connecting tab — single element that slides between triggers in sync
          with the panel, merging the active trigger into the panel. */}
      <div ref={tabRef} className="site-header__dropdown-tab" aria-hidden="true" />
      <div
        ref={panelRef}
        className="site-header__dropdown"
        data-open={isOpen}
        aria-hidden={!isOpen}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        {/* Hidden sizer — always reflects incoming item's natural size */}
        <div
          ref={measureRef}
          style={{ position: "absolute", visibility: "hidden", pointerEvents: "none", top: 0, left: 0, minWidth: 280 }}
        >
          {displayItem?.children?.map((child) => (
            <DropdownItem key={child.label} child={child} onClose={onClose} />
          ))}
        </div>

        {/* Visible content — fades out then in on item change */}
        <DropdownContent
          key={contentKey}
          phase={contentPhase}
          enterX={enterX}
          style={contentStyle}
          item={visibleItem}
          onClose={onClose}
        />
      </div>
    </>
  );
}

/* ── Components mobile menu ─────────────────────────────────────── */

function ComponentsMobileMenu({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Components navigation"
      className="flex flex-col absolute top-20 right-3 left-3 px-3"
      onClick={(e) => e.stopPropagation()}
    >
      <Link href="/components" onClick={onClose} className="text-[22px] tracking-tight text-[rgb(var(--fg))] mb-4 block" style={{ opacity: 0.9 }}>
        Components
      </Link>
      <div className="flex flex-col gap-3 mb-6">
        {TOC_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="text-[18px] tracking-tight transition-colors"
              style={{
                color: active ? "rgb(var(--fg))" : "rgb(var(--muted))",
                opacity: active ? 1 : 0.7,
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
      <a
        href="https://cal.com/jacob-c-99otvp/15min"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center w-full rounded-full py-3 text-[15px] font-medium tracking-tight transition-opacity"
        style={{ background: "rgb(var(--fg))", color: "rgb(var(--bg))", letterSpacing: "-0.01em" }}
      >
        Book a call
      </a>
    </nav>
  );
}

/* ── Mobile drawer ───────────────────────────────────────────────── */

function MobileAccordion({ item, onNavigate, drawerOpen, showDesc }: { item: NavItem; onNavigate: () => void; drawerOpen: boolean; showDesc?: boolean }) {
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!drawerOpen) setOpen(false);
  }, [drawerOpen]);

  useEffect(() => {
    if (!bodyRef.current) return;
    setHeight(open ? bodyRef.current.scrollHeight : 0);
  }, [open]);

  return (
    <div className="mobile-nav__section" data-open={open}>
      <button
        className="mobile-nav__section-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {item.label}
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
          className="mobile-nav__chevron" aria-hidden="true"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <polyline points="2 4 6 8 10 4" />
        </svg>
      </button>

      <div
        ref={bodyRef}
        className="mobile-nav__section-body"
        style={{ height }}
      >
        {item.children?.map((child) => {
          const externalArrow = child.external ? <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10, opacity: 0.4, flexShrink: 0 }}><path d="M4 12L12 4M7 4h5v5"/></svg> : null;
          const inner = showDesc ? (
            <span className="mobile-nav__item-text">
              <span className="mobile-nav__item-label">
                {child.label}
                {child.disabled && <span className="site-header__soon">soon</span>}
                {externalArrow}
              </span>
              <span className="mobile-nav__item-desc">{child.description}</span>
            </span>
          ) : (
            <span className="mobile-nav__item-label">
              {child.label}
              {child.disabled && <span className="site-header__soon">soon</span>}
              {externalArrow}
            </span>
          );

          if (child.disabled) return (
            <span key={child.label} className="mobile-nav__item mobile-nav__item--disabled">{inner}</span>
          );
          if (child.external) return (
            <a key={child.label} href={child.href} target="_blank" rel="noreferrer" className="mobile-nav__item" onClick={onNavigate}>{inner}</a>
          );
          return (
            <Link key={child.label} href={child.href!} className="mobile-nav__item" onClick={onNavigate}>{inner}</Link>
          );
        })}
      </div>
    </div>
  );
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <div className="mobile-nav__drawer" data-open={open} aria-label="Mobile navigation">
        <div className="mobile-nav__drawer-inner">
          {NAV.map((item) => (
            item.href ? (
              <div key={item.label} className="mobile-nav__section">
                <Link
                  href={item.href}
                  onClick={onClose}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noreferrer" : undefined}
                  className="mobile-nav__section-trigger"
                  style={{ textDecoration: "none" }}
                >
                  {item.label}
                </Link>
              </div>
            ) : (
              <MobileAccordion key={item.label} item={item as NavItem & { children: Child[] }} onNavigate={onClose} drawerOpen={open} showDesc={item.label === "Products"} />
            )
          ))}
          <div style={{ marginTop: "auto", padding: "16px 20px 20px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <HeaderAuth mobile />
            </div>
            <div style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "100px", border: "1px solid rgb(var(--line))", padding: "0px 8px" }}>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Logo spring ─────────────────────────────────────────────────── */

function InertiaLogo() {
  return (
    <img
      src="/logo.png"
      alt="Inertia"
      className="h-6 w-auto"
      style={{ display: "block" }}
    />
  );
}

/* ── Merged CTA — two separate rounded pills (book-a-call + sign-in avatar)
   bridged by a thin connector at vertical center, so they read as one
   linked shape rather than a single continuous pill. ──────────────────── */

function MergedCTA({ compact = false }: { compact?: boolean }) {
  const h = compact ? 40 : 44;
  const iconSize = compact ? 16 : 18;
  const gap = 2;
  return (
    <div className="relative inline-flex items-center" style={{ height: h, gap: 0 }}>
      <a
        href="https://cal.com/jacob-c-99otvp/15min"
        target="_blank"
        rel="noreferrer"
        className={"relative " + (compact ? "inline-flex px-4 py-2.5 text-[15px]" : "inline-flex px-4 py-2.5 text-[15px] sm:px-5 sm:py-2.5 sm:text-[16px]")}
        style={{
          zIndex: 1,
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1,
          borderRadius: 999,
          background: "rgb(var(--fg))",
          color: "rgb(var(--bg))",
          fontWeight: 500,
          letterSpacing: "-0.01em",
          textDecoration: "none",
          whiteSpace: "nowrap",
          transition: "transform 150ms ease",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
      >
        Book a call
      </a>
      {/* Bridge — thin bar connecting the two pills, sits behind them via
          negative margins so it overlaps into each rather than floating in
          an empty gap. */}
      <span
        aria-hidden="true"
        style={{
          width: gap + 6,
          marginLeft: -3,
          marginRight: -3,
          height: 16,
          background: "rgb(var(--fg))",
          zIndex: 0,
          flexShrink: 0,
        }}
      />
      <Link
        href="/login"
        aria-label="Sign in"
        className="relative flex items-center justify-center"
        style={{
          zIndex: 1,
          width: h,
          height: h,
          borderRadius: "50%",
          background: "rgb(var(--fg))",
          color: "rgb(var(--bg))",
          transition: "transform 150ms ease",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
      >
        <HiOutlineUser style={{ width: iconSize, height: iconSize }} />
      </Link>
    </div>
  );
}

/* ── Root ────────────────────────────────────────────────────────── */

let headerHasAnimated = false;

export function VisualNotch() {
  const { trigger } = useWebHaptics();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const triggerEls = useRef<(HTMLDivElement | null)[]>([]);

  const pathname = usePathname();

  useEffect(() => {
    if (headerHasAnimated) return;
    if (pathname !== "/") return;
    headerHasAnimated = true;
    const el = headerRef.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(-8px)";
    const raf = requestAnimationFrame(() => {
      el.style.transition = "opacity 420ms cubic-bezier(0.16,1,0.3,1), transform 420ms cubic-bezier(0.16,1,0.3,1)";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
      const onEnd = () => {
        el.style.transition = "";
        el.style.opacity = "";
        el.style.transform = "";
      };
      el.addEventListener("transitionend", onEnd, { once: true });
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  const handleEnter = useCallback((i: number) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setOpenIndex(i);
  }, []);

  const handleLeave = useCallback(() => {
    leaveTimer.current = setTimeout(() => setOpenIndex(null), 300);
  }, []);

  const handleClose = useCallback(() => setOpenIndex(null), []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prevent = (e: TouchEvent) => e.preventDefault();
    document.addEventListener("touchmove", prevent, { passive: false });
    return () => {
      document.removeEventListener("touchmove", prevent);
    };
  }, [mobileOpen]);

  useEffect(() => {
    // The homepage scrolls from a white section into a black one (the AI
    // section onward) — this frosted-glass blur tints toward the global
    // (light) --bg regardless of what's actually behind it, so past that
    // point it reads as a stray translucent white bar over black content.
    // Simplest fix: skip the effect entirely on "/" and leave the header
    // at its plain static background there.
    if (pathname === "/") return;
    const onScroll = () => {
      if (mobileOpen) return;
      const bg = headerRef.current?.querySelector<HTMLElement>(".site-header__bg");
      if (!bg) return;
      const y = window.scrollY;
      const progress = Math.min(y / 120, 1);
      const blur = progress * 20;
      const alpha = 1 - progress * 0.55;
      bg.style.transition = "";
      bg.style.backdropFilter = `blur(${blur}px) saturate(${1 + progress * 0.8})`;
      (bg.style as unknown as Record<string, string>)["-webkit-backdrop-filter"] = `blur(${blur}px) saturate(${1 + progress * 0.8})`;
      bg.style.background = `rgb(var(--bg) / ${alpha})`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mobileOpen, pathname]);

  const isHome = pathname === "/";
  const isPolicies = pathname.startsWith("/policies");
  const isAether = pathname.startsWith("/aether");
  const isWork = pathname.startsWith("/work");
  const isComponents = pathname.startsWith("/components");
  const isBlog = pathname.startsWith("/blog");
  const useMinimalHeader = isHome || isPolicies || isAether || isWork || isComponents || isBlog;

  if (useMinimalHeader) {
    return (
      <>
        <div className={`site-header${mobileOpen ? " site-header--open" : ""}`} ref={headerRef}>
          <div className="site-header__bg" aria-hidden="true" />
          <div className="site-header__bg-fill" aria-hidden="true" />
          <div className="site-header__inner" style={isComponents ? { maxWidth: "96rem" } : undefined}>
            <Link href="/" className="site-header__brand">
              <InertiaLogo />
            </Link>
            <div className="site-header__actions">
              <div className="hidden sm:flex">
                <MergedCTA />
              </div>
              <div className={isComponents ? "hidden" : "flex sm:hidden"}>
                <MergedCTA compact />
              </div>
              {isComponents && (
                <button
                  className="site-header__hamburger sm:hidden"
                  onClick={() => {
                    trigger("medium");
                    setMobileOpen((v) => !v);
                  }}
                  aria-label={mobileOpen ? "Close menu" : "Open menu"}
                  aria-expanded={mobileOpen}
                >
                  <span className="site-header__hamburger-bar" data-open={mobileOpen} />
                  <span className="site-header__hamburger-bar" data-open={mobileOpen} />
                </button>
              )}
            </div>
          </div>
        </div>
        {isComponents && mobileOpen && (
          <div
            className="sm:hidden fixed inset-0 z-20"
            style={{ background: "rgb(var(--bg) / 0.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
            onClick={() => setMobileOpen(false)}
          >
            <ComponentsMobileMenu onClose={() => setMobileOpen(false)} />
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className={`site-header${mobileOpen ? " site-header--open" : ""}`} ref={headerRef}>
        <div className="site-header__bg" aria-hidden="true" />
        <div className="site-header__bg-fill" aria-hidden="true" />
        <div className="site-header__inner">
          {/* Brand */}
          <Link href="/" className="site-header__brand">
            <InertiaLogo />
          </Link>

          {/* Desktop nav */}
          <nav className="site-header__nav" aria-label="Main navigation" ref={navRef} onMouseLeave={handleLeave}>
            {NAV.map((item, i) => (
              <NavTrigger
                key={item.label}
                item={item}
                index={i}
                openIndex={openIndex}
                onEnter={handleEnter}
                onLeave={() => {}}
                triggerRef={(el) => { triggerEls.current[i] = el; }}
              />
            ))}
            <SharedDropdown
              openIndex={openIndex}
              triggerEls={triggerEls.current}
              navRef={navRef}
              onLeave={handleLeave}
              onEnter={() => { if (leaveTimer.current) clearTimeout(leaveTimer.current); }}
              onClose={handleClose}
            />
          </nav>

          {/* Right side */}
          <div className="site-header__actions">
            <div className="hidden sm:contents">
              <HeaderAuth />
            </div>
            <div className="sm:hidden">
              <HeaderAuth mobileInline />
            </div>
            <div className="hidden sm:contents">
              <ThemeToggle />
            </div>
            {/* Hamburger — mobile only */}
            <button
              className="site-header__hamburger"
              onClick={() => {
                trigger("medium");
                setMobileOpen((v) => !v);
              }}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              <span className="site-header__hamburger-bar" data-open={mobileOpen} />
              <span className="site-header__hamburger-bar" data-open={mobileOpen} />
            </button>
          </div>
        </div>
      </div>

      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
