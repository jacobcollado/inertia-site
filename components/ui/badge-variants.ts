import { cva } from "class-variance-authority"

export const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent w-fit whitespace-nowrap shrink-0 gap-1 [&_svg]:pointer-events-none [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-[rgb(var(--fg)/0.06)] text-[rgb(var(--fg))]",
        outline: "border-[rgb(var(--line))] text-[rgb(var(--muted))]",
        stat: "border-[rgb(var(--fg)/0.12)] bg-[rgb(var(--fg)/0.07)] text-[rgb(var(--muted))]",
      },
      size: {
        default: "px-3 py-1.5 text-[12px] tracking-tight",
        sm: "px-2 pt-[2px] pb-[3px] text-[10px] tracking-tight",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)
