"use client";

import Link from "next/link";
import { useState, useRef, useCallback, useEffect } from "react";
import { ThemeToggle } from "./theme-toggle";
import { SiShopify } from "react-icons/si";
import {
  HiOutlineSparkles,
  HiOutlineDocumentText,
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
  HiOutlinePhoto,
  HiOutlineGlobeAlt,
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
  children: Child[];
};

const NAV: NavItem[] = [
  {
    label: "Get started",
    children: [
      { label: "Shopify themes", description: "Production-ready themes built for conversion.", href: "/aether", icon: <SiShopify /> },
      { label: "Changelog", description: "Every update, documented.", href: "/aether/changelog", icon: <HiOutlineClipboardDocumentList /> },
      { label: "Work with us", description: "Custom builds, shipped on time.", href: "/contact", icon: <HiOutlineChatBubbleLeftRight /> },
    ],
  },
  {
    label: "Learn",
    children: [
      { label: "Blog", description: "Thoughts on building things that work.", href: "/blog", icon: <HiOutlineNewspaper /> },
      { label: "Docs", description: "Guides, references, and how-tos.", href: "/docs", icon: <HiOutlineBookOpen /> },
      { label: "Changelog", description: "What shipped and when.", href: "/aether/changelog", icon: <HiOutlineDocumentText /> },
    ],
  },
  {
    label: "Pricing",
    children: [
      { label: "Aether theme", description: "One-time purchase, lifetime updates.", href: "/aether", icon: <HiOutlineCreditCard /> },
      { label: "Enterprise", description: "Custom licensing for larger teams.", disabled: true, icon: <HiOutlineBuildingOffice /> },
      { label: "Add-ons", description: "Extend your theme with optional modules.", disabled: true, icon: <HiOutlinePuzzlePiece /> },
    ],
  },
  {
    label: "Company",
    children: [
      { label: "About", description: "Who we are and why we build this way.", href: "/about", icon: <HiOutlineInformationCircle /> },
      { label: "Careers", description: "Join us when the time is right.", disabled: true, icon: <HiOutlineBriefcase /> },
      { label: "Help", description: "Get support for anything we've shipped.", href: "/contact", icon: <HiOutlineQuestionMarkCircle /> },
      { label: "Legal", description: "Terms, licenses, and policies.", disabled: true, icon: <HiOutlineShieldCheck /> },
    ],
  },
  {
    label: "Community",
    children: [
      { label: "Shipped using Inertia", description: "Real stores built on our themes.", href: "/work", icon: <HiOutlineSparkles /> },
      { label: "Instagram", description: "Behind the build, process shots.", href: "https://www.instagram.com/inertia.dev/", external: true, icon: <HiOutlinePhoto /> },
      { label: "X / Twitter", description: "Updates and hot takes.", href: "https://x.com/inertia_dev", external: true, icon: <HiOutlineGlobeAlt /> },
    ],
  },
];

/* ── Desktop mega menu ───────────────────────────────────────────── */

function MegaMenu({
  item,
  index,
  openIndex,
  prevIndex,
  onEnter,
  onLeave,
  onClose,
}: {
  item: NavItem;
  index: number;
  openIndex: number | null;
  prevIndex: number | null;
  onEnter: (i: number) => void;
  onLeave: () => void;
  onClose: () => void;
}) {
  const open = openIndex === index;

  // Slide direction: positive = sliding in from right, negative = from left
  const direction = prevIndex !== null && openIndex !== null
    ? (openIndex > prevIndex ? 1 : -1)
    : 0;

  const DropdownItem = ({ child }: { child: Child }) => {
    const inner = (
      <>
        <span className="site-header__dropdown-icon">{child.icon}</span>
        <span className="site-header__dropdown-text">
          <span className="site-header__dropdown-label">
            {child.label}
            {child.disabled && <span className="site-header__soon">soon</span>}
          </span>
          <span className="site-header__dropdown-desc">{child.description}</span>
        </span>
      </>
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
  };

  return (
    <div
      className="site-header__menu-root"
      onMouseEnter={() => onEnter(index)}
      onMouseLeave={onLeave}
    >
      <button className="site-header__link" aria-expanded={open} aria-haspopup="true">
        {item.label}
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
          className="site-header__chevron" aria-hidden="true"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <polyline points="2 4 6 8 10 4" />
        </svg>
      </button>

      <div className="site-header__dropdown" data-open={open} aria-hidden={!open}>
        <div
          style={{
            transform: open ? "translateX(0)" : `translateX(${direction * 12}px)`,
            opacity: open ? 1 : 0,
            transition: open
              ? "transform 240ms cubic-bezier(0.22,1,0.36,1), opacity 180ms ease"
              : "transform 160ms cubic-bezier(0.4,0,1,1), opacity 120ms ease",
          }}
        >
          {item.children.map((child) => <DropdownItem key={child.label} child={child} />)}
        </div>
      </div>
    </div>
  );
}

/* ── Mobile drawer ───────────────────────────────────────────────── */

function MobileAccordion({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);

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
        {item.children.map((child) => {
          const inner = (
            <>
              <span className="mobile-nav__item-icon">{child.icon}</span>
              <span className="mobile-nav__item-text">
                <span className="mobile-nav__item-label">
                  {child.label}
                  {child.disabled && <span className="site-header__soon">soon</span>}
                </span>
                <span className="mobile-nav__item-desc">{child.description}</span>
              </span>
            </>
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
  // Lock body scroll while open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="mobile-nav__backdrop"
        data-open={open}
        aria-hidden="true"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="mobile-nav__drawer" data-open={open} aria-label="Mobile navigation">
        <div className="mobile-nav__drawer-inner">
          {NAV.map((item) => (
            <MobileAccordion key={item.label} item={item} onNavigate={onClose} />
          ))}
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

  return <span ref={ref} style={{ display: "inline-block", willChange: "transform" }}>Inertia</span>;
}

/* ── Root ────────────────────────────────────────────────────────── */

export function VisualNotch() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = useCallback((i: number) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setOpenIndex((prev) => {
      if (prev !== null && prev !== i) setPrevIndex(prev);
      return i;
    });
  }, []);

  const handleLeave = useCallback(() => {
    leaveTimer.current = setTimeout(() => {
      setPrevIndex(null);
      setOpenIndex(null);
    }, 80);
  }, []);

  const handleClose = useCallback(() => {
    setPrevIndex(null);
    setOpenIndex(null);
  }, []);

  return (
    <>
      <div className="site-header">
        <div className="site-header__inner">
          {/* Brand */}
          <span className="site-header__brand">
            <InertiaLogo />
          </span>

          {/* Desktop nav */}
          <nav className="site-header__nav" aria-label="Main navigation">
            {NAV.map((item, i) => (
              <MegaMenu
                key={item.label}
                item={item}
                index={i}
                openIndex={openIndex}
                prevIndex={prevIndex}
                onEnter={handleEnter}
                onLeave={handleLeave}
                onClose={handleClose}
              />
            ))}
          </nav>

          {/* Right side */}
          <div className="site-header__actions">
            <ThemeToggle />
            {/* Hamburger — mobile only */}
            <button
              className="site-header__hamburger"
              onClick={() => setMobileOpen((v) => !v)}
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
