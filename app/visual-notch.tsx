"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useCallback, useEffect } from "react";
import { ThemeToggle } from "./theme-toggle";
import { HeaderAuth } from "./dashboard/header-auth";
import { useWebHaptics } from "web-haptics/react";
import { SiShopify } from "react-icons/si";
import {
  HiOutlineSparkles,
  HiOutlineChatBubbleLeftRight,
  HiOutlineNewspaper,
  HiOutlineBookOpen,
  HiOutlineClipboardDocumentList,
  HiOutlineCreditCard,
  HiOutlineBuildingOffice,
  HiOutlinePuzzlePiece,
  HiOutlineInformationCircle,
  HiOutlineBriefcase,
  HiOutlineQuestionMarkCircle,
  HiOutlineShieldCheck,
  HiOutlineMapPin,
} from "react-icons/hi2";

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
};

const NAV: NavItem[] = [
  {
    label: "Products",
    children: [
      { label: "Aether theme", description: "One-time purchase, lifetime updates.", href: "/aether", icon: <SiShopify /> },
      { label: "Live demo", description: "See Aether running on a real store.", href: "https://aether-starter.myshopify.com", icon: <HiOutlineSparkles />, external: true },
      { label: "Enterprise", description: "Custom licensing for larger teams.", href: "/aether/enterprise", icon: <HiOutlineBuildingOffice /> },
      { label: "Add-ons", description: "Extend your theme with optional modules.", disabled: true, icon: <HiOutlinePuzzlePiece /> },
    ],
  },
  {
    label: "Work",
    children: [
      { label: "Work with us", description: "Custom builds, shipped on time.", href: "/contact", icon: <HiOutlineChatBubbleLeftRight /> },
      { label: "Shipped using Inertia", description: "Real stores built on our themes.", href: "/work", icon: <HiOutlineSparkles /> },
    ],
  },
  {
    label: "Resources",
    children: [
      { label: "Blog", description: "Thoughts on building things that work.", href: "/blog", icon: <HiOutlineNewspaper /> },
      { label: "Docs", description: "Guides, references, and how-tos.", href: "/docs", icon: <HiOutlineBookOpen /> },
      { label: "Changelog", description: "Every update, documented.", href: "/aether/changelog", icon: <HiOutlineClipboardDocumentList /> },
    ],
  },
  {
    label: "Company",
    children: [
      { label: "About", description: "Who we are and why we build this way.", href: "/about", icon: <HiOutlineInformationCircle /> },
      { label: "Roadmap", description: "What we've shipped and what's coming.", href: "/roadmap", icon: <HiOutlineMapPin /> },
      { label: "Careers", description: "Join us when the time is right.", href: "/careers", icon: <HiOutlineBriefcase /> },
      { label: "Help", description: "Get support for anything we've shipped.", href: "/contact", icon: <HiOutlineQuestionMarkCircle /> },
      { label: "Policies", description: "Terms, licenses, and policies.", href: "/policies", icon: <HiOutlineShieldCheck /> },
    ],
  },
  { label: "Pricing", href: "/pricing" },
];

/* ── Desktop mega menu ───────────────────────────────────────────── */

function DropdownItem({ child, onClose }: { child: Child; onClose: () => void }) {
  const inner = (
    <span className="site-header__dropdown-text">
      <span className="site-header__dropdown-label">
        {child.label}
        {child.disabled && <span className="site-header__soon">soon</span>}
        {child.external && <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10, opacity: 0.4, flexShrink: 0 }}><path d="M4 12L12 4M7 4h5v5"/></svg>}
      </span>
    </span>
  );

  if (child.disabled) return (
    <span className="site-header__dropdown-item site-header__dropdown-item--disabled">{inner}</span>
  );
  if (child.external) return (
    <a href={child.href} target="_blank" rel="noreferrer" className="site-header__dropdown-item">{inner}</a>
  );
  return (
    <Link href={child.href!} className="site-header__dropdown-item" onClick={onClose}>{inner}</Link>
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
        <Link href={item.href} className="site-header__link site-header__link--pricing">
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
    // Snap to offset with no transition, then let the style transition take over
    el.style.transition = "none";
    el.style.opacity = "0";
    el.style.transform = `translateX(${enterX}px) translateY(3px)`;
    el.style.filter = "blur(4px)";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = "";
        el.style.opacity = "";
        el.style.transform = "";
        el.style.filter = "";
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", width: "100%", ...style }}>
      {item?.children?.map((child) => (
        <DropdownItem key={child.label} child={child} onClose={onClose} />
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
    }, 200);
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
    if (!panel) return;

    if (openIndex === null) {
      panel.style.width = "0px";
      panel.style.height = "0px";
      prevOpenIndex.current = null;
      return;
    }

    const trigger = triggerEls[openIndex];
    const nav = navRef.current;
    if (!trigger || !nav) return;

    const navRect = nav.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    const newLeft = triggerRect.left - navRect.left;
    const isSliding = prevOpenIndex.current !== null && prevOpenIndex.current !== openIndex;

    prevOpenIndex.current = openIndex;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    if (isSliding) {
      panel.style.transition = "left 380ms cubic-bezier(0.22,1,0.36,1), width 380ms cubic-bezier(0.22,1,0.36,1), height 380ms cubic-bezier(0.22,1,0.36,1), opacity 280ms cubic-bezier(0.22,1,0.36,1), transform 380ms cubic-bezier(0.22,1,0.36,1)";
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => {
          if (!measureRef.current || !panelRef.current) return;
          const { offsetWidth: w, offsetHeight: h } = measureRef.current;
          panelRef.current.style.left = `${newLeft}px`;
          panelRef.current.style.width = `${w}px`;
          panelRef.current.style.height = `${h}px`;
        });
      });
    } else {
      panel.style.transition = "none";
      panel.style.left = `${newLeft}px`;
      panel.style.width = "0px";
      panel.style.height = "0px";

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => {
          if (!measureRef.current || !panelRef.current) return;
          const { offsetWidth: w, offsetHeight: h } = measureRef.current;
          panelRef.current.style.transition = "width 220ms cubic-bezier(0.22,1,0.36,1), height 220ms cubic-bezier(0.22,1,0.36,1), opacity 180ms cubic-bezier(0.22,1,0.36,1), transform 220ms cubic-bezier(0.22,1,0.36,1)";
          panelRef.current.style.width = `${w}px`;
          panelRef.current.style.height = `${h}px`;
        });
      });
    }
  }, [openIndex, triggerEls, navRef]);

  const exitX = direction * 10;
  const enterX = direction * -6;
  const contentStyle: React.CSSProperties = contentPhase === "exit"
    ? {
        opacity: 0,
        transform: `translateX(${exitX}px) translateY(2px)`,
        filter: "blur(3px)",
        transition: "opacity 180ms cubic-bezier(0.4,0,1,1), transform 180ms cubic-bezier(0.4,0,1,1), filter 180ms cubic-bezier(0.4,0,1,1)",
      }
    : contentPhase === "enter"
    ? {
        opacity: 1,
        transform: "translateX(0) translateY(0)",
        filter: "blur(0px)",
        transition: "opacity 200ms cubic-bezier(0.22,1,0.36,1) 30ms, transform 200ms cubic-bezier(0.22,1,0.36,1) 30ms, filter 200ms cubic-bezier(0.22,1,0.36,1) 30ms",
      }
    : {
        opacity: 1,
        transform: "translateX(0) translateY(0)",
        filter: "blur(0px)",
      };

  return (
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
    <div className="mobile-nav__section">
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
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <div
        className="mobile-nav__backdrop"
        data-open={open}
        aria-hidden="true"
        onClick={onClose}
      />
      <div className="mobile-nav__drawer" data-open={open} aria-label="Mobile navigation">
        <div className="mobile-nav__drawer-inner">
          {NAV.map((item) => (
            item.href ? (
              <div key={item.label} className="mobile-nav__section">
                <Link href={item.href} onClick={onClose} className="mobile-nav__section-trigger" style={{ textDecoration: "none" }}>
                  {item.label}
                </Link>
              </div>
            ) : (
              <MobileAccordion key={item.label} item={item as NavItem & { children: Child[] }} onNavigate={onClose} drawerOpen={open} showDesc={item.label === "Products"} />
            )
          ))}
          <div style={{ marginTop: "auto", borderTop: "1px solid rgb(var(--line))", display: "flex", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <HeaderAuth mobile />
            </div>
            <div style={{ paddingRight: "20px", flexShrink: 0 }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "100px", border: "1px solid rgb(var(--fg) / 0.2)", padding: "6px 12px" }}>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Logo spring ─────────────────────────────────────────────────── */

function InertiaLogo() {
  const ref = useRef<HTMLSpanElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const vel = useRef({ x: 0, y: 0 });
  const raf = useRef<number | null>(null);
  const target = useRef({ x: 0, y: 0 });
  const isHovering = useRef(false);

  useEffect(() => {
    const STIFFNESS = 0.18;
    const DAMPING = 0.72;

    const tick = () => {
      if (!ref.current) return;
      const tx = isHovering.current ? target.current.x : 0;
      const ty = isHovering.current ? target.current.y : 0;
      const ax = (tx - pos.current.x) * STIFFNESS;
      const ay = (ty - pos.current.y) * STIFFNESS;
      vel.current.x = vel.current.x * DAMPING + ax;
      vel.current.y = vel.current.y * DAMPING + ay;
      pos.current.x += vel.current.x;
      pos.current.y += vel.current.y;

      const settled = !isHovering.current &&
        Math.abs(pos.current.x) < 0.01 && Math.abs(pos.current.y) < 0.01 &&
        Math.abs(vel.current.x) < 0.01 && Math.abs(vel.current.y) < 0.01;

      if (!settled) {
        ref.current.style.transform = `translate(${pos.current.x.toFixed(2)}px, ${pos.current.y.toFixed(2)}px)`;
        raf.current = requestAnimationFrame(tick);
      } else {
        pos.current = { x: 0, y: 0 };
        vel.current = { x: 0, y: 0 };
        ref.current.style.transform = "";
        raf.current = null;
      }
    };

    const onMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.closest(".site-header__brand")!.getBoundingClientRect();
      target.current = {
        x: (e.clientX - (rect.left + rect.width / 2)) * 0.18,
        y: (e.clientY - (rect.top + rect.height / 2)) * 0.18,
      };
      if (!raf.current) raf.current = requestAnimationFrame(tick);
    };

    const onEnter = () => { isHovering.current = true; };
    const onLeave = () => {
      isHovering.current = false;
      if (!raf.current) raf.current = requestAnimationFrame(tick);
    };

    const brand = ref.current?.closest(".site-header__brand");
    brand?.addEventListener("mousemove", onMove as EventListener);
    brand?.addEventListener("mouseenter", onEnter);
    brand?.addEventListener("mouseleave", onLeave);
    return () => {
      brand?.removeEventListener("mousemove", onMove as EventListener);
      brand?.removeEventListener("mouseenter", onEnter);
      brand?.removeEventListener("mouseleave", onLeave);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <span ref={ref} style={{ display: "inline-block", willChange: "transform" }}>
      <img
        src="/logo.png"
        alt="Inertia"
        className="h-5 w-auto dark:invert invert-0"
        style={{ display: "block" }}
      />
    </span>
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
    const bg = headerRef.current?.querySelector<HTMLElement>(".site-header__bg");
    if (!bg) return;
    if (mobileOpen) {
      bg.style.transition = "background 200ms ease, backdrop-filter 200ms ease";
      bg.style.backdropFilter = "none";
      (bg.style as unknown as Record<string, string>)["-webkit-backdrop-filter"] = "none";
      bg.style.background = `rgb(var(--bg))`;
      bg.style.webkitMaskImage = "none";
      bg.style.maskImage = "none";
    } else {
      bg.style.webkitMaskImage = "";
      bg.style.maskImage = "";
    }
  }, [mobileOpen]);

  useEffect(() => {
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
  }, [mobileOpen]);

  return (
    <>
      <div className={`site-header${mobileOpen ? " site-header--open" : ""}`} ref={headerRef}>
        <div className="site-header__bg" aria-hidden="true" />
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
