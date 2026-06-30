import type { Metadata } from "next";
import { Hero, Swatch, CodeBlock } from "../shared";

export const metadata: Metadata = {
  title: "Color",
  description: "The color tokens Inertia builds with, foreground, muted, surface, and line.",
};

const code = `--fg: 10 10 10;
--muted: 110 110 110;
--surface: 250 250 250;
--line: 230 230 230;`;

export default function ColorPage() {
  return (
    <>
      <Hero title="Color" desc="Tokens that hold across light and dark." />

      <section className="px-1 pt-8 sm:pt-12 pb-16">
        <div className="w-full rounded-2xl border border-[rgb(var(--line))] p-8 sm:p-10 max-w-2xl mx-auto" style={{ background: "rgb(var(--bg) / 0.4)" }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <Swatch name="Foreground" varName="--fg" />
            <Swatch name="Muted" varName="--muted" />
            <Swatch name="Surface" varName="--surface" />
            <Swatch name="Line" varName="--line" />
          </div>
          <CodeBlock code={code} />
        </div>
      </section>
    </>
  );
}
