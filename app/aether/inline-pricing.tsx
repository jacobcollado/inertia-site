"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAnimate, useReducedMotion } from "motion/react";
import { AnimatedNumber } from "@/components/animated-number";
import { PricingLifeShader } from "./pricing-life-shader";
import { PolicyDisclaimer } from "./policy-disclaimer";
import { PaymentMethodIcons } from "@/components/payment-method-icons";
import { ACTION_RADIUS_CLASS, CTA_SHELL_HEIGHT_CLASS } from "@/lib/cta-chrome";
import { createCtaScalePressOnRef, ctaScalePressOnSelf } from "@/lib/cta-hover-motion";
import { trackMeta } from "../meta-pixel";
import { AETHER_CHECKOUT_ID } from "@/lib/scroll-to-hash";

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
          <circle cx="5" cy="8" r="3" />
          <path d="M8 8h6.5" />
          <path d="M12 8v2.5" />
          <path d="M14.5 8v2" />
        </svg>
      ),
    },
    {
      label: "Full Aether theme, all 41 sections",
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={INCLUDE_ICON} aria-hidden="true">
          <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
          <path d="M1.5 5.5h13" />
          <path d="M4 8.5h8" />
          <path d="M4 11h5" />
        </svg>
      ),
    },
    {
      label: "Lifetime updates, no renewals",
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={INCLUDE_ICON} aria-hidden="true">
          <path d="M8 8C6.8 5.2 1.8 5.2 1.8 8s5 2.8 6.2 0 6.2-2.8 6.2 0-5 2.8-6.2 0Z" />
        </svg>
      ),
    },
    {
      label: "Single store license",
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={INCLUDE_ICON} aria-hidden="true">
          <path d="M2 6 3.2 2.5h9.6L14 6Z" />
          <path d="M3 6v7.5h10V6" />
          <path d="M6.5 13.5V10h3v3.5" />
        </svg>
      ),
    },
    {
      label: "Priority support",
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={INCLUDE_ICON} aria-hidden="true">
          <path d="M3 2h10A1.5 1.5 0 0 1 14.5 3.5v6A1.5 1.5 0 0 1 13 11H7.5L4.5 13.5V11H3A1.5 1.5 0 0 1 1.5 9.5v-6A1.5 1.5 0 0 1 3 2Z" />
          <path d="M8.6 4.5 7.2 6.6h1.6L7.4 8.7" />
        </svg>
      ),
    },
    {
      label: "Theme install included",
      bonus: "$50 value for free",
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={INCLUDE_ICON} aria-hidden="true">
          <path d="M3 13 9.5 6.5" />
          <path d="M8.5 5.5l2 2" />
          <path d="M12.5 1.8v3.4M10.8 3.5h3.4" />
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
      // Sized in em off the label's font size, so icon, gap and text scale
      // together: icon ~1.4x the cap line, gap ~1.3x.
      className="mb-[1.3em] flex shrink-0 items-center text-[16px] text-[rgb(var(--muted))] sm:text-[17px] [&_svg]:size-[1.4em]"
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

      <div className="overflow-hidden rounded-2xl bg-[rgb(var(--surface)/0.45)] flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-stretch">
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
              id={AETHER_CHECKOUT_ID}
              type="button"
              onClick={handleCheckout}
              disabled={status === "submitting"}
              data-aether-cta
              className={`scroll-mt-24 inline-flex w-full items-center justify-center gap-1.5 sm:w-auto sm:min-w-[14rem] ${ACTION_RADIUS_CLASS} ${CTA_SHELL_HEIGHT_CLASS} px-8 text-[17px] sm:text-[19px] font-medium tracking-tight leading-none disabled:opacity-50 disabled:cursor-not-allowed [-webkit-tap-highlight-color:transparent]`}
              style={{
                background: "#000",
                color: "#ededed",
                // Warm edge: a faint inner light in the heading shimmer's warm
                // tone (#ded2c2), marking this as the final CTA without a new
                // color. Top highlight, bottom glow, hairline ring.
                boxShadow:
                  "inset 0 1px 0 rgba(222,210,194,0.35), inset 0 -12px 22px -10px rgba(222,210,194,0.7), 0 0 0 1px rgba(222,210,194,0.28), 0 6px 22px -8px rgba(184,173,160,0.55)",
              }}
              {...(status === "submitting" ? {} : ctaScalePressOnSelf)}
            >
              {status === "submitting" ? <Spinner /> : null}
              {status === "submitting" ? "Redirecting…" : "Own Aether"}
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

        <div className="flex w-full flex-col gap-3 border-t border-[rgb(var(--line))] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-5 lg:px-8">
          <div className="flex flex-col gap-2 sm:gap-2.5">
            <PaymentMethodIcons />
          </div>
          <div className="flex shrink-0 items-center gap-2 self-start sm:self-center" style={{ opacity: 0.55 }}>
            <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] sm:text-[12px]">Secured by</span>
            <img
              src="/stripe-wordmark.svg"
              alt="Stripe"
              width={46}
              height={20}
              className="h-5 w-auto"
              draggable={false}
              style={{ filter: "grayscale(1) brightness(0) invert(0.42)" }}
            />
          </div>
        </div>
      </div>

      {status === "error" && (
        <span className="mt-3 block text-[13px] tracking-tight text-red-500">{error || "Something went wrong."}</span>
      )}
    </div>
  );
}
