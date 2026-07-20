"use client";

import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FollowerPointerCard } from "@/components/ui/following-pointer";

export default function Home() {
  return <VisualLayout />;
}

const hl = (text: string) => (
  <span
    style={{
      backgroundImage:
        "linear-gradient(104deg, rgba(10,132,255,0) 0.3%, rgba(10,132,255,0.32) 2.5%, rgba(10,132,255,0.14) 20%, rgba(10,132,255,0.12) 80%, rgba(10,132,255,0.3) 97.5%, rgba(10,132,255,0) 99.7%)",
      color: "#0a84ff",
      borderRadius: 4,
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

function GradientWord({ children, color = "#0a84ff", trigger, italic }: { children: string; color?: string; trigger?: number; italic?: boolean }) {
  const chars = children.split("");
  const isFirstRun = useRef(true);
  const [cycleId, setCycleId] = useState(0);
  const [displayColor, setDisplayColor] = useState(color);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Starts deterministic (all "fill") so server and client render identically
  // on first paint — randomization only happens client-side, inside the
  // color-change effect below, avoiding a hydration mismatch.
  const variantsRef = useRef<("fill" | "outline" | "ghost")[]>(chars.map(() => "fill"));

  // Re-plays the ripple whenever `trigger` changes (falls back to `color`
  // if no trigger is passed) — driven by an always-incrementing value
  // rather than color equality, so it still fires when two consecutive
  // slides happen to share the same accent color.
  useEffect(() => {
    if (isFirstRun.current) { isFirstRun.current = false; return; }
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setCycleId((n) => n + 1);
    // Re-roll which characters flash filled / outlined / unfilled this cycle.
    variantsRef.current = chars.map(() => (["fill", "outline", "ghost"] as const)[Math.floor(Math.random() * 3)]);
    // Swap the settled color roughly mid-ripple so the last chars land in
    // the new hue rather than snapping the whole word instantly.
    const t = setTimeout(() => setDisplayColor(color), 260);
    timersRef.current.push(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger ?? color]);

  const bloom = `0 0 12px ${hexToRgba(displayColor, 0.55)}, 0 0 28px ${hexToRgba(displayColor, 0.3)}`;

  return (
    <span className="inline-flex" aria-label={children} style={{ textShadow: bloom, transition: "text-shadow 400ms ease" }}>
      {chars.map((ch, i) => (
        <span
          key={`${cycleId}-${i}`}
          aria-hidden="true"
          className={`typer-char typer-char--${variantsRef.current[i]}`}
          style={{
            display: "inline-block",
            color: displayColor,
            fontWeight: 500,
            fontStyle: italic ? "italic" : undefined,
            letterSpacing: "-0.03em",
            marginRight: ch === " " ? undefined : "-0.04em",
            ["--ripple-color" as string]: color,
            animationDuration: "420ms",
            animationTimingFunction: "steps(1, jump-end)",
            animationFillMode: "both",
            animationDelay: `${i * 35}ms`,
            whiteSpace: ch === " " ? "pre" : "normal",
          }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

function VercelHero({ accentColor, accentTrigger }: { accentColor: string; accentTrigger?: number }) {
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
      style={{ width: "100vw", marginLeft: "calc(50% - 50vw)", background: "#fff", color: "#1a1a1a", overflow: "visible" }}
    >
      <div
        className="relative flex items-center"
      >
        <div className="relative max-w-[88rem] mx-auto w-full px-6 sm:pl-3 sm:pr-4 pt-16 sm:pt-24 pb-10 pb-[34dvh] flex flex-col items-center text-center gap-10 min-h-[100dvh] justify-center sm:min-h-0 sm:pb-10 sm:items-start sm:text-left sm:justify-start">
          <span
            className="inline-flex items-center rounded-full px-3.5 py-1.5 text-[12px] tracking-tight"
            style={{ ...fade(0), background: "#f0f0f0", color: "#5c5c5c" }}
          >
            900+ clients served since 2022
          </span>

          <h1
            className="font-normal tracking-tight leading-[0.88] max-w-xl"
            style={{ ...fade(120), color: "#1a1a1a", fontSize: "clamp(2.6rem, 6vw, 4.2rem)" }}
          >
            Design that moves at your{" "}
            <GradientWord color={accentColor} trigger={accentTrigger}>speed</GradientWord>
          </h1>

          <div className="hidden sm:flex flex-col gap-5 max-w-md absolute inset-y-0 right-0 justify-center">
            <p
              className="text-[16.5px] sm:text-[21px] leading-relaxed tracking-tight text-right"
              style={{ ...fade(300), color: "#5c5c5c" }}
            >
              We do design and development ourselves, so you're not stuck explaining your vision twice.
            </p>
          </div>

          <div className="flex flex-col gap-5 max-w-lg sm:hidden">
            <p
              className="text-[16.5px] leading-relaxed tracking-tight"
              style={{ ...fade(300), color: "#5c5c5c" }}
            >
              We do design and development ourselves, so you're not stuck explaining your vision twice.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://cal.com/jacob-c-99otvp/15min"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full px-4 py-2 text-[15px] font-medium tracking-tight"
              style={{ ...fade(660), background: "#1a1a1a", color: "#fff" }}
              onMouseEnter={e => { e.currentTarget.style.transition = "opacity 150ms ease, transform 150ms ease"; e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
              onMouseDown={e => { e.currentTarget.style.transform = "translateY(0px)"; }}
            >
              Book a call
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
    // Set up the Cal queue function before the script loads
    (function (C: any, A: string, L: string) {
      let p = function (a: any, ar: any) { a.q.push(ar); };
      let d = document;
      C.Cal = C.Cal || function () {
        let cal = C.Cal; let ar = arguments;
        if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; (d.head.appendChild(d.createElement("script")) as HTMLScriptElement).src = A; cal.loaded = true; }
        if (ar[0] === L) { let api: any = function () { p(api, arguments); }; let namespace = ar[1]; api.q = api.q || []; if (typeof namespace === "string") { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ["initNamespace", namespace]); } else p(cal, ar); return; } p(cal, ar);
      };
    })(window, "https://app.cal.com/embed/embed.js", "init");

    const Cal = (window as any).Cal;
    Cal("init", "15min", { origin: "https://app.cal.com" });
    Cal.config = Cal.config || {};
    Cal.config.forwardQueryParams = true;
    Cal.ns["15min"]("inline", {
      elementOrSelector: "#my-cal-inline-15min",
      config: { layout: "month_view", useSlotsViewOnSmallScreen: "true", theme: "light" },
      calLink: "jacob-c-99otvp/15min",
    });
    Cal.ns["15min"]("ui", { hideEventTypeDetails: false, layout: "month_view", theme: "light" });
  }, []);

  return (
    <section className="rise w-full max-w-[88rem] mx-auto px-6 sm:px-8">
      <div id="my-cal-inline-15min" style={{ width: "100%", height: "auto", minHeight: "500px", overflow: "visible", border: "1px solid rgb(var(--line))", borderRadius: "12px" }} />
    </section>
  );
}

const WORK_ITEMS = [
  { src: "/work/inboundly-1.png", title: "Inboundly", category: "Web app", accent: "#6a6dff" },
  { src: "/work/inboundly-2.png", title: "Inboundly", category: "Product design", accent: "#6f72ff" },
  { src: "/work/aether-2.webp", title: "Aether Theme", category: "Cart design", accent: "#5b7496" },
  { src: "/work/aether-1.webp", title: "Aether Theme", category: "Shopify theme", accent: "#39637e" },
  { src: "/work/ellora-la/1.webp", title: "Ellora La", category: "Shopify storefront", accent: "#cb591b" },
  { src: "/work/aether-3.png", title: "Aether Theme", category: "Product page", accent: "#1a1a1a" },
  { src: "/work/inertia-site.png", title: "Inertia", category: "Web design", accent: "#154365" },
  { src: "/work/ftgioo-1.png", title: "Ft. Gioo", category: "Shopify storefront", accent: "#b8433a" },
  { src: "/work/ftgioo-2.png", title: "Ft. Gioo", category: "Shop page", accent: "#b8433a" },
  { src: "/work/ftgioo-3.png", title: "Ft. Gioo", category: "Collection page", accent: "#b8433a" },
  { src: "/work/subtle-goods/1.png", title: "Subtle Goods", category: "Shopify storefront", accent: "#3a627c" },
  { src: "/work/subtle-goods/2.png", title: "Subtle Goods", category: "Coming soon page", accent: "#4a5a2c" },
  { src: "/work/trippie-1.png", title: "Trippie Redd", category: "Merch store", accent: "#9c0000" },
  { src: "/work/trippie-2.png", title: "Trippie Redd", category: "Music page", accent: "#0d1b3e" },
  { src: "/work/trippie-3.png", title: "Trippie Redd", category: "Product page", accent: "#a50000" },
  { src: "/work/ellora-la/2.png", title: "Ellora La", category: "Collection page", accent: "#6f283c" },
  { src: "/work/ellora-la/3.png", title: "Ellora La", category: "Product page", accent: "#5f696f" },
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

function WorkThumbnails({ onActiveAccent }: { onActiveAccent?: (color: string) => void }) {
  const router = useRouter();
  const total = WORK_ITEMS.length;
  // index runs 1..total inside a [last-clone, ...items, first-clone] track
  const [index, setIndex] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [navigating, setNavigating] = useState(false);
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

  const slides = [WORK_ITEMS[total - 1], ...WORK_ITEMS, WORK_ITEMS[0]];
  const slideWidth = isDesktop ? WORK_PEEK_PCT : 100;
  // center the active slide within the track when it's narrower than 100%
  const centerOffset = (100 - slideWidth) / 2;

  const goTo = (i: number) => { setAnimate(true); setIndex(i); };
  const advance = () => goTo(index + 1);
  const retreat = () => goTo(index - 1);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(advance, WORK_SLIDE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, paused]);

  // index runs 1..total inside the [last-clone, ...items, first-clone] track,
  // wrapping via onTransitionEnd, so map back to the real (non-clone) item.
  const activeAccent = WORK_ITEMS[((index - 1) % total + total) % total].accent;
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

  // After the wrap-slide finishes animating, jump instantly (no transition)
  // back to the real slide at the opposite end so the loop never runs out.
  const onTransitionEnd = () => {
    if (index === 0) { setAnimate(false); setIndex(total); }
    else if (index === total + 1) { setAnimate(false); setIndex(1); }
  };
  useEffect(() => {
    if (!animate) {
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
      return () => cancelAnimationFrame(id);
    }
  }, [animate]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragState.current = { startX: e.clientX, dragging: true, dx: 0 };
    setPaused(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current?.dragging) return;
    const dx = e.clientX - dragState.current.startX;
    dragState.current.dx = dx;
    setDragX(dx);
  };
  const endDrag = () => {
    if (!dragState.current?.dragging) return;
    dragState.current.dragging = false;
    const w = widthRef.current || 1;
    const threshold = w * 0.12;
    setAnimate(true);
    if (dragX < -threshold) setIndex(i => i + 1);
    else if (dragX > threshold) setIndex(i => i - 1);
    setDragX(0);
    setPaused(false);
  };

  const dragPct = widthRef.current ? (dragX / widthRef.current) * 100 : 0;
  // each slide occupies `slideWidth`%; shift left by index slides, then add
  // the centering offset so the active slide sits in the middle on desktop
  const trackOffset = -index * slideWidth + centerOffset + dragPct;

  const arrowClass = "flex items-center justify-center size-11 rounded-full transition-all duration-200 hover:scale-105";
  const arrowStyle = { background: "rgb(var(--fg) / 0.06)", color: "rgb(var(--muted))" } as const;

  return (
    <section
      ref={sectionRef}
      className="relative sm:mt-10"
      style={{ width: "100vw", marginLeft: "calc(50% - 50vw)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => { setPaused(false); dragState.current = null; }}
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
      <FollowerPointerCard title="View project" className="w-full">
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
                transition: animate ? `transform ${WORK_DURATION}ms ${WORK_EASE}` : "none",
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
                return (
                  <div
                    key={`${w.src}-${i}`}
                    role="link"
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    onClick={() => { if (Math.abs(dragState.current?.dx ?? 0) <= 6) { setNavigating(true); setTimeout(() => router.push("/work"), 300); } }}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push("/work"); } }}
                    className="relative h-full shrink-0 px-1.5 sm:px-3 flex items-center"
                    style={{ width: `${slideWidth}%`, cursor: "none", WebkitUserDrag: "none" } as React.CSSProperties}
                    tabIndex={on ? 0 : -1}
                  >
                    <div
                      className="relative w-full rounded-2xl overflow-hidden"
                      style={{
                        height: `${heightPct}%`,
                        transition: `height ${WORK_DURATION}ms ${WORK_EASE}`,
                      }}
                    >
                      <Image
                        src={w.src}
                        alt={w.title}
                        fill
                        draggable={false}
                        priority={inViewport}
                        loading={inViewport ? undefined : "lazy"}
                        sizes={isDesktop ? `${WORK_PEEK_PCT}vw` : "calc(100vw - 12px)"}
                        className="object-cover object-top"
                        style={{
                          filter: on || !isDesktop ? "none" : "brightness(0.55) blur(3px)",
                          transform: on || !isDesktop ? "scale(1)" : "scale(1.06)",
                          transition: "filter 500ms ease, transform 500ms ease",
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

          {navigating && (
            <div className="absolute inset-0 z-20 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.25)" }}>
              <div
                className="size-6 rounded-full animate-spin"
                style={{ border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff" }}
              />
            </div>
          )}
        </div>
      </FollowerPointerCard>

      {/* Prev / next arrows — below the carousel, mobile only (desktop drags instead) */}
      <div className="flex sm:hidden items-center justify-end gap-3 mt-5 px-3">
        <button type="button" aria-label="Previous project" onClick={retreat} className={arrowClass} style={arrowStyle}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <line x1="13" y1="8" x2="3" y2="8" /><polyline points="7 4 3 8 7 12" />
          </svg>
        </button>
        <button type="button" aria-label="Next project" onClick={advance} className={arrowClass} style={arrowStyle}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <line x1="3" y1="8" x2="13" y2="8" /><polyline points="9 4 13 8 9 12" />
          </svg>
        </button>
      </div>
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

// Eases the native scrollLeft toward a target over rAF frames — smoother and
// more "fluid" than the browser's built-in smooth-scroll, which feels stiff
// at this card size.
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function ClientCarousel() {
  const [items, setItems] = useState<{ slug: string; client: string; image: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollAnimRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchRef = useRef<{ startX: number; startScrollLeft: number } | null>(null);

  useEffect(() => {
    fetch("/api/content").then(r => r.json()).then(d => {
      const work = (d.work ?? []) as { slug: string; client: string; cover?: string; preview?: string; images?: string[] }[];
      const mapped = work
        .map(w => ({ slug: w.slug, client: w.client, image: w.cover ?? w.preview ?? w.images?.[0] ?? "" }))
        .filter(w => w.image);
      setItems(mapped);
    });
  }, []);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  // Mobile only: whichever card sits nearest the track's center gets the
  // "active" hover-style treatment (scale + shadow), so it applies whether
  // you got there by touch, drag, or the arrow buttons — not just touch
  // events on that specific card.
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

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      updateScrollState();
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      settleTimerRef.current = setTimeout(updateActiveCard, 60);
    };
    updateScrollState();
    updateActiveCard();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Cards' real width isn't known until their images finish loading, so
    // the initial scrollWidth read above can be stale — recheck once layout
    // settles.
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      ro.disconnect();
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, [items]);

  // Scroll exactly to the next/previous card's snap position, rather than a
  // fixed pixel delta, so the landing position always aligns with a card.
  // Compares each card's own snap target (its offset on desktop's snap-start,
  // or its centered offset on mobile's snap-center) against the current
  // scroll position — comparing raw left-edge offsets against scrollLeft
  // breaks on mobile since a centered card's scrollLeft sits mid-card, not
  // at its edge.
  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cards = cardRefs.current.filter((c): c is HTMLAnchorElement => !!c);
    if (cards.length === 0) return;
    if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);

    const isMobile = window.innerWidth < 640;
    const start = el.scrollLeft;
    const trackLeft = el.getBoundingClientRect().left;
    const leftOffsets = cards.map(c => c.getBoundingClientRect().left - trackLeft + el.scrollLeft);
    const maxScroll = el.scrollWidth - el.clientWidth;

    // snap-center targets the offset that puts a card's own center at the
    // track's center; snap-start targets its left edge directly.
    const snapTargets = isMobile
      ? cards.map((c, i) => Math.max(0, Math.min(maxScroll, leftOffsets[i] + c.clientWidth / 2 - el.clientWidth / 2)))
      : leftOffsets;

    const tolerance = 8;
    let targetIndex: number;
    if (dir === "right") {
      const found = snapTargets.findIndex(o => o > start + tolerance);
      targetIndex = found !== -1 ? found : snapTargets.length - 1;
    } else {
      let last = 0;
      for (let i = 0; i < snapTargets.length; i++) {
        if (snapTargets[i] < start - tolerance) last = i;
      }
      targetIndex = last;
    }
    const target = Math.max(0, Math.min(snapTargets[targetIndex], maxScroll));

    // Scale the outgoing/incoming cards the moment the move starts, not once
    // the scroll finishes, so the shrink/grow happens *during* the motion
    // instead of as an afterthought once it lands. Mobile only — desktop
    // never shows the active-card treatment.
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    if (isMobile) setActiveIndex(targetIndex);

    const duration = 150;
    const startTime = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      el.scrollLeft = start + (target - start) * easeOutCubic(t);
      if (t < 1) {
        scrollAnimRef.current = requestAnimationFrame(step);
      } else {
        scrollAnimRef.current = null;
      }
    };
    scrollAnimRef.current = requestAnimationFrame(step);
  };

  // On mobile, swiping should move exactly one card at a time rather than
  // free-scrolling with native momentum (which can fly past several cards
  // on a fast flick). Track the gesture ourselves and, on release, hand off
  // to the same one-card `scroll()` used by the arrow buttons.
  const onTouchStart = (e: React.TouchEvent) => {
    if (window.innerWidth >= 640) return;
    const el = scrollRef.current;
    if (!el) return;
    touchRef.current = { startX: e.touches[0].clientX, startScrollLeft: el.scrollLeft };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const t = touchRef.current;
    touchRef.current = null;
    if (!t || window.innerWidth >= 640) return;
    const el = scrollRef.current;
    if (!el) return;
    const dx = e.changedTouches[0].clientX - t.startX;
    // Kill any native momentum the browser started on release, so it can't
    // keep carrying the track past the one card we're about to land on.
    el.style.overflowX = "hidden";
    requestAnimationFrame(() => { el.style.overflowX = "auto"; });
    if (Math.abs(dx) < 24) {
      el.scrollLeft = t.startScrollLeft;
      updateActiveCard();
      return;
    }
    scroll(dx < 0 ? "right" : "left");
  };

  const arrowClass = "flex shrink-0 items-center justify-center size-11 sm:size-9 rounded-full transition-all duration-200 hover:scale-105";
  const arrowStyle = { background: "rgb(var(--fg) / 0.06)", color: "rgb(var(--muted))" } as const;

  if (items.length === 0) return null;

  return (
    <section className="rise w-[100vw] ml-[calc(50%-50vw)] sm:w-full sm:ml-0 sm:max-w-[88rem] sm:mx-auto px-1.5 sm:px-8">
      <div className="relative">
        <div
          ref={scrollRef}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="flex items-center gap-3 sm:gap-4 overflow-x-auto touch-pan-x sm:snap-x sm:snap-mandatory scroll-smooth py-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="shrink-0 sm:hidden" style={{ width: 6 }} aria-hidden="true" />
          {items.map((item, i) => (
            <Link
              key={item.slug}
              ref={(el) => { cardRefs.current[i] = el; }}
              href={`/work#project-${item.slug}`}
              className="relative shrink-0 snap-center sm:snap-start rounded-2xl overflow-hidden group w-[240px] sm:w-[340px] sm:hover:scale-105"
              style={{
                aspectRatio: "4 / 5",
                transition: "transform 200ms cubic-bezier(0.4,0,0.2,1), box-shadow 200ms cubic-bezier(0.4,0,0.2,1)",
                ...(activeIndex === i ? { transform: "scale(1.05)", boxShadow: "0 0 14px 0px rgba(0,0,0,0.2)" } : {}),
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 22px 0px rgba(0,0,0,0.35)"; }}
              onMouseLeave={(e) => { if (activeIndex !== i) e.currentTarget.style.boxShadow = "none"; }}
            >
              <Image
                src={item.image}
                alt={item.client}
                fill
                loading="lazy"
                sizes="(max-width: 640px) 240px, 340px"
                className="object-cover"
                draggable={false}
              />
              <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col items-start gap-2 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)" }}>
                <p className="text-[14px] tracking-tight text-white font-normal">{item.client}</p>
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] tracking-tight"
                  style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", backdropFilter: "blur(1.5px) saturate(1.6)", WebkitBackdropFilter: "blur(1.5px) saturate(1.6)" }}
                >
                  View project
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-16 transition-opacity duration-200"
          style={{ background: "linear-gradient(to right, rgb(var(--bg)) 0%, rgb(var(--bg) / 0.8) 40%, transparent 100%)", opacity: canScrollLeft ? 1 : 0 }} />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-12 transition-opacity duration-200"
          style={{ background: "linear-gradient(to left, rgb(var(--bg)), transparent)", opacity: canScrollRight ? 1 : 0 }} />
      </div>

      <div className="flex items-center justify-end gap-3 mt-5 pl-1.5 sm:pl-8 pr-1 sm:pr-3">
        <button type="button" aria-label="Scroll left" onClick={() => scroll("left")} className={arrowClass} style={arrowStyle} disabled={!canScrollLeft}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <line x1="13" y1="8" x2="3" y2="8" /><polyline points="7 4 3 8 7 12" />
          </svg>
        </button>
        <button type="button" aria-label="Scroll right" onClick={() => scroll("right")} className={arrowClass} style={arrowStyle} disabled={!canScrollRight}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <line x1="3" y1="8" x2="13" y2="8" /><polyline points="9 4 13 8 9 12" />
          </svg>
        </button>
      </div>
    </section>
  );
}

function VisualLayout() {
  const [dashboardModalOpen, setDashboardModalOpen] = useState(false);
  const [accentColor, setAccentColor] = useState(WORK_ITEMS[0].accent);
  const [accentTrigger, setAccentTrigger] = useState(0);
  return (
    <>
    <DashboardModal open={dashboardModalOpen} onClose={() => setDashboardModalOpen(false)} />
    <main className="page-container mx-3 sm:mx-auto w-auto sm:w-full max-w-[88rem] flex flex-col">

      <VercelHero accentColor={accentColor} accentTrigger={accentTrigger} />

      <div className="py-10 sm:py-6" />

      <WorkThumbnails onActiveAccent={(c) => { setAccentColor(c); setAccentTrigger((n) => n + 1); }} />

      <div className="py-7 sm:py-12" />

      <DesignPhilosophy />

      <div className="py-10 sm:py-8" />

      <ClientCarousel />

      <div className="py-20 sm:py-14" />

      <CalEmbed />

      <div className="py-14 sm:py-20" />

      <IndexFaq />

      <div className="py-20 sm:py-20" />

    </main>
    </>
  );
}
