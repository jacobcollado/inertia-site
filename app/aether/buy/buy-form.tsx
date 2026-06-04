"use client";

import React, { useState, useEffect, useRef } from "react";
import { ShieldCheck, MailCheck, PackageCheck } from "lucide-react";
import { SiStripe } from "react-icons/si";

type Status = "idle" | "submitting" | "sent" | "error";

const TIERS = [
  {
    id: "standard",
    label: "Standard",
    price: "$85",
    term: "per year, single store",
    tagline: "Everything you need to launch. Renews when you're ready.",
    includes: [
      "Full Aether theme, all 41 sections",
      "1 year of updates",
      "Single store license",
      "Support via client portal",
    ],
    stripe: true,
  },
  {
    id: "lifetime",
    label: "Lifetime",
    price: "$105",
    term: "one-time, single store",
    tagline: "Pay once, own it forever. Every update we ever ship, included.",
    badge: "Best value",
    includes: [
      "Full Aether theme, all 41 sections",
      "Lifetime updates, no renewals",
      "Single store license",
      "Priority support",
    ],
    stripe: true,
  },
  {
    id: "custom",
    label: "Custom",
    price: "On request",
    term: "bespoke build on Aether",
    tagline: "Your brand, your vision. We build it on the Aether foundation.",
    includes: [
      "Custom design on Aether",
      "Direct access throughout",
      "Handoff included",
      "Post-launch support",
    ],
    stripe: false,
  },
];

function TierCard({ tier }: { tier: string }) {
  const [displayed, setDisplayed] = useState(() => TIERS.find((t) => t.id === tier)!);
  const [phase, setPhase] = useState<"idle" | "out" | "in">("in");
  const prevTier = useRef(tier);
  useEffect(() => {
    if (tier === prevTier.current) return;
    prevTier.current = tier;

    // Step 1: trigger exit styles
    setPhase("out");

    // Step 2: after exit, swap content and reset to pre-enter position (no transition)
    const swapTimer = setTimeout(() => {
      setDisplayed(TIERS.find((t) => t.id === tier)!);
      setPhase("idle"); // no transition — snap to start position
      // Step 3: one rAF later, trigger enter transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPhase("in");
        });
      });
    }, 130);

    return () => clearTimeout(swapTimer);
  }, [tier]);

  const ease = "cubic-bezier(0.22,1,0.36,1)";

  const row = (i: number, baseOpacity = 1): React.CSSProperties => {
    if (phase === "idle") return { opacity: 0, transform: "translateY(6px)", transition: "none" };
    if (phase === "out") return { opacity: 0, transform: "translateY(6px)", transition: `opacity 110ms ease ${i * 12}ms, transform 110ms ease ${i * 12}ms` };
    return { opacity: baseOpacity, transform: "translateY(0)", transition: `opacity 300ms ${ease} ${i * 40}ms, transform 300ms ${ease} ${i * 40}ms` };
  };

  return (
    <div
      className="rounded-2xl border border-[rgb(var(--line))] p-6 flex flex-col gap-5"
      style={{ background: "rgb(var(--surface))" }}
    >
      {/* header */}
      <div className="flex items-start justify-between gap-4" style={row(0)}>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))]">{displayed.label}</span>
            {displayed.badge && (
              <span className="text-[10px] font-medium tracking-tight px-2 py-0.5 rounded-full bg-[rgb(var(--fg))] text-[rgb(var(--bg))]">
                {displayed.badge}
              </span>
            )}
          </div>
          <span className="text-[13px] leading-relaxed tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.65 }}>
            {displayed.tagline}
          </span>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="text-[2.2rem] font-normal tabular-nums tracking-[-0.04em] leading-none text-[rgb(var(--fg))]">
            {displayed.price}
          </span>
          <span className="text-[11px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.35 }}>
            {displayed.term}
          </span>
        </div>
      </div>

      {/* includes */}
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

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

export function BuyForm({ initialTier }: { initialTier?: string }) {
  const [tier, setTier] = useState(initialTier || "lifetime");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const isCustom = tier === "custom";
  const isSubmitting = status === "submitting";

  const inputBase =
    "w-full bg-transparent border-0 border-b py-3 text-[17px] tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-40 focus:outline-none transition-colors duration-200 allow-select";

  const handleStripeCheckout = async () => {
    if (isSubmitting) return;
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message: message || "(no additional notes)",
          subject: `Aether Custom, ${name}`,
          kind: "aether:custom",
        }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error || "Something went wrong");
      }
      setStatus("sent");
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Something went wrong");
    }
  };

  if (status === "sent") {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-[clamp(1.8rem,4vw,2.8rem)] font-normal tracking-[-0.04em] leading-none text-[rgb(var(--fg))]">
          {name ? `Got it, ${name}.` : "Got it."}
        </p>
        <p className="text-[15px] tracking-tight leading-relaxed text-[rgb(var(--muted))]" style={{ opacity: 0.7 }}>
          We'll be in touch shortly to talk through the build.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Tier pill tabs */}
      <div className="inline-flex items-center self-center rounded-full border border-[rgb(var(--line))] p-1 gap-1">
        {TIERS.map((t) => {
          const active = tier === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTier(t.id)}
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

      {/* Selected tier card — stable container, content fades */}
      <TierCard tier={tier} />

      {/* Stripe checkout */}
      {!isCustom && (
        <div className="flex flex-col gap-4">
          <button
            onClick={handleStripeCheckout}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[14px] font-medium tracking-tight text-white transition-opacity hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed [-webkit-tap-highlight-color:transparent]"
            style={{ background: "var(--accent-gradient)" }}
          >
            {isSubmitting ? <Spinner /> : null}
            {isSubmitting ? "Redirecting…" : "Continue to checkout"}
            {!isSubmitting && (
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4"/>
              </svg>
            )}
          </button>
          {status === "error" && (
            <span className="text-[13px] tracking-tight text-red-500 text-center">{error || "Something went wrong."}</span>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[rgb(var(--muted))]" style={{ opacity: 0.35 }}>
            <span className="text-[11px] tracking-tight">Powered and secured by</span>
            {/* Stripe wordmark SVG */}
            <svg viewBox="0 0 60 25" fill="currentColor" className="h-4 w-auto" aria-label="Stripe" role="img">
              <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.87zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.92 2.20H5.72c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58H7.6c0-1.85-1.07-2.58-2.07-2.58z"/>
            </svg>
          </div>
        </div>
      )}

      {/* Custom contact form */}
      {isCustom && (
        <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              className={inputBase}
              style={{ borderColor: name ? "rgb(var(--fg))" : "rgb(var(--line))" }}
              onFocus={(e) => { e.target.style.borderColor = "rgb(var(--fg))"; }}
              onBlur={(e) => { e.target.style.borderColor = name ? "rgb(var(--fg))" : "rgb(var(--line))"; }}
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              autoComplete="email"
              className={inputBase}
              style={{ borderColor: email ? "rgb(var(--fg))" : "rgb(var(--line))" }}
              onFocus={(e) => { e.target.style.borderColor = "rgb(var(--fg))"; }}
              onBlur={(e) => { e.target.style.borderColor = email ? "rgb(var(--fg))" : "rgb(var(--line))"; }}
            />
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us about the brand and what you want built."
            rows={4}
            required
            className={`${inputBase} resize-none`}
            style={{ borderColor: message ? "rgb(var(--fg))" : "rgb(var(--line))" }}
            onFocus={(e) => { e.target.style.borderColor = "rgb(var(--fg))"; }}
            onBlur={(e) => { e.target.style.borderColor = message ? "rgb(var(--fg))" : "rgb(var(--line))"; }}
          />
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={!name || !email || !message || isSubmitting}
              className="inline-flex items-center gap-2.5 rounded-full bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-5 py-2.5 text-[13px] font-medium tracking-tight transition-opacity hover:opacity-80 disabled:opacity-25 disabled:cursor-not-allowed [-webkit-tap-highlight-color:transparent]"
            >
              {isSubmitting ? <Spinner /> : null}
              Get a quote
            </button>
            {status === "error" && (
              <span className="text-[13px] tracking-tight text-red-500">{error || "Something went wrong."}</span>
            )}
          </div>
        </form>
      )}

    </div>
  );
}
