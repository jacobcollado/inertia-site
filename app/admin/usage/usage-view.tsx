"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { AiUsage } from "../data";

function fmt$(cents: number) {
  if (cents < 100) return `$${(cents / 100).toFixed(2)}`;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(cents / 100);
}

const dayFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

const chartConfig = {
  sonnetCents: { label: "Sonnet 5", color: "var(--sh-chart-1)" },
  haikuCents: { label: "Haiku 4.5", color: "var(--sh-chart-2)" },
} satisfies ChartConfig;

// Legend uses the actual Claude logo instead of the usual color-swatch dots
// — this dashboard tracks Anthropic API spend specifically, so identifying
// the provider visually is more useful here than in a generic chart.
function ClaudeLegend() {
  return (
    <div className="flex items-center gap-4 px-5">
      <div className="flex items-center gap-1.5">
        <img src="/claude-logo.svg" alt="" className="size-4 rounded-full" style={{ opacity: 1 }} />
        <span className="text-[13px] text-muted-foreground">Sonnet 5</span>
        <span className="size-2 rounded-full ml-1" style={{ background: "var(--sh-chart-1)" }} />
      </div>
      <div className="flex items-center gap-1.5">
        <img src="/claude-logo.svg" alt="" className="size-4 rounded-full" style={{ opacity: 0.55 }} />
        <span className="text-[13px] text-muted-foreground">Haiku 4.5</span>
        <span className="size-2 rounded-full ml-1" style={{ background: "var(--sh-chart-2)" }} />
      </div>
    </div>
  );
}

function SummaryTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-md border bg-sidebar px-4 py-3.5 sm:rounded-sm">
      <span className="text-[13px] tracking-tight text-muted-foreground">{label}</span>
      <span className="text-xl font-semibold tabular-nums text-foreground">{value}</span>
      {sub && <span className="text-[12px] text-muted-foreground">{sub}</span>}
    </div>
  );
}

export function UsageView({ usage }: { usage: AiUsage }) {
  const hasData = usage.totalCalls > 0;
  const data = usage.daily.map(d => ({ ...d, label: dayFmt.format(new Date(d.date)) }));

  return (
    <div className="flex flex-col gap-4 w-full lg:max-w-[58%] mx-auto">
      <div className="inline-flex items-center gap-2 self-start rounded-full border bg-sidebar py-1.5 pl-1.5 pr-4">
        <img src="/claude-logo.svg" alt="Claude" className="size-6 rounded-full" />
        <h2 className="text-[15px] font-semibold tracking-tight text-foreground">Usage</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryTile label="Total cost" value={fmt$(usage.totalCostCents)} sub="Last 30 days" />
        <SummaryTile label="API calls" value={usage.totalCalls.toLocaleString()} />
        <SummaryTile label="Input tokens" value={usage.totalInputTokens.toLocaleString()} />
        <SummaryTile label="Output tokens" value={usage.totalOutputTokens.toLocaleString()} />
      </div>

      <div className="rounded-md border bg-sidebar sm:rounded-sm overflow-hidden">
        <div className="px-5 pt-4 pb-3 flex flex-col gap-0.5">
          <span className="text-[13px] tracking-tight text-muted-foreground">Daily cost by model</span>
          <span className="text-xl font-semibold tabular-nums text-foreground">{fmt$(usage.totalCostCents)}</span>
        </div>
        <ClaudeLegend />
        {hasData ? (
          <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full overflow-visible px-5 pb-4 pt-2 select-none [&_.recharts-wrapper]:!cursor-crosshair [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none [&_*]:focus:outline-none">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
              <defs>
                <linearGradient id="sonnetFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--sh-chart-1)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--sh-chart-1)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="haikuFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--sh-chart-2)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--sh-chart-2)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--sh-border)" strokeDasharray="4 4" />
              <YAxis hide />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} className="text-xs" interval="preserveStartEnd" />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent formatter={(value) => fmt$(value as number)} indicator="dot" />}
              />
              <Area dataKey="sonnetCents" type="monotone" stackId="cost" fill="url(#sonnetFill)" stroke="var(--sh-chart-1)" strokeWidth={2} />
              <Area dataKey="haikuCents" type="monotone" stackId="cost" fill="url(#haikuFill)" stroke="var(--sh-chart-2)" strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex h-64 w-full items-center justify-center text-sm text-muted-foreground">
            No API usage logged yet.
          </div>
        )}
      </div>

      {usage.byFeature.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[12px] font-medium tracking-tight text-muted-foreground px-1">By feature</p>
          <div className="flex flex-col gap-3 sm:gap-0 sm:rounded-sm sm:border sm:bg-sidebar sm:overflow-hidden">
            {usage.byFeature.map((f, i) => (
              <div
                key={f.feature}
                className={`flex items-center justify-between gap-4 rounded-md border bg-sidebar px-5 py-3 sm:rounded-none sm:border-0 sm:border-b ${i === usage.byFeature.length - 1 ? "sm:border-b-0" : ""}`}
              >
                <span className="text-[14px] tracking-tight">{f.feature}</span>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-[13px] text-muted-foreground tabular-nums">{f.calls} calls</span>
                  <span className="text-[14px] font-medium tabular-nums">{fmt$(f.costCents)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
