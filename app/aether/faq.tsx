"use client";

import { useState, useEffect, useRef } from "react";

const FAQ_ITEMS: { q: string; a: React.ReactNode }[] = [
  {
    q: "What is Aether?",
    a: "Aether is a premium Shopify theme built for independent brands that treat how the store looks as part of what they sell. It ships with 41 sections, dark mode, a sticky cart, and a mega menu.",
  },
  {
    q: "Do I need to know how to code to use it?",
    a: "No. Every section is built for the Shopify theme editor, so you can build and rearrange pages without touching a line of code. If you do want to customize further, the theme is clean and well organized for developers too.",
  },
  {
    q: "What's the difference between Standard and Lifetime?",
    a: "Standard is $85 for a single store with a year of updates. Lifetime is $105 for a single store with updates forever and priority support.",
  },
  {
    q: "How long does setup take?",
    a: "Most stores are live within an hour of purchase. Aether installs like any Shopify theme, and the guided sections mean you're rarely starting from a blank page.",
  },
  {
    q: "Is there a live demo?",
    a: <>Yes. You can <a href="https://aether-starter.myshopify.com" target="_blank" rel="noreferrer" style={{ color: "#0a84ff", textDecoration: "none" }}>preview Aether</a> running on a real store before you buy.</>,
  },
  {
    q: "What happens after my year of updates ends?",
    a: "On the Standard license, the theme keeps working exactly as installed. You just won't receive new sections or updates until you renew. The Lifetime license includes updates for as long as you use it.",
  },
  {
    q: "Do you offer support?",
    a: <>Yes, through the client portal for every tier, with priority support on Lifetime. You can also reach us directly at <a href="mailto:hello@byinertia.com" style={{ color: "#0a84ff", textDecoration: "none" }}>hello@byinertia.com</a>.</>,
  },
];

function FaqItem({ q, a, open, onToggle, delay }: { q: string; a: React.ReactNode; open: boolean; onToggle: () => void; delay: number }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const target = open ? el.scrollHeight : 0;
    setHeight(target);
  }, [open]);

  return (
    <div className="rise" style={{ "--rise-delay": `${delay}ms` } as React.CSSProperties}>
      <div
        style={{
          borderRadius: 16,
          background: open ? "rgb(var(--surface))" : "transparent",
          transition: "background 350ms cubic-bezier(0.22,1,0.36,1)",
          marginBottom: 6,
        }}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="w-full flex items-center justify-between gap-6 py-5 px-5"
        >
          <span className="flex-1 text-[16px] sm:text-[17px] tracking-tight text-[rgb(var(--fg))] text-left sm:text-center">{q}</span>
        </button>
        <div style={{ height, overflow: "hidden", transition: "height 350ms cubic-bezier(0.22,1,0.36,1)" }}>
          <div ref={bodyRef} className="pb-5 px-5">
            <p className="text-[15px] sm:text-[16px] leading-relaxed tracking-tight text-[rgb(var(--muted))] text-left sm:text-center">
              {a}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AetherFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="px-3 py-16 sm:py-24">
      <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))] mb-10 text-center">
        Questions, answered
      </p>
      <div className="max-w-2xl mx-auto">
        {FAQ_ITEMS.map((item, i) => (
          <FaqItem
            key={item.q}
            q={item.q}
            a={item.a}
            open={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            delay={i * 40}
          />
        ))}
      </div>
    </section>
  );
}
