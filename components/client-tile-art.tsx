import type { ReactNode } from "react";
import { Box, LineBoard } from "@/components/line-art";

// The homepage's "In good company" tiles, in the hero staircase's line style
// (components/line-art.tsx): each client is a solid block on the tile with
// its logo printed on the front face. Three proportions take turns down the
// grid so the row has some rhythm. `open` draws the faint, empty block that
// stands for the next client.

type Face = { x: number; y: number; w: number; h: number };

// All stand on the same ground (y 240) on the 400x300 board.
const SHAPES: Face[] = [
  { x: 110, y: 104, w: 180, h: 136 },
  { x: 128, y: 84, w: 144, h: 156 },
  { x: 96, y: 128, w: 208, h: 112 },
];

const pct = (n: number, of: number) => `${(n / of) * 100}%`;

export function ClientTileArt({ index, open, children }: { index: number; open?: boolean; children?: ReactNode }) {
  const f = SHAPES[index % SHAPES.length];
  return (
    <div className="relative h-full w-full">
      <LineBoard>
        <Box {...f} d={0.18} light={open} />
      </LineBoard>
      {/* The logo, laid over the block's front face. */}
      <div
        className="absolute flex items-center justify-center"
        style={{ left: pct(f.x, 400), top: pct(f.y, 300), width: pct(f.w, 400), height: pct(f.h, 300) }}
      >
        {children}
      </div>
    </div>
  );
}
