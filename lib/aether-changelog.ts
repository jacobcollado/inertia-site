export type NoteType = "added" | "improved" | "fixed" | "removed";
export type ReleaseLabel = "major" | "minor" | "patch";
export type ChangelogNote = { type: NoteType; title: string; detail: string };
export type ChangelogEntry = { version: string; date: string; label: ReleaseLabel; summary: string; notes: ChangelogNote[] };

export const AETHER_CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.6.0",
    date: "2026-09-29",
    label: "minor",
    summary: "A full-bleed Imagery section, Klaviyo signups on the password page and a redesigned lightbox, plus fixes for collection filtering and cart pricing in non-dollar currencies.",
    notes: [
      { type: "added",    title: "Imagery section and page template",          detail: "A new full-bleed Imagery section for the homepage, plus an \"imagery\" page template. Show single shots, two-up pairs and looping video, each with optional overlay text and a separate mobile image." },
      { type: "added",    title: "Imagery layout controls",                    detail: "Choose each shot's height (fit image, half, three-quarter or full screen), side margin and spacing. Includes reveal-on-scroll, an optional lightbox and a Show section switch." },
      { type: "added",    title: "Klaviyo signups on the password page",       detail: "Collect email or SMS signups straight into Klaviyo using your Klaviyo public API key and list ID." },
      { type: "added",    title: "Phone field and SMS consent text",           detail: "A phone number field for Klaviyo SMS, and editable SMS consent text for Klaviyo and Postscript." },
      { type: "added",    title: "Show variant label setting",                 detail: "Product sections can now show or hide the variant label. It stays on by default." },
      { type: "added",    title: "Free shipping bar toggle",                   detail: "The free shipping bar can be turned off in each header. It stays on by default." },
      { type: "fixed",    title: "Cart prices in non-dollar currencies",       detail: "Cart prices showed \"$\" in every currency. The cart now follows your store's money format and converts the free shipping threshold for Shopify Markets." },
      { type: "fixed",    title: "Price filters returned the wrong products",  detail: "Collection price filters now return the products in the selected range." },
      { type: "fixed",    title: "Page links dropped active filters",          detail: "Moving between collection pages now keeps the filters you've applied." },
      { type: "fixed",    title: "Filters with quote marks",                   detail: "Filter options containing quote marks stopped the collection from updating in place. They now filter like any other option." },
      { type: "fixed",    title: "Campaign lightbox counted images twice",     detail: "The campaign lookbook lightbox now shows the correct image count." },
      { type: "fixed",    title: "Footer menus stuck open",                    detail: "Footer menus could get stuck open when clicked quickly." },
      { type: "improved", title: "Early access signup stays on the page",      detail: "Signing up on the password page no longer navigates away. It shows a loading state, clear error messages and a success confirmation." },
      { type: "improved", title: "Signup panel redesign",                      detail: "Consistent corners, flat buttons and a close button. Swipe down to close on phones, and a floating panel on desktop." },
      { type: "improved", title: "Urgency popup redesign",                     detail: "Matches the signup panel, with settings for position, font weight, background opacity, a live dot and a tap-to-join button. It now uses the signup panel's colors, so set Colors to Custom to keep your own." },
      { type: "improved", title: "Password page logo and countdown",           detail: "The logo sits centered above the heading with the countdown beneath it, and has separate desktop and mobile widths." },
      { type: "improved", title: "Password page settings reorganized",         detail: "The most-used options come first, with shorter labels." },
      { type: "improved", title: "New lookbook lightbox",                      detail: "The homepage and campaign lookbooks get larger images, swipe on mobile, smooth transitions, and keyboard and screen-reader support." },
      { type: "improved", title: "Lookbook page uses the main header",         detail: "The lookbook page now shows Header 2 with all its menu and cart features, so its header settings apply there too." },
      { type: "improved", title: "Faster campaign images",                     detail: "Campaign images load faster, fade in as you scroll, and each carousel has its own progress bar on mobile." },
      { type: "improved", title: "Faster collection filtering",                detail: "Filtering is quicker, a message shows when no products match or a collection has no filters, and price ranges no longer overlap." },
      { type: "improved", title: "Collection grid loads cleanly",              detail: "Products appear without a loading-grid flash, and the entrance animation is shorter." },
      { type: "improved", title: "Subtle back button on product pages",        detail: "The back button is now an arrow over the product image instead of its own row." },
      { type: "improved", title: "Product info tabs",                          detail: "Size Chart and the other info tabs use the footer's chevron and no longer have divider lines." },
      { type: "improved", title: "Product image fade-in",                      detail: "The product image fades in once it has loaded, with the details rising alongside." },
      { type: "improved", title: "Smoother header and footer menus",           detail: "Header and footer menus open and close more smoothly on desktop and mobile." },
      { type: "improved", title: "Mobile cart polish",                         detail: "The order note no longer shows a white outline, and in Header 2 the checkout sits right below your products." },
      { type: "improved", title: "Page crossfades",                            detail: "Pages crossfade into each other in supported browsers (Chrome, Edge, Safari 18 and later)." },
    ],
  },
  {
    version: "1.4.0",
    date: "2026-06-01",
    label: "minor",
    summary: "SMS capture widget, signup notification card, and custom cursor support.",
    notes: [
      { type: "added",    title: "SMS overlay widget",                        detail: "A corner-anchored SMS signup widget with a configurable position (top-left, middle-right, etc.), heading, body copy, and signup URL. Dismisses on click-outside and remembers the dismissed state for the session." },
      { type: "added",    title: "Signup notification card",                  detail: "A non-intrusive slide-in card that prompts email or SMS signups after a configurable delay. Supports a discount code reveal on success, suppress-for-N-days logic, and full color customisation without touching code." },
      { type: "added",    title: "Custom cursor support",                     detail: "Theme settings now include a cursor image picker. When set, the custom cursor replaces the default pointer across the entire storefront including links and buttons. Unset to revert to the system cursor." },
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

// The zip in storage is always the newest release, so a download is recorded
// as this version. Ship a new changelog entry together with the new zip.
export const LATEST_AETHER_VERSION = AETHER_CHANGELOG[0].version;

export function compareVersions(a: string, b: string) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

// The release a license holder last downloaded. Downloads from before
// versions were recorded only have a date, so those fall back to the newest
// release out at the time.
export function downloadedThemeVersion(license: { downloaded_at: string | null; downloaded_version: string | null }) {
  if (license.downloaded_version) return license.downloaded_version;
  if (!license.downloaded_at) return null;
  const day = license.downloaded_at.slice(0, 10);
  return AETHER_CHANGELOG.find(r => r.date <= day)?.version ?? null;
}

// Releases newer than what the license holder has, newest first. Empty when
// they're current or haven't downloaded yet (onboarding covers that case).
export function releasesSince(license: { downloaded_at: string | null; downloaded_version: string | null }) {
  const current = downloadedThemeVersion(license);
  if (!current) return [];
  return AETHER_CHANGELOG.filter(r => compareVersions(r.version, current) > 0);
}

export function formatChangelogDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}
