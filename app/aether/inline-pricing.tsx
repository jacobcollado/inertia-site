"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAnimate, useReducedMotion } from "motion/react";
import { AnimatedNumber } from "@/components/animated-number";
import { PolicyDisclaimer } from "./policy-disclaimer";
import { FigmaSelectionFrame, SELECTION_FILL, SELECTION_FRAME_COLOR, SELECTION_RAIL } from "@/components/figma-frame";
import { PaymentMethodIcons } from "@/components/payment-method-icons";
import { ACTION_RADIUS_CLASS, CTA_SHELL_HEIGHT_CLASS } from "@/lib/cta-chrome";
import { createCtaScalePressOnRef, ctaScalePressOnSelf } from "@/lib/cta-hover-motion";
import { trackMeta } from "../meta-pixel";
import { AETHER_CHECKOUT_ID } from "@/lib/scroll-to-hash";
import { BONUS_TOTAL } from "./bonuses";

/* Checkout on the site's Figma language: the price as a selected frame, the
 * button and guarantee right under it, then what's in the box as a quiet
 * list, then proof and payment, all on one centered column. */

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
    <div className="mx-auto flex w-full max-w-[26rem] flex-col items-center rise rise--liquid">
      {/* The price as a selected Figma frame, the same chrome as the homepage
          statement and the work pages: frame name above, handles on the
          corners, the selected-layer tint inside. */}
      <div className="w-full">
        <p className="mb-1.5 text-left text-[12px] sm:text-[13px] tracking-tight" style={{ color: SELECTION_FRAME_COLOR }}>
          Aether license
        </p>
        <FigmaSelectionFrame handleFill="rgb(var(--bg))" style={{ background: SELECTION_FILL }}>
          <div className="flex flex-col items-center gap-2.5 px-5 py-8 sm:py-10 text-center">
            <p
              ref={priceScope}
              className="text-[clamp(2.75rem,6vw,3.75rem)] font-normal tabular-nums tracking-[-0.045em] leading-none text-[rgb(var(--fg))]"
            >
              $
              <AnimatedNumber
                value={priceAmount}
                transformTiming={PRICE_TIMING}
                spinTiming={PRICE_TIMING}
              />
              {" once"}
            </p>
            <p className="text-[14px] sm:text-[15px] tracking-tight text-[rgb(var(--muted))]">
              <s className="tabular-nums decoration-[rgb(var(--muted))]">${totalValue}</s> total value, for one store
            </p>
            {/* Klarna's pay in 4, offered in Stripe Checkout. It's another way
                to read the price, so it lives with the price and follows the
                SMS add-on below. */}
            <p className="text-[13px] sm:text-[14px] tracking-tight text-[rgb(var(--muted))]">
              or 4 interest-free payments of{" "}
              <span className="tabular-nums text-[rgb(var(--fg))]">${(priceAmount / 4).toFixed(2)}</span> with Klarna
            </p>
          </div>
          {/* The add-on changes the price, so it sits in the frame with it,
              split off by a rail the way Figma divides a selected group. */}
          <div className="flex justify-center px-5 py-3" style={{ borderTop: SELECTION_RAIL }}>
            <label
              className="flex cursor-pointer items-center gap-2.5 [-webkit-tap-highlight-color:transparent]"
              {...(status === "submitting" ? {} : smsCheckPress)}
            >
              <span ref={smsCheckRef} className="inline-flex shrink-0">
                <input
                  type="checkbox"
                  checked={smsSetup}
                  disabled={status === "submitting"}
                  onChange={(e) => setSmsSetup(e.target.checked)}
                  className="h-4 w-4 appearance-none rounded-[6px] border border-[rgb(var(--line))] bg-transparent transition-colors checked:border-[#0a84ff] checked:bg-[#0a84ff] checked:bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%222.2%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%223.5%208.5%206.5%2011.5%2012.5%204.5%22%2F%3E%3C%2Fsvg%3E')] checked:bg-[length:0.65rem_0.65rem] checked:bg-center checked:bg-no-repeat disabled:cursor-not-allowed disabled:opacity-50"
                />
              </span>
              <span className="text-[13px] sm:text-[14px] tracking-tight text-[rgb(var(--muted))]">
                Add SMS setup <span className="text-[rgb(var(--fg))]">+$10</span>
              </span>
            </label>
          </div>
        </FigmaSelectionFrame>
      </div>

      {/* Action, then the guarantee right after it, where the hesitation is. */}
      <div className="mt-6 flex w-full flex-col items-stretch gap-3">

        <button
          id={AETHER_CHECKOUT_ID}
          type="button"
          onClick={handleCheckout}
          disabled={status === "submitting"}
          data-aether-cta
          className={`scroll-mt-24 inline-flex w-full items-center justify-center gap-1.5 ${ACTION_RADIUS_CLASS} ${CTA_SHELL_HEIGHT_CLASS} px-8 text-[17px] sm:text-[19px] font-medium tracking-tight leading-none disabled:opacity-50 disabled:cursor-not-allowed [-webkit-tap-highlight-color:transparent]`}
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
          {status === "submitting" ? "Redirecting…" : "Get Aether"}
        </button>

        <p className="flex items-center justify-center gap-1.5 text-[14px] sm:text-[15px] tracking-tight text-[rgb(var(--fg))]">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-[1.1em] shrink-0" aria-hidden="true">
            <path d="M8 1.5 13.5 3.5V8c0 3.2-2.3 5.6-5.5 6.5C4.8 13.6 2.5 11.2 2.5 8V3.5Z" />
            <polyline points="5.5 8 7.3 9.8 10.5 6.3" />
          </svg>
          Full refund if we can&apos;t get it working
        </p>

        {status === "error" && (
          <span className="block text-center text-[13px] tracking-tight text-red-500">{error || "Something went wrong."}</span>
        )}

        {/* One line of proof at the moment of decision, right under the
            guarantee. An exact excerpt of the review in testimonials.tsx,
            first letter capitalised. */}
        <figure className="mt-3 flex items-center gap-3 rounded-[6px] bg-[rgb(var(--surface)/0.45)] px-4 py-3">
          <Image
            src="/reviews/voraarchive.png"
            alt=""
            width={64}
            height={64}
            className="size-8 shrink-0 rounded-full"
          />
          <div className="min-w-0 text-[13px] sm:text-[14px] tracking-tight leading-snug">
            <blockquote className="text-[rgb(var(--fg))]">
              &ldquo;Super happy with how our website turned out.&rdquo;
            </blockquote>
            <figcaption className="text-[rgb(var(--muted))]">vora.archive</figcaption>
          </div>
        </figure>
      </div>

      {/* What's in the box, one quiet column on the same axis as the frame
          and button, under the decision rather than in front of it. A small
          label names the block so it reads as its own tier. */}
      <div className="mt-14 w-full sm:mt-16">
        <p className="mb-2 text-[13px] sm:text-[14px] tracking-tight text-[rgb(var(--muted))]">What&apos;s included</p>
        <ul
          role="list"
          className="w-full border-t border-[rgb(var(--line))] pt-2"
        >
          {LICENSE.lines.map((line) => (
            <IncludeLine key={line.label} line={line} />
          ))}
        </ul>
      </div>

      {/* Payment, then the fine print folded into one line with the Stripe
          mark, so the section ends on two quiet rows instead of a stack. */}
      <div className="mt-10 flex w-full flex-col items-center gap-4 border-t border-[rgb(var(--line))] pt-8">
        <PaymentMethodIcons className="justify-center" />
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