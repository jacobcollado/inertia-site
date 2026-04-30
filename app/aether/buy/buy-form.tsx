"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "sent" | "error";

const TIERS = [
  { id: "standard", label: "Standard", price: "$85", term: "1 year, 1 store" },
  { id: "lifetime", label: "Lifetime", price: "$105", term: "Permanent, 1 store" },
  { id: "custom", label: "Custom", price: "On request", term: "Foundation + bespoke" },
];

export function BuyForm({ initialTier }: { initialTier?: string }) {
  const [tier, setTier] = useState(initialTier || "lifetime");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [store, setStore] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setError("");
    const selected = TIERS.find((t) => t.id === tier);
    const subject = `Aether ${selected?.label || tier} — ${name}`;
    const body = [
      `Tier: ${selected?.label} (${selected?.price})`,
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
          subject,
          kind: `aether:${tier}`,
        }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error || "Something went wrong");
      }
      setStatus("sent");
      setName("");
      setEmail("");
      setStore("");
      setMessage("");
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Something went wrong");
    }
  };

  const inputClass =
    "w-full bg-transparent border-0 border-b border-[rgb(var(--line))] py-3 text-base tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] focus:outline-none focus:border-[rgb(var(--fg))] transition-colors duration-300";

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <fieldset>
        <legend className="text-[13px] tracking-tight text-[rgb(var(--muted))] mb-4">
          Select a license
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[rgb(var(--line))] border border-[rgb(var(--line))]">
          {TIERS.map((t) => {
            const active = tier === t.id;
            return (
              <label
                key={t.id}
                className={`cursor-pointer p-5 transition-colors ${
                  active
                    ? "bg-[rgb(var(--fg))/0.04]"
                    : "hover:bg-[rgb(var(--line))/0.15]"
                }`}
              >
                <input
                  type="radio"
                  name="tier"
                  value={t.id}
                  checked={active}
                  onChange={() => setTier(t.id)}
                  className="sr-only"
                />
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full border transition-colors ${active ? "border-[rgb(var(--fg))] bg-[rgb(var(--fg))]" : "border-[rgb(var(--muted))]"}`} />
                  <span className="text-[13px] font-medium tracking-tight text-[rgb(var(--fg))]">
                    {t.label}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px] tracking-tight text-[rgb(var(--muted))]">
                    {t.term}
                  </span>
                  <span className="text-[13px] tracking-tight text-[rgb(var(--fg))] tabular-nums shrink-0">
                    {t.price}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="your name"
          className={inputClass}
          autoComplete="name"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your email"
          className={inputClass}
          autoComplete="email"
        />
      </div>
      <input
        type="text"
        value={store}
        onChange={(e) => setStore(e.target.value)}
        placeholder="store url (if you have one)"
        className={inputClass}
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={
          tier === "custom"
            ? "tell me about the brand and what you want built"
            : "anything you'd like me to know (optional)"
        }
        rows={4}
        className={`${inputClass} resize-none`}
        required={tier === "custom"}
      />

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center justify-center rounded-full border border-[rgb(var(--fg))] bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-5 py-2 text-sm tracking-tight hover:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--fg))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-300 [-webkit-tap-highlight-color:transparent]"
        >
          {status === "submitting"
            ? "sending"
            : status === "sent"
            ? "sent"
            : tier === "custom"
            ? "request a quote"
            : "request invoice"}
        </button>
        <span
          className="text-sm tracking-tight text-[rgb(var(--muted))] transition-opacity duration-300"
          style={{ opacity: status === "sent" || status === "error" ? 1 : 0 }}
          aria-live="polite"
        >
          {status === "sent" && "thanks, I'll send next steps shortly."}
          {status === "error" && (error || "something went wrong.")}
        </span>
      </div>
    </form>
  );
}
