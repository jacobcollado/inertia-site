"use client";
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useMotionValue } from "motion/react";
import { cn } from "@/lib/utils";

export const FollowerPointerCard = ({
  children,
  className,
  title,
  titleKey,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string | React.ReactNode;
  // Stable identity for the current title. When it changes, the tooltip
  // content cross-fades and the pill resizes fluidly instead of snapping.
  titleKey?: string | number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInside, setIsInside] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const x = useMotionValue(-999);
  const y = useMotionValue(-999);

  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    if (isTouch) return;
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };

    const onEnter = () => setIsInside(true);
    const onLeave = () => setIsInside(false);

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    window.addEventListener("mousemove", onMove);

    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mousemove", onMove);
    };
  }, [x, y, isTouch]);

  return (
    <div
      ref={ref}
      style={{ cursor: isTouch ? "auto" : "none" }}
      className={cn("relative", className)}
    >
      {children}
      <AnimatePresence>
        {isInside && <FollowPointer x={x} y={y} title={title} titleKey={titleKey} />}
      </AnimatePresence>
    </div>
  );
};

export const FollowPointer = ({
  x,
  y,
  title,
  titleKey,
}: {
  x: any;
  y: any;
  title?: string | React.ReactNode;
  titleKey?: string | number;
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <motion.div
      className="fixed z-[9999] flex flex-col items-start pointer-events-none"
      style={{ top: y, left: x }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.15 }}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))" }}
      >
        <path d="M4 2.5C4 2.1 4.4 1.9 4.7 2.1L18.6 12.4C18.9 12.6 18.8 13.1 18.4 13.2L12.1 14.5C11.9 14.5 11.7 14.6 11.6 14.8L8.4 20.4C8.2 20.7 7.7 20.7 7.6 20.3L4 2.5Z" stroke="rgba(0,0,0,0.25)" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <motion.div
        layout
        initial={{ scale: 0.8, opacity: 0, y: 4 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 4 }}
        transition={{
          duration: 0.15,
          delay: 0.05,
          layout: { type: "spring", stiffness: 500, damping: 38 },
        }}
        className="mt-1.5 min-w-max rounded-full pl-1.5 pr-3.5 py-1.5 text-[13px] tracking-tight whitespace-nowrap backdrop-blur-sm flex items-center gap-2 overflow-hidden"
        style={{ background: "rgba(30,30,30,0.6)", color: "#f0f0f0" }}
      >
        {/* Cross-fade the thumbnail + name on project change; keep the pill
            mounted so its width springs between titles instead of snapping. */}
        <span className="grid items-center">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={titleKey ?? "default"}
              layout
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center [grid-area:1/1]"
            >
              {title || "View project"}
            </motion.span>
          </AnimatePresence>
        </span>
        <motion.svg
          layout
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5 shrink-0 opacity-70"
          style={{ marginLeft: "-1px" }}
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </motion.svg>
      </motion.div>
    </motion.div>,
    document.body
  );
};
