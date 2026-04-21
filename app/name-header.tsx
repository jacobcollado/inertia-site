"use client";

import { useEffect, useRef, useState } from "react";
import { useViewMode, type ViewMode } from "./view-mode-context";

export function NameHeader() {
  const { mode, setMode } = useViewMode();
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tipVisible, setTipVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    tipTimer.current = setTimeout(() => {
      setTipVisible(true);
      tipTimer.current = setTimeout(() => setTipVisible(false), 4000);
    }, 1200);
    return () => {
      if (tipTimer.current) clearTimeout(tipTimer.current);
    };
  }, []);

  const isVisual = mounted && mode === "visual";

  const handleEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setTooltipVisible(true);
    if (tipVisible) setTipVisible(false);
  };

  const handleLeave = () => {
    leaveTimer.current = setTimeout(() => setTooltipVisible(false), 120);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <h1
        className="text-2xl font-medium tracking-tighter cursor-default select-none"
        style={isVisual ? { opacity: 0, pointerEvents: "none" } : undefined}
      >
        Jacob Col
        <span className="redact" aria-hidden="true">
          <span className="redact-inner">lado</span>
        </span>
        <span className="sr-only">lado</span>
      </h1>

      {/* Tip bubble */}
      <div className="name-tip" data-visible={tipVisible} aria-hidden="true">
        Hover to switch view
      </div>

      {/* Tooltip */}
      <div
        className="view-tooltip"
        data-visible={tooltipVisible}
        role="tooltip"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <span className="view-tooltip__label">View</span>
        <div className="view-tooltip__pills">
          {(["text", "visual"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onMouseDown={(e) => {
                e.preventDefault();
                setMode(v);
                setTooltipVisible(false);
              }}
              className="view-tooltip__pill"
              data-active={mounted && mode === v}
              aria-pressed={mounted && mode === v}
            >
              {v === "text" ? "Text" : "Visual"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
