"use client";

import { useEffect } from "react";

// Delegated at the document so every button/link gets the sound without
// wiring a handler into each one individually. Decoded once and cloned per
// play via cloneNode so rapid hovers can overlap instead of cutting each
// other off.
export function ClickSound() {
  useEffect(() => {
    const audio = new Audio("/sfx/click.ogg");
    audio.volume = 0.35;
    audio.preload = "auto";

    // pointerover bubbles (unlike pointerenter), so it can be delegated at
    // the document. Track the last hovered target so moving between
    // descendants of the same button doesn't replay the sound.
    let lastTarget: Element | null = null;

    function handlePointerOver(e: PointerEvent) {
      const target = (e.target as HTMLElement | null)?.closest(
        "button, a, [role='button'], [data-slot='button']"
      );
      if (!target || (target as HTMLButtonElement).disabled) {
        lastTarget = null;
        return;
      }
      if (target === lastTarget) return;
      lastTarget = target;
      const clone = audio.cloneNode() as HTMLAudioElement;
      clone.volume = audio.volume;
      clone.play().catch(() => {});
    }

    document.addEventListener("pointerover", handlePointerOver);
    return () => document.removeEventListener("pointerover", handlePointerOver);
  }, []);

  return null;
}
