import type { CSSProperties, ReactNode } from "react";

// Homepage section heading: plain ink type, nothing around it. One scale for
// every section ("In good company", "Don't take our word for it" and the
// rest), so they read as one set. Sections bring it in with their own
// staggered reveal (rise-stagger in globals.css), so it has no animation of
// its own.

export function SectionHeading({
  children,
  className = "",
  style,
  align = "center",
  tone = "light",
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  align?: "center" | "left";
  // "dark" for the sections on the black zone: ink follows the zone's --fg.
  tone?: "light" | "dark";
}) {
  return (
    <h2
      className={`${align === "left" ? "text-left" : "text-center"} text-[clamp(1.8rem,3vw,2.5rem)] tracking-[-0.03em] leading-[1.1] ${className}`}
      style={{ color: tone === "dark" ? "rgb(var(--fg))" : "var(--ink)", fontWeight: 450, ...style }}
    >
      {children}
    </h2>
  );
}
