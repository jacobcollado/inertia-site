import { cn } from "@/lib/utils";

// The page's visible structure: two hairline rails down
// the content column for the whole page, and a hairline across it at every
// section boundary with square handles where they cross (the same handles
// as the framed section headings). Rails sit just outside the sections'
// own padding: at the column edge on wide screens, 12px in from the
// viewport below that, where the column runs edge to edge.
export const FRAME_INSET = "inset-x-0 sm:inset-x-3 xl:inset-x-0";
export const FRAME_TONES = {
  light: { line: "rgb(var(--ink-rgb) / 0.09)", handle: "rgb(var(--ink-rgb) / 0.28)", paper: "var(--paper)" },
  // The homepage's lower panel, which follows the theme: lines in its own ink.
  dark: { line: "rgb(var(--fg) / 0.09)", handle: "rgb(var(--fg) / 0.3)", paper: "rgb(var(--bg))" },
} as const;
export type FrameTone = keyof typeof FRAME_TONES;

export function FrameRails({ tone }: { tone: FrameTone }) {
  const t = FRAME_TONES[tone];
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-y-0", FRAME_INSET)}>
      <div className="absolute inset-y-0 left-0 w-px" style={{ background: t.line }} />
      <div className="absolute inset-y-0 right-0 w-px" style={{ background: t.line }} />
    </div>
  );
}

// A section boundary: the gap between two sections, with the rule through
// its middle. Takes the place of the plain spacer divs.
export function FrameRule({ tone, className = "py-16 sm:py-24" }: { tone: FrameTone; className?: string }) {
  const t = FRAME_TONES[tone];
  const handle = (side: "left" | "right") => (
    <span
      className="absolute top-1/2 size-[7px] -translate-y-1/2"
      style={{ [side]: -3, background: t.paper, boxShadow: `inset 0 0 0 1px ${t.handle}` }}
    />
  );
  return (
    <div aria-hidden="true" className={cn("relative", className)}>
      <div className={cn("absolute top-1/2 h-px", FRAME_INSET)} style={{ background: t.line }}>
        {handle("left")}
        {handle("right")}
      </div>
    </div>
  );
}

// The rails alone, for a full-width band (the header, the card backdrop):
// centred on the same 80rem column as the page content.
export function FrameColumnRails({ tone, className }: { tone: FrameTone; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0", className)}>
      <div className="relative mx-auto h-full w-full max-w-[80rem]">
        <FrameRails tone={tone} />
      </div>
    </div>
  );
}
