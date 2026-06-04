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

          <div className="flex items-center justify-center gap-1 text-[rgb(var(--muted))]" style={{ opacity: 0.35 }}>
            <span className="text-[12px] tracking-tight">Powered and secured by</span>
            {/* Stripe wordmark — official */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 468 222.5" fill="currentColor" className="h-7 w-auto" aria-label="Stripe" role="img">
              <path d="M414 113.4c0-25.6-12.4-45.8-36.1-45.8-23.8 0-38.2 20.2-38.2 45.6 0 30.1 17 45.3 41.4 45.3 11.9 0 20.9-2.7 27.7-6.5v-20c-6.8 3.4-14.6 5.5-24.5 5.5-9.7 0-18.3-3.4-19.4-15.2h48.9c0-1.3.2-6.5.2-8.9zm-49.4-9.5c0-11.3 6.9-16 13.2-16 6.1 0 12.6 4.7 12.6 16h-25.8zM301.1 67.6c-9.8 0-16.1 4.6-19.6 7.8l-1.3-6.2h-22v116.6l25-5.3.1-28.3c3.6 2.6 8.9 6.3 17.7 6.3 17.9 0 34.2-14.4 34.2-46.1-.1-29-16.6-44.8-34.1-44.8zm-6 67.9c-5.9 0-9.4-2.1-11.8-4.7l-.1-37.1c2.6-2.9 6.2-4.9 11.9-4.9 9.1 0 15.4 10.2 15.4 23.3 0 13.4-6.2 23.4-15.4 23.4zM223.8 61.7l25.1-5.4V36l-25.1 5.3zM223.8 69.2h25.1v87.5h-25.1zM196.9 76.7l-1.6-7.5h-21.6v87.5h25V97.5c5.9-7.7 15.9-6.3 19-5.2v-23c-3.2-1.2-14.9-3.4-20.8 7.4zM146.9 47.6l-24.4 5.2-.1 80.1c0 14.8 11.1 25.7 25.9 25.7 8.2 0 14.2-1.5 17.5-3.3V135c-3.2 1.3-19 5.9-19-8.9V90.6h19V69.2h-19l.1-21.6zM79.3 94.7c0-3.9 3.2-5.4 8.5-5.4 7.6 0 17.2 2.3 24.8 6.4V72.2c-8.3-3.3-16.5-4.6-24.8-4.6C67.5 67.6 54 78.2 54 95.9c0 27.6 38 23.2 38 35.1 0 4.6-4 6.1-9.6 6.1-8.3 0-18.9-3.4-27.3-8v23.8c9.3 4 18.7 5.7 27.3 5.7 20.8 0 35.1-10.3 35.1-28.2-.1-29.8-38.2-24.5-38.2-35.7z"/>
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
