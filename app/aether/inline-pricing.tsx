"use client";

import { useState } from "react";
import { PricingLifeShader } from "./pricing-life-shader";

const TIERS = [
  {
    id: "standard",
    label: "Core",
    price: "$85/year",
    desc: "One year of updates, portal support, single store.",
    includes: [
      "Full Aether theme, all 41 sections",
      "1 year of updates",
      "Single store license",
      "Support via client portal",
    ],
  },
  {
    id: "lifetime",
    label: "Forever",
    price: "$105 once",
    desc: "Lifetime updates, priority support, single store.",
    includes: [
      "Full Aether theme, all 41 sections",
      "Lifetime updates, no renewals",
      "Single store license",
      "Priority support",
    ],
  },
] as const;

type TierId = (typeof TIERS)[number]["id"];
type Status = "idle" | "submitting" | "error";

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 w-3 h-3 shrink-0 text-[rgb(var(--fg))]"
      style={{ opacity: 0.45 }}
      aria-hidden="true"
    >
      <polyline points="2 8 6 12 14 4" />
    </svg>
  );
}

export function InlinePricing() {
  const [tier, setTier] = useState<TierId>("lifetime");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const selected = TIERS.find((t) => t.id === tier)!;

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
    } catch (err: unknown) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <div className="w-full rise rise--liquid">
      <div className="overflow-hidden rounded-2xl border border-[rgb(var(--line))] bg-[rgb(var(--surface)/0.45)] flex flex-col sm:flex-row sm:items-stretch">
        <div className="hidden sm:block sm:w-[35%] sm:shrink-0 border-r border-[rgb(var(--line))]">
          <PricingLifeShader embedded className="min-h-[320px]" />
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-7 lg:p-8 text-left">
          <div className="flex flex-col gap-5 sm:gap-6">
            <div
              className="inline-flex items-center self-start rounded-full border border-[rgb(var(--line))] p-1 gap-1"
              role="tablist"
              aria-label="License type"
            >
              {TIERS.map((t) => {
                const active = tier === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      setTier(t.id);
                      setStatus("idle");
                      setError("");
                    }}
                    className="rounded-full px-4 py-1.5 text-[13px] font-normal tracking-tight transition-all duration-200 [-webkit-tap-highlight-color:transparent]"
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

            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div
                key={tier}
                className="flex flex-col gap-2 sm:max-w-[22rem]"
                style={{
                  animation: "liquid-in 680ms cubic-bezier(0.22, 0.61, 0.36, 1) both",
                }}
              >
                <p className="text-[clamp(2rem,4vw,2.75rem)] font-normal tabular-nums tracking-[-0.04em] leading-none text-[rgb(var(--fg))]">
                  {selected.price}
                </p>
                <p className="text-[14px] sm:text-[15px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">
                  {selected.desc}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={status === "submitting"}
                className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium tracking-tight transition-opacity hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed [-webkit-tap-highlight-color:transparent]"
                style={{ background: "#000", color: "#ededed" }}
              >
                {status === "submitting" ? <Spinner /> : null}
                {status === "submitting" ? "Redirecting…" : "Get Aether"}
              </button>
            </div>

            {status === "error" && (
              <span className="-mt-2 text-[13px] tracking-tight text-red-500">{error || "Something went wrong."}</span>
            )}
          </div>

          <div className="mt-6 sm:mt-8 pt-6 sm:pt-7 border-t border-[rgb(var(--line))]">
            <p className="mb-4 text-[13px] font-medium tracking-tight text-[rgb(var(--fg))]">What&apos;s included</p>
            <ul
              key={tier}
              className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5"
              style={{
                animation: "liquid-in 680ms cubic-bezier(0.22, 0.61, 0.36, 1) both",
              }}
            >
              {selected.includes.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[13px] leading-snug tracking-tight text-[rgb(var(--muted))]">
                  <CheckIcon />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
