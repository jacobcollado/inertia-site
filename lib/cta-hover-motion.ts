import type { MouseEvent } from "react";

export const CTA_SCALE_SPRING = "transform 420ms cubic-bezier(0.34, 1.45, 0.64, 1)";
export const CTA_SCALE_RESET = "transform 520ms cubic-bezier(0.34, 1.15, 0.64, 1)";
export const CTA_SCALE_PRESS = "transform 120ms cubic-bezier(0.22, 1, 0.36, 1)";

type ScaleTarget = "self" | "parent";

function getScaleEl(e: MouseEvent<HTMLElement>, target: ScaleTarget) {
  return target === "parent" ? e.currentTarget.parentElement : e.currentTarget;
}

export function createCtaScaleHoverHandlers(target: ScaleTarget = "self") {
  return {
    onMouseEnter(e: MouseEvent<HTMLElement>) {
      const el = getScaleEl(e, target);
      if (!el) return;
      el.style.transition = CTA_SCALE_SPRING;
      el.style.transform = "scale(1.035)";
    },
    onMouseLeave(e: MouseEvent<HTMLElement>) {
      const el = getScaleEl(e, target);
      if (!el) return;
      el.style.transition = CTA_SCALE_RESET;
      el.style.transform = "scale(1)";
    },
    onMouseDown(e: MouseEvent<HTMLElement>) {
      const el = getScaleEl(e, target);
      if (!el) return;
      el.style.transition = CTA_SCALE_PRESS;
      el.style.transform = "scale(0.975)";
    },
    onMouseUp(e: MouseEvent<HTMLElement>) {
      const el = getScaleEl(e, target);
      if (!el) return;
      el.style.transition = CTA_SCALE_SPRING;
      el.style.transform = "scale(1.035)";
    },
  };
}

export const ctaScaleHoverOnSelf = createCtaScaleHoverHandlers("self");
export const ctaScaleHoverOnParent = createCtaScaleHoverHandlers("parent");
