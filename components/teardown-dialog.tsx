"use client";

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import { CTA_FILL, CTA_PILL_CLASS } from "@/lib/cta-chrome";

// The free teardown offer from the hero. Everything promised here is what
// the studio actually does: a short recorded walkthrough of their site,
// within REPLY_BUSINESS_DAYS (keep in sync with app/api/teardown/route.ts),
// and one follow-up at most.
const REPLY_BUSINESS_DAYS = 3;

const field =
  "h-11 w-full rounded-[6px] px-3.5 text-[16px] tracking-tight outline-none transition-shadow duration-200 placeholder:opacity-50 focus:shadow-[0_0_0_1.5px_var(--ink)]";

// Where the button that opened the dialog sits, as its centre's offset from
// the middle of the screen. On wider screens the dialog grows out of that
// spot and goes back into it on close, so it never just appears. Phones keep
// the sheet sliding up from the bottom.
export type TeardownOrigin = { x: number; y: number };

export function originOf(el: Element): TeardownOrigin | undefined {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2 - window.innerWidth / 2, y: r.top + r.height / 2 - window.innerHeight / 2 };
}

export function TeardownDialog({
  open,
  onOpenChange,
  from,
  website: givenWebsite,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  from?: TeardownOrigin;
  // A site the visitor already typed (the hero canvas's address bar).
  website?: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [customers, setCustomers] = useState("");
  const [trap, setTrap] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && givenWebsite) setWebsite(givenWebsite);
  }, [open, givenWebsite]);

  // Clear a finished request once the dialog has closed, so reopening starts fresh.
  useEffect(() => {
    if (open || state !== "done") return;
    const t = setTimeout(() => {
      setState("idle");
      setName("");
      setWebsite("");
      setCustomers("");
    }, 300);
    return () => clearTimeout(t);
  }, [open, state]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setState("sending");
    try {
      const res = await fetch("/api/teardown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, website, customers, company_url: trap }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.resolution ?? body?.message ?? "Something went wrong.");
      }
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("idle");
    }
  }

  const inputStyle = { background: "var(--tile)", color: "var(--ink)" };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[6px] transition-opacity duration-300 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
        <DialogPrimitive.Popup
          className="fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto overscroll-contain rounded-t-[14px] p-6 outline-none transition-[transform,opacity] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] data-[starting-style]:translate-y-6 data-[starting-style]:opacity-0 data-[ending-style]:translate-y-4 data-[ending-style]:opacity-0 data-[ending-style]:duration-200 sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[min(30rem,calc(100vw-2rem))] sm:rounded-[10px] sm:p-8 teardown-popup"
          style={{
            background: "var(--paper)",
            color: "var(--ink)",
            boxShadow: "0 24px 80px -20px rgb(0 0 0 / 0.35)",
            // Without an origin it rises a little into place.
            ["--from-x" as string]: `${from?.x ?? 0}px`,
            ["--from-y" as string]: `${from?.y ?? 16}px`,
            ["--from-s" as string]: from ? 0.3 : 0.98,
          } as CSSProperties}
        >
          <DialogPrimitive.Close
            className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full transition-colors hover:bg-[var(--tile)]"
            style={{ color: "var(--ink-4)" }}
            aria-label="Close"
          >
            <XIcon className="size-4" />
          </DialogPrimitive.Close>

          {state === "done" ? (
            <div className="py-2" style={{ animation: "liquid-in 680ms cubic-bezier(0.22,0.61,0.36,1) both" }}>
              <DialogPrimitive.Title className="text-[24px] leading-tight tracking-[-0.03em]" style={{ fontWeight: 450 }}>
                It&apos;s on our list.
              </DialogPrimitive.Title>
              <p className="mt-3 text-[16px] leading-relaxed tracking-tight" style={{ color: "var(--ink-2)" }}>
                Your teardown will land at <span style={{ color: "var(--ink)" }}>{email}</span> within {REPLY_BUSINESS_DAYS} business days. If anything
                about the site makes us want to ask a question first, we&apos;ll reply to that address.
              </p>
              <DialogPrimitive.Close
                className={`${CTA_PILL_CLASS} mt-7`}
                style={{ background: CTA_FILL, color: "var(--cta-fg)", fontWeight: 450 }}
              >
                Done
              </DialogPrimitive.Close>
            </div>
          ) : (
            <>
              <p className="text-[13px] tracking-tight" style={{ color: "var(--ink-4)" }}>
                Free, no call needed
              </p>
              <DialogPrimitive.Title className="mt-2 pr-8 text-[24px] leading-tight tracking-[-0.03em] sm:text-[28px]" style={{ fontWeight: 450 }}>
                Get a free teardown of your site
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-3 text-[15.5px] leading-relaxed tracking-tight" style={{ color: "var(--ink-2)" }}>
                We record a short video going through your homepage the way a new customer sees it, and point out three things that may be
                costing you customers. It&apos;s yours to keep.
              </DialogPrimitive.Description>

              <ul className="mt-5 flex flex-col gap-2 text-[14.5px] leading-snug tracking-tight" style={{ color: "var(--ink-2)" }}>
                <li className="flex gap-2.5">
                  <Tick /> In your inbox within {REPLY_BUSINESS_DAYS} business days
                </li>
                <li className="flex gap-2.5">
                  <Tick /> One follow-up from us at most, and only if we think we can help
                </li>
              </ul>

              <form onSubmit={submit} className="mt-7 flex flex-col gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    required
                    autoComplete="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={field}
                    style={inputStyle}
                  />
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={field}
                    style={inputStyle}
                  />
                </div>
                <input
                  required
                  inputMode="url"
                  autoComplete="url"
                  placeholder="Your website, like example.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className={field}
                  style={inputStyle}
                />
                <textarea
                  rows={2}
                  placeholder="Who are your customers? (optional)"
                  value={customers}
                  onChange={(e) => setCustomers(e.target.value)}
                  className={`${field} h-auto resize-none py-3 leading-snug`}
                  style={inputStyle}
                />
                {/* Hidden from people; bots that fill it get a quiet success. */}
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={trap}
                  onChange={(e) => setTrap(e.target.value)}
                  className="absolute -left-[9999px] h-0 w-0 opacity-0"
                  name="company_url"
                />

                {error && (
                  <p className="text-[14px] tracking-tight text-red-500" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={state === "sending"}
                  className={`${CTA_PILL_CLASS} mt-2 w-full justify-center transition-opacity disabled:opacity-50`}
                  style={{ background: CTA_FILL, color: "var(--cta-fg)", fontWeight: 450 }}
                >
                  {state === "sending" ? "Sending…" : "Request my teardown"}
                </button>
                <p className="text-center text-[12.5px] tracking-tight" style={{ color: "var(--ink-4)" }}>
                  We only use these details to send your teardown. Nothing is sold or shared.
                </p>
              </form>
            </>
          )}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function Tick() {
  return (
    <svg viewBox="0 0 16 16" className="mt-[3px] size-3.5 shrink-0" fill="none" stroke="var(--ink)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="2.5 8.5 6.5 12 13.5 4" />
    </svg>
  );
}

// The offer as a standalone CTA, for pages without the homepage hero.
export function TeardownButton({ label = "Get a free teardown", className = "" }: { label?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState<TeardownOrigin>();
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          setFrom(originOf(e.currentTarget));
          setOpen(true);
        }}
        className={`${CTA_PILL_CLASS} transition-transform duration-150 active:scale-[0.97] ${className}`}
        style={{ background: CTA_FILL, color: "var(--cta-fg)", fontWeight: 450 }}
      >
        <span className="relative whitespace-nowrap">{label}</span>
      </button>
      <TeardownDialog open={open} onOpenChange={setOpen} from={from} />
    </>
  );
}
