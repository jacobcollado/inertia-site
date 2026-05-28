"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("cookie_consent")) setVisible(true);
    } catch {}
  }, []);

  const accept = () => {
    try { localStorage.setItem("cookie_consent", "accepted"); } catch {}
    setVisible(false);
  };

  const decline = () => {
    try { localStorage.setItem("cookie_consent", "declined"); } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4 sm:px-6 sm:pb-6"
      style={{ animation: "rise-in 300ms cubic-bezier(0.22,1,0.36,1) both" }}
    >
      <div
        className="mx-auto max-w-2xl rounded-xl border border-[rgb(var(--line))] px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4"
        style={{ background: "rgb(var(--surface-elevated))", boxShadow: "0 8px 32px rgb(0 0 0 / 0.18)" }}
      >
        <p className="text-[13px] leading-relaxed tracking-tight text-[rgb(var(--muted))] flex-1">
          We use cookies to keep you signed in and understand how the site is used.{" "}
          <Link href="/policies/privacy-policy" className="underline underline-offset-2 hover:text-[rgb(var(--fg))] transition-colors">
            Privacy policy
          </Link>
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={decline}
            className="rounded-full px-4 py-2 text-[12px] tracking-tight text-[rgb(var(--muted))] border border-[rgb(var(--line))] hover:border-[rgb(var(--fg)/0.3)] hover:text-[rgb(var(--fg))] transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="rounded-full px-4 py-2 text-[12px] tracking-tight font-medium bg-[rgb(var(--fg))] text-[rgb(var(--bg))] hover:opacity-85 transition-opacity"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
