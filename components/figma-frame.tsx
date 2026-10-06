import type React from "react";
import { cn } from "@/lib/utils";

// Figma's own selection blue, so the affordance reads as the tool it's
// quoting rather than as a brand accent.
export const SELECTION_FRAME_COLOR = "#6bb8ef";
// The same blue at low alpha, the way Figma tints a selected layer.
export const SELECTION_FILL = "rgb(107 184 239 / 0.08)";
// 1px rail for grids built inside a frame.
export const SELECTION_RAIL = `1px solid ${SELECTION_FRAME_COLOR}`;

// Static Figma-style frame: a 1px stroke with square handles on each corner,
// the same chrome as the homepage hero's "design" selection without its
// draw-in or resize animation.
export function FigmaSelectionFrame({
  children,
  className,
  frameRef,
  style,
  strokeColor = SELECTION_FRAME_COLOR,
  handleFill = "var(--paper)",
}: {
  children: React.ReactNode;
  className?: string;
  frameRef?: React.Ref<HTMLDivElement>;
  style?: React.CSSProperties;
  strokeColor?: string;
  handleFill?: string;
}) {
  const color = strokeColor;
  const HANDLE = 5;
  const corners = [
    { top: -HANDLE / 2, left: -HANDLE / 2 },
    { top: -HANDLE / 2, right: -HANDLE / 2 },
    { bottom: -HANDLE / 2, right: -HANDLE / 2 },
    { bottom: -HANDLE / 2, left: -HANDLE / 2 },
  ] as const;

  return (
    <div
      ref={frameRef}
      className={cn("relative w-full", className)}
      style={{ border: `1px solid ${color}`, ...style }}
    >
      {children}
      {corners.map((pos, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            position: "absolute",
            width: HANDLE,
            height: HANDLE,
            background: handleFill,
            border: `1px solid ${color}`,
            pointerEvents: "none",
            zIndex: 2,
            ...pos,
          }}
        />
      ))}
    </div>
  );
}
