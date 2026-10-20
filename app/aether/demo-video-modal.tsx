"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DemoFrame, hostOf, type DemoMode } from "./demo-player";

/* The demo recording in a dialog, opened from "See it in action". The
 * button that opened it grows into the dialog (a white card, outlined like
 * the button, opens from the button's box to the dialog's while the
 * contents arrive), and the dialog shrinks back
 * into it on close, so it's always clear where it came from and went. A
 * white raised card over a faded page, in the site's 6px system: a title
 * and the device switch, the recording, and one row to visit the live store
 * with its password. The videos mount with the dialog, so nothing downloads
 * for visitors who never open it. Styles are .ae-dm in globals.css. */

// A duration token in milliseconds. The browser may hand it back in
// seconds ("0.65s") rather than as written ("650ms").
function motionToken(name: string, fallback: number) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const v = parseFloat(raw);
  if (!Number.isFinite(v)) return fallback;
  return raw.endsWith("ms") ? v : raw.endsWith("s") ? v * 1000 : v;
}
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

// Keyframes that take the card from the trigger's box to the panel's: its
// four edges, as offsets from the panel's own (negative where the trigger
// lies outside it), easing to zero.
function fromTrigger(panel: DOMRect, trigger: DOMRect) {
  return [
    {
      top: `${trigger.top - panel.top}px`,
      left: `${trigger.left - panel.left}px`,
      right: `${panel.right - trigger.right}px`,
      bottom: `${panel.bottom - trigger.bottom}px`,
    },
    { top: "0px", left: "0px", right: "0px", bottom: "0px" },
  ];
}

// The card's surface, from the trigger's own (the hero's see-through button
// and its ring) to the card's white and shadow, so the first frame of an
// open and the last of a close are the button exactly, with no white left
// to snap off. Run on its own curve: an open whitens early as it grows; a
// close stays white most of the way and clears as it lands in the button.
// Shadows are padded to one list, inset ring first, so they interpolate.
function surfaceFromTrigger(triggerEl: HTMLElement, card: HTMLElement) {
  const clear = (s: string) => s.replace(/rgba?\([^)]*\)/g, "rgba(0, 0, 0, 0)");
  const ts = getComputedStyle(triggerEl);
  const cs = getComputedStyle(card);
  const triggerRing = ts.boxShadow.includes("inset") ? ts.boxShadow.split(/,(?![^(]*\))/)[0].trim() : "rgba(0, 0, 0, 0) 0px 0px 0px 1px inset";
  const cardShadow = cs.boxShadow === "none" ? "rgba(0, 0, 0, 0) 0px 0px 0px 0px" : cs.boxShadow;
  return [
    { backgroundColor: ts.backgroundColor, boxShadow: `${triggerRing}, ${clear(cardShadow)}` },
    { backgroundColor: cs.backgroundColor, boxShadow: `${clear(triggerRing)}, ${cardShadow}` },
  ];
}
const SURFACE_IN = "cubic-bezier(0.2, 0.6, 0.35, 1)";
const SURFACE_OUT = "cubic-bezier(0.6, 0, 0.8, 0.3)";

// The same edges as a clip for the contents, so nothing shows outside the
// card while it opens. A clip can't reach past the panel, so the edges stop
// at zero.
function clipFromTrigger(panel: DOMRect, trigger: DOMRect) {
  const e = (n: number) => `${Math.max(0, n)}px`;
  return [
    {
      clipPath: `inset(${e(trigger.top - panel.top)} ${e(panel.right - trigger.right)} ${e(panel.bottom - trigger.bottom)} ${e(trigger.left - panel.left)} round 6px)`,
    },
    { clipPath: "inset(0px 0px 0px 0px round 6px)" },
  ];
}

type Props = { open: boolean; onClose: () => void; href: string; password: string };

// Mounted fresh on each open, so the device is chosen before the first
// frame (phones see the phone recording first) and nothing slides into place.
export function DemoVideoModal(props: Props) {
  return props.open ? <Dialog {...props} /> : null;
}

function Dialog({ open, onClose, href, password }: Props) {
  const [mode, setMode] = useState<DemoMode>(() =>
    window.matchMedia("(max-width: 639px)").matches ? "mobile" : "desktop",
  );
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  // The button that opened it, read once when the dialog is created: later
  // reads would find the dialog itself focused.
  const [trigger] = useState(() => document.activeElement as HTMLElement | null);
  const triggerRef = useRef(trigger);
  const closingRef = useRef(false);

  const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const close = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    const panel = panelRef.current;
    const card = cardRef.current;
    const trigger = triggerRef.current;
    const dur = motionToken("--motion-dur", 650) * 0.6;
    const done = () => {
      closingRef.current = false;
      onClose();
    };
    if (!panel || !card || reduce()) return done();
    veilRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur, easing: EASE, fill: "forwards" });
    bodyRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur * 0.4, fill: "forwards" });
    const t = trigger?.getBoundingClientRect();
    const onScreen = t && t.bottom > 0 && t.top < window.innerHeight && t.width > 0;
    if (onScreen) {
      bodyRef.current?.animate(clipFromTrigger(panel.getBoundingClientRect(), t).reverse(), { duration: dur, easing: EASE, fill: "forwards" });
    }
    if (onScreen && trigger) {
      card.animate(surfaceFromTrigger(trigger, card).reverse(), { duration: dur, easing: SURFACE_OUT, fill: "forwards" });
    }
    const anim = onScreen
      ? card.animate(fromTrigger(panel.getBoundingClientRect(), t).reverse(), { duration: dur, easing: EASE, fill: "forwards" })
      : panel.animate([{ transform: "none", opacity: 1 }, { transform: "translateY(24px)", opacity: 0 }], { duration: dur, easing: EASE, fill: "forwards" });
    anim.finished.then(done, done);
  };

  // Opening: everything before paint, so the first frame is the trigger.
  useLayoutEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    // Measure the panel at rest: a run still in flight (React runs this
    // twice in development) would skew its box.
    for (const el of [panel, cardRef.current, veilRef.current, bodyRef.current]) el?.getAnimations().forEach((a) => a.cancel());
    const dur = motionToken("--motion-dur", 650);
    if (reduce()) {
      panel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
      return;
    }
    veilRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur * 0.6, easing: EASE });
    const t = triggerRef.current?.getBoundingClientRect();
    if (t && t.width > 0) {
      const box = panel.getBoundingClientRect();
      cardRef.current?.animate(fromTrigger(box, t), { duration: dur, easing: EASE });
      if (triggerRef.current && cardRef.current) {
        cardRef.current.animate(surfaceFromTrigger(triggerRef.current, cardRef.current), { duration: dur, easing: SURFACE_IN });
      }
      bodyRef.current?.animate(clipFromTrigger(box, t), { duration: dur, easing: EASE });
    } else {
      panel.animate([{ transform: "translateY(24px)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: dur, easing: EASE });
    }
    bodyRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur * 0.6, delay: dur * 0.25, easing: EASE, fill: "backwards" });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    window.dispatchEvent(new Event("lenis:lock"));
    panelRef.current?.focus({ preventScroll: true });
    const trigger = triggerRef.current;
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.dispatchEvent(new Event("lenis:unlock"));
      trigger?.focus?.({ preventScroll: true });
    };
    // close reads refs only; re-binding on every render would restore focus
    // mid-session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const visit = async () => {
    try {
      await navigator.clipboard.writeText(password);
    } catch {}
    setCopied(true);
    window.setTimeout(() => {
      if (window.matchMedia("(max-width: 639px)").matches) window.location.assign(href);
      else window.open(href, "_blank", "noreferrer");
      setCopied(false);
    }, 700);
  };

  return createPortal(
    <div className="ae-dm">
      <div ref={veilRef} className="ae-dm__veil" onClick={close} />
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="ae-dm-title" tabIndex={-1} data-lenis-prevent className="ae-dm__panel">
        <div ref={cardRef} className="ae-dm__card" aria-hidden />
        <div ref={bodyRef} className="ae-dm__body">
          <div className="ae-dm__head">
            <p id="ae-dm-title" className="ae-dm__title">
              A store on Aether
            </p>
            <div role="tablist" aria-label="Device" className="ae-dm__switch" data-mode={mode}>
              <span className="ae-dm__chip" aria-hidden />
              {(["desktop", "mobile"] as const).map((m) => (
                <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)}>
                  {m === "desktop" ? "Desktop" : "Phone"}
                </button>
              ))}
            </div>
            <button type="button" onClick={close} aria-label="Close" className="ae-dm__close">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </div>

          <div className="ae-dm__stage">
            <DemoFrame mode={mode} host={hostOf(href)} />
          </div>

          <div className="ae-dm__foot">
            <p className="ae-dm__pass">
              Password <span>{password}</span>
            </p>
            <button type="button" onClick={visit} className="ae-dm__visit">
              <span className="ae-dm__flip" data-copied={copied || undefined}>
                <span>Visit the store</span>
                <span aria-hidden>Password copied</span>
              </span>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 11l6-6M6 5h5v5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
