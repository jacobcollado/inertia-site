"use client";
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useMotionValue } from "motion/react";
import { cn } from "@/lib/utils";

export const FollowerPointerCard = ({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string | React.ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInside, setIsInside] = useState(false);
  const x = useMotionValue(-999);
  const y = useMotionValue(-999);

  useEffect(() => {
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
  }, [x, y]);

  return (
    <div
      ref={ref}
      style={{ cursor: "none" }}
      className={cn("relative", className)}
    >
      {children}
      <AnimatePresence>
        {isInside && <FollowPointer x={x} y={y} title={title} />}
      </AnimatePresence>
    </div>
  );
};

export const FollowPointer = ({
  x,
  y,
  title,
}: {
  x: any;
  y: any;
  title?: string | React.ReactNode;
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
        <path d="M3 3L3 20L8 14H18L3 3Z" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 4 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 4 }}
        transition={{ duration: 0.15, delay: 0.05 }}
        className="mt-1 min-w-max rounded-full px-3 py-1.5 text-[12px] tracking-tight whitespace-nowrap"
        style={{ background: "rgba(30,30,30,0.85)", color: "#e5e5e5", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        {title || "View project"}
      </motion.div>
    </motion.div>,
    document.body
  );
};
