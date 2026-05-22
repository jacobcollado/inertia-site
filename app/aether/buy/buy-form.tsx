"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "sent" | "error";

const TIERS = [
  {
    id: "standard",
    label: "Standard",
    price: "$85",
    term: "1 year · single store",
    includes: ["Full Aether theme", "1 year of updates", "Single store licence", "Support via client portal"],
  },
  {
    id: "lifetime",
    label: "Lifetime",
    price: "$105",
    term: "Forever · single store",
    includes: ["Full Aether theme", "Lifetime updates", "Single store licence", "Priority support"],
    badge: "Most popular",
  },
  {
    id: "custom",
    label: "Custom",
    price: "On request",
    term: "Foundation + bespoke build",
    includes: ["Custom design on Aether", "Direct access throughout", "Handoff included", "Post-launch support"],
  },
];

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 shrink-0" aria-hidden="true">
      <polyline points="2 8 6 12 14 4" />
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
  const isCustom = tier === "custom";
  const isSubmitting = status === "submitting";

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

  if (status === "sent") {
    return (
      <div className="w-full max-w-lg mx-auto px-6 sm:px-0 py-20 sm:py-28 flex flex-col gap-5" style={{ animation: "rise-in 400ms cubic-bezier(0.22,1,0.36,1) both" }}>
        <span className="text-[11px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.5 }}>
          Submitted
        </span>
        <p className="text-[clamp(2rem,5vw,3rem)] font-normal tracking-[-0.04em] leading-none text-[rgb(var(--fg))]">
          {name ? `Got it, ${name}.` : "Got it."}
        </p>
        <p className="text-[15px] tracking-tight leading-relaxed text-[rgb(var(--muted))] max-w-sm">
          {email
            ? `I'll send an invoice to ${email} shortly. Usually within a day.`
            : "I'll be in touch soon."}
        </p>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="w-full max-w-lg mx-auto px-6 sm:px-0 py-20 sm:py-28 flex flex-col gap-5" style={{ animation: "rise-in 300ms cubic-bezier(0.22,1,0.36,1) both" }}>
        <Spinner />
        <p className="text-[clamp(2rem,5vw,3rem)] font-normal tracking-[-0.04em] leading-none text-[rgb(var(--fg))]">
          Sending.
        </p>
        <p className="text-[15px] tracking-tight text-[rgb(var(--muted))]">Just a moment.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto px-6 sm:px-0 py-12 sm:py-16 flex flex-col gap-10">

      {/* Order summary */}
      <div
        key={`summary-${tier}`}
        className="rounded-2xl border px-6 py-5 flex items-start justify-between gap-4"
        style={{
          borderColor: "rgb(var(--line))",
          animation: "rise-in 260ms cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-medium tracking-tight text-[rgb(var(--fg))]">
              Aether — {selected.label}
            </span>
            {"badge" in selected && selected.badge && (
              <span
                className="text-[10px] tracking-tight font-medium px-2 py-0.5 rounded-full"
                style={{ background: "rgb(var(--fg))", color: "rgb(var(--bg))" }}
              >
                {selected.badge}
              </span>
            )}
          </div>
          <span className="text-[12px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.5 }}>
            {selected.term}
          </span>
          <ul className="mt-3 flex flex-col gap-1.5">
            {selected.includes.map((item) => (
              <li key={item} className="flex items-center gap-2 text-[12px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.7 }}>
                <Check />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <span className="text-[1.6rem] font-normal tracking-[-0.04em] leading-none tabular-nums text-[rgb(var(--fg))] shrink-0">
          {selected.price}
        </span>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-8" noValidate style={{ animation: "rise-in 320ms cubic-bezier(0.22,1,0.36,1) both" }}>

        {/* Tier selector */}
        <fieldset>
          <legend className="sr-only">License tier</legend>
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
                    className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 sm:py-1.5 text-[14px] sm:text-[13px] font-medium tracking-tight transition-all duration-200 select-none"
                    style={{
                      borderColor: active ? "rgb(var(--fg))" : "rgb(var(--line))",
                      color: active ? "rgb(var(--bg))" : "rgb(var(--muted))",
                      background: active ? "rgb(var(--fg))" : "transparent",
                    }}
                  >
                    {t.label}
                    <span className="tabular-nums text-[12px]" style={{ opacity: active ? 0.6 : 0.4 }}>
                      {t.price}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Fields */}
        <div className="flex flex-col gap-6">
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
          {!isCustom && (
            <input
              type="text"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              placeholder="Store URL (optional)"
              className={inputBase}
              style={{ borderColor: store ? "rgb(var(--fg))" : "rgb(var(--line))" }}
              onFocus={(e) => { e.target.style.borderColor = "rgb(var(--fg))"; }}
              onBlur={(e) => { e.target.style.borderColor = store ? "rgb(var(--fg))" : "rgb(var(--line))"; }}
            />
          )}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              isCustom
                ? "Tell me about the brand and what you want built."
                : "Anything you'd like me to know (optional)."
            }
            rows={3}
            required={isCustom}
            className={`${inputBase} resize-none`}
            style={{ borderColor: message ? "rgb(var(--fg))" : "rgb(var(--line))" }}
            onFocus={(e) => { e.target.style.borderColor = "rgb(var(--fg))"; }}
            onBlur={(e) => { e.target.style.borderColor = message ? "rgb(var(--fg))" : "rgb(var(--line))"; }}
          />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={!name || !email || isSubmitting}
            className="group inline-flex items-center gap-2.5 rounded-full bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-5 py-2.5 text-[13px] tracking-tight font-medium transition-opacity duration-200 hover:opacity-80 disabled:opacity-25 disabled:cursor-not-allowed [-webkit-tap-highlight-color:transparent]"
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
    </div>
  );
}
