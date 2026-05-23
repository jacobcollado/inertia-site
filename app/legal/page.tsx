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

      let seed = 13;
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
    title: "Before we start",
    body: "This covers how Inertia operates: what you own, what we retain, how payment works, and what happens when things go sideways. Most projects run without ever needing to reference this. But clear terms protect both sides, and ambiguity tends to create problems that goodwill alone can't fix. By engaging Inertia for paid work, you agree to the terms below.",
  },
  {
    id: "ip",
    num: "02",
    title: "You own what we build",
    body: "When you pay in full, the final deliverable is yours. Code, design files, copy, everything produced specifically for your project. Use it, modify it, build on it however you like. We retain ownership of what existed before your project started: base themes, component libraries, internal frameworks. If we use those as a foundation, you get a perpetual licence to use them within your project. You can't sell the underlying code separately, but you'll never be restricted from using what we built for you.",
  },
  {
    id: "payment",
    num: "03",
    title: "50/50, no surprises",
    body: "Half is due before we start. The other half is due before the site goes live or final files are delivered. Work does not begin until the deposit clears. Invoices are payable within 7 days. After 14 days, a 1.5% monthly late fee applies. If an invoice goes unpaid past 30 days, we can pause work or terminate the project. Deposits are non-refundable once we've started.",
  },
  {
    id: "revisions",
    num: "04",
    title: "Two rounds, scope is scope",
    body: "Every project includes two revision rounds against the original brief. A revision means changing something we built, not adding features or rebuilding sections from scratch. Additional rounds are billed at our hourly rate. Scope changes require a new written estimate before we proceed. If a project goes quiet for more than 30 days without a scheduled pause, we treat it as stalled, invoice for completed work, and close it out.",
  },
  {
    id: "post-launch",
    num: "05",
    title: "14 days to catch real bugs",
    body: "After handover, we offer a 14-day correction window. If something we built doesn't work the way it was supposed to, we fix it at no charge. This covers genuine bugs, not new requests, Shopify platform updates, or changes made by your team after handover. Ongoing support is a separate retainer.",
  },
  {
    id: "confidentiality",
    num: "06",
    title: "What you share stays with us",
    body: "Business plans, roadmaps, financials, customer data, unreleased work. None of it leaves the project. We don't store client credentials beyond what's needed and access is revoked on handover. If you need a formal NDA, send it over. We sign reasonable ones without issue.",
  },
  {
    id: "liability",
    num: "07",
    title: "Our liability is capped at what you paid",
    body: "We build carefully and stand behind our work. But our total liability for any claim is capped at the total amount you paid us for that project. We're not liable for lost revenue, missed launches, or downstream business impact. We're also not liable for issues caused by Shopify platform changes, third-party providers, or modifications your team makes to code we delivered.",
  },
  {
    id: "disputes",
    num: "08",
    title: "Message us first",
    body: "Most issues resolve in a single conversation. We're a small studio and we have a genuine interest in making things right. If a dispute can't be resolved directly, both parties agree to attempt mediation before legal action. Formal proceedings are governed by the laws of Illinois, United States. We've never had a dispute reach that stage.",
  },
];

export default function LegalPage() {
  return (
    <main className="page-container mx-3 sm:mx-auto w-auto sm:w-full max-w-6xl min-h-screen flex flex-col">

      <div className="flex items-center justify-between px-6 sm:px-8 py-5 rise">
        <Link href="/privacy" className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-50 hover:opacity-80 transition-opacity">
          Privacy policy
        </Link>
      </div>

      <div className="grid-rule" aria-hidden="true" />

      <div className="relative rise" style={{ ["--rise-delay" as any]: "40ms" }}>
        <HexBanner />
        <div className="px-6 sm:px-8 pb-14 flex flex-col items-center text-center">
          <h1 className="text-[clamp(2.4rem,6vw,4.5rem)] font-normal tracking-[-0.04em] leading-[1.0] text-[rgb(var(--fg))] mb-5">
            Terms of engagement
          </h1>
          <p className="text-[15px] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-md">
            Written to be read, not skimmed by lawyers.
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
          <Link href="/contact" className="underline underline-offset-2 hover:opacity-70 transition-opacity">
            Get in touch.
          </Link>
        </p>
        <p className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-30 tabular-nums shrink-0">
          &copy; {new Date().getFullYear()} Inertia
        </p>
      </div>

    </main>
  );
}
