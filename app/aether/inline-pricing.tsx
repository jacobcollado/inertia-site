"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAnimate, useReducedMotion } from "motion/react";
import { AnimatedNumber } from "@/components/animated-number";
import { PricingLifeShader } from "./pricing-life-shader";
import { PolicyDisclaimer } from "./policy-disclaimer";
import { ACTION_RADIUS_CLASS } from "@/lib/cta-chrome";
import { createCtaScalePressOnRef, ctaScalePressOnSelf } from "@/lib/cta-hover-motion";
import { trackMeta } from "../meta-pixel";

const PRICE_BOUNCE_EASING = "cubic-bezier(0.22, 1.18, 0.36, 1)";
const PRICE_TIMING = { duration: 520, easing: PRICE_BOUNCE_EASING };

const INCLUDE_ICON = "size-[1em] shrink-0 text-[rgb(var(--muted))]";
const INCLUDE_LABEL_CLASS =
  "text-[16px] sm:text-[17px] font-normal tracking-tight leading-snug text-[rgb(var(--fg))] [text-wrap:pretty]";

const LICENSE = {
  id: "lifetime" as const,
  price: "$125 once",
  desc: "Lifetime updates, priority support, single store.",
  includes: [
    {
      // First: the delivery promise is the thing a buyer wants settled before
      // anything else, so it leads rather than naming a feature.
      label: "Instant delivery, key in your inbox",
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={INCLUDE_ICON} aria-hidden="true">
          <rect x="2" y="2.5" width="12" height="11" rx="1.5" />
          <path d="M2 6h12" />
          <path d="M6 6v7.5" />
        </svg>
      ),
    },
    {
      label: "Full Aether theme, all 41 sections",
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={INCLUDE_ICON} aria-hidden="true">
          <rect x="1" y="1.5" width="14" height="2" rx="0.5" />
          <rect x="1" y="4.5" width="14" height="3" rx="0.5" />
          <rect x="1" y="8.5" width="6" height="2.5" rx="0.5" />
          <rect x="9" y="8.5" width="6" height="2.5" rx="0.5" />
          <rect x="1" y="12" width="14" height="2.5" rx="0.5" />
        </svg>
      ),
    },
    {
      label: "Lifetime updates, no renewals",
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={INCLUDE_ICON} aria-hidden="true">
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
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={INCLUDE_ICON} aria-hidden="true">
          <path d="M2.5 6.5 3.5 3h9l1 3.5" />
          <rect x="2.5" y="6.5" width="11" height="7" rx="1" />
          <path d="M6.5 13.5V9.5h3v4" />
        </svg>
      ),
    },
    {
      label: "Priority support",
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={INCLUDE_ICON} aria-hidden="true">
          <path d="M4 10V8a4 4 0 0 1 8 0v2" />
          <rect x="2" y="9.5" width="2.5" height="4" rx="1.2" />
          <rect x="11.5" y="9.5" width="2.5" height="4" rx="1.2" />
        </svg>
      ),
    },
    {
      label: "Theme install included",
      bonus: "$50 value for free",
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={INCLUDE_ICON} aria-hidden="true">
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

type IncludeItem = (typeof LICENSE.includes)[number];

const INCLUDE_CAROUSEL_CLASS =
  "min-h-[9.5rem] w-[min(17.5rem,calc(100vw-2.5rem))] shrink-0 snap-start sm:min-h-0 sm:w-auto sm:shrink";
const INCLUDE_CARD_CLASS =
  "rounded-xl bg-[rgb(var(--surface)/0.45)] px-4 py-5 sm:px-5 sm:py-4";
const INCLUDE_BONUS_INNER_CLASS =
  "block rounded-[5px] bg-black px-2.5 py-1 text-[12px] sm:text-[13px] font-medium tracking-tight text-white whitespace-nowrap";

function IncludeCard({ item, mobileFirst = false }: { item: IncludeItem; mobileFirst?: boolean }) {
  const orderClass = mobileFirst ? "order-first sm:order-none" : "";
  const icon = (
    <span
      className="mb-5 flex shrink-0 items-center text-[rgb(var(--muted))] sm:mb-6 [&_svg]:size-5"
      aria-hidden="true"
    >
      {item.icon}
    </span>
  );

  if (item.bonus) {
    return (
      <div
        className={`relative ${INCLUDE_CARD_CLASS} flex flex-col items-start justify-center overflow-visible ${INCLUDE_CAROUSEL_CLASS} ${orderClass}`}
      >
        {icon}
        <p className={INCLUDE_LABEL_CLASS}>{item.label}</p>
        <span className="absolute left-1/2 -bottom-3 z-10 -translate-x-1/2 include-bonus-outline sm:-bottom-3.5">
          <span className={INCLUDE_BONUS_INNER_CLASS}>{item.bonus}</span>
        </span>
      </div>
    );
  }

  return (
    <div className={`${INCLUDE_CARD_CLASS} flex flex-col items-start justify-center ${INCLUDE_CAROUSEL_CLASS} ${orderClass}`}>
      {icon}
      <p className={INCLUDE_LABEL_CLASS}>{item.label}</p>
    </div>
  );
}

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
  const [smsSetup, setSmsSetup] = useState(false);
  const [priceScope, animatePrice] = useAnimate<HTMLParagraphElement>();
  const skipPriceBounce = useRef(true);
  const smsCheckRef = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();
  const priceAmount = smsSetup ? 135 : 125;
  const smsCheckPress = useMemo(
    () => createCtaScalePressOnRef(() => smsCheckRef.current),
    [],
  );

  useEffect(() => {
    if (skipPriceBounce.current) {
      skipPriceBounce.current = false;
      return;
    }
    if (reduceMotion || !priceScope.current) return;

    void animatePrice(
      priceScope.current,
      { scale: [1, 1.045, 0.985, 1], y: [0, -3, 1, 0] },
      { duration: 0.55, ease: [0.22, 1.18, 0.36, 1] },
    );
  }, [priceAmount, animatePrice, priceScope, reduceMotion]);

  const handleCheckout = async () => {
    if (status === "submitting") return;
    setStatus("submitting");
    setError("");
    // Before the request, not after: the success path replaces the document
    // with Stripe's, and an event fired at that point can be cut off mid-send.
    trackMeta("InitiateCheckout", {
      content_name: "Aether Shopify Theme",
      content_ids: [smsSetup ? "lifetime_sms" : LICENSE.id],
      content_type: "product",
      value: priceAmount,
      currency: "USD",
      num_items: 1,
    });
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: LICENSE.id, smsSetup }),
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
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="What's included"
        className="no-scrollbar -mx-3 mb-8 flex gap-3 overflow-x-auto overscroll-x-contain px-3 pb-4 snap-x snap-proximity sm:mx-0 sm:mb-10 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {LICENSE.includes.map((item) => (
          <IncludeCard key={item.label} item={item} mobileFirst={item.label === "Theme install included"} />
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl bg-[rgb(var(--surface)/0.45)] flex flex-col sm:flex-row sm:items-stretch">
        <div className="hidden sm:block sm:w-[35%] sm:shrink-0">
          <PricingLifeShader embedded className="min-h-[220px]" />
        </div>

        <div className="flex flex-1 flex-col gap-5 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7 lg:p-8">
          <div className="flex flex-col gap-2 sm:max-w-[22rem] text-left">
            <p
              ref={priceScope}
              className="text-[clamp(2rem,4vw,2.75rem)] font-normal tabular-nums tracking-[-0.04em] leading-none text-[rgb(var(--fg))]"
            >
              $
              <AnimatedNumber
                value={priceAmount}
                transformTiming={PRICE_TIMING}
                spinTiming={PRICE_TIMING}
              />
              {" once"}
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
              data-aether-cta
              className={`inline-flex w-full items-center justify-center gap-1.5 sm:w-auto ${ACTION_RADIUS_CLASS} px-4 py-2 text-[17px] sm:text-[18px] font-medium tracking-tight disabled:opacity-50 disabled:cursor-not-allowed [-webkit-tap-highlight-color:transparent]`}
              style={{ background: "#000", color: "#ededed" }}
              {...(status === "submitting" ? {} : ctaScalePressOnSelf)}
            >
              {status === "submitting" ? <Spinner /> : null}
              {status === "submitting" ? "Redirecting…" : "Get Aether"}
            </button>
            <label
              className="flex w-full cursor-pointer items-center gap-2.5 sm:w-auto [-webkit-tap-highlight-color:transparent]"
              {...(status === "submitting" ? {} : smsCheckPress)}
            >
              <span ref={smsCheckRef} className="inline-flex shrink-0">
                <input
                  type="checkbox"
                  checked={smsSetup}
                  disabled={status === "submitting"}
                  onChange={(e) => setSmsSetup(e.target.checked)}
                  className="h-4 w-4 appearance-none rounded border border-[rgb(var(--line))] bg-transparent transition-colors checked:border-[#0a84ff] checked:bg-[#0a84ff] checked:bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%222.2%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%223.5%208.5%206.5%2011.5%2012.5%204.5%22%2F%3E%3C%2Fsvg%3E')] checked:bg-[length:0.65rem_0.65rem] checked:bg-center checked:bg-no-repeat disabled:cursor-not-allowed disabled:opacity-50"
                />
              </span>
              <span className="text-[13px] sm:text-[14px] tracking-tight text-[rgb(var(--muted))]">
                Add SMS setup <span className="text-[rgb(var(--fg))]">+$10</span>
              </span>
            </label>
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
