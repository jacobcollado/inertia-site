"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "sent" | "error";

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

function SketchStandard() {
  const c = "rgb(var(--blue))";
  const g = (a: number) => `rgba(160,160,160,${a})`;
  return (
    <svg viewBox="0 0 280 190" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Browser shell */}
      <rect x="10" y="10" width="218" height="172" rx="4" stroke={g(0.2)} strokeWidth="1"/>
      {/* Title bar */}
      <rect x="10" y="10" width="218" height="26" rx="4" fill={g(0.04)} stroke={g(0.16)} strokeWidth="0.8"/>
      {/* Traffic lights */}
      <circle cx="26" cy="23" r="4" fill={g(0.18)}/>
      <circle cx="38" cy="23" r="4" fill={g(0.12)}/>
      <circle cx="50" cy="23" r="4" fill={g(0.09)}/>
      {/* URL bar */}
      <rect x="68" y="16" width="100" height="14" rx="3" stroke={g(0.18)} strokeWidth="0.7"/>
      {/* Lock icon */}
      <rect x="74" y="20" width="5" height="4" rx="1" stroke={g(0.38)} strokeWidth="0.65"/>
      <path d="M74.5 20v-2a2 2 0 0 1 4 0v2" stroke={g(0.32)} strokeWidth="0.65" fill="none"/>
      {/* Favicon */}
      <circle cx="83" cy="23" r="1.5" fill={c} opacity="0.5"/>

      {/* Shopify storefront nav */}
      <line x1="10" y1="36" x2="228" y2="36" stroke={g(0.12)} strokeWidth="0.6"/>
      <rect x="18" y="40" width="26" height="7" rx="1.5" fill={c} opacity="0.2"/>
      <line x1="58" y1="44" x2="76" y2="44" stroke={g(0.22)} strokeWidth="0.9"/>
      <line x1="82" y1="44" x2="100" y2="44" stroke={g(0.16)} strokeWidth="0.9"/>
      <line x1="106" y1="44" x2="124" y2="44" stroke={g(0.16)} strokeWidth="0.9"/>
      <rect x="198" y="39" width="22" height="10" rx="2" stroke={c} strokeWidth="0.8" opacity="0.4"/>

      {/* Hero banner */}
      <rect x="10" y="52" width="218" height="58" fill={c} fillOpacity="0.05" stroke={c} strokeWidth="0.9" opacity="0.5"/>
      <line x1="24" y1="68" x2="116" y2="68" stroke={c} strokeWidth="2.4" opacity="0.7"/>
      <line x1="24" y1="77" x2="92" y2="77" stroke={c} strokeWidth="1.4" opacity="0.45"/>
      <line x1="24" y1="85" x2="72" y2="85" stroke={g(0.22)} strokeWidth="0.8"/>
      <rect x="24" y="93" width="46" height="11" rx="2" fill={c} opacity="0.8"/>

      {/* Product grid 3-up */}
      {([10, 84, 158] as number[]).map((x, i) => (
        <g key={i}>
          <rect x={x} y="118" width="66" height="42" rx="2" fill={g(0.04)} stroke={g(0.15)} strokeWidth="0.7"/>
          <line x1={x + 10} y1="122" x2={x + 56} y2="156" stroke={g(0.08)} strokeWidth="0.5"/>
          <line x1={x + 56} y1="122" x2={x + 10} y2="156" stroke={g(0.08)} strokeWidth="0.5"/>
          <line x1={x + 6} y1="164" x2={x + 50} y2="164" stroke={g(0.28)} strokeWidth="0.9"/>
          <line x1={x + 6} y1="171" x2={x + 30} y2="171" stroke={c} strokeWidth="0.9" opacity="0.55"/>
        </g>
      ))}

      {/* 1-year calendar badge */}
      <rect x="236" y="10" width="40" height="44" rx="4" fill={c} fillOpacity="0.07" stroke={c} strokeWidth="1.2" opacity="0.65"/>
      <line x1="236" y1="24" x2="276" y2="24" stroke={c} strokeWidth="0.9" opacity="0.4"/>
      <line x1="248" y1="10" x2="248" y2="5" stroke={c} strokeWidth="1.5" opacity="0.55"/>
      <line x1="264" y1="10" x2="264" y2="5" stroke={c} strokeWidth="1.5" opacity="0.55"/>
      {/* Numeral "1" */}
      <line x1="256" y1="30" x2="256" y2="46" stroke={c} strokeWidth="2.8" opacity="0.8"/>
      <line x1="250" y1="33" x2="256" y2="30" stroke={c} strokeWidth="1.8" opacity="0.6"/>
      <line x1="251" y1="46" x2="262" y2="46" stroke={c} strokeWidth="1.4" opacity="0.5"/>
    </svg>
  );
}

function SketchLifetime() {
  const c = "rgb(var(--green))";
  const g = (a: number) => `rgba(160,160,160,${a})`;
  return (
    <svg viewBox="0 0 280 190" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* License document */}
      <rect x="38" y="6" width="172" height="136" rx="4" fill={g(0.03)} stroke={g(0.22)} strokeWidth="1.1"/>
      {/* Header band */}
      <rect x="38" y="6" width="172" height="28" rx="4" fill={c} fillOpacity="0.08" stroke={c} strokeWidth="1.2" opacity="0.6"/>
      <line x1="60" y1="20" x2="184" y2="20" stroke={c} strokeWidth="1.9" opacity="0.65"/>
      <line x1="54" y1="27" x2="88" y2="27" stroke={c} strokeWidth="0.9" opacity="0.4"/>

      {/* Licensee block */}
      <rect x="52" y="42" width="144" height="30" rx="2" fill={g(0.03)} stroke={g(0.14)} strokeWidth="0.7"/>
      <line x1="62" y1="52" x2="136" y2="52" stroke={g(0.28)} strokeWidth="0.9"/>
      <line x1="62" y1="60" x2="112" y2="60" stroke={g(0.18)} strokeWidth="0.7"/>
      <line x1="62" y1="66" x2="90" y2="66" stroke={c} strokeWidth="0.8" opacity="0.4"/>

      {/* Terms lines */}
      <line x1="52" y1="82" x2="200" y2="82" stroke={g(0.2)} strokeWidth="0.7"/>
      <line x1="52" y1="90" x2="200" y2="90" stroke={g(0.16)} strokeWidth="0.7"/>
      <line x1="52" y1="98" x2="182" y2="98" stroke={g(0.14)} strokeWidth="0.7"/>
      <line x1="52" y1="106" x2="192" y2="106" stroke={g(0.12)} strokeWidth="0.6"/>
      <line x1="52" y1="114" x2="168" y2="114" stroke={g(0.1)} strokeWidth="0.6"/>

      {/* Signature line + scribble */}
      <line x1="52" y1="130" x2="130" y2="130" stroke={g(0.25)} strokeWidth="0.7"/>
      <path d="M56 128 Q64 122 72 128 Q80 134 88 128 Q94 124 100 127" stroke={c} strokeWidth="1.2" opacity="0.55" fill="none"/>

      {/* Wax seal */}
      <circle cx="214" cy="118" r="36" fill={c} fillOpacity="0.05" stroke={c} strokeWidth="1.3" opacity="0.45"/>
      <circle cx="214" cy="118" r="28" fill={c} fillOpacity="0.07" stroke={c} strokeWidth="1.0" opacity="0.55"/>
      <circle cx="214" cy="118" r="20" fill="none" stroke={c} strokeWidth="0.7" opacity="0.35"/>
      {/* Checkmark */}
      <polyline points="202,118 210,129 227,104" stroke={c} strokeWidth="3" opacity="0.85" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Seal notch marks */}
      {([0,30,60,90,120,150,180,210,240,270,300,330] as number[]).map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={214 + Math.cos(rad) * 30}
            y1={118 + Math.sin(rad) * 30}
            x2={214 + Math.cos(rad) * 35}
            y2={118 + Math.sin(rad) * 35}
            stroke={c} strokeWidth="0.9" opacity="0.4"
          />
        );
      })}

      {/* Ribbon tails */}
      <path d="M200,150 L194,172 L214,162 L234,172 L228,150" fill={c} fillOpacity="0.07" stroke={c} strokeWidth="1.1" opacity="0.35"/>

      {/* "Lifetime" pill top-right */}
      <rect x="216" y="6" width="60" height="18" rx="9" fill={c} fillOpacity="0.1" stroke={c} strokeWidth="1" opacity="0.55"/>
      <line x1="226" y1="15" x2="268" y2="15" stroke={c} strokeWidth="1" opacity="0.45"/>
    </svg>
  );
}

function SketchCustom() {
  const c = "rgb(var(--purple))";
  const g = (a: number) => `rgba(160,160,160,${a})`;
  return (
    <svg viewBox="0 0 280 190" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Blueprint grid */}
      {([42, 72, 102, 132, 162, 192, 222] as number[]).map((x) => (
        <line key={`v${x}`} x1={x} y1="4" x2={x} y2="186" stroke={g(0.08)} strokeWidth="0.5"/>
      ))}
      {([18, 48, 78, 108, 138, 168] as number[]).map((y) => (
        <line key={`h${y}`} x1="4" y1={y} x2="276" y2={y} stroke={g(0.08)} strokeWidth="0.5"/>
      ))}

      {/* Main frame */}
      <rect x="18" y="12" width="224" height="160" rx="3" fill={c} fillOpacity="0.025" stroke={c} strokeWidth="1.4" opacity="0.5"/>

      {/* Top dimension annotation */}
      <line x1="18" y1="5" x2="242" y2="5" stroke={c} strokeWidth="0.9" opacity="0.5"/>
      <line x1="18" y1="2" x2="18" y2="8" stroke={c} strokeWidth="0.9" opacity="0.5"/>
      <line x1="242" y1="2" x2="242" y2="8" stroke={c} strokeWidth="0.9" opacity="0.5"/>
      {/* Left dimension annotation */}
      <line x1="7" y1="12" x2="7" y2="172" stroke={c} strokeWidth="0.9" opacity="0.5"/>
      <line x1="4" y1="12" x2="10" y2="12" stroke={c} strokeWidth="0.9" opacity="0.5"/>
      <line x1="4" y1="172" x2="10" y2="172" stroke={c} strokeWidth="0.9" opacity="0.5"/>

      {/* Nav bar */}
      <rect x="18" y="12" width="224" height="22" rx="3" fill={c} fillOpacity="0.05" stroke={c} strokeWidth="0.9" opacity="0.4"/>
      <rect x="26" y="17" width="32" height="12" rx="2" fill={c} opacity="0.22"/>
      <line x1="72" y1="23" x2="94" y2="23" stroke={g(0.25)} strokeWidth="0.8"/>
      <line x1="102" y1="23" x2="124" y2="23" stroke={g(0.2)} strokeWidth="0.8"/>
      <line x1="132" y1="23" x2="154" y2="23" stroke={g(0.2)} strokeWidth="0.8"/>
      <rect x="216" y="17" width="20" height="12" rx="2" fill={c} opacity="0.22" stroke={c} strokeWidth="0.7"/>

      {/* Hero zone */}
      <rect x="18" y="34" width="224" height="54" fill={c} fillOpacity="0.04" stroke={c} strokeWidth="1" opacity="0.45"/>
      {/* Headline copy stubs */}
      <line x1="32" y1="50" x2="140" y2="50" stroke={c} strokeWidth="2.4" opacity="0.65"/>
      <line x1="32" y1="61" x2="110" y2="61" stroke={c} strokeWidth="1.4" opacity="0.4"/>
      <line x1="32" y1="70" x2="78" y2="70" stroke={g(0.2)} strokeWidth="0.8"/>
      {/* Hero image right half */}
      <rect x="164" y="38" width="70" height="46" rx="2" fill={g(0.05)} stroke={g(0.18)} strokeWidth="0.7"/>
      <line x1="164" y1="38" x2="234" y2="84" stroke={g(0.08)} strokeWidth="0.5"/>
      <line x1="234" y1="38" x2="164" y2="84" stroke={g(0.08)} strokeWidth="0.5"/>

      {/* Feature cards row */}
      {([18, 94, 170] as number[]).map((x, i) => (
        <g key={i}>
          <rect x={x} y="96" width="68" height="54" rx="2" fill={g(0.03)} stroke={g(0.16)} strokeWidth="0.7"/>
          <rect x={x + 8} y="104" width="12" height="12" rx="2" fill={c} opacity="0.2"/>
          <line x1={x + 8} y1="122" x2={x + 54} y2="122" stroke={g(0.22)} strokeWidth="0.8"/>
          <line x1={x + 8} y1="130" x2={x + 46} y2="130" stroke={g(0.15)} strokeWidth="0.7"/>
          <line x1={x + 8} y1="138" x2={x + 36} y2="138" stroke={g(0.12)} strokeWidth="0.6"/>
        </g>
      ))}

      {/* Footer strip */}
      <line x1="18" y1="158" x2="242" y2="158" stroke={g(0.12)} strokeWidth="0.6"/>
      <line x1="26" y1="167" x2="70" y2="167" stroke={g(0.18)} strokeWidth="0.7"/>
      <line x1="186" y1="167" x2="234" y2="167" stroke={g(0.14)} strokeWidth="0.6"/>

      {/* Pencil annotation */}
      <g transform="translate(252,8) rotate(32)">
        <rect x="0" y="0" width="7" height="26" rx="1.5" fill={c} fillOpacity="0.15" stroke={c} strokeWidth="1" opacity="0.6"/>
        <polygon points="0,26 7,26 3.5,34" fill={c} opacity="0.5"/>
        <line x1="0" y1="6" x2="7" y2="6" stroke={c} strokeWidth="0.7" opacity="0.4"/>
        <line x1="0" y1="22" x2="7" y2="22" stroke={c} strokeWidth="0.7" opacity="0.4"/>
        <line x1="3.5" y1="-4" x2="3.5" y2="0" stroke={c} strokeWidth="1.2" opacity="0.3"/>
      </g>

      {/* Callout bubble on hero */}
      <circle cx="164" cy="61" r="3.5" fill={c} opacity="0.6"/>
      <line x1="167" y1="59" x2="186" y2="46" stroke={c} strokeWidth="0.8" opacity="0.45"/>
      <rect x="186" y="38" width="38" height="14" rx="3" fill={c} fillOpacity="0.1" stroke={c} strokeWidth="0.8" opacity="0.55"/>
      <line x1="192" y1="45" x2="218" y2="45" stroke={c} strokeWidth="0.8" opacity="0.45"/>
    </svg>
  );
}

function SketchSent() {
  const c = "rgb(var(--green))";
  return (
    <svg viewBox="0 0 280 190" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <circle cx="140" cy="95" r="68" stroke={c} strokeWidth="1.1" opacity="0.25"/>
      <circle cx="140" cy="95" r="52" stroke={c} strokeWidth="1.4" opacity="0.5" fill={c} fillOpacity="0.05"/>
      <polyline points="112,95 130,115 170,72" stroke={c} strokeWidth="3.2" opacity="0.85" strokeLinecap="round" strokeLinejoin="round"/>
      {([0,30,60,90,120,150,180,210,240,270,300,330] as number[]).map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={140 + Math.cos(rad) * 60}
            y1={95 + Math.sin(rad) * 60}
            x2={140 + Math.cos(rad) * 70}
            y2={95 + Math.sin(rad) * 70}
            stroke={c} strokeWidth="1" opacity="0.4"
          />
        );
      })}
    </svg>
  );
}

function Spinner({ color }: { color: string }) {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

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
          subject: `Aether ${selected.label}, ${name}`,
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

      {/* Left: sketch panel */}
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

      {/* Right: form panel */}
      <div className="sm:w-[56%] flex flex-col justify-center px-8 sm:px-12 pt-2 pb-12 sm:py-16">

        {isSubmitting && (
          <div className="flex flex-col gap-6" style={{ animation: "rise-in 300ms cubic-bezier(0.22,1,0.36,1) both" }}>
            <Spinner color={accent}/>
            <p className="text-[clamp(1.6rem,4vw,2.25rem)] font-medium tracking-[-0.04em] leading-snug text-[rgb(var(--fg))]">
              Sending.
            </p>
            <p className="text-[15px] tracking-tight text-[rgb(var(--muted))]">Just a moment.</p>
          </div>
        )}

        {status === "sent" && (
          <div className="flex flex-col gap-5" style={{ animation: "rise-in 400ms cubic-bezier(0.22,1,0.36,1) both" }}>
            <span className="text-[11px] tracking-tight" style={{ color: "rgb(var(--green))", opacity: 0.8 }}>
              Submitted
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

        {!isSubmitting && status !== "sent" && (
          <form onSubmit={onSubmit} className="w-full" noValidate>

            <div className="mb-8" style={{ animation: "rise-in 280ms cubic-bezier(0.22,1,0.36,1) both" }}>
              <p className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-medium tracking-[-0.04em] leading-snug text-[rgb(var(--fg))]">
                {isCustom ? "Tell me about the build." : "Pick up a license."}
              </p>
              <p className="mt-2 text-[14px] tracking-tight text-[rgb(var(--muted))]">
                {isCustom
                  ? "Share a few details and I'll put together a scope and quote."
                  : "Share a few details and I'll send an invoice within a day."}
              </p>
            </div>

            {/* Tier selector */}
            <fieldset className="mb-8">
              <legend className="sr-only">License</legend>
              <div className="flex items-center gap-2 flex-wrap">
                {TIERS.map((t) => {
                  const active = tier === t.id;
                  return (
                    <label key={t.id} className="cursor-pointer [-webkit-tap-highlight-color:transparent]">
                      <input
                        type="radio"
                        name="tier"
                        value={t.id}
                        checked={active}
                        onChange={() => setTier(t.id)}
                        className="sr-only"
                      />
                      <span
                        className="inline-flex items-center gap-2 rounded-full border px-4 py-2 sm:py-1.5 text-[14px] sm:text-[13px] font-medium tracking-tight transition-all duration-200 select-none"
                        style={{
                          borderColor: active ? t.accent : "rgb(var(--line))",
                          color: active ? t.accent : "rgb(var(--muted))",
                          background: active ? `color-mix(in srgb, ${t.accent} 8%, transparent)` : "transparent",
                        }}
                      >
                        {t.label}
                        <span
                          className="tabular-nums text-[13px] sm:text-[12px]"
                          style={{ opacity: active ? 0.75 : 0.45 }}
                        >
                          {t.price}
                        </span>
                        {t.badge && active && (
                          <span
                            className="text-[10px] tracking-tight rounded-full px-1.5 py-px"
                            style={{ background: `color-mix(in srgb, ${t.accent} 14%, transparent)` }}
                          >
                            Popular
                          </span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
              <p
                key={`ctx-${tier}`}
                className="mt-3 text-[12px] tracking-tight text-[rgb(var(--muted))]"
                style={{ animation: "rise-in 200ms cubic-bezier(0.22,1,0.36,1) both", opacity: 0.6 }}
              >
                {selected.term}. {selected.description}
              </p>
            </fieldset>

            {/* Fields */}
            <div className="flex flex-col gap-6 mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
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
                  placeholder="Your email"
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
                placeholder="Store URL (optional)"
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

            {/* Submit */}
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={!name || !email || isSubmitting}
                className="group inline-flex items-center gap-2.5 rounded-full border px-5 py-2 text-[13px] tracking-tight font-medium transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed [-webkit-tap-highlight-color:transparent]"
                style={{ borderColor: accent, color: accent, background: "transparent" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = accent;
                  (e.currentTarget as HTMLButtonElement).style.color = "white";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = accent;
                }}
              >
                {isCustom ? "Request a quote" : "Request invoice"}
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
              </button>

              {status === "error" && (
                <span className="text-[13px] tracking-tight text-red-500">{error || "Something went wrong."}</span>
              )}
            </div>

          </form>
        )}
      </div>
    </div>
  );
}
