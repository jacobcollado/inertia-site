export const CTA_FILL =
  "linear-gradient(180deg, #242424 0%, #000000 52%, #080808 100%)";

export const CTA_INSET_SHADOW =
  "inset 0 1px 0 rgba(255,255,255,0.18)," +
  "inset 0 -1.5px 0 rgba(0,0,0,0.55)";

export const CTA_OUTER_SHADOW =
  "0 2px 4px rgba(0,0,0,0.32)," +
  "0 10px 28px rgba(0,0,0,0.24)," +
  "0 24px 56px -10px rgba(0,0,0,0.20)";

export const CTA_WELL_BG =
  "radial-gradient(130% 90% at 50% 0%, rgba(0,0,0,0.55) 0%, transparent 52%)," +
  "radial-gradient(90% 70% at 50% 110%, rgba(255,255,255,0.08) 0%, transparent 65%)," +
  "rgba(0,0,0,0.38)";

export const CTA_WELL_SHADOW =
  "inset 0 2.5px 4px rgba(0,0,0,0.65)," +
  "inset 0 -1px 2px rgba(255,255,255,0.1)," +
  "inset 0 0 0 0.5px rgba(255,255,255,0.06)," +
  "0 1px 2px rgba(0,0,0,0.14)";

export const CTA_SHELL_HEIGHT_CLASS = "h-10 sm:h-11";

export const CTA_HEADER_SHELL_HEIGHT_CLASS = "h-9 sm:h-10";

export const CTA_PILL_CLASS =
  "relative inline-flex items-center gap-2 overflow-hidden rounded-full px-4 py-1.5 sm:px-5 sm:py-1.5 text-[15px] sm:text-[16px] font-normal tracking-tight leading-none " +
  CTA_SHELL_HEIGHT_CLASS;

export const CTA_HEADER_PILL_CLASS =
  "relative inline-flex items-center overflow-hidden rounded-full px-4 py-1 sm:px-4 sm:py-1 text-[14px] sm:text-[15px] font-normal tracking-tight leading-none " +
  CTA_HEADER_SHELL_HEIGHT_CLASS;

export const CTA_WELL_CLASS =
  "relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full shrink-0 overflow-hidden";

export const CTA_HEADER_WELL_CLASS =
  "relative flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full shrink-0 overflow-hidden";

export const CTA_WELL_ICON_CLASS = "relative block h-3.5 w-3.5 sm:h-4 sm:w-4";

export const CTA_HEADER_WELL_ICON_CLASS = "relative block h-3 w-3 sm:h-3.5 sm:w-3.5";

const CTA_GRAIN_IMAGE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function CtaGrain() {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none rounded-full overflow-hidden"
      style={{
        backgroundImage: CTA_GRAIN_IMAGE,
        backgroundSize: "180px 180px",
        mixBlendMode: "overlay",
        opacity: 0.3,
      }}
    />
  );
}

export function CtaWellSpecular() {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none rounded-full"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 40%)",
      }}
    />
  );
}

export function CtaWell({
  children,
  className = CTA_WELL_CLASS,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={className} style={{ background: CTA_WELL_BG, boxShadow: CTA_WELL_SHADOW }}>
      <CtaWellSpecular />
      {children}
    </span>
  );
}
