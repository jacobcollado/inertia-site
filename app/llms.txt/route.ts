import { getAllPosts } from "@/lib/posts";
import { getAllWork } from "@/lib/work";

// llms.txt (https://llmstxt.org): a plain markdown summary of the site for AI
// assistants and crawlers. Built from content/ so new work and posts show up
// without editing this file.
export const dynamic = "force-static";

const BASE = "https://byinertia.com";

export function GET() {
  const work = getAllWork();
  const posts = getAllPosts();

  const workLines = work.map((w) => {
    const meta = [w.service, w.year].filter(Boolean).join(", ");
    return `- [${w.client}](${BASE}/work/${w.slug})${meta ? ` (${meta})` : ""}: ${w.summary ?? w.blurb ?? ""}`.trimEnd();
  });

  const postLines = posts.map(
    (p) => `- [${p.title}](${BASE}/blog/${p.slug}): ${p.summary ?? p.subtitle ?? ""}`.trimEnd(),
  );

  const body = `# Inertia

> Inertia is a design studio for founders and brands moving fast. Direction, design, and development, handled by one focused team. The studio builds Shopify storefronts, custom websites, and web app interfaces, and makes Aether, a premium Shopify theme.

## About

- Name: Inertia
- Website: ${BASE}
- What we do: brand and product direction, visual and interface design, and front-end and Shopify development
- Who we work with: founders, ecommerce brands, artists, and product teams who care about presentation and need to ship quickly
- How we work: one small team from first conversation to launch, with no handoffs between agencies
- Start a project: ${BASE}/#start

## Aether, our Shopify theme

- [Aether](${BASE}/aether): a Shopify theme for brands that care how their store looks. 41 sections, dark mode, sticky cart and mega menu, installed for you the same day. $125 once for a single store, with lifetime updates.
- [Aether for agencies](${BASE}/aether/enterprise): per-store or unlimited commercial licenses for agencies, studios, and operators building client stores
- [Changelog](${BASE}/aether/changelog): theme updates and release notes
- [Docs](${BASE}/docs): setup and customization guides

## Selected work

${workLines.join("\n")}

## Writing

${postLines.join("\n")}

## Optional

- [All work](${BASE}/work)
- [Blog](${BASE}/blog)
- [Terms of service](${BASE}/policies/terms-of-service)
- [Privacy policy](${BASE}/policies/privacy-policy)
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
