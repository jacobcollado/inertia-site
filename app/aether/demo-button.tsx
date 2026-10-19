"use client";

import { useState } from "react";
import { DemoVideoModal } from "./demo-video-modal";

/* The outlined partner to the buy button (.ae-demo in globals.css). Opens the
 * demo recording in a dialog. The live store, and the password
 * copy that goes with it, moved into the dialog's footer. The href stays on
 * the anchor so a middle click or a no-JS visit still reaches the store. */
export function DemoButton({ href, password }: { href: string; password: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-full">
      <a
        href={href}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();
          setOpen(true);
        }}
        className="ae-demo"
      >
        View demo
      </a>
      <DemoVideoModal open={open} onClose={() => setOpen(false)} href={href} password={password} />
    </div>
  );
}
