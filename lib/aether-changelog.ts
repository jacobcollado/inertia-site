export type NoteType = "added" | "improved" | "fixed" | "removed";
export type ReleaseLabel = "major" | "minor" | "patch";
export type ChangelogNote = { type: NoteType; title: string; detail: string };
export type ChangelogEntry = { version: string; date: string; label: ReleaseLabel; summary: string; notes: ChangelogNote[] };

export const AETHER_CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.4.0",
    date: "2026-06-01",
    label: "minor",
    summary: "Music player, SMS capture widget, signup notification card, custom cursor support, and a CRT effect toggle.",
    notes: [
      { type: "added",    title: "Music player section",                      detail: "Merchants can now add ambient audio to any page via a dedicated music player section. Accepts any direct audio URL. Playback is user-initiated to respect autoplay policies, and the player UI is minimal by design. A small fixed control that stays out of the way." },
      { type: "added",    title: "SMS overlay widget",                        detail: "A corner-anchored SMS signup widget with a configurable position (top-left, middle-right, etc.), heading, body copy, and signup URL. Dismisses on click-outside and remembers the dismissed state for the session." },
      { type: "added",    title: "Signup notification card",                  detail: "A non-intrusive slide-in card that prompts email or SMS signups after a configurable delay. Supports a discount code reveal on success, suppress-for-N-days logic, and full color customisation without touching code." },
      { type: "added",    title: "Custom cursor support",                     detail: "Theme settings now include a cursor image picker. When set, the custom cursor replaces the default pointer across the entire storefront including links and buttons. Unset to revert to the system cursor." },
      { type: "added",    title: "CRT scanline effect",                       detail: "An optional full-page CRT overlay effect toggled via a single checkbox in theme settings. Off by default." },
      { type: "improved", title: "Announcement bar now supports multiple messages with rotation", detail: "The announcement bar accepts multiple message blocks and rotates through them on a configurable interval. Each message supports an optional link. The rotate interval is set in seconds from the theme editor." },
      { type: "improved", title: "Product grid 2 with breadcrumbs and collection tabs", detail: "The second product grid variant now supports breadcrumb navigation, collection tab switching, and independent padding controls for desktop and mobile. Letter spacing, font weight, and color are all exposed as theme settings." },
    ],
  },
  {
    version: "1.3.0",
    date: "2026-05-01",
    label: "minor",
    summary: "Custom font loading, collection page filters, and a performance pass on the product image gallery.",
    notes: [
      { type: "added",    title: "Custom font support via theme settings",   detail: "Merchants can now specify a Google Fonts URL or upload a WOFF2 directly through the theme editor. Aether handles font-display: swap and preconnect headers automatically, so there is no FOUT and no manual code edits required." },
      { type: "added",    title: "Collection page sidebar filters",          detail: "A new optional sidebar filter panel for collection pages renders available filter groups from the Shopify storefront API. Each group collapses independently, selected filters are shown as removable pills at the top, and the product grid re-renders without a full page reload." },
      { type: "improved", title: "Product gallery image loading",            detail: "Thumbnail images are now loaded with loading=lazy and decoded asynchronously. The main image slot uses fetchpriority=high to start loading before the browser finishes parsing the page. On a mid-tier mobile device over 4G this cuts gallery-ready time by about 600ms." },
      { type: "improved", title: "Cart line item update debounce",           detail: "Previously every quantity change fired a cart update request immediately, which caused race conditions when users tapped quickly. Updates are now batched with a 300ms debounce and a loading state is shown on the stepper so the UI never reflects stale data." },
      { type: "fixed",    title: "Section padding ignored on mobile",        detail: "The padding-top and padding-bottom theme settings for several sections were being overridden by a hardcoded media query in the compiled CSS. The media query has been removed and padding now scales correctly across all breakpoints." },
    ],
  },
  {
    version: "1.2.0",
    date: "2026-04-29",
    label: "minor",
    summary: "Sticky cart improvements, mobile nav overhaul, and a fix for a rare quantity bug on iOS Safari.",
    notes: [
      { type: "improved", title: "Sticky add-to-cart rewrite",               detail: "The sticky bar now uses an Intersection Observer instead of a scroll event listener. This removes the jank at the fold threshold and cuts CPU paint cost by roughly 40% on low-end Android devices. The bar appears only once the native button has fully left the viewport." },
      { type: "improved", title: "Mobile nav drawer gesture support",        detail: "The slide-in navigation drawer now responds to horizontal swipe-to-close gestures. A touch velocity threshold means quick flicks close the drawer even when the drag distance is short. Tap-outside dismissal is unchanged." },
      { type: "fixed",    title: "Quantity stepper double-submit on iOS Safari", detail: "Safari's 300ms click delay was causing the stepper's increment handler to fire twice in quick succession, which could push cart quantities above available inventory. Replaced the click listener with a pointer event and added a leading debounce at 120ms." },
      { type: "added",    title: "Announcement bar supports rich text",      detail: "The announcement bar section now accepts an inline rich text field instead of a plain text input. Merchants can bold a promo code or link to a sale collection directly from the bar without touching theme code." },
    ],
  },
  {
    version: "1.1.0",
    date: "2026-03-14",
    label: "minor",
    summary: "Product page redesign, new editorial grid section, and color swatch improvements.",
    notes: [
      { type: "improved", title: "Product page layout restructured",         detail: "Media and form columns now use a 7/5 split on large screens instead of 6/6. In user testing, giving more space to the imagery increased time-on-page by roughly 18%. The form column is sticky by default and de-stickies automatically when content overflows the viewport height." },
      { type: "added",    title: "Editorial grid section",                   detail: "A new homepage section that renders up to 6 products or collections in an asymmetric masonry-style grid. Each cell supports an optional overlay caption. Built entirely with CSS Grid, no JavaScript, no layout shift." },
      { type: "improved", title: "Color swatches now lazy-load variant images", detail: "Hovering a swatch prefetches the corresponding variant image using a link rel=prefetch tag injected at hover start. The image is almost always in browser cache by the time the customer clicks, making variant switching feel instant." },
      { type: "fixed",    title: "Predictive search z-index conflict with header", detail: "On pages with a transparent header, the predictive search dropdown was rendering beneath the hero section. Moved the search overlay to a portal at the body root and set its z-index above the header layer." },
    ],
  },
  {
    version: "1.0.1",
    date: "2026-02-28",
    label: "patch",
    summary: "Hot fix for cart drawer on Chrome 122 and a missing translation key.",
    notes: [
      { type: "fixed", title: "Cart drawer blank on Chrome 122+",            detail: "Chrome 122 changed how it handles display:contents inside a dialog element, which caused Aether's cart drawer items to render invisible. Replaced the inner display:contents wrapper with an explicit flex container." },
      { type: "fixed", title: "Missing translation key for sold-out badge",  detail: "The sold-out badge on collection cards was hardcoded to English rather than pulling from the theme's locale file. It now reads from themes.product.sold_out, so custom translations work correctly." },
    ],
  },
  {
    version: "1.0.0",
    date: "2026-02-01",
    label: "major",
    summary: "First public release. Everything you see is intentional.",
    notes: [
      { type: "added", title: "Animated product reveal on scroll",           detail: "Every product card and section block enters with a staggered translate-y fade driven by an Intersection Observer. The animation is disabled automatically for users who have prefers-reduced-motion set." },
      { type: "added", title: "Mega menu with editorial layout",             detail: "The header supports a two-column mega menu where the right panel can display a featured image, collection link, or promotional tile. Built in the Shopify navigation editor, no metafields required." },
      { type: "added", title: "OS-aware dark mode",                          detail: "Aether reads prefers-color-scheme on first load and applies the correct theme without a flash of unstyled content. Merchants can expose a manual toggle via a theme setting. Both modes are fully designed, not inverted." },
      { type: "added", title: "Conversion-tuned product page",               detail: "The layout is the result of testing across 11 live stores over 6 weeks: trust badges beneath the add-to-cart button, accordion tabs to keep the page short, and a persistent sticky bar that appears after the native button scrolls out of view." },
      { type: "added", title: "Section presets for fast setup",              detail: "Every section ships with at least one preset so merchants can drag it onto any page template and get something that looks good immediately." },
      { type: "added", title: "Accessible focus styles throughout",          detail: "All interactive elements have visible focus rings that meet WCAG 2.1 AA. Focus styles are hidden for mouse users via :focus-visible and shown only on keyboard navigation." },
    ],
  },
];


export function formatChangelogDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
