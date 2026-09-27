import { getAllPosts } from "@/lib/posts";
import { getAllWork } from "@/lib/work";
import { getAllBonuses } from "@/lib/bonuses";
import { QUESTIONS } from "@/app/aether/faq";

// llms.txt (https://llmstxt.org): a plain markdown summary of the site for AI
// assistants and crawlers. Built from content/ so new work and posts show up
// without editing this file.
export const dynamic = "force-static";

const BASE = "https://byinertia.com";

// Mirrors the pricing block on /aether (app/aether/inline-pricing.tsx, a
// client component this route can't import from). Update both together.
const AETHER_PRICE = 125;
const INSTALL_VALUE = 50;
const SMS_SETUP_PRICE = 10;

export function GET() {
  const work = getAllWork();
  const posts = getAllPosts();

  const workLines = work.map((w) => {
    const meta = [w.service, w.year].filter(Boolean).join(", ");
    return `- [${w.client}](${BASE}/work/${w.slug})${meta ? ` (${meta})` : ""}: ${w.summary ?? w.blurb ?? ""}`.trimEnd();
  });

  // The Ask AI buttons point assistants here when /aether itself won't load
  // for them, so this has to answer "what's included, what does it cost, is
  // it a fit" on its own.
  const bonuses = getAllBonuses();
  const bonusTotal = bonuses.reduce((sum, b) => sum + b.worth, 0);
  const bonusLines = bonuses.map((b) => `  - ${b.title} (${b.kind}, worth $${b.worth}): ${b.summary}`);
  // One level below the "Aether FAQ" heading, so the questions read as its entries.
  const faqLines = QUESTIONS.map(({ q, a }) => `#### ${q}\n\n${a}`);

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
- [Aether for agencies](${BASE}/aether/commercial): per-store or unlimited commercial licenses for agencies, studios, and operators building client stores
- [Changelog](${BASE}/aether/changelog): theme updates and release notes
- [Docs](${BASE}/docs): setup and customization guides

### What comes with an Aether license

- Price: $${AETHER_PRICE} once, no subscription or renewals. Optional SMS setup for +$${SMS_SETUP_PRICE}.
- License key by email within a minute of purchase
- The full theme, all 41 sections, for one Shopify store
- Lifetime updates and priority support from the people who built it
- Installation done for you the same day, normally worth $${INSTALL_VALUE}. You accept a Shopify collaborator request and we set it up. Your current theme stays live until you publish.
- A personal dashboard with your license key, the latest theme files and support
- $${bonusTotal} in bonuses, included free:
${bonusLines.join("\n")}
- Guarantee: if we can't get Aether working on your store within 14 days, you get a full refund.
- Total value: $${AETHER_PRICE + INSTALL_VALUE + bonusTotal}, for $${AETHER_PRICE}.

### Aether FAQ

${faqLines.join("\n\n")}

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
