// Content negotiation for agents, used by proxy.ts. Kept free of imports so
// tests can load it directly (tests/agent-negotiation.test.mjs).

const BASE = "https://byinertia.com";

/** The q value an Accept header gives a media type, or -1 if it doesn't list
 * it. Wildcards don't count: only an explicit text/markdown asks for it. */
function quality(accept: string, type: string): number {
  for (const part of accept.split(",")) {
    const [mediaType, ...params] = part.split(";").map((s) => s.trim().toLowerCase());
    if (mediaType !== type) continue;
    const q = params.find((p) => p.startsWith("q="));
    const value = q ? Number(q.slice(2)) : 1;
    return Number.isFinite(value) ? value : 1;
  }
  return -1;
}

/** True when the request asks for Markdown at least as much as HTML.
 * Browsers never list text/markdown, so they always get HTML. */
export function prefersMarkdown(accept: string | null | undefined): boolean {
  if (!accept) return false;
  const md = quality(accept, "text/markdown");
  return md > 0 && md >= quality(accept, "text/html");
}

// Every first path segment something on the site answers to: the folders in
// app/ and public/, plus what Next and the rewrites in next.config.mjs serve.
// tests/agent-negotiation.test.mjs fails if a folder in app/ or public/ is
// missing here, so a new section can't start answering Markdown 404s.
export const KNOWN_SEGMENTS = new Set([
  "_next",
  "accept-invite",
  "admin",
  "aether",
  "api",
  "auth",
  "blog",
  "bonuses",
  "components",
  "dashboard",
  "docs",
  "emoji",
  "fonts",
  "hero-lab",
  "ingest",
  "login",
  "og-lab",
  "policies",
  "portal",
  "reset-password",
  "reviews",
  "sfx",
  "textures",
  "work",
  "work-logos",
]);

/** False only for paths nothing on the site can answer: the first segment is
 * unknown and the last one isn't a file name (files such as /llms.txt,
 * /robots.txt or /icon.png are left to Next). Paths under a known segment
 * pass through, and a missing post still gets the site's own 404. */
export function isKnownPath(pathname: string): boolean {
  if (pathname === "/") return true;
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return true;
  if (KNOWN_SEGMENTS.has(segments[0])) return true;
  return segments[segments.length - 1].includes(".");
}

/** The Markdown body for a 404, for agents that asked for Markdown. */
export function markdownNotFound(pathname: string): string {
  return `# Page not found

There is no page at \`${pathname}\` on byinertia.com. It may have moved, or never existed.

## Where to go instead

- [Homepage](${BASE}/): Inertia, a design and development studio
- [Aether](${BASE}/aether): our Shopify theme
- [llms.txt](${BASE}/llms.txt): a Markdown summary of the whole site, for AI assistants
- [Sitemap](${BASE}/sitemap.xml): every public page
- [API spec](${BASE}/openapi.json): the OpenAPI description of the site's API
`;
}

export const MARKDOWN_HEADERS = {
  "Content-Type": "text/markdown; charset=utf-8",
  Vary: "Accept",
} as const;
