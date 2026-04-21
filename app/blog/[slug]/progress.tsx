"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let frame = 0;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      setProgress(p);
      frame = 0;
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed left-0 right-0 top-0 z-[70] h-[4px] bg-transparent pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full origin-left bg-[rgb(var(--fg))]"
        style={{
          transform: `scaleX(${progress})`,
          transition: "transform 180ms cubic-bezier(0.22, 1, 0.36, 1)",
          willChange: "transform",
        }}
      />
    </div>,
    document.body
  );
}
