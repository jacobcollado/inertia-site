"use client";

import { useState, type ReactNode } from "react";
import { PricingLifeShader } from "./pricing-life-shader";
import { PolicyDisclaimer } from "./policy-disclaimer";
import { ACTION_RADIUS_CLASS } from "@/lib/cta-chrome";

const INCLUDE_ICON_CLASS =
  "h-3.5 w-3.5 shrink-0 text-primary";

const LICENSE = {
  id: "lifetime" as const,
  price: "$125 once",
  desc: "Lifetime updates, priority support, single store.",
  includes: [
    {
      label: "Full Aether theme, all 41 sections",
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={INCLUDE_ICON_CLASS} aria-hidden="true">
          <rect x="1" y="2" width="14" height="3" rx="1" />
          <rect x="1" y="7" width="9" height="3" rx="1" />
          <rect x="1" y="12" width="6" height="3" rx="1" />
        </svg>
      ),
    },
    {
      label: "Lifetime updates, no renewals",
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={INCLUDE_ICON_CLASS} aria-hidden="true">
          <path d="M13 2.5v3.5H9.5" />
          <path d="M3 13.5V10h3.5" />
          <path d="M12.2 5.8A5 5 0 0 0 4.2 6.5" />
          <path d="M3.8 10.2A5 5 0 0 0 11.8 9.5" />
        </svg>
      ),
    },
    {
      label: "Single store license",
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={INCLUDE_ICON_CLASS} aria-hidden="true">
          <path d="M2.5 6.5 3.5 3h9l1 3.5" />
          <rect x="2.5" y="6.5" width="11" height="7" rx="1" />
          <path d="M6.5 13.5V9.5h3v4" />
        </svg>
      ),
    },
    {
      label: "Priority support",
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={INCLUDE_ICON_CLASS} aria-hidden="true">
          <path d="M4 10V8a4 4 0 0 1 8 0v2" />
          <rect x="2" y="9.5" width="2.5" height="4" rx="1.2" />
          <rect x="11.5" y="9.5" width="2.5" height="4" rx="1.2" />
        </svg>
      ),
    },
    {
      label: "Theme install included",
      bonus: "$50 value — free",
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={INCLUDE_ICON_CLASS} aria-hidden="true">
          <path d="M8 2v8" />
          <path d="M5 7l3 3 3-3" />
          <path d="M3 12.5h10" />
          <path d="M3 12.5v1.5h10v-1.5" />
        </svg>
      ),
    },
  ] satisfies { label: string; icon: ReactNode; bonus?: string }[],
};

type Status = "idle" | "submitting" | "error";

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function InlinePricing() {
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
        body: JSON.stringify({ tier: LICENSE.id }),
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 sm:mb-10">
        {LICENSE.includes.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-3 rounded-xl bg-[rgb(var(--surface)/0.45)] px-5 py-4${item.bonus ? " sm:col-span-2" : ""}`}
          >
            {item.icon}
            <span className="flex min-w-0 flex-wrap items-center gap-2.5 text-[14px] sm:text-[15px] tracking-tight text-[rgb(var(--fg))]">
              {item.label}
              {item.bonus ? (
                <span className="inline-flex shrink-0 items-center rounded-full border border-[#0a84ff]/25 bg-[#0a84ff]/12 px-2.5 py-1 text-[12px] sm:text-[13px] font-medium tracking-tight text-[#0a84ff]">
                  {item.bonus}
                </span>
              ) : null}
            </span>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl bg-[rgb(var(--surface)/0.45)] flex flex-col sm:flex-row sm:items-stretch">
        <div className="hidden sm:block sm:w-[35%] sm:shrink-0">
          <PricingLifeShader embedded className="min-h-[220px]" />
        </div>

        <div className="flex flex-1 flex-col gap-5 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7 lg:p-8">
          <div className="flex flex-col gap-2 sm:max-w-[22rem] text-left">
            <p className="text-[clamp(2rem,4vw,2.75rem)] font-normal tabular-nums tracking-[-0.04em] leading-none text-[rgb(var(--fg))]">
              {LICENSE.price}
            </p>
            <p className="text-[14px] sm:text-[15px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">
              {LICENSE.desc}
            </p>
          </div>

          <div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:shrink-0">
            <button
              type="button"
              onClick={handleCheckout}
              disabled={status === "submitting"}
              className={`inline-flex w-full items-center justify-center gap-1.5 sm:w-auto ${ACTION_RADIUS_CLASS} px-4 py-2 text-[17px] sm:text-[18px] font-medium tracking-tight transition-opacity hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed [-webkit-tap-highlight-color:transparent]`}
              style={{ background: "#000", color: "#ededed" }}
            >
              {status === "submitting" ? <Spinner /> : null}
              {status === "submitting" ? "Redirecting…" : "Get Aether"}
            </button>
            <PolicyDisclaimer />
          </div>
        </div>
      </div>

      {status === "error" && (
        <span className="mt-3 block text-[13px] tracking-tight text-red-500">{error || "Something went wrong."}</span>
      )}
    </div>
  );
}
