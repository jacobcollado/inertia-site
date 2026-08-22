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

export const CTA_SHELL_HEIGHT_CLASS = "h-10 sm:h-11";

export const CTA_HEADER_SHELL_HEIGHT_CLASS = "h-9 sm:h-11";

export const CTA_PILL_CLASS =
  "relative inline-flex items-center overflow-hidden rounded-[6px] px-5 py-1.5 sm:px-6 sm:py-1.5 text-[16px] sm:text-[17px] tracking-tight leading-none " +
  CTA_SHELL_HEIGHT_CLASS;

export const CTA_HEADER_PILL_CLASS =
  "relative inline-flex items-center overflow-hidden rounded-[6px] px-4 py-1 sm:px-6 sm:py-1.5 text-[14px] sm:text-[17px] font-normal tracking-tight leading-none " +
  CTA_HEADER_SHELL_HEIGHT_CLASS;

export const CTA_WELL_CLASS =
  "relative flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full shrink-0 overflow-hidden";

export const CTA_HEADER_WELL_CLASS =
  "relative flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full shrink-0 overflow-hidden";

export const CTA_WELL_ICON_CLASS = "relative block h-3.5 w-3.5 sm:h-4 sm:w-4";

export const CTA_HEADER_WELL_ICON_CLASS = "relative block h-3 w-3 sm:h-3.5 sm:w-3.5";

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
