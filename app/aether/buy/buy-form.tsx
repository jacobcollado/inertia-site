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
    <svg viewBox="0 0 260 176" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Browser frame */}
      <rect x="20" y="14" width="192" height="148" rx="3" stroke={muted} strokeWidth="0.9" opacity="0.28" />
      {/* Chrome */}
      <rect x="20" y="14" width="192" height="20" rx="3" fill={blue} fillOpacity="0.05" stroke={blue} strokeWidth="1" opacity="0.5" />
      <circle cx="35" cy="24" r="3" fill={blue} fillOpacity="0.2" stroke={blue} strokeWidth="0.9" opacity="0.6" />
      <circle cx="46" cy="24" r="3" stroke={muted} strokeWidth="0.8" opacity="0.3" />
      <circle cx="57" cy="24" r="3" stroke={muted} strokeWidth="0.8" opacity="0.3" />
      <rect x="88" y="19" width="72" height="10" rx="2.5" stroke={muted} strokeWidth="0.7" opacity="0.25" />
      {/* Nav strip */}
      <line x1="20" y1="34" x2="212" y2="34" stroke={muted} strokeWidth="0.5" opacity="0.2" />
      {/* Hero — full width */}
      <rect x="28" y="42" width="176" height="64" rx="2" fill={blue} fillOpacity="0.05" stroke={blue} strokeWidth="1.1" opacity="0.45" />
      <line x1="28" y1="42" x2="204" y2="106" stroke={blue} strokeWidth="0.5" opacity="0.12" />
      <line x1="204" y1="42" x2="28" y2="106" stroke={blue} strokeWidth="0.5" opacity="0.12" />
      {/* Product grid — 3 cards */}
      {[28, 90, 152].map((x) => (
        <g key={x}>
          <rect x={x} y="114" width="52" height="38" rx="2" stroke={muted} strokeWidth="0.8" opacity="0.25" />
          <line x1={x + 8} y1="138" x2={x + 36} y2="138" stroke={muted} strokeWidth="0.7" opacity="0.3" />
          <line x1={x + 8} y1="144" x2={x + 28} y2="144" stroke={muted} strokeWidth="0.5" opacity="0.2" />
        </g>
      ))}
      {/* Calendar badge — 1 year */}
      <rect x="178" y="6" width="36" height="32" rx="3" fill={blue} fillOpacity="0.08" stroke={blue} strokeWidth="1.4" opacity="0.7" />
      <line x1="178" y1="17" x2="214" y2="17" stroke={blue} strokeWidth="1" opacity="0.5" />
      <line x1="188" y1="6" x2="188" y2="2" stroke={blue} strokeWidth="1.3" opacity="0.6" />
      <line x1="204" y1="6" x2="204" y2="2" stroke={blue} strokeWidth="1.3" opacity="0.6" />
      {/* "1" digit */}
      <line x1="196" y1="22" x2="196" y2="30" stroke={blue} strokeWidth="2.2" opacity="0.7" strokeLinecap="round" />
      <line x1="192" y1="24" x2="196" y2="22" stroke={blue} strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
    </svg>
  );
}

function SketchLifetime() {
  const green = "rgb(var(--green))";
  const muted = "rgb(var(--muted))";
  return (
    <svg viewBox="0 0 260 176" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Document — centred, shorter so seal fits */}
      <rect x="52" y="12" width="156" height="124" rx="3" stroke={muted} strokeWidth="1.1" opacity="0.35" />
      {/* Header band */}
      <rect x="52" y="12" width="156" height="24" rx="3" fill={green} fillOpacity="0.07" stroke={green} strokeWidth="1.4" opacity="0.6" />
      <line x1="76" y1="24" x2="188" y2="24" stroke={green} strokeWidth="1.6" opacity="0.6" />
      {/* Body lines */}
      <line x1="70" y1="52" x2="190" y2="52" stroke={muted} strokeWidth="0.9" opacity="0.32" />
      <line x1="70" y1="64" x2="190" y2="64" stroke={muted} strokeWidth="0.9" opacity="0.28" />
      <line x1="70" y1="76" x2="172" y2="76" stroke={muted} strokeWidth="0.9" opacity="0.24" />
      <line x1="70" y1="88" x2="186" y2="88" stroke={muted} strokeWidth="0.8" opacity="0.2" />
      <line x1="70" y1="100" x2="158" y2="100" stroke={muted} strokeWidth="0.8" opacity="0.18" />
      {/* Wax seal — bottom, overlapping doc edge */}
      <circle cx="130" cy="138" r="26" fill={green} fillOpacity="0.06" stroke={green} strokeWidth="1.6" opacity="0.6" />
      <circle cx="130" cy="138" r="18" stroke={green} strokeWidth="1" opacity="0.4" />
      <polyline points="119,138 127,147 143,128" stroke={green} strokeWidth="2.6" opacity="0.85" strokeLinecap="round" strokeLinejoin="round" />
      {/* Ribbon tails */}
      <path d="M112,160 L104,174 L130,165 L156,174 L148,160" stroke={green} strokeWidth="1.2" opacity="0.4" fill={green} fillOpacity="0.05" />
      {/* "Forever" pill — top right */}
      <rect x="178" y="4" width="52" height="16" rx="3" fill={green} fillOpacity="0.1" stroke={green} strokeWidth="1.1" opacity="0.55" />
      <line x1="186" y1="12" x2="222" y2="12" stroke={green} strokeWidth="1.1" opacity="0.5" />
    </svg>
  );
}

function SketchCustom() {
  const purple = "rgb(var(--purple))";
  const muted = "rgb(var(--muted))";
  return (
    <svg viewBox="0 0 260 176" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Blueprint grid — subtle */}
      {[52, 82, 112, 142, 172, 202].map((x) => (
        <line key={`v${x}`} x1={x} y1="10" x2={x} y2="162" stroke={muted} strokeWidth="0.45" opacity="0.12" />
      ))}
      {[10, 40, 70, 100, 130, 160].map((y) => (
        <line key={`h${y}`} x1="22" y1={y} x2="238" y2={y} stroke={muted} strokeWidth="0.45" opacity="0.12" />
      ))}
      {/* Outer frame */}
      <rect x="30" y="16" width="200" height="140" rx="3" stroke={purple} strokeWidth="1.5" opacity="0.55" fill={purple} fillOpacity="0.03" />
      {/* Nav bar */}
      <rect x="30" y="16" width="200" height="20" rx="3" fill={purple} fillOpacity="0.05" stroke={purple} strokeWidth="1.1" opacity="0.45" />
      <line x1="44" y1="26" x2="70" y2="26" stroke={purple} strokeWidth="1.2" opacity="0.5" />
      <line x1="148" y1="26" x2="164" y2="26" stroke={muted} strokeWidth="0.8" opacity="0.3" />
      <line x1="170" y1="26" x2="186" y2="26" stroke={muted} strokeWidth="0.8" opacity="0.3" />
      <rect x="196" y="21" width="26" height="10" rx="2" fill={purple} fillOpacity="0.12" stroke={purple} strokeWidth="0.8" opacity="0.5" />
      {/* Hero block */}
      <rect x="38" y="44" width="184" height="50" rx="2" fill={purple} fillOpacity="0.05" stroke={purple} strokeWidth="1.2" opacity="0.5" />
      {/* Hero content lines */}
      <line x1="54" y1="60" x2="140" y2="60" stroke={purple} strokeWidth="1.4" opacity="0.55" />
      <line x1="54" y1="70" x2="118" y2="70" stroke={purple} strokeWidth="0.9" opacity="0.35" />
      <rect x="54" y="78" width="38" height="10" rx="2" fill={purple} fillOpacity="0.2" stroke={purple} strokeWidth="0.8" opacity="0.5" />
      {/* Two content columns */}
      <rect x="38" y="102" width="88" height="46" rx="2" stroke={muted} strokeWidth="1" opacity="0.38" />
      <rect x="134" y="102" width="88" height="46" rx="2" stroke={muted} strokeWidth="1" opacity="0.38" />
      <line x1="50" y1="116" x2="114" y2="116" stroke={muted} strokeWidth="0.8" opacity="0.28" />
      <line x1="50" y1="124" x2="104" y2="124" stroke={muted} strokeWidth="0.8" opacity="0.22" />
      <line x1="146" y1="116" x2="210" y2="116" stroke={muted} strokeWidth="0.8" opacity="0.28" />
      <line x1="146" y1="124" x2="196" y2="124" stroke={muted} strokeWidth="0.8" opacity="0.22" />
      {/* Dimension line — left edge */}
      <line x1="18" y1="16" x2="18" y2="156" stroke={purple} strokeWidth="0.9" opacity="0.45" />
      <line x1="13" y1="16" x2="23" y2="16" stroke={purple} strokeWidth="0.9" opacity="0.45" />
      <line x1="13" y1="156" x2="23" y2="156" stroke={purple} strokeWidth="0.9" opacity="0.45" />
      {/* Dimension line — bottom */}
      <line x1="30" y1="168" x2="230" y2="168" stroke={purple} strokeWidth="0.9" opacity="0.45" />
      <line x1="30" y1="163" x2="30" y2="173" stroke={purple} strokeWidth="0.9" opacity="0.45" />
      <line x1="230" y1="163" x2="230" y2="173" stroke={purple} strokeWidth="0.9" opacity="0.45" />
      {/* Pencil — top right corner, within bounds */}
      <line x1="206" y1="8" x2="240" y2="2" stroke={purple} strokeWidth="1.6" opacity="0.6" />
      <path d="M206 8 L200 16 L207 13 Z" fill={purple} fillOpacity="0.55" stroke={purple} strokeWidth="0.5" opacity="0.55" />
      <line x1="237" y1="3" x2="243" y2="0" stroke={purple} strokeWidth="1.4" opacity="0.35" strokeLinecap="round" />
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
              <legend className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-50 mb-3">
                Choose a license
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
