import { cn } from "@/lib/utils";

// The page's visible structure: two hairline rails down the content column
// for the whole page, splitting into rounded cells at every section boundary
// (see FrameRule). Rails sit just outside the sections' own padding: at the
// column edge on wide screens, 12px in from the viewport below that, where
// the column runs edge to edge.
export const FRAME_INSET = "inset-x-0 sm:inset-x-3 xl:inset-x-0";
export const FRAME_TONES = {
  light: { line: "rgb(var(--ink-rgb) / 0.09)", paper: "var(--paper)" },
  // The homepage's lower panel, which follows the theme: lines in its own ink.
  dark: { line: "rgb(var(--fg) / 0.09)", paper: "rgb(var(--bg))" },
} as const;
export type FrameTone = keyof typeof FRAME_TONES;
// The homepage's light card scales down as it pulls away from the dark zone,
// and sets --frame-unscale to the inverse so the frame's lines keep their
// width and stay on the dark zone's rails. The column is centred on the card,
// so scaling about the centre lands them exactly. 1 everywhere else.
const UNSCALE = { transform: "scaleX(var(--frame-unscale, 1))" } as const;

export function FrameRails({ tone }: { tone: FrameTone }) {
  const t = FRAME_TONES[tone];
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-y-0", FRAME_INSET)} style={UNSCALE}>
      <div className="absolute inset-y-0 left-0 w-px" style={{ background: t.line }} />
      <div className="absolute inset-y-0 right-0 w-px" style={{ background: t.line }} />
    </div>
  );
}

// A section boundary: the gap between two sections, where the frame splits
// into two rounded cells: the section above closes with rounded bottom
// corners, the one below opens with rounded top corners, and a narrow gap
// runs between them. Paper masks hide the straight rails behind the curves
// and the gap. Takes the place of the plain spacer divs.
const CELL_RADIUS = 14;
const CELL_GAP = 10;
// How far a boundary reaches below its own line: the gap's lower half and
// the next cell's rounded top. The pinned header extends its fill this far.
export const FRAME_RULE_OVERHANG = CELL_RADIUS + CELL_GAP / 2;
export const FRAME_CELL_GAP = CELL_GAP;

// `inset` places the rails it meets, FRAME_INSET by default; a sheet with
// its own border passes where that border sits instead. `solidGap` fills the
// gap and the corners outside both cells with paper, for a boundary that
// content scrolls under (the pinned header's), so nothing shows between the
// cells.
export function FrameRule({
  tone,
  className = "py-16 sm:py-24",
  inset = FRAME_INSET,
  solidGap = false,
}: {
  tone: FrameTone;
  className?: string;
  inset?: string;
  solidGap?: boolean;
}) {
  const t = FRAME_TONES[tone];
  // A paper square in one corner with the cell's quarter circle cut out of
  // it, so only the area outside the rounded corner is filled.
  const corner = (side: "left" | "right", half: "top" | "bottom") => {
    const at = `${side === "left" ? "100%" : "0%"} ${half === "top" ? "0%" : "100%"}`;
    const cut = `radial-gradient(circle ${CELL_RADIUS}px at ${at}, transparent ${CELL_RADIUS - 0.5}px, black ${CELL_RADIUS + 0.5}px)`;
    return (
      <span
        className="absolute"
        style={{
          [side]: 0,
          [half === "top" ? "bottom" : "top"]: CELL_GAP / 2,
          width: CELL_RADIUS,
          height: CELL_RADIUS,
          background: t.paper,
          WebkitMaskImage: cut,
          maskImage: cut,
        }}
      />
    );
  };
  const mask = (side: "left" | "right") => (
    <span
      className="absolute w-[5px]"
      style={{ [side]: -2, top: -(CELL_RADIUS + CELL_GAP / 2), height: CELL_RADIUS * 2 + CELL_GAP, background: t.paper }}
    />
  );
  return (
    <div aria-hidden="true" className={cn("relative", className)}>
      <div className={cn("absolute top-1/2 h-0", inset)} style={UNSCALE}>
        {mask("left")}
        {mask("right")}
        {solidGap && (
          <>
            <span className="absolute -inset-x-[2px]" style={{ top: -CELL_GAP / 2, height: CELL_GAP, background: t.paper }} />
            {corner("left", "top")}
            {corner("right", "top")}
            {corner("left", "bottom")}
            {corner("right", "bottom")}
          </>
        )}
        <span
          className="absolute inset-x-0 border-x border-b"
          style={{ bottom: CELL_GAP / 2, height: CELL_RADIUS, borderColor: t.line, borderRadius: `0 0 ${CELL_RADIUS}px ${CELL_RADIUS}px` }}
        />
        <span
          className="absolute inset-x-0 border-x border-t"
          style={{ top: CELL_GAP / 2, height: CELL_RADIUS, borderColor: t.line, borderRadius: `${CELL_RADIUS}px ${CELL_RADIUS}px 0 0` }}
        />
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
