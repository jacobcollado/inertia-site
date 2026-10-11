"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useWebHaptics } from "web-haptics/react";
import { AETHER_LIQUID_EASE, AETHER_LIQUID_MS } from "./motion";

/* The phones under the mobile hero, one per example store. Session
 * recordings showed people tapping and swiping them, so they rotate: swipe
 * either way, tap a side phone to bring it forward, or tap the front one for
 * the next. Until someone does, they turn on their own every few seconds, so
 * a visitor who only looks still sees all four looks. Three show at a time;
 * the fourth waits, hidden, behind the front phone.
 *
 * Every phone is laid out at the front phone's size and pushed into its slot
 * with translate and scale, so a rotation is one transform transition per
 * phone. The side slots match the old static layout: 28vw phones tucked 7vw
 * under a 46vw front phone, which puts their centres 30vw out, 65% of the
 * front phone's width.
 */

const PHONES = [
  // After Hours in front, Rosso right, Argent left, Relics waiting.
  { src: "/aether/after-hours-mobile.png", w: 1300, h: 2642, quality: 100 },
  { src: "/aether/rosso-mobile.png", w: 1280, h: 2642, quality: 90 },
  { src: "/aether/relics-mobile.png", w: 1300, h: 2642, quality: 90 },
  { src: "/aether/argent-mobile-v2.png", w: 1300, h: 2642, quality: 90 },
];

const AUTO_MS = 3200;

// By distance from the front phone: 0 is the front, 1 sits right, 2 waits
// hidden behind the front, 3 sits left.
const SLOTS = [
  { x: 0, scale: 1, z: 10, opacity: 1 },
  { x: 65.2, scale: 0.609, z: 0, opacity: 1 },
  { x: 0, scale: 0.5, z: -1, opacity: 0 },
  { x: -65.2, scale: 0.609, z: 0, opacity: 1 },
];
const LEFT = 3;

const SWIPE_PX = 30;

export function HeroPhones() {
  // Which phone sits in the front slot; the others follow in order.
  const [front, setFront] = useState(0);
  // Set by the first tap or swipe, which hands the phones to the visitor.
  const [touched, setTouched] = useState(false);
  const reduce = useReducedMotion();
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const { trigger } = useWebHaptics();
  const n = PHONES.length;

  useEffect(() => {
    if (touched || reduce) return;
    const t = setInterval(() => setFront((f) => (f + 1) % n), AUTO_MS);
    return () => clearInterval(t);
  }, [touched, reduce, n]);

  const rotate = (dir: 1 | -1) => {
    setTouched(true);
    setFront((f) => (f + dir + n) % n);
    trigger("light");
  };

  const onPointerDown = (e: React.PointerEvent) => {
    startRef.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = (e: React.PointerEvent, phone: number) => {
    const start = startRef.current;
    startRef.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
      // Swiping left pulls the right-hand phone forward.
      rotate(dx < 0 ? 1 : -1);
      return;
    }
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) return;
    const slot = (phone - front + n) % n;
    rotate(slot === LEFT ? -1 : 1);
  };

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="Aether on iPhone"
      className="relative mx-auto w-[46vw] max-w-[15.5rem] cursor-pointer select-none [-webkit-tap-highlight-color:transparent]"
      style={{ touchAction: "pan-y", aspectRatio: `${PHONES[0].w} / ${PHONES[0].h}` }}
      onPointerCancel={() => { startRef.current = null; }}
    >
      {PHONES.map((p, i) => {
        const slot = SLOTS[(i - front + n) % n];
        return (
          <div
            key={p.src}
            className="absolute inset-0 motion-reduce:transition-none"
            style={{
              transform: `translateX(${slot.x}%) scale(${slot.scale})`,
              zIndex: slot.z,
              opacity: slot.opacity,
              transition: `transform ${AETHER_LIQUID_MS}ms ${AETHER_LIQUID_EASE}, opacity ${AETHER_LIQUID_MS}ms ${AETHER_LIQUID_EASE}`,
            }}
            onPointerDown={onPointerDown}
            onPointerUp={(e) => onPointerUp(e, i)}
          >
            <Image
              src={p.src}
              alt="Aether storefront on iPhone"
              width={p.w}
              height={p.h}
              sizes="(max-width: 639px) 46vw, 0px"
              quality={p.quality}
              className="h-full w-full object-contain"
              draggable={false}
              priority={i === 0}
            />
          </div>
        );
      })}
    </div>
  );
}
