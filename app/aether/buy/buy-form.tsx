"use client";

import { useState, useEffect, useRef } from "react";
import { ShieldCheck, MailCheck, PackageCheck } from "lucide-react";

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

          {/* Payment methods */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {/* Visa */}
              <svg viewBox="0 0 38 24" className="h-6 w-auto" aria-label="Visa" role="img"><rect width="38" height="24" rx="4" fill="#1A1F71"/><path d="M14.5 16.5H12.2L13.7 7.5H16L14.5 16.5ZM22.6 7.7C22.1 7.5 21.3 7.3 20.3 7.3C18 7.3 16.4 8.5 16.4 10.2C16.4 11.4 17.5 12.1 18.3 12.5C19.1 12.9 19.4 13.2 19.4 13.6C19.4 14.2 18.7 14.5 18 14.5C17 14.5 16.5 14.3 15.7 14L15.4 13.9L15.1 16C15.7 16.3 16.8 16.5 17.9 16.5C20.4 16.5 21.9 15.3 21.9 13.5C21.9 12.5 21.3 11.7 20 11.1C19.3 10.7 18.9 10.4 18.9 10C18.9 9.6 19.3 9.2 20.1 9.2C20.8 9.2 21.3 9.3 21.7 9.5L21.9 9.6L22.6 7.7ZM27.8 7.5H26C25.5 7.5 25.1 7.7 24.9 8.2L21.7 16.5H24.2L24.7 15.1H27.7L28 16.5H30.2L27.8 7.5ZM25.4 13.2C25.6 12.7 26.4 10.5 26.4 10.5C26.4 10.5 26.6 9.9 26.7 9.6L26.9 10.4C26.9 10.4 27.5 12.8 27.6 13.2H25.4ZM11.2 7.5L8.9 13.4L8.6 12C8.1 10.5 6.7 8.8 5.1 8L7.2 16.5H9.8L13.8 7.5H11.2Z" fill="white"/><path d="M6.6 7.5H2.5L2.5 7.7C5.7 8.5 7.9 10.4 8.7 12.7L7.8 8.2C7.6 7.7 7.2 7.5 6.6 7.5Z" fill="#F9A51A"/></svg>
              {/* Mastercard */}
              <svg viewBox="0 0 38 24" className="h-6 w-auto" aria-label="Mastercard" role="img"><rect width="38" height="24" rx="4" fill="#252525"/><circle cx="15" cy="12" r="6" fill="#EB001B"/><circle cx="23" cy="12" r="6" fill="#F79E1B"/><path d="M19 7.8a6 6 0 0 1 0 8.4A6 6 0 0 1 19 7.8z" fill="#FF5F00"/></svg>
              {/* Apple Pay */}
              <svg viewBox="0 0 38 24" className="h-6 w-auto" aria-label="Apple Pay" role="img"><rect width="38" height="24" rx="4" fill="#000"/><path d="M12.5 8.5c-.4.5-1 .9-1.7.8-.1-.7.2-1.4.6-1.8.4-.5 1.1-.9 1.7-.9.1.7-.2 1.4-.6 1.9zm.6 1c-.9-.1-1.7.5-2.2.5-.5 0-1.2-.5-2-.5-1 0-2 .6-2.5 1.5-1.1 1.9-.3 4.6.8 6.1.5.7 1.1 1.5 1.9 1.5.8 0 1-.5 2-.5s1.2.5 2 .5c.8 0 1.4-.8 1.9-1.5.4-.5.6-1 .8-1.6-.8-.3-1.5-1.1-1.5-2.1 0-.9.5-1.7 1.2-2.1-.5-.6-1.2-1-1.9-1.3h-.5zm5.2-2v9.5h1.4v-3.3h1.9c1.7 0 2.9-1.2 2.9-3.1s-1.2-3.1-2.9-3.1h-3.3zm1.4 1.2h1.6c1.1 0 1.7.6 1.7 1.9s-.6 1.9-1.7 1.9h-1.6V8.7zm6.4 8.4c.9 0 1.7-.5 2.1-1.3h.1v1.2h1.3v-5c0-1.3-1-2.1-2.5-2.1-1.4 0-2.5.8-2.6 2h1.3c.1-.6.6-.9 1.2-.9.8 0 1.3.4 1.3 1.1v.5l-1.7.1c-1.6.1-2.4.8-2.4 1.9-.1 1.2.8 2 1.9 2zm.4-1.1c-.7 0-1.1-.3-1.1-.9 0-.5.4-.8 1.2-.9l1.5-.1v.5c0 .8-.7 1.4-1.6 1.4zm5.5 3.5c1.3 0 1.9-.5 2.4-2l2.3-6.5h-1.4l-1.5 5h-.1l-1.5-5h-1.5l2.2 6.1-.1.4c-.2.6-.5.8-1.1.8H31v1.2h.5z" fill="white"/></svg>
              {/* Google Pay */}
              <svg viewBox="0 0 38 24" className="h-6 w-auto" aria-label="Google Pay" role="img"><rect width="38" height="24" rx="4" fill="#fff" stroke="#e0e0e0" strokeWidth="1"/><path d="M18.2 12.1v2.7h-.9V8.5h2.3c.6 0 1.1.2 1.5.6.4.4.6.8.6 1.4 0 .6-.2 1-.6 1.4-.4.4-.9.6-1.5.6h-1.4zm0-2.8v2.1h1.5c.3 0 .6-.1.8-.3.2-.2.3-.5.3-.7 0-.3-.1-.5-.3-.7-.2-.2-.5-.3-.8-.3h-1.5zm5.6 1.2c.6 0 1.1.2 1.4.5.3.3.5.8.5 1.4v2.7h-.8v-.6h-.1c-.3.5-.8.7-1.4.7-.5 0-.9-.1-1.2-.4-.3-.3-.5-.7-.5-1.1 0-.4.2-.8.5-1 .3-.3.8-.4 1.3-.4.5 0 .9.1 1.2.3v-.2c0-.3-.1-.5-.3-.7-.2-.2-.5-.3-.8-.3-.4 0-.8.2-1 .5l-.7-.5c.4-.5 1-.8 1.9-.8zm-.1 3.7c.3 0 .5-.1.7-.3.2-.2.3-.4.3-.7-.2-.2-.6-.3-1-.3-.3 0-.6.1-.8.2-.2.2-.3.4-.3.6 0 .2.1.4.3.5.2.1.5.2.8 0zm4.3-3.5-2 5.1h-.9l.7-1.7-1.3-3.4h.9l.9 2.5h.1l.9-2.5h.7z" fill="#3c4043"/><path d="M13.4 11.8c0-.3 0-.6-.1-.8H10v1.5h1.9c-.1.4-.3.8-.6 1v.8h1c.6-.5 1-1.4 1-2.5z" fill="#4285F4"/><path d="M10 14.9c.9 0 1.7-.3 2.3-.8l-1-.8c-.3.2-.7.3-1.3.3-1 0-1.8-.7-2.1-1.6H6.8v.9c.6 1.2 1.8 2 3.2 2z" fill="#34A853"/><path d="M7.9 12c-.1-.3-.1-.6 0-.9V10.2H6.8c-.4.7-.4 1.5 0 2.2L7.9 12z" fill="#FBBC04"/><path d="M10 9.7c.6 0 1.1.2 1.5.6l1.1-1.1C11.8 8.4 10.9 8 10 8c-1.4 0-2.6.8-3.2 2L7.9 11c.3-.9 1.1-1.6 2.1-1.6z" fill="#EA4335"/></svg>
              {/* Klarna */}
              <svg viewBox="0 0 38 24" className="h-6 w-auto" aria-label="Klarna" role="img"><rect width="38" height="24" rx="4" fill="#FFB3C7"/><path d="M23.5 7h-2.2v10h2.2V7zm-4.6 0h-2.1c0 1.9-.9 3.6-2.3 4.7l-.9.7 3.4 4.6H19l-3-4.1c1.5-1.4 2.4-3.4 2.4-5.6l-.5-.3zM10 7H7.8v10H10V7zm18.5 6.8c-.7 0-1.2.6-1.2 1.3 0 .7.5 1.2 1.2 1.2.7 0 1.2-.5 1.2-1.2.1-.7-.5-1.3-1.2-1.3z" fill="#17120F"/></svg>
              {/* Affirm */}
              <svg viewBox="0 0 38 24" className="h-6 w-auto" aria-label="Affirm" role="img"><rect width="38" height="24" rx="4" fill="#060809"/><path d="M7.5 15.5h1.7V12c0-1.4.8-2 1.8-2h.3V8.4c-1 0-1.8.5-2.2 1.3V8.5H7.5v7zm5.8 0h1.7V8.5h-1.7v7zm.8-8.3c.6 0 1-.4 1-1s-.4-1-1-1-1 .4-1 1 .5 1 1 1zm3.2 8.3h1.7v-4.2c0-.8.5-1.3 1.2-1.3.7 0 1.1.5 1.1 1.3v4.2h1.7V11c0-1.5-.9-2.6-2.4-2.6-.8 0-1.4.3-1.8.9v-.8h-1.5v7zm6.5 0h1.7v-4.2c0-.8.5-1.3 1.2-1.3.7 0 1.1.5 1.1 1.3v4.2H30V11c0-1.5-.9-2.6-2.4-2.6-.8 0-1.4.3-1.8.9v-.8H24v7z" fill="white"/></svg>
            </div>
            {/* Stripe secured */}
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3 shrink-0" style={{ color:"rgb(var(--muted))", opacity:0.45 }}><path d="M6 1L1.5 3v3c0 2.2 1.9 4.3 4.5 4.8C8.6 10.3 10.5 8.2 10.5 6V3L6 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
              <span className="text-[11px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity:0.45 }}>Secured by Stripe</span>
            </div>
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
