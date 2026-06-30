import type { Metadata } from "next";
import { Hero, CodeBlock } from "../shared";

export const metadata: Metadata = {
  title: "Type",
  description: "The type scale Inertia builds with, tight tracking throughout.",
};

const code = `<p className="text-heading-lg">Heading large</p>
<p className="text-heading-md">Heading medium</p>
<p className="text-body">Body, used for the lead paragraph under a heading.</p>
<p className="text-body-muted">Muted body, used for supporting copy and captions.</p>
<p className="text-eyebrow">Eyebrow / label, all sentence case, never uppercase.</p>

.text-heading-lg {
  font-size: clamp(2.6rem, 4.5vw, 3.5rem);
  font-weight: 400;
  letter-spacing: -0.04em;
  line-height: 1.15;
  color: rgb(var(--fg));
}

.text-heading-md {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 400;
  letter-spacing: -0.03em;
  line-height: 1;
  color: rgb(var(--fg));
}

.text-body {
  font-size: 17px;
  line-height: 1.6;
  letter-spacing: -0.01em;
  color: rgb(var(--fg));
}

.text-body-muted {
  font-size: 14px;
  line-height: 1.6;
  letter-spacing: -0.01em;
  color: rgb(var(--muted));
  opacity: 0.65;
}

.text-eyebrow {
  font-size: 13px;
  letter-spacing: -0.01em;
  color: rgb(var(--muted));
  opacity: 0.5;
}`;

export default function TypePage() {
  return (
    <>
      <Hero title="Type" desc="Tight tracking throughout, weight does the work." />

      <section className="px-1 pt-8 sm:pt-12 pb-16">
        <div className="flex flex-col text-left gap-6 rounded-2xl border border-[rgb(var(--line))] p-8 sm:p-10 max-w-2xl mx-auto" style={{ background: "rgb(var(--bg) / 0.4)" }}>
          <p className="text-[clamp(2.6rem,4.5vw,3.5rem)] font-normal tracking-[-0.04em] leading-[1.15] text-[rgb(var(--fg))]">Heading large</p>
          <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))]">Heading medium</p>
          <p className="text-[17px] leading-relaxed tracking-tight text-[rgb(var(--fg))]">Body, used for the lead paragraph under a heading.</p>
          <p className="text-[14px] leading-relaxed tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.65 }}>Muted body, used for supporting copy and captions.</p>
          <p className="text-[13px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.5 }}>Eyebrow / label, all sentence case, never uppercase.</p>
          <CodeBlock code={code} />
        </div>
      </section>
    </>
  );
}
