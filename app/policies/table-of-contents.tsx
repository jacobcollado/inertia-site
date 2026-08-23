"use client";

import { useEffect, useRef, useState } from "react";

/* Matches the blog's TOCInline (app/blog/[slug]/toc.tsx): one container that
   grows in place, 6px radius with a hairline edge, and a tinted fill rather
   than the surface token. Kept as its own component because the two take
   different data shapes - posts pass parsed headings with levels, policies
   pass a flat section list - but the chrome is deliberately identical. */
export function TableOfContents({ sections }: { sections: { id: string; title: string }[] }) {
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState(0);
  const bodyRef = useRef<HTMLUListElement>(null);

  // Measured height rather than a grid-rows trick, so the easing curve matches
  // the blog's and the panel re-measures if the viewport reflows the links.
  useEffect(() => {
    if (!open) { setHeight(0); return; }
    const measure = () => setHeight(bodyRef.current?.scrollHeight ?? 0);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open, sections]);

  if (sections.length === 0) return null;

  const jump = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    setOpen(false);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <nav aria-label="Table of contents" className="w-full mb-10">
      <div
        className="w-full overflow-hidden"
        style={{
          background: "rgb(var(--fg) / 0.04)",
          border: "1px solid rgb(var(--line))",
          borderRadius: 6,
        }}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center justify-between px-4 py-2.5 text-[13px] tracking-tight transition-colors"
          style={{ color: "rgb(var(--muted))" }}
        >
          Contents
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3 h-3"
            style={{
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 260ms cubic-bezier(0.22,1,0.36,1)",
            }}
            aria-hidden="true"
          >
            <polyline points="4 6 8 10 12 6" />
          </svg>
        </button>

        <div
          style={{
            height,
            overflow: "hidden",
            transition: "height 320ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <ul ref={bodyRef} className="flex flex-col px-4 pb-3">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => jump(e, s.id)}
                  className="block py-2 text-[14px] leading-snug tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
