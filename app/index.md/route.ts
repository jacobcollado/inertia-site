import { getAllPosts } from "@/lib/posts";
import { getAllWork } from "@/lib/work";
import { MARKDOWN_HEADERS } from "@/lib/agent-negotiation";
import {
  AI_APPROACH,
  EXECUTION_INTRO,
  EXECUTION_PRINCIPLES,
  HERO_HEADING_LINES,
  HERO_SUBLINE,
  WHAT_WE_DO_ITEMS,
  plainCopy,
} from "@/lib/home-copy";

// The homepage as Markdown, for agents. proxy.ts rewrites a request for /
// that asks for text/markdown here; it's also reachable as /index.md. Built
// from the same copy as the page (lib/home-copy.ts), so the two can't drift.
export const dynamic = "force-static";

const BASE = "https://byinertia.com";

export function GET() {
  const work = getAllWork().filter((w) => w.slug !== "ft-gioo");
  const posts = getAllPosts();

  const heading = HERO_HEADING_LINES.flat().join(" ");
  const principles = EXECUTION_PRINCIPLES.map((p, i) => `${i + 1}. **${p.label}.** ${plainCopy(p.text)}`);
  const stages = WHAT_WE_DO_ITEMS.map((s, i) => `${i + 1}. **${s.label}.** ${s.description}`);
  const workLines = work.map((w) => {
    const meta = [w.service, w.year].filter(Boolean).join(", ");
    return `- [${w.client}](${BASE}/work/${w.slug})${meta ? ` (${meta})` : ""}: ${w.summary ?? w.blurb ?? ""}`.trimEnd();
  });
  const postLines = posts.map(
    (p) => `- [${p.title}](${BASE}/blog/${p.slug}): ${p.summary ?? p.subtitle ?? ""}`.trimEnd(),
  );

  const body = `# Inertia: ${heading}

${HERO_SUBLINE}

- [Reach out](${BASE}/#start)
- [View Aether](${BASE}/aether), our Shopify theme

## How we think about execution

${plainCopy(EXECUTION_INTRO)}

${principles.join("\n")}

## How we think about AI

${AI_APPROACH.map(plainCopy).join("\n\n")}

## What we do

${stages.join("\n")}

## Our thoughts

${postLines.join("\n")}

## In good company

${workLines.join("\n")}

## Working on something?

Tell us a little about it at ${BASE}/#start. It takes about two minutes, and we read every answer. Or email hello@byinertia.com.

## More

- [llms.txt](${BASE}/llms.txt): the whole site in one Markdown file
- [Sitemap](${BASE}/sitemap.xml)
- [API spec](${BASE}/openapi.json)
`;

  return new Response(body, { headers: MARKDOWN_HEADERS });
}
