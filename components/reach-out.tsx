"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";

// "Reach out", everywhere it appears (the header, the phone dock and drawer,
// the close): a button that opens two ways to talk to us, a message on
// Telegram or a call booked on Cal. The pop-up rises in over a soft wash of
// the page, raised on a firm ring and a shadow so it stands apart; it closes
// on Escape, on the wash, or on its close button, and hands focus back to
// the button that opened it. Each way in has a small drawing in the hairline
// of the site's drawings. Styles are .reach in globals.css.

export const TELEGRAM_LINK = "https://t.me/Jacob_inertia";
export const CAL_LINK = "https://cal.com/jacob-c-99otvp/15min";

// How long the pop-up takes to leave, in ms (--motion-dur-short).
const EXIT_MS = 300;

export function ReachOut({ className, style, children }: { className?: string; style?: CSSProperties; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={className} style={style} onClick={() => setOpen(true)} aria-haspopup="dialog">
        {children}
      </button>
      {open && <ReachDialog onClose={() => setOpen(false)} />}
    </>
  );
}

// The paper plane, at icon size, for the buttons that open the pop-up.
export function PlaneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14.25 1.75 7 9" />
      <path d="M14.25 1.75 9.75 14.25 7 9 1.75 6.25z" />
    </svg>
  );
}

function ReachDialog({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"in" | "out">("in");
  const [shown, setShown] = useState(false);

  const close = () => {
    if (state === "out") return;
    setState("out");
    window.setTimeout(onClose, EXIT_MS);
  };

  useEffect(() => {
    const restore = document.activeElement as HTMLElement | null;
    // One frame at rest-before, so it rises in rather than appearing.
    const id = requestAnimationFrame(() => setShown(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      // Keep Tab inside the pop-up.
      if (e.key === "Tab" && panelRef.current) {
        const items = panelRef.current.querySelectorAll<HTMLElement>("a, button");
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    window.dispatchEvent(new Event("lenis:lock"));
    panelRef.current?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.dispatchEvent(new Event("lenis:unlock"));
      restore?.focus?.({ preventScroll: true });
    };
    // close only reads state through setState; binding once keeps focus put.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div className="reach" data-state={shown && state === "in" ? "in" : "out"}>
      <div className="reach__wash" onClick={close} aria-hidden />
      <div ref={panelRef} className="reach__panel" role="dialog" aria-modal="true" aria-labelledby="reach-title">
        <div className="reach__head">
          <div>
            <h2 id="reach-title" className="reach__title">
              Reach out
            </h2>
            <p className="reach__line">Message us, or book fifteen minutes.</p>
          </div>
          <button type="button" className="reach__close" onClick={close} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="reach__ways">
          <Way href={TELEGRAM_LINK} title="Message on Telegram" sub="@Jacob_inertia" art={<PlaneArt />} onPick={close} />
          <Way href={CAL_LINK} title="Book a call" sub="15 minutes, on Cal" art={<DialArt />} onPick={close} />
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Way({ href, title, sub, art, onPick }: { href: string; title: string; sub: string; art: ReactNode; onPick: () => void }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="reach__way" onClick={onPick}>
      <span className="reach__art" aria-hidden>
        {art}
      </span>
      <span className="reach__text">
        <span className="reach__way-title">{title}</span>
        <span className="reach__way-sub">{sub}</span>
      </span>
      <svg className="reach__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M5 11 11 5M6 5h5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

// A paper plane, folded, in hairline: the message.
function PlaneArt() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round">
      <path d="M8 23.5 40 10l-7 28-9.5-7.5z" />
      <path d="M40 10 23.5 30.5 22 38l-3.5-9.6z" />
      <path d="M8 23.5l10.5 4.9" />
    </svg>
  );
}

// A dial with its hands, in hairline: the call. The minute hand comes round
// a quarter while the way is pointed at.
function DialArt() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
      <circle cx="24" cy="24" r="15" />
      <circle cx="24" cy="24" r="12.5" opacity="0.4" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const r0 = i % 3 === 0 ? 9.5 : 10.5;
        return (
          <line
            key={i}
            x1={(24 + Math.sin(a) * r0).toFixed(2)}
            y1={(24 - Math.cos(a) * r0).toFixed(2)}
            x2={(24 + Math.sin(a) * 12).toFixed(2)}
            y2={(24 - Math.cos(a) * 12).toFixed(2)}
          />
        );
      })}
      <path d="M24 24l-4.5 3" />
      <path className="reach__hand" d="M24 24V15" />
      <circle cx="24" cy="24" r="1" fill="currentColor" />
    </svg>
  );
}
