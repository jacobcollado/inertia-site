"use client";

import { Hero, CodeBlock, ExamplesSection, InfoSection, type Example, type ManualStep } from "../shared";
import { Badge } from "@/components/ui/badge";

const code = `<Badge variant="outline" size="sm">soon</Badge>
<span className="pill-status"><span className="dot" /> All systems operational</span>
<Badge variant="default">A web app or dashboard</Badge>
<Badge variant="stat" size="sm">+69% monthly revenue</Badge>

.pill-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  letter-spacing: -0.01em;
  color: rgb(var(--muted));
  opacity: 0.5;
}

.pill-status .dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgb(var(--muted));
}`;

const manualSteps: ManualStep[] = [
  {
    title: "Install the following dependencies:",
    code: `npm install class-variance-authority`,
  },
  {
    title: "Copy and paste the following code into your project:",
    filename: "components/ui/badge.tsx",
    code: `import { type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { badgeVariants } from "./badge-variants"

function Badge({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Badge, badgeVariants }`,
  },
  {
    title: "Update the import paths to match your project setup.",
    code: `import { Badge } from "@/components/ui/badge"`,
  },
];

const examples: Example[] = [
  {
    title: "Variants",
    desc: "Default for tags, outline for low-stakes labels, stat for callouts.",
    code: `<Badge variant="default">Default</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="stat">Stat</Badge>`,
    demo: (
      <>
        <Badge variant="default">Default</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="stat">Stat</Badge>
      </>
    ),
  },
  {
    title: "Sizes",
    desc: "Small for compact inline tags, default for standalone chips.",
    code: `<Badge size="sm">Small</Badge>
<Badge size="default">Default</Badge>`,
    demo: (
      <>
        <Badge size="sm">Small</Badge>
        <Badge size="default">Default</Badge>
      </>
    ),
  },
  {
    title: "Status pill",
    desc: "Pair a Badge with a dot indicator for live status.",
    code: `<span className="status-pill">
  <span className="dot" />
  All systems operational
</span>`,
    demo: (
      <span className="inline-flex items-center gap-1.5 text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-50">
        <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--muted))] shrink-0" />
        All systems operational
      </span>
    ),
  },
];

export default function PillsDemo() {
  return (
    <>
      <Hero title="Pills" desc="Status, category, and quick-pick chips." />

      <section className="px-1 -mt-6 pb-16">
        <div className="max-w-2xl mx-auto w-full flex flex-col items-start">
          <div className="flex flex-col gap-6 rounded-2xl border border-[rgb(var(--line))] p-8 sm:p-10 w-full" style={{ background: "rgb(var(--bg) / 0.4)" }}>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" size="sm">soon</Badge>
              <span className="inline-flex items-center gap-1.5 text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-50">
                <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--muted))] shrink-0" />
                All systems operational
              </span>
              <Badge variant="default">A web app or dashboard</Badge>
              <Badge variant="stat" size="sm">+69% monthly revenue</Badge>
            </div>
            <p className="text-left text-[13px] tracking-tight text-[rgb(var(--muted))] max-w-sm" style={{ opacity: 0.5 }}>
              Pills carry low-stakes information, status, tags, quick picks, never a primary action.
            </p>
            <CodeBlock code={code} />
          </div>

          <InfoSection
            install="npx shadcn@latest add badge"
            manualSteps={manualSteps}
            usage={[
              "Badge carries low-stakes information: tags, categories, and quick stats. It never represents a clickable action, use Button for that.",
              "Use the outline variant for sparse, secondary labels like a \"soon\" tag, and stat for numeric callouts that need a bit more visual weight.",
            ]}
          />

          <ExamplesSection examples={examples} />
        </div>
      </section>
    </>
  );
}
