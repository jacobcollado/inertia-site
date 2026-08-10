export const AETHER_LIQUID_MS = 680;
export const AETHER_LIQUID_EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";

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
