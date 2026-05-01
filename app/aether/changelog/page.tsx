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
  { title: "How to update", body: "Download the latest .zip from your license email, then go to Shopify Admin › Online Store › Themes › Add theme › Upload zip. Your live theme is untouched until you manually publish." },
  { title: "Version numbers", body: "Major releases may include breaking schema changes. Minor adds features without breaking existing ones. Patch fixes bugs only, always safe to apply." },
  { title: "Backup first", body: "Shopify keeps your previous theme as an unpublished copy when you publish a new one. Re-publish the old version from the theme list in seconds if needed." },
  { title: "Custom code", body: "Note which files you edited before updating. The changelog lists touched files per release so you know where conflicts might occur. Re-apply changes to the fresh files after uploading." },
];

const TYPE_LABEL: Record<NoteType, string> = {
  added: "Added",
  improved: "Improved",
  fixed: "Fixed",
  removed: "Removed",
};

// Soundwave-matched palette: muted blue-slates in dark, cool greys in light
const TYPE_COLOR: Record<NoteType, { bg: string; text: string; dot: string }> = {
  added:    { bg: "rgba(50,68,80,0.18)",  text: "#6a9ab0", dot: "#6a9ab0"  },
  improved: { bg: "rgba(62,62,90,0.18)",  text: "#8080b8", dot: "#8080b8"  },
  fixed:    { bg: "rgba(52,70,82,0.18)",  text: "#5a8a8a", dot: "#5a8a8a"  },
  removed:  { bg: "rgba(80,55,65,0.18)",  text: "#a07080", dot: "#a07080"  },
};

const LABEL_COLOR: Record<ReleaseLabel, { bg: string; text: string }> = {
  major: { bg: "rgba(62,62,90,0.22)", text: "#9090c8" },
  minor: { bg: "rgba(50,68,80,0.15)", text: "#6a9ab0" },
  patch: { bg: "rgba(80,80,80,0.12)", text: "#909090" },
};

const ALL_TYPES: NoteType[] = ["added", "improved", "fixed", "removed"];
const ALL_LABELS: ReleaseLabel[] = ["major", "minor", "patch"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function Divider() {
  return <div className="h-px bg-[rgb(var(--line))]" />;
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
    <div className="flex flex-col">

      {/* Filter by type */}
      <div className="py-6 border-b border-[rgb(var(--line))]">
        <p className="text-[11px] tracking-tight font-medium text-[rgb(var(--muted))] opacity-50 mb-4">Type</p>
        <div className="flex flex-col gap-1">
          {ALL_TYPES.map((t) => {
            const active = activeTypes.has(t);
            const c = TYPE_COLOR[t];
            return (
              <button
                key={t}
                onClick={() => toggleType(t)}
                className="w-full flex items-center justify-between py-1.5 text-[13px] tracking-tight transition-colors text-left rounded-sm px-1.5 -mx-1.5"
                style={active ? { background: c.bg, color: c.text } : {}}
              >
                <span className={active ? "" : "text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))]"}>
                  {TYPE_LABEL[t]}
                </span>
                {active && <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: c.dot }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter by release */}
      <div className="py-6 border-b border-[rgb(var(--line))]">
        <p className="text-[11px] tracking-tight font-medium text-[rgb(var(--muted))] opacity-50 mb-4">Release</p>
        <div className="flex flex-col gap-1">
          {ALL_LABELS.map((l) => {
            const active = activeLabels.has(l);
            const c = LABEL_COLOR[l];
            return (
              <button
                key={l}
                onClick={() => toggleLabel(l)}
                className="w-full flex items-center justify-between py-1.5 text-[13px] tracking-tight transition-colors text-left capitalize rounded-sm px-1.5 -mx-1.5"
                style={active ? { background: c.bg, color: c.text } : {}}
              >
                <span className={active ? "" : "text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))]"}>{l}</span>
                {active && <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: c.text }} />}
              </button>
            );
          })}
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="mt-3 text-[12px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Version index */}
      <div className="py-6 border-b border-[rgb(var(--line))]">
        <p className="text-[11px] tracking-tight font-medium text-[rgb(var(--muted))] opacity-50 mb-4">Versions</p>
        <ul className="flex flex-col gap-1">
          {CHANGELOG.map((entry) => {
            const c = LABEL_COLOR[entry.label];
            return (
              <li key={entry.version}>
                <a
                  href={`#v${entry.version}`}
                  onClick={onNav}
                  className="flex items-center justify-between py-1 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors tabular-nums"
                >
                  <span>v{entry.version}</span>
                  <span
                    className="text-[10px] capitalize px-1.5 py-0.5 rounded-sm"
                    style={{ background: c.bg, color: c.text }}
                  >
                    {entry.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Guide */}
      <div className="py-6">
        <p className="text-[11px] tracking-tight font-medium text-[rgb(var(--muted))] opacity-50 mb-4">Guide</p>
        <ul className="flex flex-col">
          {GUIDE.map((g, i) => (
            <li key={i} className="border-b border-[rgb(var(--line))] last:border-0">
              <button
                onClick={() => setGuideOpen(guideOpen === i ? null : i)}
                className="w-full flex items-start justify-between gap-3 py-3 text-left"
              >
                <span className={`text-[13px] tracking-tight leading-snug transition-colors ${guideOpen === i ? "text-[rgb(var(--fg))]" : "text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))]"}`}>
                  {g.title}
                </span>
                <svg
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
                  strokeLinecap="round" strokeLinejoin="round"
                  className="h-3 w-3 shrink-0 mt-[3px] text-[rgb(var(--muted))]"
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
                <p className="text-[13px] leading-relaxed tracking-tight text-[rgb(var(--muted))] pb-4">
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
  const [activeTypes, setActiveTypes] = useState<Set<NoteType>>(new Set());
  const [activeLabels, setActiveLabels] = useState<Set<ReleaseLabel>>(new Set());
  const [guideOpen, setGuideOpen] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

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
    <div className="page-container mx-auto w-full max-w-5xl min-h-screen flex flex-col">

      {/* Header */}
      <header className="px-8 pt-6 sm:pt-8 pb-12 rise" style={{ ["--rise-delay" as any]: "0ms" }}>
        <Link
          href="/aether"
          className="text-sm tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          ← Aether
        </Link>
      </header>

      <Divider />

      {/* Title row */}
      <div className="px-8 py-10 rise" style={{ ["--rise-delay" as any]: "60ms" }}>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tighter leading-none mb-3">Changelog</h1>
        <p className="text-[15px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">
          Every change documented with context: what changed, why, and how it works.
        </p>
      </div>

      <Divider />

      {/* Mobile filter trigger */}
      <div className="lg:hidden px-8 py-4 flex items-center gap-3">
        <button
          onClick={() => setSheetOpen(true)}
          className="inline-flex items-center gap-2 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="20" y2="12" />
            <line x1="12" y1="18" x2="20" y2="18" />
          </svg>
          Filters &amp; guide
          {hasFilters && (
            <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-[rgb(var(--fg))] text-[rgb(var(--bg))] text-[9px] font-medium">
              {activeTypes.size + activeLabels.size}
            </span>
          )}
        </button>
        {hasFilters && (
          <button onClick={clearFilters} className="text-[12px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
            Clear
          </button>
        )}
      </div>
      {/* Mobile divider only */}
      <div className="lg:hidden h-px bg-[rgb(var(--line))]" />

      {/* Body */}
      <div className="rise flex flex-1" style={{ ["--rise-delay" as any]: "120ms" }}>

        {/* Sidebar */}
        <aside className="hidden lg:block w-52 xl:w-60 shrink-0 border-r border-[rgb(var(--line))]">
          <div className="sticky top-8 px-8 pr-6">
            <SidebarContent {...sidebarProps} />
          </div>
        </aside>

        {/* Entries */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="px-8 py-24 text-center">
              <p className="text-[15px] tracking-tight text-[rgb(var(--muted))] mb-4">No releases match the current filters.</p>
              <button onClick={clearFilters} className="text-[13px] tracking-tight text-[rgb(var(--fg))] underline underline-offset-2">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="flex flex-col">
              {filtered.map((entry, ei) => (
                <article key={entry.version} id={`v${entry.version}`} className="scroll-mt-8">
                  {/* Version header */}
                  <div className="px-8 py-8 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-5 border-b border-[rgb(var(--line))]">
                    <span className="text-2xl font-medium tracking-tighter tabular-nums text-[rgb(var(--fg))]">
                      v{entry.version}
                    </span>
                    <span
                      className="self-start text-[11px] capitalize px-2 py-0.5 rounded-sm tracking-tight"
                      style={{ background: LABEL_COLOR[entry.label].bg, color: LABEL_COLOR[entry.label].text }}
                    >
                      {entry.label}
                    </span>
                    <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] tabular-nums sm:ml-auto">
                      {formatDate(entry.date)}
                    </span>
                  </div>

                  {/* Summary */}
                  <div className="px-8 py-6 border-b border-[rgb(var(--line))]">
                    <p className="text-[15px] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-2xl">
                      {entry.summary}
                    </p>
                  </div>

                  {/* Notes */}
                  <ul className="flex flex-col">
                    {entry.notes.map((note, i) => (
                      <li
                        key={i}
                        className="px-8 py-6 border-b border-[rgb(var(--line))] grid grid-cols-1 md:grid-cols-[120px_1fr] gap-x-8 gap-y-2"
                      >
                        <span
                          className="self-start text-[11px] tracking-tight px-1.5 py-0.5 rounded-sm"
                          style={{ background: TYPE_COLOR[note.type].bg, color: TYPE_COLOR[note.type].text }}
                        >
                          {TYPE_LABEL[note.type]}
                        </span>
                        <div>
                          <p className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))] mb-1.5">
                            {note.title}
                          </p>
                          <p className="text-[13px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">
                            {note.detail}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Spacer between releases */}
                  {ei < filtered.length - 1 && <div className="h-px bg-[rgb(var(--line))] opacity-0" />}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setSheetOpen(false)}
            style={{ animation: "fade-in 200ms ease both" }}
          />
          <div
            className="relative z-10 bg-[rgb(var(--bg))] rounded-t-2xl border-t border-[rgb(var(--line))] pt-5 pb-10 max-h-[85vh] overflow-y-auto"
            style={{ animation: "sheet-up 320ms cubic-bezier(0.22,1,0.36,1) both" }}
          >
            <div className="absolute left-1/2 -translate-x-1/2 top-3 h-1 w-10 rounded-full bg-[rgb(var(--line))]" />
            <div className="flex items-center justify-between px-6 mb-2">
              <p className="text-[14px] font-medium tracking-tight text-[rgb(var(--fg))]">Filters &amp; guide</p>
              <button
                onClick={() => setSheetOpen(false)}
                className="text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors p-1"
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="px-6">
              <SidebarContent {...sidebarProps} onNav={() => setSheetOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes sheet-up {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
