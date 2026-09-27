"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useWebHaptics } from "web-haptics/react";
import { AETHER_LIQUID_EASE, AETHER_LIQUID_MS } from "./motion";

/* The three phones under the mobile hero. Session recordings showed people
 * tapping and swiping them, so they now rotate: swipe either way, tap a side
 * phone to bring it forward, or tap the front one for the next.
 *
 * Every phone is laid out at the front phone's size and pushed into its slot
 * with translate and scale, so a rotation is one transform transition per
 * phone. The side slots match the old static layout: 28vw phones tucked 7vw
 * under a 46vw front phone, which puts their centres 30vw out, 65% of the
 * front phone's width.
 */

const PHONES = [
  { src: "/aether/hero-mobile-center-v3.png", w: 1349, h: 2691, quality: 100 },
  { src: "/aether/hero-mobile-center-v2.png", w: 1349, h: 2691, quality: 90 },
  { src: "/aether/hero-mobile-left.png", w: 1300, h: 2642, quality: 90 },
];

// Slot 0 is the front, 1 sits right, 2 sits left.
const SLOTS = [
  { x: 0, scale: 1, z: 10 },
  { x: 65.2, scale: 0.609, z: 0 },
  { x: -65.2, scale: 0.609, z: 0 },
];

const SWIPE_PX = 30;

export function HeroPhones() {
  // Which phone sits in the front slot; the others follow in order.
  const [front, setFront] = useState(0);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const { trigger } = useWebHaptics();
  const n = PHONES.length;

  const rotate = (dir: 1 | -1) => {
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
    rotate(slot === 2 ? -1 : 1);
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
              transition: `transform ${AETHER_LIQUID_MS}ms ${AETHER_LIQUID_EASE}`,
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
