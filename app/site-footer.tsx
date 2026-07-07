"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

// Hand-drawn smiley — sketches itself in on reveal, then blinks every so often.
function DrawnSmiley() {
  const faceRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(0);
  const [visible, setVisible] = useState(false);
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    if (faceRef.current) setLen(faceRef.current.getTotalLength());
    const t = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!visible) return;
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay = 2200 + Math.random() * 2600;
      timeout = setTimeout(() => {
        setBlinking(true);
        setTimeout(() => setBlinking(false), 160);
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, [visible]);

  return (
    <svg
      viewBox="0 0 32 32"
      width="26"
      height="26"
      className="shrink-0"
      aria-hidden="true"
      style={{
        opacity: visible ? 0.55 : 0,
        transform: visible ? "scale(1) rotate(-4deg)" : "scale(0.6) rotate(-4deg)",
        transition: "opacity 400ms cubic-bezier(0.22,1,0.36,1), transform 400ms cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <path
        ref={faceRef}
        d="M16 3.2 C 22.5 3.2, 27.8 8.5, 27.8 15.5 C 27.8 22.5, 22.5 27.8, 16 27.8 C 9.5 27.8, 4.2 22.5, 4.2 15.5 C 4.2 8.5, 9.5 3.2, 16 3.2 Z"
        fill="none"
        stroke="rgb(var(--muted))"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={visible ? 0 : len}
        style={{ transition: "stroke-dashoffset 650ms cubic-bezier(0.4,0,0.2,1) 150ms" }}
      />
      <g style={{ transformOrigin: "center", transform: blinking ? "scaleY(0.15)" : "scaleY(1)", transition: "transform 90ms ease" }}>
        <circle cx="11.8" cy="14.5" r="1.5" fill="rgb(var(--muted))" />
        <circle cx="20.2" cy="14.5" r="1.5" fill="rgb(var(--muted))" />
      </g>
      <path
        d="M10.5 19.5 Q 16 24.5, 21.5 19.5"
        fill="none"
        stroke="rgb(var(--muted))"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="20"
        strokeDashoffset={visible ? 0 : 20}
        style={{ transition: "stroke-dashoffset 500ms cubic-bezier(0.4,0,0.2,1) 550ms" }}
      />
    </svg>
  );
}

function ChicagoTime() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          timeZone: "America/Chicago",
          hour: "numeric",
          minute: "2-digit",
        })
      );
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="rise flex items-center justify-center gap-2 text-[17px] tracking-tight text-[rgb(var(--muted))] max-w-sm leading-relaxed" style={{ opacity: 0.5 }}>
      <span>{time ?? " "} in Chicago, Illinois</span>
      <DrawnSmiley />
    </p>
  );
}

export function MinimalFooter() {
  return (
    <footer className="w-full max-w-[88rem] mx-auto px-6 sm:px-8 py-8 flex flex-col items-center text-center gap-4">
      <ChicagoTime />
      <div className="rise flex items-center gap-5" style={{ "--rise-delay": "80ms" } as React.CSSProperties}>
        <Link href="/work" className="text-[15px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors" style={{ opacity: 0.4 }}>
          Work
        </Link>
        <Link href="/aether" className="text-[15px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors" style={{ opacity: 0.4 }}>
          Aether theme
        </Link>
        <Link href="/policies/terms-of-service" className="text-[15px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors" style={{ opacity: 0.4 }}>
          Terms of service
        </Link>
        <Link href="/policies/privacy-policy" className="text-[15px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors" style={{ opacity: 0.4 }}>
          Privacy policy
        </Link>
      </div>
    </footer>
  );
}

