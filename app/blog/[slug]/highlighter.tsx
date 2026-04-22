"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type Highlight = { id: string; text: string; color: string };

const COLORS = ["#fde68a", "#a7f3d0", "#bfdbfe", "#fecaca", "#e9d5ff"];
const STORAGE_KEY = (slug: string) => `highlights-${slug}`;

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function applyHighlights(articleEl: HTMLElement, highlights: Highlight[]) {
  // Remove existing marks
  articleEl.querySelectorAll("mark[data-hid]").forEach((m) => {
    const parent = m.parentNode;
    if (!parent) return;
    parent.replaceChild(document.createTextNode(m.textContent ?? ""), m);
    parent.normalize();
  });

  for (const h of highlights) {
    const walker = document.createTreeWalker(articleEl, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const text = node.textContent ?? "";
      const idx = text.indexOf(h.text);
      if (idx === -1) continue;
      const range = document.createRange();
      range.setStart(node, idx);
      range.setEnd(node, idx + h.text.length);
      const mark = document.createElement("mark");
      mark.dataset.hid = h.id;
      mark.style.background = h.color;
      mark.style.color = "inherit";
      mark.style.borderRadius = "3px";
      mark.style.padding = "0 1px";
      mark.style.cursor = "pointer";
      try {
        range.surroundContents(mark);
      } catch {
        // skip if selection spans multiple nodes
      }
      break;
    }
  }
}

export function Highlighter({ slug }: { slug: string }) {
  const articleRef = useRef<HTMLElement | null>(null);
  const [toolbar, setToolbar] = useState<{ x: number; y: number; text: string } | null>(null);
  const [activeColor, setActiveColor] = useState(COLORS[0]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  // Load from storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY(slug));
      if (raw) setHighlights(JSON.parse(raw));
    } catch {}
  }, [slug]);

  // Persist + re-apply whenever highlights change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY(slug), JSON.stringify(highlights));
    } catch {}
    const el = document.querySelector("article") as HTMLElement | null;
    if (el) applyHighlights(el, highlights);
  }, [highlights, slug]);

  // Click on existing mark removes it
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const mark = (e.target as HTMLElement).closest("mark[data-hid]") as HTMLElement | null;
      if (!mark) return;
      const id = mark.dataset.hid;
      setHighlights((prev) => prev.filter((h) => h.id !== id));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const handleSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) { setToolbar(null); return; }
    const text = sel.toString().trim();
    if (!text || text.length < 2) { setToolbar(null); return; }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setToolbar({
      x: rect.left + rect.width / 2,
      y: rect.top + window.scrollY - 48,
      text,
    });
  }, []);

  useEffect(() => {
    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("touchend", handleSelection);
    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("touchend", handleSelection);
    };
  }, [handleSelection]);

  const addHighlight = () => {
    if (!toolbar) return;
    setHighlights((prev) => [...prev, { id: uid(), text: toolbar.text, color: activeColor }]);
    window.getSelection()?.removeAllRanges();
    setToolbar(null);
  };

  const dismiss = () => {
    window.getSelection()?.removeAllRanges();
    setToolbar(null);
  };

  if (!toolbar) return null;

  return (
    <div
      className="highlight-toolbar"
      style={{ left: toolbar.x, top: toolbar.y }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {COLORS.map((c) => (
        <button
          key={c}
          className="highlight-swatch"
          style={{ background: c, outline: activeColor === c ? "2px solid rgba(0,0,0,0.35)" : "none", outlineOffset: "1px" }}
          onClick={() => setActiveColor(c)}
          aria-label={`Highlight colour ${c}`}
        />
      ))}
      <button className="highlight-btn" onClick={addHighlight} aria-label="Apply highlight">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" aria-hidden="true">
          <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      </button>
      <button className="highlight-dismiss" onClick={dismiss} aria-label="Dismiss">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="11" height="11" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}
