"use client";

import { Line, LineChart, CartesianGrid, XAxis } from "recharts";
import { Hero, CodeBlock, ExamplesSection, InfoSection, type Example, type ManualStep } from "../shared";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const data = [
  { month: "Jan", revenue: 4200 },
  { month: "Feb", revenue: 4800 },
  { month: "Mar", revenue: 5100 },
  { month: "Apr", revenue: 4950 },
  { month: "May", revenue: 6200 },
  { month: "Jun", revenue: 7100 },
];

const chartConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "rgb(var(--fg))" },
};

const code = `const chartConfig = {
  revenue: { label: "Revenue", color: "rgb(var(--fg))" },
} satisfies ChartConfig;

<ChartContainer config={chartConfig}>
  <LineChart data={data}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Line dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} dot={false} />
  </LineChart>
</ChartContainer>`;

const manualSteps: ManualStep[] = [
  {
    title: "Install the following dependencies:",
    code: `npm install recharts`,
  },
  {
    title: "Copy and paste the following code into your project:",
    filename: "components/ui/chart.tsx",
    code: `"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"

export type ChartConfig = {
  [key: string]: { label?: React.ReactNode; color?: string }
}

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) throw new Error("useChart must be used within a <ChartContainer />")
  return context
}

function ChartContainer({ config, className, children, ...props }: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
}) {
  return (
    <ChartContext.Provider value={{ config }}>
      <div data-slot="chart" className={cn("aspect-video w-full text-[12px]", className)} {...props}>
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

export { ChartContainer, ChartTooltip, useChart }`,
  },
  {
    title: "Update the import paths to match your project setup.",
    code: `import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"`,
  },
];

const examples: Example[] = [
  {
    title: "Grid and axis",
    desc: "A horizontal grid with a labeled x-axis, no y-axis clutter.",
    code: `<LineChart data={data}>
  <CartesianGrid vertical={false} />
  <XAxis dataKey="month" tickLine={false} axisLine={false} />
  <Line dataKey="revenue" stroke="rgb(var(--fg))" strokeWidth={2} dot={false} />
</LineChart>`,
    demo: (
      <ChartContainer config={chartConfig} className="h-48 w-full">
        <LineChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="rgb(var(--line))" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "rgb(var(--muted))", fontSize: 11 }} />
          <Line dataKey="revenue" stroke="rgb(var(--fg))" strokeWidth={2} dot={false} />
        </LineChart>
      </ChartContainer>
    ),
  },
  {
    title: "With tooltip",
    desc: "Hover the line to see the themed tooltip, styled with the same surface and line tokens as the rest of the site.",
    code: `<LineChart data={data}>
  <ChartTooltip content={<ChartTooltipContent />} />
  <Line dataKey="revenue" stroke="rgb(var(--fg))" strokeWidth={2} dot={false} />
</LineChart>`,
    demo: (
      <ChartContainer config={chartConfig} className="h-48 w-full">
        <LineChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="rgb(var(--line))" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "rgb(var(--muted))", fontSize: 11 }} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line dataKey="revenue" stroke="rgb(var(--fg))" strokeWidth={2} dot={false} />
        </LineChart>
      </ChartContainer>
    ),
  },
];

export default function ChartsDemo() {
  return (
    <>
      <Hero title="Charts" desc="A themed Recharts wrapper for trend lines and comparisons." />

      <section className="px-1 -mt-6 pb-16">
        <div className="max-w-2xl mx-auto w-full flex flex-col items-start">
          <div className="flex flex-col gap-8 rounded-2xl border border-[rgb(var(--line))] p-8 sm:p-10 w-full" style={{ background: "rgb(var(--bg) / 0.4)" }}>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <LineChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="rgb(var(--line))" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "rgb(var(--muted))", fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line dataKey="revenue" stroke="rgb(var(--fg))" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
            <p className="text-left text-[14px] tracking-tight text-[rgb(var(--muted))] max-w-sm" style={{ opacity: 0.5 }}>
              Built on Recharts, themed with the same color and line tokens as every other component.
            </p>
            <CodeBlock code={code} />
          </div>

          <InfoSection
            install="npx shadcn@latest add chart"
            manualSteps={manualSteps}
            deps={[{ name: "Recharts", href: "https://recharts.org" }]}
            usage={[
              "ChartContainer wraps a Recharts chart and provides theming through a ChartConfig, mapping each data key to a label and color.",
              "Use ChartTooltipContent for a themed tooltip that reads colors and labels from the same config, instead of styling Recharts' default tooltip by hand.",
            ]}
          />

          <ExamplesSection examples={examples} />
        </div>
      </section>
    </>
  );
}
