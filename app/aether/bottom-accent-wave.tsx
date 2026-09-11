"use client";

/** Blue accent wave — Aether landing page footer only. Rises upward from the footer edge. */
export function AetherFooterWave() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[min(34vh,280px)] overflow-hidden"
      aria-hidden="true"
    >
      <div className="aether-bottom-wave absolute inset-0">
        <div className="aether-bottom-wave__layer aether-bottom-wave__layer--a" />
        <div className="aether-bottom-wave__layer aether-bottom-wave__layer--b" />
        <div className="aether-bottom-wave__glow" />
      </div>
    </div>
  );
}
