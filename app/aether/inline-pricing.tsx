"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAnimate, useReducedMotion } from "motion/react";
import { AnimatedNumber } from "@/components/animated-number";
import { PolicyDisclaimer } from "./policy-disclaimer";
import { PaymentMethodIcons } from "@/components/payment-method-icons";
import { ACTION_RADIUS_CLASS } from "@/lib/cta-chrome";
import { createCtaScalePressOnRef, ctaScalePressOnSelf } from "@/lib/cta-hover-motion";
import { trackMeta } from "../meta-pixel";
import { AETHER_CHECKOUT_ID } from "@/lib/scroll-to-hash";
import { BONUSES } from "./bonuses";
import { RevealDetail } from "./reveal-detail";

/* Checkout, built for a visitor who has already been sold by the page and
 * now wants it to be easy. One centred card holds the whole decision, in
 * reading order: the price, a real anchor for it, the Klarna split, what you
 * get as five checks (the bonuses fold open under the last one), the SMS
 * add-on, the button and the guarantee. Payment methods and the policies sit
 * under the card as small print. Comes in with the site's staggered reveal.
 *
 * The anchor is the same published figure the "Other themes stop at the
 * download" section uses (switch.tsx); keep the two in step. */

const PRICE_BOUNCE_EASING = "cubic-bezier(0.22, 1.18, 0.36, 1)";
const PRICE_TIMING = { duration: 520, easing: PRICE_BOUNCE_EASING };

const LICENSE_ID = "lifetime" as const;

// What you get, most persuasive first. The theme itself leads so a cold
// visitor knows what's being bought; the bonuses close the list.
const INCLUDES = [
  "The full Aether theme, all 41 sections",
  "Installed for you, the same day",
  "Updates for life, no renewals",
  "Priority support and your own dashboard",
];

type Status = "idle" | "submitting" | "error";

function Check({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`size-[1em] shrink-0 translate-y-[0.15em] ${className}`} aria-hidden="true">
      <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin size-[1em] shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
      content_ids: [smsSetup ? "lifetime_sms" : LICENSE_ID],
      content_type: "product",
      value: priceAmount,
      currency: "USD",
      num_items: 1,
    });
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: LICENSE_ID, smsSetup }),
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
    <div className="rise rise-stagger mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] flex flex-col items-center">
      <div className="mb-10 text-center sm:mb-12">
        <h2 className="text-[clamp(2rem,4.2vw,3.25rem)] font-normal tracking-[-0.035em] leading-[1.08] text-[rgb(var(--fg))] [text-wrap:balance]">
          Everything done for you.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[15.5px] sm:text-[17px] leading-relaxed tracking-tight text-[rgb(var(--muted))] [text-wrap:balance]">
          One payment, one store, yours for life.
        </p>
      </div>

      <div className="w-full max-w-[30rem] rounded-[6px] bg-[var(--tile)] px-5 py-7 sm:px-8 sm:py-9">
        <p
          ref={priceScope}
          className="text-[clamp(3rem,7vw,4rem)] font-normal tabular-nums tracking-[-0.045em] leading-none text-[rgb(var(--fg))]"
        >
          $
          <AnimatedNumber value={priceAmount} transformTiming={PRICE_TIMING} spinTiming={PRICE_TIMING} />
          <span className="text-[rgb(var(--muted))]">{" once"}</span>
        </p>
        <p className="mt-3 text-[14px] sm:text-[15px] tracking-tight text-[rgb(var(--muted))] [text-wrap:pretty]">
          Other fashion theme shops charge up to $349 for a lifetime license.
        </p>
        {/* Klarna's pay in 4, offered in Stripe Checkout. Another way to read
            the price, so it lives with it and follows the add-on. */}
        <p className="mt-1 text-[13px] sm:text-[14px] tracking-tight text-[rgb(var(--muted))]">
          or 4 interest-free payments of{" "}
          <span className="tabular-nums text-[rgb(var(--fg))]">${(priceAmount / 4).toFixed(2)}</span> with Klarna
        </p>

        <ul role="list" className="mt-7 flex flex-col gap-2.5">
          {INCLUDES.map((line) => (
            <li key={line} className="flex items-baseline gap-2.5 text-[15px] sm:text-[16px] tracking-tight leading-snug text-[rgb(var(--fg))]">
              <Check className="text-[rgb(var(--muted))]" />
              {line}
            </li>
          ))}
          <li className="flex items-baseline gap-2.5 text-[15px] sm:text-[16px] tracking-tight leading-snug text-[rgb(var(--fg))]">
            <Check className="text-[rgb(var(--muted))]" />
            <div className="min-w-0 flex-1">
              5 bonus guides and lists
              <div className="mt-1.5">
                <RevealDetail label="What's in them">
                  <ul className="flex flex-col gap-1.5 pt-3 pl-7 text-[14px] sm:text-[15px] tracking-tight text-[rgb(var(--muted))]">
                    {BONUSES.map((b) => (
                      <li key={b.title}>
                        <span className="text-[rgb(var(--fg))]">{b.title}</span>
                        <span className="opacity-70"> · {b.kind === "guide" ? "Guide" : "List"}</span>
                      </li>
                    ))}
                  </ul>
                </RevealDetail>
              </div>
            </div>
          </li>
        </ul>

        {/* The add-on changes the price, so it sits in the card with it. */}
        <label
          className="mt-7 flex cursor-pointer items-center gap-2.5 [-webkit-tap-highlight-color:transparent]"
          {...(status === "submitting" ? {} : smsCheckPress)}
        >
          <span ref={smsCheckRef} className="relative inline-flex size-4 shrink-0">
            <input
              type="checkbox"
              checked={smsSetup}
              disabled={status === "submitting"}
              onChange={(e) => setSmsSetup(e.target.checked)}
              className="absolute inset-0 appearance-none rounded-[4px] border border-[rgb(var(--fg)/0.3)] bg-transparent transition-colors checked:border-[rgb(var(--fg))] checked:bg-[rgb(var(--fg))] disabled:cursor-not-allowed disabled:opacity-50"
            />
            {smsSetup && (
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute inset-0 m-auto size-3 text-[rgb(var(--bg))]" aria-hidden="true">
                <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
              </svg>
            )}
          </span>
          <span className="text-[14px] sm:text-[15px] tracking-tight text-[rgb(var(--muted))]">
            Add SMS setup <span className="text-[rgb(var(--fg))]">+$10</span>
          </span>
        </label>

        <button
          id={AETHER_CHECKOUT_ID}
          type="button"
          onClick={handleCheckout}
          disabled={status === "submitting"}
          data-aether-cta
          // The one buy button (.cta-buy and .cta-beam in globals.css):
          // near-black with a beam of light circling its edge, the live price
          // in its label, then an arrow in the label's colour that slides out
          // and a fresh one in on hover.
          className={`cta-buy cta-beam group relative scroll-mt-24 mt-4 flex h-14 sm:h-[3.75rem] w-full items-center justify-center gap-2.5 overflow-hidden ${ACTION_RADIUS_CLASS} px-8 text-[17px] sm:text-[19px] font-medium tracking-tight leading-none disabled:opacity-60 disabled:cursor-not-allowed [-webkit-tap-highlight-color:transparent]`}
          {...(status === "submitting" ? {} : ctaScalePressOnSelf)}
        >
          {status === "submitting" ? (
            <span className="relative inline-flex items-center gap-2">
              <Spinner />
              Redirecting to checkout…
            </span>
          ) : (
            <>
              <span className="relative">
                Get Aether for <span className="tabular-nums">${priceAmount}</span>
              </span>
              <span aria-hidden="true" className="relative flex size-[1.05em] items-center justify-center overflow-hidden">
                {[0, 1].map((n) => (
                  <svg
                    key={n}
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`absolute size-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                      n === 0 ? "group-hover:translate-x-[180%]" : "-translate-x-[180%] group-hover:translate-x-0"
                    }`}
                  >
                    <line x1="3" y1="8" x2="13" y2="8" />
                    <polyline points="9 4 13 8 9 12" />
                  </svg>
                ))}
              </span>
            </>
          )}
        </button>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-[14px] sm:text-[15px] tracking-tight text-[rgb(var(--fg))]">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-[1.1em] shrink-0" aria-hidden="true">
            <path d="M8 1.5 13.5 3.5V8c0 3.2-2.3 5.6-5.5 6.5C4.8 13.6 2.5 11.2 2.5 8V3.5Z" />
            <polyline points="5.5 8 7.3 9.8 10.5 6.3" />
          </svg>
          Full refund if we can&apos;t get it working
        </p>

        {status === "error" && (
          <span className="mt-2 block text-center text-[13px] tracking-tight text-red-500">{error || "Something went wrong."}</span>
        )}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <PaymentMethodIcons />
        <PolicyDisclaimer
          lead={
            <span className="inline-flex items-center gap-1.5">
              Secured by
              <img
                src="/stripe-wordmark.svg"
                alt="Stripe"
                width={46}
                height={20}
                className="h-[1.5em] w-auto"
                draggable={false}
                style={{ filter: "grayscale(1) brightness(0) invert(0.42)" }}
              />
            </span>
          }
        />
      </div>
    </div>
  );
}
