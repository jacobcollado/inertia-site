"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const TIERS = [
  {
    id: "standard",
    label: "Standard",
    price: "$85",
    term: "per year / single store",
    tagline: "Everything you need to launch. Renews when you're ready.",
    includes: [
      "Full Aether theme, all 41 sections",
      "1 year of updates",
      "Single store license",
      "Support via client portal",
    ],
  },
  {
    id: "lifetime",
    label: "Lifetime",
    price: "$105",
    term: "one-time / single store",
    tagline: "Pay once, own it forever. Every update we ever ship, included.",
    badge: "Best value",
    includes: [
      "Full Aether theme, all 41 sections",
      "Lifetime updates, no renewals",
      "Single store license",
      "Priority support",
    ],
  },
];

type Status = "idle" | "submitting" | "error";

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

function TierCard({ tier }: { tier: string }) {
  const [displayed, setDisplayed] = useState(() => TIERS.find((t) => t.id === tier)!);
  const [phase, setPhase] = useState<"idle" | "out" | "in">("in");
  const prev = useRef(tier);

  useEffect(() => {
    if (tier === prev.current) return;
    prev.current = tier;
    setPhase("out");
    const t = setTimeout(() => {
      setDisplayed(TIERS.find((t) => t.id === tier)!);
      setPhase("idle");
      requestAnimationFrame(() => requestAnimationFrame(() => setPhase("in")));
    }, 120);
    return () => clearTimeout(t);
  }, [tier]);

  const ease = "cubic-bezier(0.22,1,0.36,1)";
  const row = (i: number, baseOpacity = 1): React.CSSProperties => {
    if (phase === "idle") return { opacity: 0, transform: "translateY(6px)", transition: "none" };
    if (phase === "out") return { opacity: 0, transform: "translateY(4px)", transition: `opacity 100ms ease ${i * 10}ms, transform 100ms ease ${i * 10}ms` };
    return { opacity: baseOpacity, transform: "translateY(0)", transition: `opacity 280ms ${ease} ${i * 35}ms, transform 280ms ${ease} ${i * 35}ms` };
  };

  return (
    <div className="rounded-2xl p-6 flex flex-col gap-5" style={{ background: "rgb(var(--surface))" }}>
      <div className="flex items-start justify-between gap-4" style={row(0)}>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))]">{displayed.label}</span>
            {displayed.badge && (
              <span className="text-[10px] font-medium tracking-tight px-2 py-0.5 rounded-full bg-[var(--btn-bg)] text-[var(--btn-fg)]">{displayed.badge}</span>
            )}
          </div>
          <span className="text-[13px] leading-relaxed tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.65 }}>{displayed.tagline}</span>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="text-[2.2rem] font-normal tabular-nums tracking-[-0.04em] leading-none text-[rgb(var(--fg))]">{displayed.price}</span>
          <span className="text-[11px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.35 }}>{displayed.term}</span>
        </div>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-[rgb(var(--line))] pt-4">
        {displayed.includes.map((item, i) => (
          <li key={item} className="flex items-center gap-2 text-[13px] tracking-tight text-[rgb(var(--muted))]" style={row(i + 1, 0.7)}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 shrink-0 text-[rgb(var(--fg))]" style={{ opacity: 0.5 }} aria-hidden="true">
              <polyline points="2 8 6 12 14 4" />
            </svg>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function InlinePricing() {
  const [tier, setTier] = useState("lifetime");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    if (status === "submitting") return;
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error || "Could not start checkout");
      }
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Tier selector — text list on the left */}
      <div className="inline-flex items-center self-center rounded-full border border-[rgb(var(--line))] p-1 gap-1">
        {TIERS.map((t) => {
          const active = tier === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { setTier(t.id); setStatus("idle"); setError(""); }}
              className="rounded-full px-4 py-1.5 text-[13px] font-medium tracking-tight transition-all duration-200 [-webkit-tap-highlight-color:transparent]"
              style={{
                background: active ? "rgb(var(--fg))" : "transparent",
                color: active ? "rgb(var(--bg))" : "rgb(var(--muted))",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Card */}
      <TierCard tier={tier} />

      {/* Checkout */}
      <button
        onClick={handleCheckout}
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[14px] font-medium tracking-tight text-[rgb(var(--bg))] transition-opacity hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed [-webkit-tap-highlight-color:transparent]"
        style={{ background: "var(--accent-gradient)" }}
      >
        {status === "submitting" ? <Spinner /> : null}
        {status === "submitting" ? "Redirecting…" : "Continue to checkout"}
        {status !== "submitting" && (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4"/>
          </svg>
        )}
      </button>

      {status === "error" && (
        <span className="text-[13px] tracking-tight text-red-500 text-center">{error || "Something went wrong."}</span>
      )}

      <div className="flex items-center justify-center gap-2" style={{ opacity: 0.4 }}>
        <span className="text-[12px] tracking-tight text-[rgb(var(--muted))]">Powered and secured by</span>
        <img src="/stripe-wordmark.svg" alt="Stripe" className="h-5 w-auto" draggable={false} style={{ filter: "grayscale(1) brightness(0) invert(0.45)" }} />
      </div>

      <p className="text-center text-[12px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.4 }}>
        Need a custom build?{" "}
        <a href="https://cal.com/jacob-c-99otvp/15min" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:opacity-70 transition-opacity">
          Book a call
        </a>
      </p>
    </div>
  );
}
