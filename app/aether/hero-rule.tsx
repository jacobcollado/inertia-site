"use client";

import { useEffect, useRef, useState } from "react";

export function HeroRule() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const onScroll = () => {
      const top = sentinel.getBoundingClientRect().top;
      setStuck(top <= 72);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div ref={sentinelRef} style={{ height: "1px", background: "rgb(var(--line))" }} />
    </>
  );
}
