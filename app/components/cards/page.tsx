import type { Metadata } from "next";
import { Hero, CodeBlock } from "../shared";

export const metadata: Metadata = {
  title: "Cards",
  description: "The card containers Inertia builds with, link cards and numbered cards.",
};

const code = `<div className="link-card">
  <span>Link card</span>
  <span className="desc">Title, description, and an arrow that nudges on hover.</span>
</div>

<div className="numbered-card">
  <span className="index">01</span>
  <h3>Numbered card</h3>
  <p>Used for principle lists and step-by-step explanations.</p>
</div>

.link-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-radius: 12px;
  padding: 14px 16px;
  border: 1px solid rgb(var(--line));
  transition: all 0.2s ease;
}

.link-card:hover {
  border-color: rgb(var(--fg) / 0.2);
  background: rgb(var(--bg));
}

.numbered-card {
  display: flex;
  gap: 24px;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgb(var(--line));
  background: rgb(var(--bg));
}

.numbered-card .index {
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: rgb(var(--muted));
  opacity: 0.35;
}`;

export default function CardsPage() {
  return (
    <>
      <Hero title="Cards" desc="The container that link lists and previews live in." />

      <section className="px-1 pt-8 sm:pt-12 pb-16">
        <div className="rounded-2xl border border-[rgb(var(--line))] p-8 sm:p-10 max-w-2xl mx-auto" style={{ background: "rgb(var(--bg) / 0.4)" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="group flex items-center justify-between gap-4 rounded-xl px-4 py-3.5 border border-[rgb(var(--line))] hover:border-[rgb(var(--fg)/0.2)] hover:bg-[rgb(var(--bg))] transition-all duration-200">
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] font-medium tracking-tight text-[rgb(var(--fg))]">Link card</span>
                <span className="text-[12px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.5 }}>Title, description, and an arrow that nudges on hover.</span>
              </div>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0 text-[rgb(var(--muted))] opacity-30 group-hover:opacity-70 group-hover:translate-x-0.5 transition-all duration-200" aria-hidden="true">
                <path d="M4 12L12 4M7 4h5v5"/>
              </svg>
            </div>
            <div className="flex gap-6 p-6 rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--bg))] hover:bg-[rgb(var(--bg))] transition-colors">
              <span className="text-[13px] tabular-nums text-[rgb(var(--muted))] shrink-0 pt-0.5" style={{ opacity: 0.35 }}>01</span>
              <div className="flex flex-col gap-2.5 text-left">
                <h3 className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))] leading-snug">Numbered card</h3>
                <p className="text-[14px] leading-relaxed tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.65 }}>Used for principle lists and step-by-step explanations.</p>
              </div>
            </div>
          </div>
          <CodeBlock code={code} />
        </div>
      </section>
    </>
  );
}
