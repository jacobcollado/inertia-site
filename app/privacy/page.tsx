"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

const EFFECTIVE = "May 1, 2026";

function HexBanner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const r = canvas.getBoundingClientRect();
      const W = r.width, H = r.height;
      canvas.width = Math.round(W * devicePixelRatio);
      canvas.height = Math.round(H * devicePixelRatio);
      ctx.save();
      ctx.scale(devicePixelRatio, devicePixelRatio);
      ctx.clearRect(0, 0, W, H);

      const isDark = document.documentElement.classList.contains("dark");
      const [fr, fg, fb] = isDark ? [160, 185, 255] : [15, 35, 150];
      const a = (alpha: number) => `rgba(${fr},${fg},${fb},${isDark ? alpha : alpha * 1.6})`;

      const CELL_W = 38, CELL_H = 14, GAP_X = 3, GAP_Y = 3;
      const COLS = Math.ceil(W / (CELL_W + GAP_X)) + 1;
      const ROWS = Math.ceil(H / (CELL_H + GAP_Y)) + 1;

      let seed = 31;
      const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; };
      const hex = () => Math.floor(rand() * 0x100).toString(16).toUpperCase().padStart(2, "0");

      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const x = col * (CELL_W + GAP_X);
          const y = row * (CELL_H + GAP_Y);
          const edgeFadeX = Math.min(x / 40, (W - x - CELL_W) / 40, 1);
          const edgeFadeY = Math.min(y / 20, (H - y - CELL_H) / 30, 1);
          const alpha = edgeFadeX * edgeFadeY * (isDark ? 0.18 : 0.13);
          if (alpha < 0.02) continue;
          const isActive = rand() > 0.93;
          ctx.font = `${isActive ? "500" : "400"} 9px monospace`;
          ctx.fillStyle = a(isActive ? alpha * 2 : alpha);
          ctx.textAlign = "left";
          ctx.textBaseline = "top";
          ctx.fillText(`${hex()} ${hex()}`, x, y);
        }
      }
      ctx.restore();
    };

    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    const mo = new MutationObserver(draw);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    draw();
    return () => { ro.disconnect(); mo.disconnect(); };
  }, []);

  return (
    <div className="relative overflow-hidden" style={{ height: 200 }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ display: "block" }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16" style={{ background: "linear-gradient(to bottom, transparent, rgb(var(--bg)))" }} />
    </div>
  );
}

const SECTIONS = [
  {
    id: "overview",
    num: "01",
    title: "We collect as little as possible",
    body: "Inertia is a small studio. We don't run advertising networks, track you across sites, or share your information with third parties. This page explains what we do collect, why, and how long we keep it.",
  },
  {
    id: "what-we-collect",
    num: "02",
    title: "What we actually have on you",
    body: "If you fill out the contact form, we get your name, email, and message. We use it to respond to you. If you buy the Aether theme, Stripe handles the transaction and we receive your email and order details, not your card number. We collect anonymised page-view data to understand what's useful on the site. Our hosting logs IP addresses and browser info for a rolling 30-day window, for debugging and security only.",
  },
  {
    id: "what-we-dont",
    num: "03",
    title: "What we don't do",
    body: "We don't sell your data. We don't use it for ads or retargeting. We don't share your contact details with anyone outside Inertia. We don't store card data. We don't use third-party tracking cookies or fingerprinting. That's not a policy. That's just how we operate.",
  },
  {
    id: "cookies",
    num: "04",
    title: "One cookie, your theme preference",
    body: "We set a single first-party session cookie to remember whether you prefer light or dark mode. It contains no personal data and expires when you close your browser. No analytics cookies, no ad pixels. Block everything if you want, the site still works.",
  },
  {
    id: "retention",
    num: "05",
    title: "We don't keep things longer than we need to",
    body: "Contact messages are kept while the conversation is active plus 12 months, then deleted. If you want them removed sooner, email us and we'll do it within 7 days. Purchase records are kept for 7 years for tax and accounting. Server logs purge automatically after 30 days.",
  },
  {
    id: "your-rights",
    num: "06",
    title: "You can ask us to show, fix, or delete your data",
    body: "Email hello@byinertia.com with the subject \"Privacy request\" and we'll respond within 14 days. If you're in the EU or UK, you also have the right to lodge a complaint with your local supervisory authority. We'd rather hear from you first.",
  },
  {
    id: "changes",
    num: "07",
    title: "If something changes, this page changes too",
    body: `Material changes get a new effective date at the top. The version you're reading is effective ${EFFECTIVE}.`,
  },
];

export default function PrivacyPage() {
  return (
    <main className="page-container mx-3 sm:mx-auto w-auto sm:w-full max-w-6xl min-h-screen flex flex-col">

      <div className="flex items-center justify-between px-6 sm:px-8 py-5 rise">
        <Link href="/legal" className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-50 hover:opacity-80 transition-opacity">
          Terms of engagement
        </Link>
      </div>

      <div className="grid-rule" aria-hidden="true" />

      <div className="relative rise" style={{ ["--rise-delay" as any]: "40ms" }}>
        <HexBanner />
        <div className="px-6 sm:px-8 pb-14 flex flex-col items-center text-center">
          <h1 className="text-[clamp(2.4rem,6vw,4.5rem)] font-normal tracking-[-0.04em] leading-[1.0] text-[rgb(var(--fg))] mb-5">
            Privacy policy
          </h1>
          <p className="text-[15px] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-md">
            Short version: we collect as little as possible and don&apos;t do anything shady with it.
          </p>
          <p className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-40 tabular-nums mt-5">
            Effective {EFFECTIVE}
          </p>
        </div>
      </div>

      <div className="grid-rule" aria-hidden="true" />

      {SECTIONS.map((s, i) => (
        <div key={s.id}>
          <section
            id={s.id}
            className="px-6 sm:px-8 py-14 sm:py-20 rise flex flex-col items-center text-center"
            style={{ ["--rise-delay" as any]: `${i * 35}ms` }}
          >
            <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-30 tabular-nums block mb-4">{s.num}</span>
            <h2 className="text-[clamp(1.35rem,3vw,2rem)] font-normal tracking-tight text-[rgb(var(--fg))] leading-snug mb-5 max-w-xl">
              {s.title}
            </h2>
            <p className="text-[14px] sm:text-[15px] leading-[1.9] tracking-tight text-[rgb(var(--muted))] max-w-2xl">
              {s.body}
            </p>
          </section>
          <div className="grid-rule" aria-hidden="true" />
        </div>
      ))}

      <div className="px-6 sm:px-8 py-8 flex items-center justify-between gap-6">
        <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-50">
          Questions?{" "}
          <a href="mailto:hello@byinertia.com" className="underline underline-offset-2 hover:opacity-70 transition-opacity">
            hello@byinertia.com
          </a>
        </p>
        <p className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-30 tabular-nums shrink-0">
          &copy; {new Date().getFullYear()} Inertia
        </p>
      </div>

    </main>
  );
}
