"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode
    color?: string
  }
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

function ChartContainer({
  config,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"]
}) {
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-[rgb(var(--muted))] [&_.recharts-cartesian-axis-tick_text]:opacity-60",
          "[&_.recharts-cartesian-grid_line]:stroke-[rgb(var(--line))]",
          "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-[rgb(var(--line))]",
          "[&_.recharts-dot]:stroke-transparent",
          "aspect-video w-full text-[12px]",
          className
        )}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

type ChartTooltipPayloadItem = {
  dataKey?: string | number
  name?: string | number
  value?: string | number
  color?: string
}

function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  indicator = "line",
  hideLabel = false,
}: {
  active?: boolean
  payload?: ChartTooltipPayloadItem[]
  label?: React.ReactNode
  className?: string
  indicator?: "line" | "dot"
  hideLabel?: boolean
}) {
  const { config } = useChart()

  if (!active || !payload?.length) return null

  return (
    <div
      className={cn(
        "min-w-[10rem] rounded-lg border border-[rgb(var(--line))] px-3 py-2 text-[12px] shadow-sm",
        className
      )}
      style={{ background: "rgb(var(--surface))" }}
    >
      {!hideLabel && label != null && (
        <p className="mb-1.5 font-medium tracking-tight text-[rgb(var(--fg))]">{label}</p>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((item, i) => {
          const key = String(item.dataKey)
          const itemConfig = config[key]
          const color = item.color ?? itemConfig?.color

          return (
            <div key={i} className="flex items-center gap-2">
              <span
                className={cn(
                  "shrink-0 rounded-[2px]",
                  indicator === "dot" ? "size-2 rounded-full" : "h-[2px] w-3"
                )}
                style={{ background: color }}
              />
              <span className="text-[rgb(var(--muted))]" style={{ opacity: 0.7 }}>
                {itemConfig?.label ?? key}
              </span>
              <span className="ml-auto font-medium tabular-nums text-[rgb(var(--fg))]">
                {item.value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, useChart }
