"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button-base";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const sparkData = [
  { v: 42 }, { v: 48 }, { v: 51 }, { v: 49 }, { v: 62 }, { v: 71 },
];

const ITEMS = [
  {
    href: "/components/buttons",
    label: "Buttons",
    desc: "Primary, secondary, and icon actions.",
    preview: (
      <div className="flex items-center gap-2">
        <Button variant="default" className="rounded-full text-[13px] px-4 py-2">Primary</Button>
        <Button variant="outline" className="rounded-full text-[13px] px-4 py-2">Secondary</Button>
      </div>
    ),
  },
  {
    href: "/components/pills",
    label: "Pills",
    desc: "Status, category, and quick-pick chips.",
    preview: (
      <div className="flex items-center gap-2">
        <Badge variant="default">Tag</Badge>
        <Badge variant="outline" size="sm">soon</Badge>
        <Badge variant="stat" size="sm">+69%</Badge>
      </div>
    ),
  },
  {
    href: "/components/cards",
    label: "Cards",
    desc: "Link cards and numbered containers.",
    preview: (
      <div className="flex items-center gap-3 w-full">
        <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 border border-[rgb(var(--line))] flex-1 min-w-0">
          <span className="text-[13px] tracking-tight text-[rgb(var(--fg))]">Link card</span>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="size-3 shrink-0 text-[rgb(var(--muted))] opacity-40"><path d="M4 12L12 4M7 4h5v5"/></svg>
        </div>
        <div className="flex gap-3 rounded-lg px-3 py-2.5 border border-[rgb(var(--line))] flex-1 min-w-0">
          <span className="text-[12px] tabular-nums text-[rgb(var(--muted))] opacity-35 shrink-0">01</span>
          <span className="text-[13px] tracking-tight text-[rgb(var(--fg))]">Numbered</span>
        </div>
      </div>
    ),
  },
  {
    href: "/components/charts",
    label: "Charts",
    desc: "Themed Recharts wrapper for trend lines.",
    preview: (
      <div className="w-full h-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparkData}>
            <Line type="monotone" dataKey="v" stroke="rgb(var(--fg))" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    ),
  },
];

export default function ComponentsPage() {
  return (
    <section className="flex flex-col gap-10 px-1 max-w-2xl mx-auto w-full pt-10 pb-16">
      <div className="flex flex-col gap-3">
        <h1 className="text-[clamp(1.8rem,4vw,2.6rem)] font-normal tracking-[-0.04em] leading-none text-[rgb(var(--fg))]">
          Components
        </h1>
        <p className="text-[clamp(1rem,1.8vw,1.1rem)] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-sm sm:max-w-md">
          The interface pieces Inertia builds with, shown as they actually ship.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center justify-between gap-6 rounded-xl px-5 py-4 border border-[rgb(var(--line))] transition-colors hover:border-[rgb(var(--fg)/0.2)]"
            style={{ background: "rgb(var(--bg) / 0.4)" }}
          >
            <div className="flex flex-col gap-0.5 shrink-0 w-28">
              <span className="text-[15px] tracking-tight text-[rgb(var(--fg))]">{item.label}</span>
              <span className="text-[12px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.5 }}>{item.desc}</span>
            </div>
            <div className="flex-1 min-w-0 pointer-events-none">
              {item.preview}
            </div>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 shrink-0 text-[rgb(var(--muted))] opacity-30 group-hover:opacity-70 group-hover:translate-x-0.5 transition-all duration-200">
              <path d="M4 12L12 4M7 4h5v5" />
            </svg>
          </Link>
        ))}
      </div>
    </section>
  );
}
