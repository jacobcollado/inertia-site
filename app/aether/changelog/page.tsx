"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";

type NoteType = "added" | "improved" | "fixed" | "removed";
type ReleaseLabel = "major" | "minor" | "patch";

type Note = { type: NoteType; title: string; detail: string };
type Entry = { version: string; date: string; label: ReleaseLabel; summary: string; notes: Note[] };

const CHANGELOG: Entry[] = [
  {
    version: "1.3.0",
    date: "2026-05-01",
    label: "minor",
    summary: "Custom font loading, collection page filters, and a performance pass on the product image gallery.",
    notes: [
      { type: "added", title: "Custom font support via theme settings", detail: "Merchants can now specify a Google Fonts URL or upload a WOFF2 directly through the theme editor. Aether handles font-display: swap and preconnect headers automatically, so there is no FOUT and no manual code edits required." },
      { type: "added", title: "Collection page sidebar filters", detail: "A new optional sidebar filter panel for collection pages renders available filter groups from the Shopify storefront API. Each group collapses independently, selected filters are shown as removable pills at the top, and the product grid re-renders without a full page reload." },
      { type: "improved", title: "Product gallery image loading", detail: "Thumbnail images are now loaded with loading=lazy and decoded asynchronously. The main image slot uses fetchpriority=high to start loading before the browser finishes parsing the page. On a mid-tier mobile device over 4G this cuts gallery-ready time by about 600ms." },
      { type: "improved", title: "Cart line item update debounce", detail: "Previously every quantity change fired a cart update request immediately, which caused race conditions when users tapped quickly. Updates are now batched with a 300ms debounce and a loading state is shown on the stepper so the UI never reflects stale data." },
      { type: "fixed", title: "Section padding ignored on mobile", detail: "The padding-top and padding-bottom theme settings for several sections were being overridden by a hardcoded media query in the compiled CSS. The media query has been removed and padding now scales correctly across all breakpoints." },
    ],
  },
  {
    version: "1.2.0",
    date: "2026-04-29",
    label: "minor",
    summary: "Sticky cart improvements, mobile nav overhaul, and a fix for a rare quantity bug on iOS Safari.",
    notes: [
      { type: "improved", title: "Sticky add-to-cart rewrite", detail: "The sticky bar now uses an Intersection Observer instead of a scroll event listener. This removes the jank at the fold threshold and cuts CPU paint cost by roughly 40% on low-end Android devices. The bar appears only once the native button has fully left the viewport." },
      { type: "improved", title: "Mobile nav drawer gesture support", detail: "The slide-in navigation drawer now responds to horizontal swipe-to-close gestures. A touch velocity threshold means quick flicks close the drawer even when the drag distance is short. Tap-outside dismissal is unchanged." },
      { type: "fixed", title: "Quantity stepper double-submit on iOS Safari", detail: "Safari's 300ms click delay was causing the stepper's increment handler to fire twice in quick succession, which could push cart quantities above available inventory. Replaced the click listener with a pointer event and added a leading debounce at 120ms." },
      { type: "added", title: "Announcement bar supports rich text", detail: "The announcement bar section now accepts an inline rich text field instead of a plain text input. Merchants can bold a promo code or link to a sale collection directly from the bar without touching theme code." },
    ],
  },
  {
    version: "1.1.0",
    date: "2026-03-14",
    label: "minor",
    summary: "Product page redesign, new editorial grid section, and color swatch improvements.",
    notes: [
      { type: "improved", title: "Product page layout restructured", detail: "Media and form columns now use a 7/5 split on large screens instead of 6/6. In user testing, giving more space to the imagery increased time-on-page by roughly 18%. The form column is sticky by default and de-stickies automatically when content overflows the viewport height." },
      { type: "added", title: "Editorial grid section", detail: "A new homepage section that renders up to 6 products or collections in an asymmetric masonry-style grid. Each cell supports an optional overlay caption. Built entirely with CSS Grid, no JavaScript, no layout shift." },
      { type: "improved", title: "Color swatches now lazy-load variant images", detail: "Hovering a swatch prefetches the corresponding variant image using a link rel=prefetch tag injected at hover start. The image is almost always in browser cache by the time the customer clicks, making variant switching feel instant." },
      { type: "fixed", title: "Predictive search z-index conflict with header", detail: "On pages with a transparent header, the predictive search dropdown was rendering beneath the hero section. Moved the search overlay to a portal at the body root and set its z-index above the header layer." },
    ],
  },
  {
    version: "1.0.1",
    date: "2026-02-28",
    label: "patch",
    summary: "Hot fix for cart drawer on Chrome 122 and a missing translation key.",
    notes: [
      { type: "fixed", title: "Cart drawer blank on Chrome 122+", detail: "Chrome 122 changed how it handles display:contents inside a dialog element, which caused Aether's cart drawer items to render invisible. Replaced the inner display:contents wrapper with an explicit flex container." },
      { type: "fixed", title: "Missing translation key for sold-out badge", detail: "The sold-out badge on collection cards was hardcoded to English rather than pulling from the theme's locale file. It now reads from themes.product.sold_out, so custom translations work correctly." },
    ],
  },
  {
    version: "1.0.0",
    date: "2026-02-01",
    label: "major",
    summary: "First public release. Everything you see is intentional.",
    notes: [
      { type: "added", title: "Animated product reveal on scroll", detail: "Every product card and section block enters with a staggered translate-y fade driven by an Intersection Observer. The animation is disabled automatically for users who have prefers-reduced-motion set, with no extra configuration required." },
      { type: "added", title: "Mega menu with editorial layout", detail: "The header supports a two-column mega menu where the right panel can display a featured image, collection link, or promotional tile. Menus are built in the Shopify navigation editor, no metafields or custom data required." },
      { type: "added", title: "OS-aware dark mode", detail: "Aether reads prefers-color-scheme on first load and applies the correct theme without a flash of unstyled content. Merchants can also expose a manual toggle to customers via a theme setting. Both modes are fully designed, not inverted." },
      { type: "added", title: "Conversion-tuned product page", detail: "The product page layout is the result of testing across 11 live stores over 6 weeks. Key decisions: trust badges directly beneath the add-to-cart button, accordion-style tabs to keep the page short, and a persistent sticky bar that appears after the native button scrolls out of view." },
      { type: "added", title: "Section presets for fast setup", detail: "Every section ships with at least one preset so merchants can drag it onto any page template and get something that looks good immediately. Presets cover typography, spacing, and color defaults tuned to each section's purpose." },
      { type: "added", title: "Accessible focus styles throughout", detail: "All interactive elements have visible focus rings that meet WCAG 2.1 AA contrast requirements. Focus styles are hidden for mouse users via :focus-visible and shown only on keyboard navigation, so accessibility is built in without visual noise." },
    ],
  },
];

const GUIDE: { title: string; body: string }[] = [
  { title: "How to update", body: "Download the latest .zip from your license email, then go to Shopify Admin > Online Store > Themes > Add theme > Upload zip. Your live theme is untouched until you manually publish." },
  { title: "Version numbers", body: "Major releases may include breaking schema changes. Minor adds features without breaking existing ones. Patch fixes bugs only, always safe to apply." },
  { title: "Backup first", body: "Shopify keeps your previous theme as an unpublished copy when you publish a new one. Re-publish the old version from the theme list in seconds if needed." },
  { title: "Custom code", body: "Note which files you edited before updating. The changelog lists touched files per release so you know where conflicts might occur. Re-apply changes to the fresh files after uploading." },
];

const TYPE_META: Record<NoteType, { label: string; color: string; bg: string }> = {
  added:    { label: "Added",    color: "#6a9ab0", bg: "rgba(50,68,80,0.18)"  },
  improved: { label: "Improved", color: "#8080b8", bg: "rgba(62,62,90,0.18)"  },
  fixed:    { label: "Fixed",    color: "#5a8a8a", bg: "rgba(52,70,82,0.18)"  },
  removed:  { label: "Removed",  color: "#a07080", bg: "rgba(80,55,65,0.18)"  },
};

const LABEL_META: Record<ReleaseLabel, { color: string; bg: string }> = {
  major: { color: "#9090c8", bg: "rgba(62,62,90,0.22)"  },
  minor: { color: "#6a9ab0", bg: "rgba(50,68,80,0.15)"  },
  patch: { color: "#909090", bg: "rgba(80,80,80,0.12)"  },
};

const ALL_TYPES: NoteType[]     = ["added", "improved", "fixed", "removed"];
const ALL_LABELS: ReleaseLabel[] = ["major", "minor", "patch"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function TypeBadge({ type }: { type: NoteType }) {
  const m = TYPE_META[type];
  return (
    <span
      className="inline-flex items-center text-[10px] tracking-wide uppercase font-medium px-2 py-0.5 rounded-sm shrink-0"
      style={{ background: m.bg, color: m.color }}
    >
      {m.label}
    </span>
  );
}

function LabelBadge({ label }: { label: ReleaseLabel }) {
  const m = LABEL_META[label];
  return (
    <span
      className="inline-flex items-center text-[10px] tracking-wide uppercase font-medium px-2 py-0.5 rounded-sm"
      style={{ background: m.bg, color: m.color }}
    >
      {label}
    </span>
  );
}

function SidebarContent({
  activeTypes, activeLabels, hasFilters, guideOpen,
  toggleType, toggleLabel, clearFilters, setGuideOpen, onNav,
}: {
  activeTypes: Set<NoteType>;
  activeLabels: Set<ReleaseLabel>;
  hasFilters: boolean;
  guideOpen: number | null;
  toggleType: (t: NoteType) => void;
  toggleLabel: (l: ReleaseLabel) => void;
  clearFilters: () => void;
  setGuideOpen: (i: number | null) => void;
  onNav?: () => void;
}) {
  return (
    <div className="flex flex-col gap-6 py-6">

      {/* Filter by type */}
      <div>
        <p className="text-[10px] tracking-widest uppercase text-[rgb(var(--muted))] opacity-40 mb-3">Type</p>
        <div className="flex flex-col gap-0.5">
          {ALL_TYPES.map((t) => {
            const active = activeTypes.has(t);
            const m = TYPE_META[t];
            return (
              <button
                key={t}
                onClick={() => toggleType(t)}
                className="flex items-center gap-2.5 py-1.5 px-2 -mx-2 rounded text-[13px] tracking-tight transition-colors text-left"
                style={active ? { color: m.color } : {}}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0 transition-opacity"
                  style={{ background: m.color, opacity: active ? 1 : 0.25 }}
                />
                <span className={active ? "" : "text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"}>
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-[rgb(var(--line))]" />

      {/* Filter by release */}
      <div>
        <p className="text-[10px] tracking-widest uppercase text-[rgb(var(--muted))] opacity-40 mb-3">Release</p>
        <div className="flex flex-col gap-0.5">
          {ALL_LABELS.map((l) => {
            const active = activeLabels.has(l);
            const m = LABEL_META[l];
            return (
              <button
                key={l}
                onClick={() => toggleLabel(l)}
                className="flex items-center gap-2.5 py-1.5 px-2 -mx-2 rounded text-[13px] tracking-tight capitalize transition-colors text-left"
                style={active ? { color: m.color } : {}}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0 transition-opacity"
                  style={{ background: m.color, opacity: active ? 1 : 0.25 }}
                />
                <span className={active ? "" : "text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"}>
                  {l}
                </span>
              </button>
            );
          })}
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="mt-3 text-[11px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="h-px bg-[rgb(var(--line))]" />

      {/* Version index */}
      <div>
        <p className="text-[10px] tracking-widest uppercase text-[rgb(var(--muted))] opacity-40 mb-3">Versions</p>
        <ul className="flex flex-col gap-0.5">
          {CHANGELOG.map((entry) => (
            <li key={entry.version}>
              <a
                href={`#v${entry.version}`}
                onClick={onNav}
                className="flex items-center justify-between py-1.5 px-2 -mx-2 rounded text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors tabular-nums"
              >
                <span>v{entry.version}</span>
                <LabelBadge label={entry.label} />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="h-px bg-[rgb(var(--line))]" />

      {/* Guide */}
      <div>
        <p className="text-[10px] tracking-widest uppercase text-[rgb(var(--muted))] opacity-40 mb-3">Guide</p>
        <ul className="flex flex-col">
          {GUIDE.map((g, i) => (
            <li key={i} className="border-b border-[rgb(var(--line))] last:border-0">
              <button
                onClick={() => setGuideOpen(guideOpen === i ? null : i)}
                className="w-full flex items-center justify-between gap-3 py-2.5 text-left"
              >
                <span className={`text-[13px] tracking-tight transition-colors ${guideOpen === i ? "text-[rgb(var(--fg))]" : "text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))]"}`}>
                  {g.title}
                </span>
                <svg
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
                  strokeLinecap="round" strokeLinejoin="round"
                  className="h-3 w-3 shrink-0 text-[rgb(var(--muted))]"
                  style={{ transition: "transform 300ms cubic-bezier(0.22,1,0.36,1)", transform: guideOpen === i ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div
                className="overflow-hidden"
                style={{
                  maxHeight: guideOpen === i ? "300px" : "0px",
                  opacity: guideOpen === i ? 1 : 0,
                  transition: "max-height 300ms cubic-bezier(0.22,1,0.36,1), opacity 250ms ease",
                }}
              >
                <p className="text-[12px] leading-relaxed tracking-tight text-[rgb(var(--muted))] pb-3">
                  {g.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}

export default function AetherChangelog() {
  const [activeTypes, setActiveTypes]   = useState<Set<NoteType>>(new Set());
  const [activeLabels, setActiveLabels] = useState<Set<ReleaseLabel>>(new Set());
  const [guideOpen, setGuideOpen]       = useState<number | null>(null);
  const [sheetOpen, setSheetOpen]       = useState(false);

  function toggleType(t: NoteType) {
    setActiveTypes((prev) => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; });
  }
  function toggleLabel(l: ReleaseLabel) {
    setActiveLabels((prev) => { const n = new Set(prev); n.has(l) ? n.delete(l) : n.add(l); return n; });
  }
  function clearFilters() { setActiveTypes(new Set()); setActiveLabels(new Set()); }

  const hasFilters = activeTypes.size > 0 || activeLabels.size > 0;

  const filtered = useMemo(() => {
    return CHANGELOG.filter((entry) => {
      if (activeLabels.size > 0 && !activeLabels.has(entry.label)) return false;
      if (activeTypes.size === 0) return true;
      return entry.notes.some((n) => activeTypes.has(n.type));
    }).map((entry) => ({
      ...entry,
      notes: activeTypes.size === 0 ? entry.notes : entry.notes.filter((n) => activeTypes.has(n.type)),
    }));
  }, [activeTypes, activeLabels]);

  useEffect(() => {
    document.body.style.overflow = sheetOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sheetOpen]);

  const sidebarProps = { activeTypes, activeLabels, hasFilters, guideOpen, toggleType, toggleLabel, clearFilters, setGuideOpen };

  return (
    <div className="page-container mx-3 sm:mx-auto w-auto sm:w-full max-w-6xl min-h-screen flex flex-col">

      {/* Nav */}
      <div className="flex items-center justify-between px-8 py-5 rise">
        <Link
          href="/aether"
          className="inline-flex items-center gap-1.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
            <path d="M10 3L5 8l5 5" />
          </svg>
          Aether
        </Link>
        <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] tabular-nums opacity-40">
          {CHANGELOG.length} releases
        </span>
      </div>

      <div className="grid-rule" aria-hidden="true" />

      {/* Title */}
      <div className="px-8 py-10 rise" style={{ ["--rise-delay" as any]: "40ms" }}>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tighter leading-none mb-2">Changelog</h1>
        <p className="text-[14px] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-sm">
          Every change documented. What shipped, why, and how it works.
        </p>
      </div>

      <div className="grid-rule" aria-hidden="true" />


      {/* Body */}
      <div className="rise flex flex-1" style={{ ["--rise-delay" as any]: "80ms" }}>

        {/* Sidebar */}
        <aside className="hidden lg:block w-48 xl:w-56 shrink-0 border-r border-[rgb(var(--line))]">
          <div className="sticky top-8 px-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
            <SidebarContent {...sidebarProps} />
          </div>
        </aside>

        {/* Entries */}
        <div className="flex-1 min-w-0 pb-16 lg:pb-0">
          {filtered.length === 0 ? (
            <div className="px-8 py-24 text-center">
              <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] mb-4">No releases match the current filters.</p>
              <button onClick={clearFilters} className="text-[13px] tracking-tight text-[rgb(var(--fg))] underline underline-offset-2">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-[rgb(var(--line))]">
              {filtered.map((entry) => (
                <article key={entry.version} id={`v${entry.version}`} className="scroll-mt-16">

                  {/* Version header */}
                  <div className="px-8 pt-8 pb-6">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 mb-3">
                      <h2 className="text-2xl font-medium tracking-tighter tabular-nums text-[rgb(var(--fg))]">
                        v{entry.version}
                      </h2>
                      <LabelBadge label={entry.label} />
                      <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] tabular-nums ml-auto opacity-60">
                        {formatDate(entry.date)}
                      </span>
                    </div>
                    <p className="text-[14px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">
                      {entry.summary}
                    </p>
                  </div>

                  {/* Notes */}
                  <ul className="flex flex-col border-t border-[rgb(var(--line))]">
                    {entry.notes.map((note, i) => (
                      <li
                        key={i}
                        className="px-8 py-5 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6 border-b border-[rgb(var(--line))] last:border-0"
                      >
                        <div className="pt-0.5 shrink-0">
                          <TypeBadge type={note.type} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-medium tracking-tight text-[rgb(var(--fg))] mb-1">
                            {note.title}
                          </p>
                          <p className="text-[13px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">
                            {note.detail}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>

                </article>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="grid-rule" aria-hidden="true" />
          <div className="px-8 py-6 flex items-center justify-between">
            <Link href="/aether" className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
              Back to Aether
            </Link>
            <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] tabular-nums opacity-40">
              {CHANGELOG.length} releases
            </span>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <button
        onClick={() => setSheetOpen(true)}
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 w-full flex items-center gap-3 px-5 [-webkit-tap-highlight-color:transparent]"
        style={{
          height: 56,
          background: "rgb(var(--bg))",
          borderTop: "1px solid rgb(var(--line))",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-[rgb(var(--muted))]" aria-hidden="true">
          <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="20" y2="12" /><line x1="12" y1="18" x2="20" y2="18" />
        </svg>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[11px] tracking-tight text-[rgb(var(--muted))] leading-none mb-0.5 opacity-50">
            {CHANGELOG.length} releases
          </p>
          <p className="text-[13px] tracking-tight text-[rgb(var(--fg))] leading-snug">
            {hasFilters ? `${activeTypes.size + activeLabels.size} filter${activeTypes.size + activeLabels.size > 1 ? "s" : ""} active` : "Filters & guide"}
          </p>
        </div>
        <div className="flex items-center gap-1 text-[12px] tracking-tight text-[rgb(var(--muted))] shrink-0">
          <span>Contents</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Mobile sheet — always mounted, transitions in/out */}
      <div
        className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end"
        style={{ pointerEvents: sheetOpen ? "auto" : "none" }}
      >
        <div
          className="absolute inset-0"
          onClick={() => setSheetOpen(false)}
          style={{
            background: "rgba(0,0,0,0.35)",
            opacity: sheetOpen ? 1 : 0,
            transition: "opacity 260ms cubic-bezier(0.22,1,0.36,1)",
          }}
        />
        <div
          className="relative z-10 rounded-t-2xl border-t border-[rgb(var(--line))] flex flex-col"
          style={{
            background: "rgb(var(--bg))",
            maxHeight: "78vh",
            transform: sheetOpen ? "translateY(0)" : "translateY(105%)",
            transition: "transform 360ms cubic-bezier(0.32,0.72,0,1)",
          }}
        >
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[rgb(var(--line))] shrink-0">
            <p className="text-[13px] font-medium tracking-tight text-[rgb(var(--fg))]">Filters &amp; guide</p>
            <button
              onClick={() => setSheetOpen(false)}
              className="h-7 w-7 flex items-center justify-center rounded-full text-[rgb(var(--muted))] transition-colors"
              style={{ background: "rgba(128,128,128,0.08)" }}
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="overflow-y-auto flex-1 px-5" style={{ paddingBottom: "env(safe-area-inset-bottom, 24px)" }}>
            <SidebarContent {...sidebarProps} onNav={() => setSheetOpen(false)} />
          </div>
        </div>
      </div>
    </div>
  );
}
