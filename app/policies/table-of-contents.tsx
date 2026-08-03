"use client";

import { useState } from "react";

export function TableOfContents({ sections }: { sections: { id: string; title: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-10 rounded-xl bg-[rgb(var(--surface))] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 p-6 text-left"
      >
        <span className="text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-60">Contents</span>
        <svg
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="w-3 h-3 text-[rgb(var(--muted))] transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          aria-hidden="true"
        >
          <polyline points="2 4 6 8 10 4" />
        </svg>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-1.5 px-6 pb-6">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-[16px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors py-0.5"
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
