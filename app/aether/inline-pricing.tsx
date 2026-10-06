"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAnimate, useReducedMotion } from "motion/react";
import { AnimatedNumber } from "@/components/animated-number";
import { PolicyDisclaimer } from "./policy-disclaimer";
import { PaymentMethodIcons } from "@/components/payment-method-icons";
import { ACTION_RADIUS_CLASS, CTA_SHELL_HEIGHT_CLASS } from "@/lib/cta-chrome";
import { createCtaScalePressOnRef, ctaScalePressOnSelf } from "@/lib/cta-hover-motion";
import { trackMeta } from "../meta-pixel";
import { AETHER_CHECKOUT_ID } from "@/lib/scroll-to-hash";
import { BONUS_TOTAL } from "./bonuses";
import { InstallVideo } from "./install-video";

/* Checkout, laid out like the sections above it: the heading and one line on
 * the left, then two columns from lg up. On the left the decision: the price
 * on a plain tile with the SMS add-on, the button and the guarantee in the
 * same card, then the install video and one line of proof under it. On the
 * right what's in the box, then payment and the fine print. Phones stack
 * them, decision first. Comes in with the site's staggered reveal. */

// The install is included free; counted in the total value along with the
// bonuses.
const INSTALL_VALUE = 50;

const PRICE_BOUNCE_EASING = "cubic-bezier(0.22, 1.18, 0.36, 1)";
const PRICE_TIMING = { duration: 520, easing: PRICE_BOUNCE_EASING };

type Line = { label: string; worth?: number };

const LICENSE = {
  id: "lifetime" as const,
  // First: the delivery promise is the thing a buyer wants settled before
  // anything else, so it leads rather than naming a feature. The two lines
  // with a worth close the list, right above the total they add up to.
  lines: [
    { label: "License key in your inbox within a minute" },
    { label: "Full Aether theme, all 41 sections" },
    { label: "Lifetime updates, no renewals" },
    { label: "Priority support and a personal dashboard" },
    { label: "Theme install, done for you", worth: INSTALL_VALUE },
    { label: "5 bonus guides and lists", worth: BONUS_TOTAL },
  ] satisfies Line[],
};

type Status = "idle" | "submitting" | "error";

function IncludeLine({ line }: { line: Line }) {
  return (
    <li className="flex items-baseline gap-3 py-2 text-[15px] sm:text-[16px] tracking-tight leading-snug">
      {/* 1em off the line's font size, nudged onto the cap line. */}
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-[1em] shrink-0 translate-y-[0.15em] text-[rgb(var(--muted))]" aria-hidden="true">
        <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
      </svg>
      <span className="flex-1 text-[rgb(var(--fg))] [text-wrap:pretty]">{line.label}</span>
      {line.worth ? (
        <span className="shrink-0 tabular-nums text-[rgb(var(--muted))]">
          <s className="decoration-[rgb(var(--muted))]">${line.worth}</s>{" "}
          <span className="font-medium text-[rgb(var(--fg))]">Free</span>
        </span>
      ) : null}
    </li>
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

  // Everything in the box at its own price: the license as charged, plus the
  // free install and bonuses. Labelled as a value, not a former price.
  const totalValue = priceAmount + INSTALL_VALUE + BONUS_TOTAL;

  return (
    <div className="rise rise-stagger mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem]">
      <div className="mb-10 sm:mb-12">
        <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-[1.1] text-[rgb(var(--fg))]">
          Get everything, pay once
        </h2>
        <p className="mt-2 max-w-lg text-[15.5px] sm:text-[17px] leading-relaxed tracking-tight text-[rgb(var(--muted))] [text-wrap:pretty]">
          One license for one store: the full theme, installed for you, with lifetime updates.
        </p>
      </div>

      <div data-stagger className="grid items-start gap-10 lg:grid-cols-[minmax(0,27rem)_1fr] lg:gap-20">
        {/* The decision. */}
        <div className="flex w-full flex-col gap-3">
          <div className="rounded-[6px] bg-[var(--tile)] px-5 py-6 sm:px-7 sm:py-8">
            <p
              ref={priceScope}
              className="text-[clamp(2.75rem,6vw,3.5rem)] font-normal tabular-nums tracking-[-0.045em] leading-none text-[rgb(var(--fg))]"
            >
              $
              <AnimatedNumber value={priceAmount} transformTiming={PRICE_TIMING} spinTiming={PRICE_TIMING} />
              <span className="text-[rgb(var(--muted))]">{" once"}</span>
            </p>
            <p className="mt-3 text-[14px] sm:text-[15px] tracking-tight text-[rgb(var(--muted))]">
              <s className="tabular-nums decoration-[rgb(var(--muted))]">${totalValue}</s> total value, for one store
            </p>
            {/* Klarna's pay in 4, offered in Stripe Checkout. Another way to
                read the price, so it lives with it and follows the add-on. */}
            <p className="mt-1 text-[13px] sm:text-[14px] tracking-tight text-[rgb(var(--muted))]">
              or 4 interest-free payments of{" "}
              <span className="tabular-nums text-[rgb(var(--fg))]">${(priceAmount / 4).toFixed(2)}</span> with Klarna
            </p>

            {/* The add-on changes the price, so it sits in the card with it. */}
            <label
              className="mt-5 flex cursor-pointer items-center gap-2.5 border-t border-[rgb(var(--fg)/0.08)] pt-4 [-webkit-tap-highlight-color:transparent]"
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
              // The one buy button: the live price on it, an arrow that
              // nudges forward on hover, and a soft sheen that sweeps across
              // every few seconds (.cta-sheen in globals.css).
              className={`cta-sheen group relative scroll-mt-24 mt-6 inline-flex w-full items-center justify-center gap-2 overflow-hidden ${ACTION_RADIUS_CLASS} ${CTA_SHELL_HEIGHT_CLASS} px-8 text-[17px] sm:text-[19px] font-medium tracking-tight leading-none shadow-[0_8px_24px_-12px_rgb(0_0_0/0.45)] transition-shadow duration-300 hover:shadow-[0_12px_28px_-12px_rgb(0_0_0/0.55)] disabled:opacity-50 disabled:cursor-not-allowed [-webkit-tap-highlight-color:transparent]`}
              style={{ background: "var(--cta-fill)", color: "var(--cta-fg)" }}
              {...(status === "submitting" ? {} : ctaScalePressOnSelf)}
            >
              {status === "submitting" ? (
                <>
                  <Spinner />
                  Redirecting…
                </>
              ) : (
                <>
                  <span className="relative">
                    Get Aether for <span className="tabular-nums">${priceAmount}</span>
                  </span>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="relative size-[0.9em] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1" aria-hidden="true">
                    <line x1="3" y1="8" x2="13" y2="8" />
                    <polyline points="9 4 13 8 9 12" />
                  </svg>
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

          <InstallVideo />

          {/* One line of proof at the moment of decision. An exact excerpt of
              the review in testimonials.tsx, first letter capitalised. */}
          <figure className="flex items-center gap-3 rounded-[6px] bg-[var(--tile)] px-4 py-3">
            <Image src="/reviews/voraarchive.png" alt="" width={64} height={64} className="size-8 shrink-0 rounded-full" />
            <div className="min-w-0 text-[13px] sm:text-[14px] tracking-tight leading-snug">
              <blockquote className="text-[rgb(var(--fg))]">&ldquo;Super happy with how our website turned out.&rdquo;</blockquote>
              <figcaption className="text-[rgb(var(--muted))]">vora.archive</figcaption>
            </div>
          </figure>
        </div>

        {/* What's in the box, then payment and the fine print. */}
        <div className="w-full lg:pt-2">
          <p className="mb-2 text-[13px] sm:text-[14px] tracking-tight text-[rgb(var(--muted))]">What&apos;s included</p>
          <ul role="list" className="w-full border-t border-[rgb(var(--fg)/0.08)] pt-2">
            {LICENSE.lines.map((line) => (
              <IncludeLine key={line.label} line={line} />
            ))}
          </ul>

          <div className="mt-10 flex w-full flex-col items-start gap-4 border-t border-[rgb(var(--fg)/0.08)] pt-6">
            <PaymentMethodIcons />
            <PolicyDisclaimer
              className="!justify-start"
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
      </div>
    </div>
  );
}
