"use client";

import { useState } from "react";
import { PricingLifeShader } from "./pricing-life-shader";
import { PolicyDisclaimer } from "./policy-disclaimer";
import { ACTION_RADIUS_CLASS } from "@/lib/cta-chrome";

const LICENSE = {
  id: "lifetime" as const,
  price: "$125 once",
  desc: "Lifetime updates, priority support, single store.",
  includes: [
    "Full Aether theme, all 41 sections",
    "Lifetime updates, no renewals",
    "Single store license",
    "Priority support",
  ],
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

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 shrink-0 text-[rgb(var(--fg))]"
      style={{ opacity: 0.35 }}
      aria-hidden="true"
    >
      <polyline points="2 8 6 12 14 4" />
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
            key={item}
            className="flex items-center gap-3 rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--surface)/0.45)] px-5 py-4"
          >
            <CheckIcon />
            <span className="text-[14px] sm:text-[15px] tracking-tight text-[rgb(var(--fg))]">{item}</span>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[rgb(var(--line))] bg-[rgb(var(--surface)/0.45)] flex flex-col sm:flex-row sm:items-stretch">
        <div className="hidden sm:block sm:w-[35%] sm:shrink-0 border-r border-[rgb(var(--line))]">
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
