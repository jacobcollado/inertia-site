"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { Overview, Client } from "./data";

function fmt$(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
}

function ChangeBadge({ pct }: { pct: number | null }) {
  if (pct === null) return null;
  const up = pct >= 0;
  return (
    <Badge
      variant="outline"
      className={
        up
          ? "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "border-transparent bg-red-500/10 text-red-600 dark:text-red-400"
      }
    >
      {up ? <TrendingUpIcon className="!size-2" /> : <TrendingDownIcon className="!size-2" />}
      {up ? "+" : ""}{pct}%
    </Badge>
  );
}

function TrendInsight({ pct, label }: { pct: number | null; label: string }) {
  if (pct === null) {
    return <div className="flex items-center gap-1.5 font-medium">Not enough data yet</div>;
  }
  const up = pct >= 0;
  return (
    <div className="flex items-center gap-1.5 font-medium">
      {up ? "Trending up" : "Trending down"} this month
      {up ? <TrendingUpIcon className="size-4 text-emerald-600 dark:text-emerald-400" /> : <TrendingDownIcon className="size-4 text-red-600 dark:text-red-400" />}
      <span className="sr-only">{label}</span>
    </div>
  );
}

const revenueChartConfig = {
  amount: { label: "Revenue", color: "var(--sh-primary)" },
} satisfies ChartConfig;

const clientsChartConfig = {
  amount: { label: "New clients", color: "var(--sh-chart-2)" },
} satisfies ChartConfig;

function MiniAreaChart({
  data,
  config,
  gradientId,
  formatter,
}: {
  data: { month: string; amount: number }[];
  config: ChartConfig;
  gradientId: string;
  formatter: (v: number) => string;
}) {
  const color = "var(--color-amount)";
  return (
    <ChartContainer config={config} className="aspect-auto h-20 w-full overflow-visible">
      <AreaChart data={data} margin={{ top: 6, right: 2, left: 2, bottom: 4 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <YAxis hide domain={([min, max]: readonly [number, number]) => {
          if (min === max) return [Math.max(0, min - 1), max + 1];
          const pad = (max - min) * 0.15;
          return [Math.max(0, min - pad), max + pad];
        }} />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent formatter={(value) => formatter(value as number)} indicator="dot" />}
        />
        <Area dataKey="amount" type="monotone" fill={`url(#${gradientId})`} stroke={color} strokeWidth={2} />
      </AreaChart>
    </ChartContainer>
  );
}

type ClientRange = "90d" | "30d" | "7d";

const RANGE_DAYS: Record<ClientRange, number> = { "90d": 90, "30d": 30, "7d": 7 };

function bucketDailyClients(daily: { date: string; amount: number }[], range: ClientRange) {
  const days = RANGE_DAYS[range];
  const slice = daily.slice(-days);

  if (range === "7d") {
    return slice.map(d => ({
      label: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      amount: d.amount,
    }));
  }

  // Bucket by week for 30d/90d so the chart isn't a spiky daily series
  const buckets = new Map<string, { label: string; amount: number; sortKey: string }>();
  for (const d of slice) {
    const date = new Date(d.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    const label = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const existing = buckets.get(key);
    if (existing) existing.amount += d.amount;
    else buckets.set(key, { label, amount: d.amount, sortKey: key });
  }
  return Array.from(buckets.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}

const RANGE_LABELS: Record<ClientRange, string> = {
  "90d": "Last 3 months",
  "30d": "Last 30 days",
  "7d": "Last 7 days",
};

function ClientsCard({ overview }: { overview: Overview }) {
  const [range, setRange] = useState<ClientRange>("90d");
  const hasClientChart = overview.monthlyClients.some(d => d.amount > 0);
  const color = "var(--color-amount)";
  const gradientId = "fillOverviewClientsFull";
  const data = useMemo(() => bucketDailyClients(overview.dailyClients, range), [overview.dailyClients, range]);

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardDescription>Clients</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums">
          {overview.totalClients}
        </CardTitle>
        <CardAction>
          <ToggleGroup
            multiple={false}
            value={[range]}
            onValueChange={(value) => setRange((value[0] as ClientRange) ?? "90d")}
            variant="outline"
          >
            {(Object.keys(RANGE_LABELS) as ClientRange[]).map((r) => (
              <ToggleGroupItem
                key={r}
                value={r}
                className="data-[state=on]:bg-primary data-[state=on]:text-white"
              >
                {RANGE_LABELS[r]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      {hasClientChart ? (
        <ChartContainer config={clientsChartConfig} className="aspect-auto h-52 w-full overflow-visible px-6">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <YAxis hide domain={([min, max]: readonly [number, number]) => {
              if (min === max) return [Math.max(0, min - 1), max + 1];
              const pad = (max - min) * 0.15;
              return [Math.max(0, min - pad), max + pad];
            }} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} className="text-xs" />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent formatter={(value) => `${value} new`} indicator="dot" />}
            />
            <Area dataKey="amount" type="monotone" fill={`url(#${gradientId})`} stroke={color} strokeWidth={2} />
          </AreaChart>
        </ChartContainer>
      ) : (
        <CardFooter className="border-0 bg-transparent p-0 px-6">
          <div className="flex h-52 w-full items-center text-xs text-muted-foreground">No growth yet</div>
        </CardFooter>
      )}
    </Card>
  );
}

export function OverviewCards({ overview, clients }: { overview: Overview; clients: Client[] }) {
  const suspended = clients.filter(c => c.banned).length;
  const totalProjects = clients.reduce((s, c) => s + c.projects.length, 0);
  const outstandingUp = overview.outstanding > 0;
  const hasRevChart = overview.monthlyRevenue.some(d => d.amount > 0);
  const hasClientChart = overview.monthlyClients.some(d => d.amount > 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="gap-4">
          <CardHeader>
            <CardDescription>Revenue collected</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {fmt$(overview.totalRevenue)}
            </CardTitle>
            <CardAction>
              <ChangeBadge pct={overview.change.revenue} />
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 border-0 bg-transparent p-0 px-6 text-sm">
            <TrendInsight pct={overview.change.revenue} label="Revenue for the last 6 months" />
            {hasRevChart ? (
              <MiniAreaChart
                data={overview.monthlyRevenue}
                config={revenueChartConfig}
                gradientId="fillOverviewRevenueMini"
                formatter={fmt$}
              />
            ) : (
              <div className="flex h-20 w-full items-center text-xs text-muted-foreground">No revenue yet</div>
            )}
          </CardFooter>
        </Card>

        <Card className="gap-4">
          <CardHeader>
            <CardDescription>Outstanding</CardDescription>
            <CardTitle className={`text-2xl font-semibold tabular-nums ${outstandingUp ? "text-amber-500" : ""}`}>
              {fmt$(overview.outstanding)}
            </CardTitle>
            <CardAction>
              <ChangeBadge pct={overview.change.outstanding} />
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <TrendInsight pct={overview.change.outstanding} label="Outstanding balance for the last 6 months" />
            <div className="text-muted-foreground">{fmt$(overview.totalRevenue)} collected</div>
            <div className={outstandingUp ? "text-amber-500" : "text-muted-foreground"}>{fmt$(overview.outstanding)} owed</div>
          </CardFooter>
        </Card>

        <Card className="gap-4">
          <CardHeader>
            <CardDescription>Growth rate</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {overview.change.clients === null ? "—" : `${overview.change.clients >= 0 ? "+" : ""}${overview.change.clients}%`}
            </CardTitle>
            <CardAction>
              <ChangeBadge pct={overview.change.clients} />
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <TrendInsight pct={overview.change.clients} label="Clients for the last 6 months" />
            <div className="text-muted-foreground">{overview.totalClients} total clients</div>
            <div className="text-muted-foreground">vs. previous 30 days</div>
          </CardFooter>
        </Card>

        <Card className="gap-4">
          <CardHeader>
            <CardDescription>Active projects</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {overview.activeProjects}
            </CardTitle>
            <CardAction>
              <ChangeBadge pct={overview.change.activeProjects} />
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <TrendInsight pct={overview.change.activeProjects} label="Active projects for the last 6 months" />
            <div className="text-muted-foreground">{overview.activeProjects} of {totalProjects} total</div>
            <div className="text-muted-foreground">
              {overview.totalClients - suspended} active clients
              {suspended > 0 && <span className="text-destructive">, {suspended} suspended</span>}
            </div>
          </CardFooter>
        </Card>
      </div>

      <ClientsCard overview={overview} />

      {overview.recentActivity.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-[12px] font-medium tracking-tight text-muted-foreground px-1">Recent activity</span>
          <Card className="overflow-hidden py-0">
            {overview.recentActivity.map((item, i) => (
              <Link
                key={i}
                href={`/admin/clients/${item.clientId}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted/50 transition-colors"
                style={{ borderBottom: i < overview.recentActivity.length - 1 ? "1px solid var(--sh-border)" : "none" }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Badge
                    variant="outline"
                    className={
                      item.type === "invoice"
                        ? "capitalize shrink-0 border-transparent bg-primary text-white"
                        : "capitalize shrink-0 border-transparent bg-emerald-600 text-white"
                    }
                  >
                    {item.type}
                  </Badge>
                  <span className="text-[15px] tracking-tight truncate">{item.label}</span>
                  <span className="text-[13px] tracking-tight text-muted-foreground truncate hidden sm:block">{item.clientName}</span>
                </div>
                <span className="text-[13px] tracking-tight text-muted-foreground shrink-0">{item.date}</span>
              </Link>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
