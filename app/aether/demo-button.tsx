"use client";

import { useState } from "react";
import { ACTION_RADIUS_CLASS, CTA_SHELL_HEIGHT_CLASS } from "@/lib/cta-chrome";
import { DemoVideoModal } from "./demo-video-modal";

/* Opens the demo recording in a dialog. The live store, and the password
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
        className={`w-full inline-flex items-center justify-center gap-2 ${ACTION_RADIUS_CLASS} ${CTA_SHELL_HEIGHT_CLASS} border border-[rgb(var(--line))] px-3 sm:px-5 text-[16px] sm:text-[19px] font-medium tracking-tight leading-none text-[rgb(var(--fg))] hover:border-[rgb(var(--fg)/0.4)] transition-colors whitespace-nowrap`}
      >
        View demo
      </a>
      <DemoVideoModal open={open} onClose={() => setOpen(false)} href={href} password={password} />
    </div>
  );
}
