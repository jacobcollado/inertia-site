"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "sent" | "error";

/* ── Tier config ──────────────────────────────────────────────────── */

const TIERS = [
  {
    id: "standard",
    label: "Standard",
    price: "$85",
    term: "1 year · single store",
    description: "The full theme for a year. Good for testing the waters.",
    accent: "rgb(var(--blue))",
  },
  {
    id: "lifetime",
    label: "Lifetime",
    price: "$105",
    term: "Forever · single store",
    description: "Own it outright. No renewals, updates for life.",
    accent: "rgb(var(--green))",
    badge: "Most popular",
  },
  {
    id: "custom",
    label: "Custom",
    price: "On request",
    term: "Foundation + bespoke build",
    description: "Aether as the base, tailored around your brand.",
    accent: "rgb(var(--purple))",
  },
];

/* ── Sketches ─────────────────────────────────────────────────────── */

function SketchStandard() {
  const blue = "rgb(var(--blue))";
  const muted = "rgb(var(--muted))";
  return (
    <svg viewBox="0 0 260 180" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Outer browser frame */}
      <rect x="30" y="22" width="200" height="136" rx="4" stroke={muted} strokeWidth="1" opacity="0.35" />
      {/* Browser chrome bar */}
      <rect x="30" y="22" width="200" height="24" rx="4" stroke={blue} strokeWidth="1.2" opacity="0.65" fill={blue} fillOpacity="0.07" />
      {/* Traffic light dots */}
      <circle cx="48" cy="34" r="4" stroke={blue} strokeWidth="1.2" opacity="0.7" fill={blue} fillOpacity="0.15" />
      <circle cx="62" cy="34" r="4" stroke={muted} strokeWidth="1" opacity="0.4" />
      <circle cx="76" cy="34" r="4" stroke={muted} strokeWidth="1" opacity="0.4" />
      {/* URL bar */}
      <rect x="96" y="27" width="90" height="14" rx="3" stroke={muted} strokeWidth="0.8" opacity="0.3" />
      {/* Hero image zone with X */}
      <rect x="42" y="58" width="176" height="58" rx="2" stroke={blue} strokeWidth="1.2" opacity="0.55" fill={blue} fillOpacity="0.05" />
      <line x1="42" y1="58" x2="218" y2="116" stroke={blue} strokeWidth="0.7" opacity="0.2" />
      <line x1="218" y1="58" x2="42" y2="116" stroke={blue} strokeWidth="0.7" opacity="0.2" />
      {/* Product cards row */}
      {[42, 103, 164].map((x) => (
        <rect key={x} x={x} y="126" width="52" height="22" rx="2" stroke={muted} strokeWidth="0.9" opacity="0.3" />
      ))}
      {/* Calendar badge — 1 year, floating top-right */}
      <rect x="190" y="14" width="40" height="34" rx="3" fill={blue} fillOpacity="0.08" stroke={blue} strokeWidth="1.4" opacity="0.75" />
      <line x1="190" y1="26" x2="230" y2="26" stroke={blue} strokeWidth="1" opacity="0.55" />
      <line x1="201" y1="14" x2="201" y2="9" stroke={blue} strokeWidth="1.4" opacity="0.7" />
      <line x1="219" y1="14" x2="219" y2="9" stroke={blue} strokeWidth="1.4" opacity="0.7" />
      {/* "1" inside calendar */}
      <line x1="210" y1="33" x2="210" y2="42" stroke={blue} strokeWidth="2" opacity="0.65" />
    </svg>
  );
}

function SketchLifetime() {
  const green = "rgb(var(--green))";
  const muted = "rgb(var(--muted))";
  return (
    <svg viewBox="0 0 260 180" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Document body */}
      <rect x="55" y="18" width="150" height="148" rx="4" stroke={muted} strokeWidth="1.2" opacity="0.4" />
      {/* Header band */}
      <rect x="55" y="18" width="150" height="26" rx="4" stroke={green} strokeWidth="1.4" opacity="0.65" fill={green} fillOpacity="0.08" />
      {/* Title line in header */}
      <line x1="82" y1="31" x2="178" y2="31" stroke={green} strokeWidth="1.6" opacity="0.65" />
      {/* Body text lines */}
      <line x1="74" y1="62" x2="186" y2="62" stroke={muted} strokeWidth="1" opacity="0.35" />
      <line x1="74" y1="76" x2="186" y2="76" stroke={muted} strokeWidth="1" opacity="0.35" />
      <line x1="74" y1="90" x2="166" y2="90" stroke={muted} strokeWidth="1" opacity="0.3" />
      <line x1="74" y1="104" x2="186" y2="104" stroke={muted} strokeWidth="0.9" opacity="0.25" />
      <line x1="74" y1="118" x2="154" y2="118" stroke={muted} strokeWidth="0.9" opacity="0.25" />
      {/* Wax seal — outer ring */}
      <circle cx="130" cy="148" r="22" stroke={green} strokeWidth="1.6" opacity="0.65" fill={green} fillOpacity="0.07" />
      {/* Seal inner ring */}
      <circle cx="130" cy="148" r="15" stroke={green} strokeWidth="1" opacity="0.45" />
      {/* Checkmark inside seal */}
      <polyline points="120,148 127,156 142,139" stroke={green} strokeWidth="2.5" opacity="0.85" strokeLinecap="round" strokeLinejoin="round" />
      {/* Ribbon tails */}
      <path d="M116 166 L110 178 L130 171 L150 178 L144 166" stroke={green} strokeWidth="1.2" opacity="0.45" fill={green} fillOpacity="0.05" />
      {/* "One store" pill — top right corner */}
      <rect x="174" y="12" width="46" height="18" rx="4" stroke={green} strokeWidth="1.2" opacity="0.6" fill={green} fillOpacity="0.1" />
      <line x1="183" y1="21" x2="211" y2="21" stroke={green} strokeWidth="1.2" opacity="0.55" />
    </svg>
  );
}

function SketchCustom() {
  const purple = "rgb(var(--purple))";
  const muted = "rgb(var(--muted))";
  return (
    <svg viewBox="0 0 260 180" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Blueprint grid */}
      {[45, 75, 105, 135, 165, 195, 225].map((x) => (
        <line key={`v${x}`} x1={x} y1="14" x2={x} y2="166" stroke={muted} strokeWidth="0.5" opacity="0.15" />
      ))}
      {[14, 44, 74, 104, 134, 164].map((y) => (
        <line key={`h${y}`} x1="26" y1={y} x2="234" y2={y} stroke={muted} strokeWidth="0.5" opacity="0.15" />
      ))}
      {/* Main wireframe */}
      <rect x="36" y="20" width="188" height="130" rx="4" stroke={purple} strokeWidth="1.6" opacity="0.6" fill={purple} fillOpacity="0.04" />
      {/* Hero zone */}
      <rect x="48" y="32" width="164" height="46" rx="2" stroke={purple} strokeWidth="1.3" opacity="0.6" fill={purple} fillOpacity="0.06" />
      {/* Content blocks */}
      <rect x="48" y="86" width="74" height="54" rx="2" stroke={muted} strokeWidth="1.1" opacity="0.45" />
      <rect x="130" y="86" width="82" height="54" rx="2" stroke={muted} strokeWidth="1.1" opacity="0.45" />
      {/* Dimension line — left */}
      <line x1="24" y1="20" x2="24" y2="150" stroke={purple} strokeWidth="1" opacity="0.5" />
      <line x1="19" y1="20" x2="29" y2="20" stroke={purple} strokeWidth="1" opacity="0.5" />
      <line x1="19" y1="150" x2="29" y2="150" stroke={purple} strokeWidth="1" opacity="0.5" />
      {/* Dimension line — bottom */}
      <line x1="36" y1="162" x2="224" y2="162" stroke={purple} strokeWidth="1" opacity="0.5" />
      <line x1="36" y1="157" x2="36" y2="167" stroke={purple} strokeWidth="1" opacity="0.5" />
      <line x1="224" y1="157" x2="224" y2="167" stroke={purple} strokeWidth="1" opacity="0.5" />
      {/* Pencil — top right, diagonal */}
      <line x1="196" y1="14" x2="238" y2="2" stroke={purple} strokeWidth="1.8" opacity="0.7" />
      <path d="M196 14 L189 22 L196 19 Z" fill={purple} fillOpacity="0.6" stroke={purple} strokeWidth="0.5" opacity="0.6" />
      <line x1="234" y1="4" x2="242" y2="-2" stroke={purple} strokeWidth="1.8" opacity="0.5" />
    </svg>
  );
}

function SketchSent() {
  const green = "rgb(var(--green))";
  return (
    <svg viewBox="0 0 260 180" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <circle cx="130" cy="90" r="64" stroke={green} strokeWidth="1.2" opacity="0.3" />
      <circle cx="130" cy="90" r="48" stroke={green} strokeWidth="1.4" opacity="0.55" fill={green} fillOpacity="0.06" />
      <polyline points="104,90 122,110 158,68" stroke={green} strokeWidth="3" opacity="0.85" strokeLinecap="round" strokeLinejoin="round" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const r = (Math.PI * deg) / 180;
        const x1 = 130 + Math.cos(r) * 72;
        const y1 = 90 + Math.sin(r) * 72;
        const x2 = 130 + Math.cos(r) * 82;
        const y2 = 90 + Math.sin(r) * 82;
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke={green} strokeWidth="1" opacity="0.45" />;
      })}
    </svg>
  );
}

function Spinner({ color }: { color: string }) {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* ── Main component ───────────────────────────────────────────────── */

export function BuyForm({ initialTier }: { initialTier?: string }) {
  const [tier, setTier] = useState(initialTier || "lifetime");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [store, setStore] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const selected = TIERS.find((t) => t.id === tier) ?? TIERS[1];
  const accent = selected.accent;
  const isCustom = tier === "custom";
  const isSubmitting = status === "submitting";

  const sketch =
    isSubmitting || status === "sent"
      ? <SketchSent />
      : tier === "standard"
      ? <SketchStandard />
      : tier === "lifetime"
      ? <SketchLifetime />
      : <SketchCustom />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setStatus("submitting");
    setError("");
    const body = [
      `Tier: ${selected.label} (${selected.price})`,
      store ? `Store: ${store}` : "",
      "",
      message || "(no additional notes)",
    ]
      .filter(Boolean)
      .join("\n");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message: body,
          subject: `Aether ${selected.label} — ${name}`,
          kind: `aether:${tier}`,
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

  const inputBase =
    "w-full bg-transparent border-0 border-b py-3 text-[17px] tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-40 focus:outline-none transition-colors duration-200";

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col sm:flex-row">

      {/* Left — sketch panel */}
      <div className="sm:w-[44%] sm:border-r border-[rgb(var(--line))] flex flex-col">
        <div
          className="flex-1 flex items-center justify-center px-8 py-10 sm:py-16"
          style={{ minHeight: "200px" }}
        >
          <div
            key={`sk-${tier}-${status}`}
            className="w-full max-w-[340px]"
            style={{ animation: "rise-in 400ms cubic-bezier(0.22,1,0.36,1) both", animationDelay: "80ms" }}
          >
            {sketch}
          </div>
        </div>

        {/* Tier context — bottom of sketch panel */}
        {status !== "sent" && !isSubmitting && (
          <div className="hidden sm:block px-8 pb-10">
            <p
              key={`label-${tier}`}
              className="text-[13px] tracking-tight font-medium mb-1"
              style={{ color: accent, animation: "rise-in 300ms cubic-bezier(0.22,1,0.36,1) both" }}
            >
              {selected.label}
            </p>
            <p
              key={`desc-${tier}`}
              className="text-[13px] tracking-tight text-[rgb(var(--muted))]"
              style={{ animation: "rise-in 300ms cubic-bezier(0.22,1,0.36,1) both", animationDelay: "40ms" }}
            >
              {selected.description}
            </p>
          </div>
        )}
      </div>

      {/* Right — form panel */}
      <div className="sm:w-[56%] flex flex-col justify-center px-8 sm:px-12 pt-2 pb-12 sm:py-16">

        {/* Submitting */}
        {isSubmitting && (
          <div className="flex flex-col gap-6" style={{ animation: "rise-in 300ms cubic-bezier(0.22,1,0.36,1) both" }}>
            <Spinner color={accent} />
            <p className="text-[clamp(1.6rem,4vw,2.25rem)] font-medium tracking-[-0.04em] leading-snug text-[rgb(var(--fg))]">
              Sending.
            </p>
            <p className="text-[15px] tracking-tight text-[rgb(var(--muted))]">Just a moment.</p>
          </div>
        )}

        {/* Sent */}
        {status === "sent" && (
          <div className="flex flex-col gap-5" style={{ animation: "rise-in 400ms cubic-bezier(0.22,1,0.36,1) both" }}>
            <span className="text-[11px] tracking-widest uppercase" style={{ color: "rgb(var(--green))", opacity: 0.8 }}>
              submitted
            </span>
            <p className="text-[clamp(1.8rem,4.5vw,2.75rem)] font-medium tracking-[-0.04em] leading-snug text-[rgb(var(--fg))]">
              {name ? `Got it, ${name}.` : "Got it."}
            </p>
            <p className="text-[15px] tracking-tight leading-relaxed text-[rgb(var(--muted))] max-w-sm">
              {email
                ? `I'll send an invoice to ${email} shortly. Usually within a day.`
                : "I'll be in touch soon."}
            </p>
          </div>
        )}

        {/* Active form */}
        {!isSubmitting && status !== "sent" && (
          <form onSubmit={onSubmit} className="w-full" noValidate>

            {/* Heading */}
            <div className="mb-10" style={{ animation: "rise-in 280ms cubic-bezier(0.22,1,0.36,1) both" }}>
              <p className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-medium tracking-[-0.04em] leading-snug text-[rgb(var(--fg))]">
                {isCustom ? "Tell me about the build." : "Pick up a license."}
              </p>
              <p className="mt-2 text-[15px] tracking-tight text-[rgb(var(--muted))]">
                {isCustom
                  ? "Share a few details and I'll put together a scope and quote."
                  : "Share a few details and I'll send an invoice within a day."}
              </p>
            </div>

            {/* Tier selector */}
            <fieldset className="mb-8">
              <legend className="text-[11px] tracking-widest uppercase text-[rgb(var(--muted))] opacity-50 mb-3">
                License
              </legend>
              <div className="flex flex-col gap-2">
                {TIERS.map((t) => {
                  const active = tier === t.id;
                  return (
                    <label
                      key={t.id}
                      className="flex items-center justify-between gap-4 px-4 py-3 border rounded-sm cursor-pointer transition-all duration-150"
                      style={{
                        borderColor: active ? t.accent : "rgb(var(--line))",
                        background: active ? `color-mix(in srgb, ${t.accent} 5%, transparent)` : "transparent",
                      }}
                    >
                      <input
                        type="radio"
                        name="tier"
                        value={t.id}
                        checked={active}
                        onChange={() => setTier(t.id)}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0 transition-colors"
                          style={{ background: active ? t.accent : "transparent", border: `1.5px solid ${active ? t.accent : "rgb(var(--muted))"}`, opacity: active ? 1 : 0.4 }}
                        />
                        <div className="min-w-0">
                          <span className="text-[14px] font-medium tracking-tight text-[rgb(var(--fg))]">{t.label}</span>
                          {t.badge && (
                            <span
                              className="ml-2 text-[10px] tracking-tight px-1.5 py-0.5 rounded-full"
                              style={{ color: t.accent, background: `color-mix(in srgb, ${t.accent} 10%, transparent)` }}
                            >
                              {t.badge}
                            </span>
                          )}
                          <p className="text-[12px] tracking-tight text-[rgb(var(--muted))] mt-0.5 opacity-70">{t.term}</p>
                        </div>
                      </div>
                      <span
                        className="text-[14px] tracking-tight tabular-nums shrink-0 font-medium"
                        style={{ color: active ? t.accent : "rgb(var(--muted))", opacity: active ? 1 : 0.5 }}
                      >
                        {t.price}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {/* Fields */}
            <div className="flex flex-col gap-6 mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="your name"
                  autoComplete="name"
                  className={inputBase}
                  style={{ borderColor: name ? accent : "rgb(var(--line))" }}
                  onFocus={(e) => { e.target.style.borderColor = accent; }}
                  onBlur={(e) => { e.target.style.borderColor = name ? accent : "rgb(var(--line))"; }}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your email"
                  autoComplete="email"
                  className={inputBase}
                  style={{ borderColor: email ? accent : "rgb(var(--line))" }}
                  onFocus={(e) => { e.target.style.borderColor = accent; }}
                  onBlur={(e) => { e.target.style.borderColor = email ? accent : "rgb(var(--line))"; }}
                />
              </div>
              <input
                type="text"
                value={store}
                onChange={(e) => setStore(e.target.value)}
                placeholder="store url (optional)"
                className={inputBase}
                style={{ borderColor: store ? accent : "rgb(var(--line))" }}
                onFocus={(e) => { e.target.style.borderColor = accent; }}
                onBlur={(e) => { e.target.style.borderColor = store ? accent : "rgb(var(--line))"; }}
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  isCustom
                    ? "Tell me about the brand and what you want built."
                    : "Anything you'd like me to know (optional)."
                }
                rows={4}
                required={isCustom}
                className={`${inputBase} resize-none`}
                style={{ borderColor: message ? accent : "rgb(var(--line))" }}
                onFocus={(e) => { e.target.style.borderColor = accent; }}
                onBlur={(e) => { e.target.style.borderColor = message ? accent : "rgb(var(--line))"; }}
              />
            </div>

            {/* Submit row */}
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={!name || !email || isSubmitting}
                className="inline-flex items-center gap-2 rounded-full pl-6 pr-5 py-2.5 text-[14px] tracking-tight font-medium transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed [-webkit-tap-highlight-color:transparent]"
                style={{
                  background: accent,
                  color: "white",
                  border: `1px solid ${accent}`,
                }}
              >
                {isCustom ? "request a quote" : "request invoice"}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>

              {status === "error" && (
                <span className="text-[13px] tracking-tight text-red-500">{error || "something went wrong."}</span>
              )}
            </div>

          </form>
        )}
      </div>
    </div>
  );
}
