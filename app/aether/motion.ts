export const AETHER_LIQUID_MS = 680;
export const AETHER_LIQUID_EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";

function bezierPoint(t: number, a: number, b: number, c: number, d: number) {
  const ab = a + (b - a) * t;
  const bc = b + (c - b) * t;
  const cd = c + (d - c) * t;
  const abbc = ab + (bc - ab) * t;
  const bccd = bc + (cd - bc) * t;
  return abbc + (bccd - abbc) * t;
}

function solveBezierX(x: number, p1x: number, p2x: number) {
  let start = 0;
  let end = 1;
  for (let i = 0; i < 12; i++) {
    const mid = (start + end) / 2;
    if (bezierPoint(mid, 0, p1x, p2x, 1) < x) start = mid;
    else end = mid;
  }
  return (start + end) / 2;
}

/** Progress 0–1 through the liquid easing curve. */
export function easeLiquid(t: number) {
  const u = solveBezierX(t, 0.22, 0.36);
  return bezierPoint(u, 0, 0.61, 1, 1);
}

export function aetherLiquidReveal(
  visible: boolean,
  delay = 0,
  opts?: { blur?: number; scaleFrom?: number },
) {
  const blur = opts?.blur ?? 10;
  const scaleFrom = opts?.scaleFrom ?? 0.992;
  return {
    willChange: "opacity, transform, filter" as const,
    opacity: visible ? 1 : 0,
    transform: visible ? "scale(1)" : `scale(${scaleFrom})`,
    filter: visible ? "blur(0px)" : `blur(${blur}px)`,
    transition: [
      `opacity ${AETHER_LIQUID_MS}ms ${AETHER_LIQUID_EASE} ${delay}ms`,
      `transform ${AETHER_LIQUID_MS}ms ${AETHER_LIQUID_EASE} ${delay}ms`,
      `filter ${AETHER_LIQUID_MS}ms ${AETHER_LIQUID_EASE} ${delay}ms`,
    ].join(", "),
  };
}

export function aetherLiquidTransition(stagger = 0) {
  return [
    `opacity ${AETHER_LIQUID_MS}ms ${AETHER_LIQUID_EASE} ${stagger}ms`,
    `transform ${AETHER_LIQUID_MS}ms ${AETHER_LIQUID_EASE} ${stagger}ms`,
    `filter ${AETHER_LIQUID_MS}ms ${AETHER_LIQUID_EASE} ${stagger}ms`,
  ].join(", ");
}
