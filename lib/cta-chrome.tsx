// Site-wide rule: action buttons (CTAs, submits, primary/secondary links that
// behave as buttons) use a 6px radius. Not pills, not the theme's rounded-lg.
// Import this rather than hardcoding, so the value stays in one place.
export const ACTION_RADIUS_PX = 6;
export const ACTION_RADIUS_CLASS = "rounded-[6px]";

export const CTA_FILL = "#000000";

export const CTA_INSET_SHADOW = "none";

export const CTA_OUTER_SHADOW = "none";

export const CTA_WELL_BG = "transparent";

export const CTA_WELL_SHADOW = "none";

export const CTA_SHELL_HEIGHT_CLASS = "h-10 sm:h-12";

export const CTA_HEADER_SHELL_HEIGHT_CLASS = "h-9 sm:h-12";

export const CTA_PILL_CLASS =
  "relative inline-flex items-center overflow-hidden rounded-[6px] px-3 py-1 sm:px-4 sm:py-1.5 text-[16px] sm:text-[19px] tracking-tight leading-none " +
  CTA_SHELL_HEIGHT_CLASS;

export const CTA_HEADER_PILL_CLASS =
  "relative inline-flex items-center overflow-hidden rounded-[6px] px-3 py-1 sm:px-4 sm:py-1.5 text-[14px] sm:text-[18px] font-normal tracking-tight leading-none " +
  CTA_HEADER_SHELL_HEIGHT_CLASS;

// Icons inside CTA wells scale from shell height (h-9 / sm:h-12) via calc —
// not % on SVGs (collapses) and not em without an explicit shell width.
/** Well diameter ÷ shell height (0.58 × 2.25rem / 3rem). */
export const CTA_WELL_IN_SHELL_RATIO = 0.58;
/** Icon diameter ÷ well diameter. */
export const CTA_WELL_ICON_IN_WELL_RATIO = 0.68;

export const CTA_HEADER_SIGNIN_SHELL_CLASS =
  "relative z-[1] inline-flex size-9 shrink-0 items-center justify-center overflow-hidden sm:size-12";

export const CTA_WELL_CLASS =
  "relative z-[1] inline-flex size-[calc(2.25rem*0.58)] shrink-0 items-center justify-center overflow-hidden rounded-full sm:size-[calc(3rem*0.58)]";

export const CTA_HEADER_WELL_CLASS = CTA_WELL_CLASS;

export const CTA_WELL_ICON_CLASS =
  "relative z-[1] block size-[calc(2.25rem*0.58*0.68)] shrink-0 sm:size-[calc(3rem*0.58*0.68)]";

export const CTA_HEADER_WELL_ICON_CLASS = CTA_WELL_ICON_CLASS;

export function CtaGrain() {
  return null;
}

export function CtaWellSpecular() {
  return null;
}

export function CtaWell({
  children,
  className = CTA_WELL_CLASS,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={className}>{children}</span>;
}
