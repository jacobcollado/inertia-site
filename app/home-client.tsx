"use client";

import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FollowerPointerCard } from "@/components/ui/following-pointer";
import Cal, { getCalApi } from "@calcom/embed-react";

export type ClientCarouselItem = { slug: string; client: string; blurb?: string; logo?: string; palette?: string[]; card?: string };

export default function Home({ initialWork }: { initialWork: ClientCarouselItem[] }) {
  return <VisualLayout initialWork={initialWork} />;
}

const hl = (text: string) => (
  <span
    style={{
      backgroundImage:
        "linear-gradient(104deg, rgba(120,120,120,0) 0.3%, rgba(120,120,120,0.28) 2.5%, rgba(120,120,120,0.16) 20%, rgba(120,120,120,0.14) 80%, rgba(120,120,120,0.26) 97.5%, rgba(120,120,120,0) 99.7%)",
      color: "inherit",
      // Uneven corner radii read as a rougher, hand-marked stroke rather
      // than a clean uniform rectangle.
      borderRadius: "3px 7px 4px 8px / 6px 3px 7px 2px",
      padding: "1px 3px",
    }}
  >
    {text}
  </span>
);

const FAQ_ITEMS: { q: string; a: React.ReactNode }[] = [
  {
    q: "What kind of projects do you take on?",
    a: <>We work with {hl("fashion brands")}, {hl("trade businesses")}, and founder-led companies building digital products, storefronts, and brand identities.</>,
  },
  {
    q: "How does the process work?",
    a: <>We start with a {hl("short discovery call")} to understand what you're building, then move into {hl("direction, design, and development")} as one continuous process.</>,
  },
  {
    q: "Do you work with early-stage founders?",
    a: <>Yes. We work best with founders who have {hl("a clear vision")} but need the right team to shape and ship it properly.</>,
  },
  {
    q: "How long does a project take?",
    a: <>Depends on scope. A focused storefront or landing page can ship in {hl("2-4 weeks")}. Larger product builds typically run {hl("6-12 weeks")}.</>,
  },
  {
    q: "What does it cost?",
    a: <>Projects are scoped and quoted individually. Most engagements {hl("start from $3,000")} depending on what's being built.</>,
  },
  {
    q: "Can you help with just design, or just development?",
    a: <>We prefer to {hl("own the full process")}, but we're open to talking through what you actually need.</>,
  },
  {
    q: "Do you still offer the Aether Shopify theme?",
    a: <>Yes. {hl("Aether")} is our Shopify theme, available from $85. It ships with 41 sections, dark mode, sticky cart, and mega menu. You can buy a license and go live the same afternoon at <Link href="/aether" style={{ color: "#0a84ff", textDecoration: "none" }}>byinertia.com/aether</Link>.</>,
  },
];

function FaqItem({ q, a, open, onToggle, delay }: { q: string; a: React.ReactNode; open: boolean; onToggle: () => void; delay: number }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const target = open ? el.scrollHeight : 0;
    setHeight(target);
  }, [open]);

  return (
    <div
      className="rise"
      style={{ "--rise-delay": `${delay}ms` } as React.CSSProperties}
    >
      <div
        style={{
          borderRadius: 16,
          background: open ? "rgb(var(--surface))" : "transparent",
          transition: "background 350ms cubic-bezier(0.22,1,0.36,1)",
          marginBottom: 6,
        }}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="w-full flex items-center justify-between gap-6 py-5 px-5"
        >
          <span className="flex-1 text-[16px] sm:text-[17px] tracking-tight text-[rgb(var(--fg))] text-left sm:text-center">{q}</span>
        </button>
        <div
          style={{
            height,
            overflow: "hidden",
            transition: "height 350ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <div ref={bodyRef} className="pb-5 px-5">
            <p className="text-[15px] sm:text-[16px] leading-relaxed tracking-tight text-[rgb(var(--muted))] text-left sm:text-center sm:max-w-md sm:mx-auto">
              {a}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IndexFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="w-full max-w-[88rem] mx-auto px-6 sm:px-8">
      <div className="max-w-2xl sm:max-w-xl mx-auto">
        {FAQ_ITEMS.map((item, i) => (
          <FaqItem
            key={item.q}
            q={item.q}
            a={item.a}
            open={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            delay={i * 40}
          />
        ))}
      </div>
    </section>
  );
}

type Plan = "free" | "service";

function DashboardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [plan, setPlan] = useState<Plan>("free");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const backdropRef = useRef<HTMLDivElement>(null);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      setTimeout(() => { setDone(false); setError(""); setEmail(""); setName(""); setPlan("free"); }, 300);
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) { document.addEventListener("keydown", onKey); document.body.style.overflow = "hidden"; }
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: err } = await supabase.from("dashboard_waitlist").insert({ name, email, plan });
      if (err) throw err;
      setDone(true);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const accent = "rgb(var(--blue))";
  const inputBase = "w-full bg-transparent border-0 border-b py-3 text-[16px] tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-40 focus:outline-none transition-colors duration-200";

  const PLANS = [
    { key: "free" as Plan, label: "Get early access", sub: "Free, no commitment" },
    { key: "service" as Plan, label: "Work with us", sub: "Already a client or ready to start" },
  ];

  const modal = (
    <div
      ref={backdropRef}
      className="fixed z-50 flex items-end sm:items-center justify-center"
      style={{
        inset: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: "100dvh",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transition: "opacity 220ms ease",
      }}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div
        className="relative w-full sm:max-w-[420px] bg-[rgb(var(--bg))] border border-[rgb(var(--line))] rounded-t-2xl sm:rounded-sm mx-0 sm:mx-4 overflow-y-auto overscroll-contain"
        style={{
          maxHeight: "90dvh",
          animation: open ? "modal-up 320ms cubic-bezier(0.22,1,0.36,1) both" : "none",
        }}
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-8 h-1 rounded-full bg-[rgb(var(--line))]" />
        </div>

        <button
          onClick={onClose}
          className="hidden sm:flex absolute top-4 right-4 w-7 h-7 items-center justify-center text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
          aria-label="Close"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-4 h-4">
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>

        <div className="px-6 sm:px-8 pt-5 sm:pt-7 pb-8 sm:pb-8">
          {done ? (
            <div style={{ animation: "rise-in 280ms cubic-bezier(0.22,1,0.36,1) both" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center mb-4" style={{ background: "rgb(var(--blue)/0.1)" }}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ color: accent }}>
                  <polyline points="2 8 6 12 14 4" />
                </svg>
              </div>
              <p className="text-[20px] font-normal tracking-tight text-[rgb(var(--fg))] leading-snug mb-2">
                {plan === "service" ? "We'll be in touch soon." : "You're on the list."}
              </p>
              <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] leading-relaxed">
                {plan === "service"
                  ? "We'll review your details and reach out within a day to get things moving."
                  : "Access is limited while we build. We'll email you when your spot is ready."}
              </p>
              <button onClick={onClose} className="mt-6 text-[13px] tracking-tight transition-colors hover:text-[rgb(var(--fg))]" style={{ color: accent }}>
                Done
              </button>
            </div>
          ) : (
            <>
              <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] mb-3">Inertia Dashboard</p>
              <h2 className="text-[clamp(1.25rem,4vw,1.5rem)] font-normal tracking-tight text-[rgb(var(--fg))] leading-snug mb-2">
                Your project, all in one place
              </h2>
              <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] leading-relaxed mb-7">
                Status updates, files, invoices, and support. Built for clients who want visibility without the back-and-forth.
              </p>

              <div className="grid grid-cols-2 gap-2.5 mb-7">
                {PLANS.map(({ key, label, sub }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPlan(key)}
                    className="flex flex-col gap-1 p-3.5 border text-left transition-all duration-150 rounded-sm"
                    style={{
                      borderColor: plan === key ? accent : "rgb(var(--line))",
                      background: plan === key ? "rgb(var(--blue)/0.07)" : "transparent",
                    }}
                  >
                    <span className="text-[13px] font-medium tracking-tight" style={{ color: plan === key ? accent : "rgb(var(--fg))" }}>{label}</span>
                    <span className="text-[11.5px] tracking-tight text-[rgb(var(--muted))] leading-snug">{sub}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="your name" autoComplete="name" className={inputBase}
                  style={{ borderColor: name ? accent : "rgb(var(--line))" }}
                  onFocus={(e) => { e.target.style.borderColor = accent; }}
                  onBlur={(e) => { e.target.style.borderColor = name ? accent : "rgb(var(--line))"; }}
                />
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="email address" autoComplete="email" className={inputBase}
                  style={{ borderColor: email ? accent : "rgb(var(--line))" }}
                  onFocus={(e) => { e.target.style.borderColor = accent; }}
                  onBlur={(e) => { e.target.style.borderColor = email ? accent : "rgb(var(--line))"; }}
                />
                {plan === "service" && (
                  <p className="text-[12px] tracking-tight text-[rgb(var(--muted))] -mt-2 leading-relaxed">
                    Tell us a bit about your project in the next step and we'll take it from there.
                  </p>
                )}
                {error && <p className="text-[13px] tracking-tight text-red-500 -mt-1">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex items-center justify-center gap-2 rounded-full py-3 text-[15px] tracking-tight font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed mt-1"
                  style={{ background: "var(--accent-gradient)", color: "white" }}
                >
                  {loading ? "Sending..." : plan === "free" ? "Get early access" : "Start the conversation"}
                  {!loading && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}

// The "anti [!] slow" eyebrow's centre mark: a small squared, outline-only
// container holding a warning sign rendered as dots — a dotted triangle
// outline with a dotted exclamation inside. Sits inline between the two words.
function AntiSlowMark() {
  // Build an equilateral-ish warning triangle (apex at top) from three
  // corners, then place dots at EVEN intervals along each edge so the outline
  // is symmetric and correctly aligned. Corner dots are shared between edges
  // (deduped) so they aren't doubled up.
  const apex: [number, number] = [12, 4];
  const left: [number, number] = [4.5, 19];
  const right: [number, number] = [19.5, 19];
  const perEdge = 4; // dots per edge including both endpoints

  const edge = (a: [number, number], b: [number, number]) =>
    Array.from({ length: perEdge }, (_, i) => {
      const t = i / (perEdge - 1);
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t] as [number, number];
    });

  const raw = [...edge(apex, right), ...edge(right, left), ...edge(left, apex)];
  // Dedupe shared corner points.
  const outline = raw.filter(
    ([x, y], i) => raw.findIndex(([px, py]) => Math.abs(px - x) < 0.01 && Math.abs(py - y) < 0.01) === i
  );

  // Exclamation, centred on x=12, within the triangle's vertical span. Stem of
  // two dots plus a gapped point below.
  const bang: [number, number][] = [
    [12, 11],
    [12, 14],
    [12, 16.8],
  ];
  const R = 1.05;

  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "1.5em",
        height: "1.5em",
        borderRadius: "0.28em",
        background: "transparent",
        border: "0.09em solid currentColor",
        verticalAlign: "-0.34em",
        margin: "0 0.34em",
        boxSizing: "border-box",
      }}
    >
      <svg viewBox="0 0 24 24" width="76%" height="76%" style={{ display: "block" }}>
        {outline.map(([cx, cy], i) => (
          <circle key={`o${i}`} cx={cx} cy={cy} r={R} fill="currentColor" />
        ))}
        {bang.map(([cx, cy], i) => (
          <circle key={`b${i}`} cx={cx} cy={cy} r={R} fill="currentColor" />
        ))}
      </svg>
    </span>
  );
}

// A continuous, fluid light sweep across neutral text — no color cycling,
// just a soft diagonal band of brightness drifting left to right on a loop.
// Runs purely on CSS (background-position animation on a background-clip:
// text gradient), so it's smooth and consistent regardless of anything else
// happening on the page, unlike the old per-character ripple this replaced.
function ShimmerWord({ children, italic }: { children: string; italic?: boolean }) {
  return (
    <span
      aria-label={children}
      className="shimmer-word"
      style={{
        fontWeight: 500,
        fontStyle: italic ? "italic" : undefined,
        letterSpacing: "-0.03em",
      }}
    >
      {children}
    </span>
  );
}

function VercelHero({ accentColor }: { accentColor: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const fade = (delay: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(18px)",
    transition: `opacity 750ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 750ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
  });

  return (
    <section
      ref={ref}
      className="relative"
      style={{ color: "#1a1a1a" }}
    >
      <div
        className="relative flex items-center"
      >
        <div className="relative max-w-[88rem] mx-auto w-full px-6 sm:px-8 pt-16 sm:pt-24 pb-10 pb-[40dvh] flex flex-col items-center text-center gap-10 min-h-[100dvh] justify-center sm:min-h-0 sm:pb-10 sm:justify-start">
          {false && (
          <span
            className="inline-flex items-center rounded-full px-3.5 py-1.5 text-[14px] tracking-tight"
            style={{
              ...fade(0),
              background: "rgba(26,26,26,0.06)",
              color: "rgba(26,26,26,0.7)",
            }}
          >
            900+ clients served since 2022
          </span>
          )}

          <p
            className="inline-flex items-center text-[17px] sm:text-[19px] tracking-tight -mb-4 sm:-mb-6"
            style={{ ...fade(60), color: "#5c5c5c" }}
          >
            anti<AntiSlowMark />slow
          </p>

          <h1
            className="font-normal tracking-tight leading-[0.88] max-w-xl"
            style={{ ...fade(120), color: "#1a1a1a", fontSize: "clamp(2.6rem, 6vw, 4.2rem)" }}
          >
            Design that moves at your{" "}
            <ShimmerWord>speed</ShimmerWord>
          </h1>

          {false && (
          <div className="hidden sm:flex flex-col gap-5 max-w-md absolute inset-y-0 right-0 justify-center">
            <p
              className="text-[16.5px] sm:text-[21px] leading-relaxed tracking-tight text-right"
              style={{ ...fade(300), color: "#5c5c5c" }}
            >
              We do design and development ourselves, so you're not stuck explaining your vision twice.
            </p>
          </div>
          )}

          {false && (
          <div className="flex flex-col gap-5 max-w-lg sm:hidden">
            <p
              className="text-[16.5px] leading-relaxed tracking-tight"
              style={{ ...fade(300), color: "#5c5c5c" }}
            >
              We do design and development ourselves, so you're not stuck explaining your vision twice.
            </p>
          </div>
          )}

          <div className="flex items-center gap-3">
            <a
              href="https://cal.com/jacob-c-99otvp/15min"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[15px] font-medium tracking-tight"
              style={{ ...fade(660), background: "#1a1a1a", color: "#fff" }}
              onMouseEnter={e => { e.currentTarget.style.transition = "opacity 150ms ease, transform 150ms ease"; e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
              onMouseDown={e => { e.currentTarget.style.transform = "translateY(0px)"; }}
            >
              Book a call
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
            <a
              href="https://t.me/kayzxyz"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full px-4 py-2 text-[15px] font-medium tracking-tight"
              style={{ ...fade(720), background: "#f0f0f0", color: "#1a1a1a" }}
              onMouseEnter={e => { e.currentTarget.style.transition = "opacity 150ms ease, transform 150ms ease"; e.currentTarget.style.opacity = "0.8"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
              onMouseDown={e => { e.currentTarget.style.transform = "translateY(0px)"; }}
            >
              Send a message
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function CalEmbed() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "15min" });
      cal("ui", {
        theme: "dark",
        hideEventTypeDetails: false,
        layout: "month_view",
        styles: { body: { background: "#0a0a0a" } },
      });
    })();
  }, []);

  return (
    <section className="rise w-full max-w-[88rem] mx-auto px-6 sm:px-8">
      <div className="min-h-[820px] sm:min-h-[560px]" style={{ borderRadius: "12px", background: "rgb(var(--bg))", overflow: "hidden" }}>
        <Cal
          namespace="15min"
          calLink="jacob-c-99otvp/15min"
          style={{ width: "100%", height: "100%", overflow: "scroll" }}
          config={{ layout: "month_view", useSlotsViewOnSmallScreen: "true", theme: "dark" }}
        />
      </div>
    </section>
  );
}

const WORK_ITEMS = [
  { src: "/work/inboundly-1.png", title: "Inboundly", category: "Web app", accent: "#6a6dff", logo: "/work-logos/inboundly.png" },
  { src: "/work/inboundly-2.png", title: "Inboundly", category: "Product design", accent: "#6f72ff", logo: "/work-logos/inboundly.png" },
  { src: "/work/aether-1.webp", title: "Aether Theme", category: "Shopify theme", accent: "#39637e", logo: "/work-logos/aether.png" },
  { src: "/work/aether-2.webp", title: "Aether Theme", category: "Cart design", accent: "#5b7496", logo: "/work-logos/aether.png" },
  { src: "/work/ellora-la/1.webp", title: "Ellora LA", category: "Shopify storefront", accent: "#cb591b", logo: "/work-logos/ellora-la.png" },
  { src: "/work/inertia-site.png", title: "Inertia", category: "Web design", accent: "#154365" },
  { src: "/work/ftgioo-1.png", title: "FT.GIOO", category: "Shopify storefront", accent: "#b8433a", logo: "/work-logos/ft-gioo.png" },
  { src: "/work/ftgioo-2.png", title: "FT.GIOO", category: "Shop page", accent: "#b8433a", logo: "/work-logos/ft-gioo.png" },
  { src: "/work/ftgioo-3.png", title: "FT.GIOO", category: "Collection page", accent: "#b8433a", logo: "/work-logos/ft-gioo.png" },
  { src: "/work/subtle-goods/1.png", title: "Subtle Goods", category: "Shopify storefront", accent: "#3a627c", logo: "/work-logos/subtle-goods.png" },
  { src: "/work/subtle-goods/2.png", title: "Subtle Goods", category: "Coming soon page", accent: "#4a5a2c", logo: "/work-logos/subtle-goods.png" },
  { src: "/work/trippie-1.png", title: "Trippie Redd", category: "Merch store", accent: "#9c0000", logo: "/work-logos/1400.png" },
  { src: "/work/trippie-2.png", title: "Trippie Redd", category: "Music page", accent: "#0d1b3e", logo: "/work-logos/1400.png" },
  { src: "/work/trippie-3.png", title: "Trippie Redd", category: "Product page", accent: "#a50000", logo: "/work-logos/1400.png" },
  { src: "/work/ellora-la/2.png", title: "Ellora LA", category: "Collection page", accent: "#6f283c", logo: "/work-logos/ellora-la.png" },
];

// Fluid, seamless carousel: a real horizontal track (not a crossfade) with a
// slide cloned on each end so it can wrap without ever snapping backward.
// Autoplay, drag/swipe, dot nav, and arrows all move the same `index` state;
// the only special case is the wrap jump, which turns transitions off for one
// frame. On desktop each slide is sized to ~78% of the track so the next (and,
// once you've moved, previous) slide peeks in at the edges.
const WORK_SLIDE_MS = 4200;
const WORK_EASE = "cubic-bezier(0.65,0,0.35,1)";
const WORK_DURATION = 900;
const WORK_PEEK_PCT = 58; // desktop slide width as % of track

function hexToRgba(hex: string, alpha: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

const CLIENT_CARD_FALLBACK_PALETTE = ["#39637e", "#5b7496", "#1a3a4a"];

// Per-client logo size tweak — logos come in at wildly different natural
// proportions (a wide wordmark vs. a compact mark), so a single fixed width
// reads too small/large for some. Multiplies the shared base width below.
const CLIENT_CARD_LOGO_SCALE: Record<string, number> = {
  aether: 1.3,
  inboundly: 0.8,
  "ellora-la": 1.2,
};

// Every other logo is forced white via filter so it reads clearly against
// any card background — this one has its own multi-color artwork worth
// keeping as-is.
const CLIENT_CARD_NATURAL_COLOR_LOGO_SLUGS = new Set(["ft-gioo"]);

function hexLuminance(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

// Builds the flowing card background for the client carousel from a work
// item's brand palette — a static (no motion) blend of every usable color
// the palette has, so depth comes from color layering rather than
// animation. Reads as moving water/ink rather than a scatter of blobs:
// near-white and near-black swatches are dropped first (a bright glow or an
// opaque black patch is what makes a gradient read as "floating shapes"
// instead of one continuous surface), then each remaining color gets its
// own large, heavily-overlapping, very-soft-edged current — sized well past
// the card's own bounds so falloffs never resolve into a visible ring, and
// no single color is reused across multiple currents (previously the same
// hue got recycled in 2-3 places, which is what read as flat/two-tone even
// with a 5-color palette). The darkest usable tone pools in one corner
// instead of a flat black vignette, and a soft light sheen sits opposite it
// for depth.
function clientCardGradient(palette: string[] | undefined) {
  const raw = palette && palette.length >= 2 ? palette : CLIENT_CARD_FALLBACK_PALETTE;
  const usable = raw.filter((hex) => { const l = hexLuminance(hex); return l > 0.06 && l < 0.8; });
  const p = usable.length >= 2 ? usable : CLIENT_CARD_FALLBACK_PALETTE;
  const sorted = [...p].sort((a, b) => hexLuminance(a) - hexLuminance(b));
  const deepest = sorted[0];
  const lightest = sorted[sorted.length - 1];
  const base = p[0];
  // Each palette color (deduped) gets exactly one current, at a distinct
  // position/size, cycling through a fixed set of placements.
  const spots = [
    { pos: "10% 12%", size: "135% 115%" },
    { pos: "92% 18%", size: "125% 120%" },
    { pos: "78% 92%", size: "140% 125%" },
    { pos: "18% 96%", size: "130% 115%" },
    { pos: "50% 45%", size: "150% 140%" },
  ];
  const currents = p.map((hex, i) => {
    const spot = spots[i % spots.length];
    const alpha = 0.62 - i * 0.06;
    return `radial-gradient(${spot.size} at ${spot.pos}, ${hexToRgba(hex, Math.max(0.32, alpha))} 0%, transparent 64%)`;
  });
  const layers = [
    ...currents,
    `linear-gradient(155deg, ${hexToRgba(lightest, 0.16)} 0%, transparent 42%)`,
    `radial-gradient(115% 95% at 100% 100%, ${hexToRgba(deepest, 0.55)} 0%, transparent 58%)`,
  ];
  return {
    backgroundColor: base,
    backgroundImage: layers.join(", "),
  };
}

function WorkThumbnails({ onActiveAccent }: { onActiveAccent?: (color: string) => void }) {
  const router = useRouter();
  const total = WORK_ITEMS.length;
  // The track is [..CLONES tail items, ...items, ..CLONES head items]. Two
  // clones on each end (not one) so that on desktop — where the active slide
  // peeks its left AND right neighbors — both peek positions are still
  // populated at the wrap boundary. With a single clone, advancing onto the
  // wrap slide left the far-side peek empty for one step, which is what made
  // the last→first transition visibly jump instead of staying fluid.
  const CLONES = 2;
  // Real items occupy track indices CLONES .. CLONES+total-1.
  const [index, setIndex] = useState(CLONES);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  // Which slide (track index) the pointer is currently hovering, so the
  // follower tooltip can reflect the peeking prev/next card, not just the
  // centered one. null falls back to the active slide.
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  // Staggered entrance: each slide fades/rises in with a per-slide delay on
  // load, instead of the whole track sliding in from the right.
  const [entered, setEntered] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const widthRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragState = useRef<{ startX: number; dragging: boolean; dx: number } | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollScale, setScrollScale] = useState(1);

  // Mobile-only parallax: as the carousel scrolls up into view, scale it
  // from a shrunken start up to its natural size, tracking scroll position
  // directly rather than a one-shot reveal. Desktop stays at scale 1.
  useEffect(() => {
    if (window.innerWidth >= 640) return;
    const el = sectionRef.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // progress 0 when the section's top is at the bottom of the viewport,
      // 1 once its top has scrolled up to the viewport's vertical center
      const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh * 0.65)));
      setScrollScale(0.82 + progress * 0.18);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // CLONES tail items prepended + CLONES head items appended.
  const slides = [
    ...WORK_ITEMS.slice(total - CLONES),
    ...WORK_ITEMS,
    ...WORK_ITEMS.slice(0, CLONES),
  ];
  const slideWidth = isDesktop ? WORK_PEEK_PCT : 100;
  // center the active slide within the track when it's narrower than 100%
  const centerOffset = (100 - slideWidth) / 2;

  const goTo = (i: number) => { setAnimate(true); setIndex(i); };
  const advance = () => goTo(index + 1);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(advance, WORK_SLIDE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, paused]);

  // Track indices wrap via onTransitionEnd; map any track index (real or
  // clone) back to the real (non-clone) item. Real items start at CLONES.
  const activeItem = WORK_ITEMS[((index - CLONES) % total + total) % total];
  const activeAccent = activeItem.accent;

  // Pointer tooltip reflects whichever card is hovered (including the peeking
  // prev/next slides), falling back to the centered slide when the pointer
  // isn't over any specific card. hoveredIndex is a track index into the
  // [last-clone, ...items, first-clone] track, so map it back to a real item.
  const tooltipItem =
    hoveredIndex != null
      ? WORK_ITEMS[((hoveredIndex - CLONES) % total + total) % total]
      : activeItem;
  // Tooltip logo tweaks. Logos are forced black (they sit on the white pill)
  // except FT.GIOO, which keeps its own multi-color artwork. Aether reads
  // small at the shared size, so it gets a larger height.
  const tooltipLogoNaturalColor = tooltipItem.logo === "/work-logos/ft-gioo.png";
  const tooltipLogoSize = tooltipItem.logo === "/work-logos/aether.png" ? 20 : 15;
  const pointerTitle = (
    <span className="flex items-center gap-2">
      {tooltipItem.logo && (
        // Logo centered on a neutral white circular pill so it reads
        // regardless of the logo's own color, in place of the old thumbnail.
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.25)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tooltipItem.logo}
            alt=""
            className="object-contain"
            style={{
              height: tooltipLogoSize,
              width: tooltipLogoSize,
              filter: tooltipLogoNaturalColor ? undefined : "brightness(0)",
            }}
          />
        </span>
      )}
      <span className="whitespace-nowrap">{tooltipItem.title}</span>
    </span>
  );
  // Dark blue/green accents read dimmer than warm ones at the same alpha, so
  // give the glow a boost specifically for those slides (Aether, Inertia,
  // Subtle Goods' olive green).
  const isDimAccent = ["#39637e", "#5b7496", "#154365", "#4a5a2c"].includes(activeAccent);
  const glowOpacity = isDimAccent ? 0.34 : 0.20;

  // Report the active slide's accent color upward so the hero can tint
  // itself to match. Keyed on `index` (not the derived color) so the hero's
  // ripple re-plays on every slide change, even when two consecutive slides
  // happen to share the same accent.
  useEffect(() => {
    onActiveAccent?.(activeAccent);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    const measure = () => {
      if (trackRef.current) widthRef.current = trackRef.current.parentElement!.getBoundingClientRect().width;
      setIsDesktop(window.innerWidth >= 640);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Kick off the staggered entrance one frame after mount so the from-state
  // (faded/offset) paints first and the transition actually runs.
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // After a wrap-slide finishes animating, jump instantly (no transition) to
  // the equivalent real slide at the opposite end so the loop never runs out.
  // Real items span CLONES .. CLONES+total-1; anything outside that lands on a
  // clone and gets re-homed to its real counterpart.
  const onTransitionEnd = (e: React.TransitionEvent) => {
    // Only the track's own transform transition should trigger the re-home.
    // Child slides transition their height/filter/transform on the same
    // duration, and those events bubble up to this handler — acting on them
    // re-homed mid-animation (or on the wrong element), which read as a snap.
    if (e.target !== trackRef.current || e.propertyName !== "transform") return;
    if (index < CLONES) { setAnimate(false); setIndex(index + total); }
    else if (index >= CLONES + total) { setAnimate(false); setIndex(index - total); }
  };
  useEffect(() => {
    if (!animate) {
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
      return () => cancelAnimationFrame(id);
    }
  }, [animate]);

  // Desktop-only click-and-drag. Uses pointer capture so every move/up event
  // routes back to the track once a drag begins — without it, dragging faster
  // than the element (or off its edge) dropped the pointer stream, leaving the
  // drag orphaned (dragX frozen, dragging stuck true) which is what broke the
  // carousel and lost focus. Only the primary mouse button starts a drag.
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    dragState.current = { startX: e.clientX, dragging: true, dx: 0 };
    setPaused(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current?.dragging) return;
    const dx = e.clientX - dragState.current.startX;
    dragState.current.dx = dx;
    setDragX(dx);
  };
  const endDrag = (e?: React.PointerEvent) => {
    if (!dragState.current?.dragging) return;
    const dx = dragState.current.dx;
    dragState.current.dragging = false;
    if (e) (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    // Advance one slide per drag past a fraction of the visible slide width
    // (measured off the actual slide, not the whole track), so the throw
    // distance needed matches how far a slide is.
    const slidePx = (widthRef.current || 1) * (slideWidth / 100);
    const threshold = slidePx * 0.2;
    setAnimate(true);
    if (dx < -threshold) setIndex(i => i + 1);
    else if (dx > threshold) setIndex(i => i - 1);
    setDragX(0);
    setPaused(false);
  };

  const dragPct = widthRef.current ? (dragX / widthRef.current) * 100 : 0;
  // each slide occupies `slideWidth`%; shift left by index slides, then add
  // the centering offset so the active slide sits in the middle on desktop
  const trackOffset = -index * slideWidth + centerOffset + dragPct;

  return (
    <section
      ref={sectionRef}
      className="relative sm:mt-10"
      style={{ width: "100vw", marginLeft: "calc(50% - 50vw)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        // Don't clear an in-progress drag here — pointer capture keeps it
        // alive off-element, and nulling it mid-drag orphaned the gesture.
        if (!dragState.current?.dragging) { setPaused(false); dragState.current = null; }
      }}
    >
      <div
        aria-hidden="true"
        className="hero-glow"
        style={{
          position: "absolute",
          left: "50%",
          top: isDesktop ? -500 : -900,
          transform: "translateX(-50%)",
          width: "100vw",
          height: isDesktop ? 900 : 1500,
          pointerEvents: "none",
          ["--hero-glow-color" as string]: hexToRgba(activeAccent, glowOpacity),
          zIndex: 0,
        }}
      />
      {/* Mobile-only vertical light beam: a tall, soft column tinted with the
          active slide's accent that passes down through the thumbnail —
          brightest along the center axis, feathering out to the sides and
          extending above/below the card so the card reads as sitting inside a
          shaft of light rather than just glowing. */}
      {!isDesktop && (
        <div
          aria-hidden="true"
          className="work-beam"
          style={{
            position: "absolute",
            left: "50%",
            top: -260,
            transform: "translateX(-50%)",
            width: "100vw",
            height: "calc(100% + 400px)",
            pointerEvents: "none",
            ["--work-beam-color" as string]: hexToRgba(activeAccent, isDimAccent ? 0.5 : 0.32),
            ["--work-beam-core" as string]: hexToRgba(activeAccent, isDimAccent ? 0.7 : 0.5),
            zIndex: 0,
          }}
        />
      )}
      <FollowerPointerCard title={pointerTitle} titleKey={tooltipItem.title} className="w-full">
        <div
          className="relative w-full select-none"
          style={{
            aspectRatio: "16 / 9",
            maxHeight: 560,
            transform: `scale(${scrollScale})`,
            transformOrigin: "center center",
          }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div
              ref={trackRef}
              className="flex h-full"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              style={{
                transform: `translateX(${trackOffset}%)`,
                // No transform transition until the entrance has run — the
                // track sits at its resting offset from the first paint, so
                // the slides stagger in (per-slide fade/rise below) instead of
                // the whole track sliding in from the right.
                transition: animate && entered ? `transform ${WORK_DURATION}ms ${WORK_EASE}` : "none",
                touchAction: "pan-y",
              }}
              onTransitionEnd={onTransitionEnd}
            >
              {slides.map((w, i) => {
                const on = i === index;
                // Desktop peeks the adjacent slides too, so they're visible
                // (and can paint as the LCP element) on first load, not just
                // the centered one.
                const inViewport = on || Math.abs(i - index) === 1;
                // peeking slides sit shorter and grow to full height as they
                // slide into the active center; centered vertically so both
                // edges ease in/out together rather than pinning to the top.
                const heightPct = on || !isDesktop ? 100 : 84;
                // Staggered load-in: cascade the visible slides left→right off
                // the leftmost peeking slide, so they fade/rise in one after
                // another rather than all at once. Off-screen slides just
                // start in place (no visible entrance).
                const leftmostVisible = index - 1;
                const stagger = Math.max(0, i - leftmostVisible);
                const entranceDelay = entered ? stagger * 90 : 0;
                const nearViewport = Math.abs(i - index) <= 2;
                return (
                  <div
                    key={`${w.src}-${i}`}
                    role="link"
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    onClick={() => { if (Math.abs(dragState.current?.dx ?? 0) <= 6) router.push("/work"); }}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex((prev) => (prev === i ? null : prev))}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push("/work"); } }}
                    className="relative h-full shrink-0 px-1.5 sm:px-3 flex items-center"
                    style={{
                      width: `${slideWidth}%`,
                      cursor: "none",
                      WebkitUserDrag: "none",
                      // Entrance: fade + slight rise/scale, staggered per slide.
                      // Only near-viewport slides bother animating (the rest
                      // are off-screen anyway); once entered, everything rests
                      // at its natural state so nothing lingers.
                      opacity: entered || !nearViewport ? 1 : 0,
                      transform: entered || !nearViewport ? "none" : "translateY(16px) scale(0.96)",
                      transition: `opacity 620ms cubic-bezier(0.22,1,0.36,1) ${entranceDelay}ms, transform 620ms cubic-bezier(0.22,1,0.36,1) ${entranceDelay}ms`,
                    } as React.CSSProperties}
                    tabIndex={on ? 0 : -1}
                  >
                    <div
                      className="relative w-full rounded-2xl overflow-hidden"
                      style={{
                        height: `${heightPct}%`,
                        // Gate the height ramp on `animate` too. During the
                        // instant re-home at the loop seam (animate=false), the
                        // just-active clone would otherwise animate its
                        // height/blur back to the inactive state while the
                        // identical real slide animates up — that crossfade is
                        // exactly the "snap." Making these instant during the
                        // re-home keeps the handoff invisible.
                        transition: animate ? `height ${WORK_DURATION}ms ${WORK_EASE}` : "none",
                      }}
                    >
                      <Image
                        src={w.src}
                        alt={w.title}
                        fill
                        draggable={false}
                        priority={inViewport}
                        loading={inViewport ? undefined : "lazy"}
                        quality={90}
                        sizes={isDesktop ? `${WORK_PEEK_PCT}vw` : "calc(100vw - 12px)"}
                        className="object-cover object-top"
                        style={{
                          filter: on || !isDesktop ? "none" : "brightness(0.55) blur(3px)",
                          transform: on || !isDesktop ? "scale(1)" : "scale(1.06)",
                          transition: animate
                            ? "filter 500ms ease, transform 500ms ease"
                            : "none",
                        }}
                      />
                      {/* Bottom fade + label — scoped to this slide so it never overhangs into neighbors */}
                      <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none">
                        <div className="p-4" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 55%, transparent 100%)" }}>
                          <p className="text-[14px] sm:text-[18px] tracking-tight text-white font-normal">{w.title}</p>
                          <p className="text-[11px] sm:text-[13px] tracking-tight" style={{ color: "rgba(255,255,255,0.45)" }}>{w.category}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </FollowerPointerCard>
    </section>
  );
}

function DesignPhilosophy() {
  const points = [
    "We design around how real people move through a site, not around trends that'll date the brand in a year.",
    "The best design disappears. It should feel effortless to the customer, even when the work behind it wasn't.",
  ];
  return (
    <section className="rise w-full max-w-[88rem] mx-auto px-6 sm:px-8">
      <div className="max-w-2xl sm:mx-auto">
        <p className="text-[16.5px] sm:text-[19px] leading-relaxed tracking-tight text-left" style={{ color: "#5c5c5c" }}>
          Design isn't something we add at the end. It's how we think about a brand from the first conversation. We build for people who'll actually spend time with the site, not for what looks good in a case study, and that shift in focus is usually what separates a site that converts from one that just looks nice.
        </p>
        <div className="flex flex-col gap-4 mt-8">
          {points.map((text, i) => (
            <div key={i} className="flex gap-3 sm:max-w-xl">
              <span className="text-[16.5px] sm:text-[19px] tracking-tight tabular-nums shrink-0" style={{ color: "#1a1a1a" }}>
                {i + 1}.
              </span>
              <p className="text-[16.5px] sm:text-[19px] leading-relaxed tracking-tight text-left" style={{ color: "#5c5c5c" }}>
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Ramps up smoothly rather than moving fastest right at t=0, so a release
// glide starts unhurried instead of snapping off abruptly the instant you
// let go.
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function AiApproach() {
  return (
    <section className="rise w-full max-w-[88rem] mx-auto px-6 sm:px-8">
      <div className="max-w-2xl sm:mx-auto">
        <p className="text-[16.5px] sm:text-[19px] leading-relaxed tracking-tight text-left" style={{ color: "#5c5c5c" }}>
          We treat AI as a frontier tool, not a shortcut. It lets a studio our size move like a much larger one, giving us room to experiment with more directions per project while still tightening turnaround time and raising the bar on quality. It has changed how fast we can work, not what we're willing to ship.
        </p>
        <p className="text-[16.5px] sm:text-[19px] leading-relaxed tracking-tight text-left mt-5" style={{ color: "#5c5c5c" }}>
          We've been fortunate to work alongside people building genuinely great things, and every project has added to how we think about the work. Along the way we've built a deep understanding of the fundamentals: design systems that hold up as a brand grows, infrastructure that stays out of the way, and the details that make a product actually resonate with the people using it.
        </p>
      </div>
    </section>
  );
}

// Wraps everything from the hero through AiApproach in a white "card" that
// sits on the page's true (black) canvas. As the card's own bottom edge
// approaches and crosses into the viewport, it eases into a slightly
// smaller, more tightly rounded shape — like it's settling back and away —
// instead of just cutting to black the instant its flow position ends.
// Tracks scroll position directly (same pattern as WorkThumbnails'
// scrollScale effect) rather than a fixed-duration animation, so the motion
// stays tied 1:1 to how far the user has scrolled and reverses cleanly.
function LightCard({ children }: { children: React.ReactNode }) {
  // Measured on a sentinel at the very end of the card's content, not the
  // scaling element itself — reading getBoundingClientRect() off an element
  // whose own transform you're about to update from that same read creates
  // a feedback loop (the scaled position feeds back into the next scroll
  // tick's measurement instead of tracking real scroll distance).
  const sentinelRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const card = cardRef.current;
    if (!sentinel || !card) return;

    // Polled every animation frame rather than driven off scroll events —
    // Lenis (this site's smooth-scroll library) advances the real scroll
    // position through its own RAF loop, not in lockstep with native
    // `scroll` events, so an event-driven listener here was reading a
    // position that lagged behind what was actually on screen, which is
    // what read as snapping instead of tracking the wheel/swipe input.
    // Polling directly every frame keeps this locked to the exact position
    // Lenis is rendering right now.
    const apply = () => {
      const rect = sentinel.getBoundingClientRect();
      const vh = window.innerHeight;
      // Ramps across a full viewport height of scrolling, starting the
      // instant the sentinel (end of the card's content) crosses the
      // bottom of the viewport, finishing once it's scrolled a full
      // viewport height past that — a wide, generous window so the motion
      // reads as continuous rather than resolving over a few px of scroll.
      let progress = Math.min(1, Math.max(0, (vh - rect.bottom) / vh));
      // Below this, the visual difference is imperceptible but a non-zero
      // scale() value still forces the card onto its own GPU-composited
      // layer — which is what caused a faint line to reappear right at the
      // resting (should-be-untransformed) state: floating-point noise from
      // getBoundingClientRect() rarely lands on exactly 0, so the `=== 1`
      // check below almost never actually held even when nothing should be
      // visually scaling yet. Snapping the whole low end to 0 first means
      // the transform is genuinely omitted, not just visually close to it.
      if (progress < 0.01) progress = 0;
      const scale = 1 - progress * 0.08;
      // On mobile the corner radius reads too large against the narrow
      // viewport, so keep its ramp under 25px; desktop keeps the fuller
      // 32→60 ramp.
      const isMobile = window.innerWidth < 640;
      const radius = isMobile ? 12 + progress * 13 : 32 + progress * 28;
      card.style.transform = progress === 0 ? "" : `scale(${scale})`;
      card.style.borderBottomLeftRadius = `${radius}px`;
      card.style.borderBottomRightRadius = `${radius}px`;
      rafRef.current = requestAnimationFrame(apply);
    };
    rafRef.current = requestAnimationFrame(apply);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    // The wrapper is the black backdrop the card scales away from. The card
    // itself is normal document flow (its natural height determines the
    // wrapper's height) but visually pinned flush to the wrapper via a
    // second, absolutely-positioned "top pad" strip that always stays
    // exactly full-width/full-black-free at the top — see below — so
    // nothing at the very top edge (where the card never actually needs to
    // shrink) can ever expose the black wrapper behind it, regardless of
    // any sub-pixel rounding the scale()'d bottom edge introduces.
    <div
      className="relative"
      style={{ width: "100vw", marginLeft: "calc(50% - 50vw)", background: "#0a0a0a" }}
    >
      <div
        ref={cardRef}
        className="relative"
        style={{
          background: "#fff",
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          overflow: "hidden",
          transformOrigin: "center top",
        }}
      >
        {children}
        <div ref={sentinelRef} />
      </div>
      {/* Covers exactly the sliver a scale()'d box can expose right at its
          own top edge from sub-pixel rounding — a fixed-height white strip
          that never moves or scales, so there's nothing dynamic left to
          misalign against the wrapper's black background. */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: 6, background: "#fff", zIndex: 1 }} />
    </div>
  );
}

function ClientCarousel({ initialItems }: { initialItems: ClientCarouselItem[] }) {
  const [items] = useState<ClientCarouselItem[]>(initialItems);
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const padRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  // Desktop hover index. The card's transform is driven inline (for the mobile
  // active state and live swipe), and an inline transform overrides a Tailwind
  // `sm:hover:scale` class, so the desktop hover lift has to be folded into the
  // same inline transform rather than relying on CSS :hover.
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Mirrors isTouching in a ref too — the scroll listener's closure below is
  // set up once (deps: [items]) rather than re-subscribing on every touch
  // start/end, so it needs a ref to read the live value instead of a stale
  // one captured at mount.
  const isTouchingRef = useRef(false);
  const liveTouchRafRef = useRef<number | null>(null);
  const liveNearestRef = useRef<number | null>(null);
  // Each card's offset within the scrollable track, cached once (cards don't
  // move relative to each other — only the whole track scrolls), so the
  // live path never needs a per-card getBoundingClientRect() call, just
  // this fixed offset minus el.scrollLeft. scrollLeft is the browser's own
  // authoritative, always-current scroll position — reading it directly
  // sidesteps both problems the earlier attempts ran into: computing from
  // getBoundingClientRect() every frame (correct but was lagging behind a
  // fast native flick) and computing from raw finger delta (fast, but wrong
  // whenever native scroll applied any resistance/edge behavior the model
  // didn't account for, which broke the slow-drag case that used to work).
  const cardOffsetsRef = useRef<number[]>([]);
  const [isTouching, setIsTouching] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Desktop drag state. Position is tracked as a plain translateX offset
  // (<= 0, more negative reveals cards further right) applied directly to
  // the DOM node via a ref rather than React state, so drag frames never
  // wait on a render. The section's left padding follows the same drag 1:1
  // (collapsing toward full-bleed as you pull left) rather than transitioning
  // on a timer, so the width change tracks the cursor exactly like the
  // cards do. It only eases back (via a CSS transition, drag released) once
  // translateX has returned all the way to 0.
  const translateRef = useRef(0);
  const padRest = useRef(0);
  const collapseDistance = 160; // px of drag needed to fully reach full-bleed
  const dragEase = 0.6; // <1 softens the drag so it doesn't track the cursor 1:1
  const dragRef = useRef<{ startX: number; startTranslate: number; dragging: boolean; moved: boolean } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const measure = () => setIsDesktop(window.innerWidth >= 640);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Mobile only: whichever card sits nearest the track's center gets the
  // "active" hover-style treatment (scale + shadow), so it applies whether
  // you got there by touch, drag, or the arrow buttons — not just touch
  // events on that specific card. This drives the settled/at-rest state via
  // React (activeIndex), which the CSS transition eases into smoothly.
  const updateActiveCard = () => {
    if (window.innerWidth >= 640) { setActiveIndex(null); return; }
    const el = scrollRef.current;
    const cards = cardRefs.current;
    if (!el) return;
    const trackRect = el.getBoundingClientRect();
    const center = trackRect.left + trackRect.width / 2;
    let nearest: number | null = null;
    let nearestDist = Infinity;
    cards.forEach((card, i) => {
      if (!card) return;
      const r = card.getBoundingClientRect();
      const dist = Math.abs(r.left + r.width / 2 - center);
      if (dist < nearestDist) { nearestDist = dist; nearest = i; }
    });
    setActiveIndex(nearest);
  };

  // Caches each card's position within the scrollable content (left edge
  // relative to the track's own coordinate space, i.e. independent of the
  // current scroll position) — cards don't move relative to each other, so
  // this only needs recomputing when the item list or layout changes, not
  // on every frame of a gesture.
  const measureCardOffsets = () => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    cardOffsetsRef.current = cardRefs.current.map((card) => {
      if (!card) return 0;
      return card.getBoundingClientRect().left - el.getBoundingClientRect().left + scrollLeft;
    });
  };

  // While actively swiping, each card's scale/lift is a continuous function
  // of its own live distance from the track's center — not a binary flip
  // once some threshold is crossed — so the outgoing card visibly shrinks
  // and the incoming one visibly grows in lockstep with the finger, the
  // whole way between them. Written straight to each card's DOM node
  // (bypassing React state) so there's no render latency between the
  // finger's position this frame and what's painted.
  //
  // Driven off el.scrollLeft — the browser's own authoritative, always-
  // current scroll position — rather than re-querying getBoundingClientRect()
  // per card every frame (correct, but reads as laggy since that query
  // reflects wherever the DOM happened to have last painted) or the raw
  // finger position (fast, but the touch-to-scroll relationship isn't
  // guaranteed 1:1 once native resistance/edge behavior kicks in). Combined
  // with the cached per-card offsets above, this is just arithmetic — no
  // DOM reads at all in the hot path.
  const applyLiveCardScale = () => {
    const el = scrollRef.current;
    const cards = cardRefs.current;
    const offsets = cardOffsetsRef.current;
    if (!el || offsets.length === 0) return;
    const scrollLeft = el.scrollLeft;
    const viewportCenter = el.clientWidth / 2;
    const slot = cards[0]?.getBoundingClientRect().width ?? 300;
    let nearest: number | null = null;
    let nearestDist = Infinity;
    cards.forEach((card, i) => {
      if (!card) return;
      const cardCenter = (offsets[i] ?? 0) - scrollLeft + (card.clientWidth / 2);
      const dist = Math.abs(cardCenter - viewportCenter);
      if (dist < nearestDist) { nearestDist = dist; nearest = i; }
      const proximity = Math.max(0, 1 - dist / slot);
      const scale = 1 + 0.05 * proximity;
      const translateY = 6 - 12 * proximity; // +6px inactive -> -6px active
      card.style.transform = `translateY(${translateY}px) scale(${scale})`;
      card.style.boxShadow = proximity > 0.01 ? `0 0 ${14 * proximity}px 0px rgba(0,0,0,${0.2 * proximity})` : "none";
    });
    liveNearestRef.current = nearest;
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let liveRaf: number | null = null;
    const onScroll = () => {
      // Live-scale for as long as the position is actually changing —
      // including the momentum/deceleration phase after a quick flick,
      // where the finger has already lifted (isTouchingRef is false) but
      // the browser is still animating the scroll on its own. Gating this
      // on isTouchingRef meant a fast swipe produced zero visible scaling
      // during that glide — momentum scroll events landed in the settle-
      // only branch below and just sat there until scrolling fully stopped,
      // which read as "nothing happens until it's already on the next
      // card." isTouching (the state, driving the fast/no-transition CSS
      // below) is kept true through this whole active-scroll window too,
      // for the same reason — it only flips back once the settle timer
      // actually fires, meaning scrolling has genuinely stopped.
      setIsTouching(true);
      if (liveRaf === null) {
        liveRaf = requestAnimationFrame(() => {
          liveRaf = null;
          applyLiveCardScale();
        });
      }
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      settleTimerRef.current = setTimeout(() => {
        setIsTouching(false);
        updateActiveCard();
      }, 20);
    };
    updateActiveCard();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      if (liveRaf !== null) cancelAnimationFrame(liveRaf);
    };
  }, [items]);

  // Desktop drag-to-reveal: rather than native overflow scrolling, the track
  // is positioned with a plain translateX. The section's left padding is a
  // pure function of that same translateX (interpolated from its aligned
  // resting value down to full-bleed over `collapseDistance` px), so the
  // width change tracks the drag 1:1 in both directions instead of easing
  // in on a timer — it only transitions once the drag ends and the padding
  // needs to ease the rest of the way back to aligned.
  const trackMinTranslate = () => {
    const track = trackRef.current;
    const viewport = scrollRef.current;
    if (!track || !viewport) return 0;
    // A little extra slack past where the last card's trailing edge would
    // naturally land, so dragging all the way to the end lets it keep
    // sliding a bit further inward instead of stopping dead right at the
    // content's actual boundary.
    const overdrag = 200;
    return Math.min(0, viewport.clientWidth - track.scrollWidth - overdrag);
  };

  const applyPadForTranslate = (x: number) => {
    const pad = padRef.current;
    if (!pad) return;
    const t = Math.max(0, Math.min(1, -x / collapseDistance));
    pad.style.paddingLeft = `${padRest.current + (6 - padRest.current) * t}px`;
  };

  const onPointerDownDrag = (e: React.PointerEvent) => {
    if (!isDesktop || e.button !== 0) return;
    const viewport = scrollRef.current;
    if (!viewport) return;
    // Only arm the gesture here — don't touch isDragging/isExpanded, the
    // padding, or pointer capture yet. A plain click is a pointerdown with
    // no movement at all, and flipping those on every down (even one that
    // never becomes a real drag) was visibly bouncing the padding/cards out
    // and back on every single card click. Capturing the pointer here was
    // worse: browsers can fail to dispatch the resulting click event to the
    // original target (a card's <Link>) once an ancestor has taken pointer
    // capture, even if the capture only lasted a few milliseconds — which
    // is exactly why cards stopped being clickable. All of this now only
    // happens once real movement is confirmed, in onPointerMoveDrag below.
    dragRef.current = { startX: e.clientX, startTranslate: translateRef.current, dragging: true, moved: false };
  };
  const onPointerMoveDrag = (e: React.PointerEvent) => {
    const d = dragRef.current;
    const track = trackRef.current;
    const pad = padRef.current;
    const viewport = scrollRef.current;
    if (!d?.dragging || !track || !pad) return;
    const dx = e.clientX - d.startX;
    if (!d.moved) {
      if (Math.abs(dx) <= 3) return;
      d.moved = true;
      e.preventDefault();
      viewport?.setPointerCapture(e.pointerId);
      // First confirmed movement — now it's a real drag. Pin the padding to
      // its current rendered value before flipping state, same reasoning as
      // before: isDragging/isExpanded swap the wrapper's class to its
      // collapsed variant instantly, and without anchoring the inline style
      // to today's real value first, that class swap alone would snap the
      // padding to full-bleed the moment the drag is confirmed.
      const currentPad = parseFloat(getComputedStyle(pad).paddingLeft) || 0;
      pad.style.paddingLeft = `${currentPad}px`;
      if (translateRef.current === 0) padRest.current = currentPad;
      setIsDragging(true);
      setIsExpanded(true);
    } else {
      e.preventDefault();
    }
    // Hard-clamped to the actual bounds — no rubber-band overshoot. Dragging
    // past either end just stops there, same as every other position in the
    // carousel stays exactly where you leave it, with nothing left to glide
    // or bounce back from on release.
    const min = trackMinTranslate();
    const next = Math.max(min, Math.min(0, d.startTranslate + dx * dragEase));
    translateRef.current = next;
    track.style.transform = `translateX(${next}px)`;
    applyPadForTranslate(next);
  };
  const endDragDesktop = (e: React.PointerEvent) => {
    const d = dragRef.current;
    const viewport = scrollRef.current;
    const pad = padRef.current;
    dragRef.current = null;
    // A plain click never crossed the movement threshold, so isDragging/
    // isExpanded/padding were never touched — nothing to unwind, and
    // releasing the pointer capture (if any was actually set) is all that's
    // needed before letting the click proceed normally.
    if (!d?.moved) {
      if (viewport?.hasPointerCapture(e.pointerId)) viewport.releasePointerCapture(e.pointerId);
      return;
    }
    setIsDragging(false);
    // Only ease the padding all the way back to aligned once you've dragged
    // back to the very first card — anywhere past that, it settles at
    // full-bleed. Either way, the padding was tracking the drag fluidly
    // (partially collapsed, not just 0%/100%) right up until release, so
    // clearing the inline value immediately and handing off to the CSS
    // class snapped it straight to that class's binary target — a real jump
    // whenever release happened at a partial value, which is exactly the
    // first few cards' region (past that, the drag has already fully
    // collapsed the padding, so there was nothing left to jump). Instead,
    // animate the inline value the rest of the way to its resting target,
    // then hand off to the class only once they already match.
    const nextExpanded = translateRef.current < 0;
    if (pad) {
      const from = parseFloat(pad.style.paddingLeft) || padRest.current;
      const to = nextExpanded ? 6 : padRest.current;
      if (Math.abs(to - from) > 0.5) {
        const startTime = performance.now();
        const duration = 450;
        const stepPad = (now: number) => {
          const t = Math.min(1, (now - startTime) / duration);
          pad.style.paddingLeft = `${from + (to - from) * easeInOutCubic(t)}px`;
          if (t < 1) requestAnimationFrame(stepPad);
          else pad.style.paddingLeft = "";
        };
        requestAnimationFrame(stepPad);
      } else {
        pad.style.paddingLeft = "";
      }
    }
    setIsExpanded(nextExpanded);
    if (viewport?.hasPointerCapture(e.pointerId)) viewport.releasePointerCapture(e.pointerId);
  };

  // While the section's padding eases back to its resting (aligned) value —
  // which only happens once translateX has returned to 0 — the viewport's
  // width doesn't actually change here (translateX is already 0, so there's
  // nothing to re-clamp). This still guards against the general case of the
  // viewport resizing (e.g. window resize) while settled at the aligned width.
  useEffect(() => {
    if (isDragging || isExpanded || !isDesktop) return;
    const track = trackRef.current;
    if (!track) return;
    let raf: number;
    const clampDuringReturn = () => {
      const min = trackMinTranslate();
      if (translateRef.current < min) {
        translateRef.current = min;
        track.style.transform = `translateX(${min}px)`;
      }
      raf = requestAnimationFrame(clampDuringReturn);
    };
    raf = requestAnimationFrame(clampDuringReturn);
    const stop = setTimeout(() => cancelAnimationFrame(raf), 350);
    return () => { cancelAnimationFrame(raf); clearTimeout(stop); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, isExpanded, isDesktop]);

  // On mobile, the track's own CSS scroll-snap (snap-x snap-mandatory +
  // snap-center per card) handles the actual snapping natively — most
  // mobile browsers apply that snap tension live, during the drag itself,
  // which reads as a fluid magnetic pull toward the nearest card rather
  // than a free scroll that only corrects itself after you let go. All
  // that's needed here is tracking whether a finger is down, to pick the
  // fast/live vs. slow/settled transition speed on the active card's scale.
  const onTouchStart = () => {
    if (window.innerWidth >= 640) return;
    measureCardOffsets();
    isTouchingRef.current = true;
    setIsTouching(true);
  };
  // Some mobile browsers throttle/coalesce the `scroll` event during a
  // touch-driven drag rather than firing it every frame, so relying on it
  // alone left the active-card update visibly lagging behind the finger
  // instead of tracking it live. touchmove fires reliably on the actual
  // gesture regardless of scroll-event throttling, so it drives the same
  // rAF-throttled update independent of whether a scroll event happened to
  // land this frame.
  const onTouchMove = () => {
    if (!isTouchingRef.current || liveTouchRafRef.current !== null) return;
    liveTouchRafRef.current = requestAnimationFrame(() => {
      liveTouchRafRef.current = null;
      applyLiveCardScale();
    });
  };
  const onTouchEnd = () => {
    // Only clears the finger-is-down flag that gates touchmove's own
    // scheduling — NOT the isTouching state that drives the fast/no-
    // transition CSS. That one stays true through any momentum scrolling
    // that continues after the finger lifts (owned by the scroll listener's
    // settle timer above), otherwise it would flip back to the slow eased
    // transition right as momentum begins, which is the same "laggy during
    // the glide" problem this was meant to fix.
    isTouchingRef.current = false;
    // The live scale already knows exactly which card is nearest as of the
    // last frame — hand that straight to React so the settle transition
    // starts from the same place the live phase left off, rather than
    // waiting on the debounced re-measurement (which re-derives the same
    // answer a beat later, reading as a pause before the "final" snap).
    // Momentum scrolling after this (if any) will keep correcting it live.
    if (liveNearestRef.current !== null) setActiveIndex(liveNearestRef.current);
  };

  if (items.length === 0) return null;

  return (
    <section className="rise w-[100vw] ml-[calc(50%-50vw)] sm:mr-[calc(50%-50vw)]">
      <div
        ref={padRef}
        className={`px-1.5 sm:pr-0 ${isDragging ? "" : "sm:transition-[padding-left] sm:duration-300 sm:ease-out"} ${isDragging || isExpanded ? "sm:pl-1.5" : "sm:pl-[calc(50vw-336px)]"}`}
      >
      <div className="relative">
        <div
          ref={scrollRef}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onPointerDown={onPointerDownDrag}
          onPointerMove={onPointerMoveDrag}
          onPointerUp={endDragDesktop}
          onPointerCancel={endDragDesktop}
          className={`overflow-x-auto sm:overflow-x-hidden touch-pan-x touch-pan-y snap-x snap-mandatory sm:snap-none scroll-smooth py-6 sm:pb-10 sm:-ml-5 sm:pl-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]${isDragging ? " select-none" : ""}`}
          style={{ cursor: isDragging ? "grabbing" : undefined }}
        >
          <div
            ref={trackRef}
            className="flex items-start gap-5 sm:gap-4 sm:w-max"
            style={isDesktop ? { transform: `translateX(${translateRef.current}px)` } : undefined}
          >
            <div className="shrink-0 sm:hidden" style={{ width: 6 }} aria-hidden="true" />
            {items.map((item, i) => (
              <div key={item.slug} className="shrink-0 flex flex-col gap-3 sm:w-[420px]">
                <Link
                  ref={(el) => { cardRefs.current[i] = el; }}
                  href="/work"
                  draggable={false}
                  onClick={(e) => { if (dragRef.current?.moved) e.preventDefault(); }}
                  className="relative block shrink-0 snap-center sm:snap-align-none rounded-2xl overflow-hidden group w-[300px] sm:w-[420px] sm:cursor-grab"
                  style={{
                    aspectRatio: "4 / 5",
                    // While actively swiping, applyLiveCardScale writes
                    // transform/boxShadow straight to the DOM every frame —
                    // a CSS transition here would keep trying to animate
                    // between each of those rapid targets and never catch
                    // up, reading as laggy instead of tracking the finger
                    // 1:1. It only applies once the finger lifts, easing
                    // from wherever the live phase left off to the single
                    // settled state (activeIndex) below.
                    transition: isTouching
                      ? "none"
                      : "transform 750ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 750ms cubic-bezier(0.4,0,0.2,1)",
                    // Mobile settled state (activeIndex) and desktop hover
                    // (hoveredIndex) both drive the lift via this one inline
                    // transform, since an inline transform overrides a CSS
                    // :hover scale class.
                    transform: activeIndex === i
                      ? "translateY(-6px) scale(1.05)"
                      : activeIndex !== null
                        ? "translateY(6px) scale(1)"
                        : hoveredIndex === i
                          ? "translateY(-4px) scale(1.02)"
                          : "translateY(0) scale(1)",
                    ...(activeIndex === i ? { boxShadow: "0 0 14px 0px rgba(0,0,0,0.2)" } : {}),
                  }}
                  onMouseEnter={(e) => { setHoveredIndex(i); e.currentTarget.style.boxShadow = "0 0 22px 0px rgba(0,0,0,0.35)"; }}
                  onMouseLeave={(e) => { setHoveredIndex((prev) => (prev === i ? null : prev)); if (activeIndex !== i) e.currentTarget.style.boxShadow = "none"; }}
                >
                  {item.card ? (
                    <Image
                      src={item.card}
                      alt={item.client}
                      fill
                      priority={i < 2}
                      loading={i < 2 ? undefined : "lazy"}
                      quality={90}
                      sizes="(max-width: 640px) 300px, 420px"
                      className="object-cover"
                      draggable={false}
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0" style={clientCardGradient(item.palette)} />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                          backgroundSize: "180px 180px",
                          mixBlendMode: "overlay",
                          opacity: 0.35,
                        }}
                      />
                    </>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
                    {item.logo ? (
                      <Image
                        src={item.logo}
                        alt={item.client}
                        width={180}
                        height={180}
                        priority={i < 2}
                        loading={i < 2 ? undefined : "lazy"}
                        sizes="230px"
                        className="h-auto object-contain"
                        style={{
                          width: `${55 * (CLIENT_CARD_LOGO_SCALE[item.slug] ?? 1)}%`,
                          filter: CLIENT_CARD_NATURAL_COLOR_LOGO_SLUGS.has(item.slug)
                            ? "drop-shadow(0 3px 6px rgba(0,0,0,0.55)) drop-shadow(0 1px 14px rgba(0,0,0,0.4))"
                            : "brightness(0) invert(1) drop-shadow(0 3px 6px rgba(0,0,0,0.55)) drop-shadow(0 1px 14px rgba(0,0,0,0.4))",
                        }}
                        draggable={false}
                      />
                    ) : !item.card ? (
                      <p
                        className="text-[22px] sm:text-[26px] font-medium tracking-tight text-center leading-tight"
                        style={{ color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,0.35)" }}
                      >
                        {item.client}
                      </p>
                    ) : null}
                  </div>
                </Link>
                <div className="flex flex-col gap-1.5 w-[300px] sm:w-[420px]">
                  <Link
                    href="/work"
                    draggable={false}
                    onClick={(e) => { if (dragRef.current?.moved) e.preventDefault(); }}
                    className="flex items-center justify-between gap-2 pt-3 sm:pt-0 group/cta"
                  >
                    <p className="text-[15px] tracking-tight" style={{ color: "rgb(var(--fg))" }}>{item.client}</p>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0 transition-transform duration-200 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" style={{ color: "rgb(var(--muted))" }}>
                      <line x1="4" y1="12" x2="12" y2="4" /><polyline points="5 4 12 4 12 11" />
                    </svg>
                  </Link>
                  {item.blurb && (
                    <div className="max-w-[85%] sm:max-w-[75%] rounded-xl px-3 py-2" style={{ background: "rgb(var(--fg) / 0.06)" }}>
                      <p
                        className="text-[14px] leading-relaxed tracking-tight w-full"
                        style={{ color: "rgb(var(--muted))" }}
                      >
                        {item.blurb}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>

    </section>
  );
}

function VisualLayout({ initialWork }: { initialWork: ClientCarouselItem[] }) {
  const [dashboardModalOpen, setDashboardModalOpen] = useState(false);
  const [accentColor, setAccentColor] = useState(WORK_ITEMS[0].accent);
  return (
    <>
    <DashboardModal open={dashboardModalOpen} onClose={() => setDashboardModalOpen(false)} />
    <main className="page-container mx-3 sm:mx-auto w-auto sm:w-full max-w-[88rem] flex flex-col">

      <LightCard>
        <div className="mx-auto w-full max-w-[88rem] flex flex-col">
          <VercelHero accentColor={accentColor} />

          <div className="py-1 sm:py-6" />

          {/* Pull the carousel up on mobile into the hero's bottom padding. */}
          <div className="-mt-[14dvh] sm:mt-0">
            <WorkThumbnails onActiveAccent={(c) => setAccentColor(c)} />
          </div>

          <div className="py-7 sm:py-12" />

          <DesignPhilosophy />

          <div className="py-10 sm:py-8" />

          <ClientCarousel initialItems={initialWork} />

          <div className="py-10 sm:py-8" />

          <AiApproach />

          <div className="py-16 sm:py-14" />
        </div>
      </LightCard>

      <div className="homepage-dark-zone" style={{ width: "100vw", marginLeft: "calc(50% - 50vw)", background: "rgb(var(--bg))", marginTop: -2 }}>
        <div className="mx-auto w-full max-w-[88rem] flex flex-col">
          <div className="py-4 sm:py-6" />

          <IndexFaq />

          <div className="py-14 sm:py-20" />

          <CalEmbed />

          <div className="py-20 sm:py-20" />
        </div>
      </div>

    </main>
    </>
  );
}
