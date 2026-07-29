"use client";

import { useMemo } from "react";
import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";
import type { YAxisTickContentProps } from "recharts/types/util/types";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { fmt$, type Invoice } from "../types";

const chartConfig = { amount: { label: "Amount" } } satisfies ChartConfig;

const STATUS_FILL: Record<string, string> = {
  paid: "#10b981",
  pending: "#f59e0b",
  overdue: "var(--sh-destructive)",
  draft: "var(--sh-muted-foreground)",
};

function StatusTick({ x, y, payload, data }: YAxisTickContentProps & { data: { name: string; overdue: boolean }[] }) {
  const value = String(payload.value);
  const row = data.find(d => d.name === value);
  const label = value.length > 14 ? `${value.slice(0, 14)}…` : value;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={-8} y={0} dy={4} textAnchor="end" className="fill-muted-foreground text-xs">
        {label}
      </text>
      {row?.overdue && <circle cx={-8 - (label.length * 5.5) - 8} cy={0} r={3} className="fill-destructive" />}
    </g>
  );
}

export function InvoiceChart({ invoices }: { invoices: Invoice[] }) {
  const data = useMemo(
    () =>
      [...invoices]
        .sort((a, b) => a.amount - b.amount)
        .map(inv => ({
          name: inv.label,
          amount: inv.amount / 100,
          status: inv.status,
          overdue: inv.status === "overdue",
        })),
    [invoices]
  );

  return (
    <ChartContainer config={chartConfig} className="aspect-auto w-full" style={{ height: Math.max(data.length * 40, 60) }}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }} barCategoryGap={10}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          tickLine={false}
          axisLine={false}
          width={130}
          className="text-xs"
          tick={(props: YAxisTickContentProps) => <StatusTick {...props} data={data} />}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(value, _name, item) => (
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-foreground">{fmt$((value as number) * 100)}</span>
                  <span className="text-muted-foreground capitalize">{item.payload.status}</span>
                </div>
              )}
            />
          }
        />
        <Bar dataKey="amount" radius={4} isAnimationActive={false}>
          {data.map((d, i) => (
            <Cell key={i} fill={STATUS_FILL[d.status] ?? "var(--sh-muted-foreground)"} fillOpacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
