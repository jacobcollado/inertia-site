import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { DemoButton } from "./demo-button";
import { Mark, STORES } from "./stores-on-aether";
import { QUESTIONS } from "./faq";
import { BuyButton } from "./buy-button";
import { Questions } from "./questions";
import { Shots } from "./shots";
import { Checkout } from "./checkout";
import { Testimonials } from "./testimonials";
import { Compare } from "./compare";
import { Rating, REVIEWS_ID } from "./rating";
import { TrackAetherViewContent } from "./track-view-content";
import { AETHER_PRICING_ID } from "@/lib/scroll-to-hash";

export const metadata: Metadata = {
  title: { absolute: "Aether, a Shopify theme by Inertia" },
  description: "Aether is a Shopify theme that turns more visits into orders and makes a growing brand look established. Installed for you the same day. $125 once.",
  alternates: { canonical: "https://byinertia.com/aether" },
  openGraph: {
    type: "website",
    url: "https://byinertia.com/aether",
    title: { absolute: "Aether, a Shopify theme by Inertia" },
    description: "Aether is a Shopify theme that turns more visits into orders and makes a growing brand look established. Installed for you the same day. $125 once.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Aether Shopify Theme" }],
  },
  twitter: {
    card: "summary_large_image",
    title: { absolute: "Aether, a Shopify theme by Inertia" },
    description: "Aether is a Shopify theme that turns more visits into orders and makes a growing brand look established. Installed for you the same day. $125 once.",
    images: ["/og.png"],
  },
};

const DEMO_URL = "https://aether-starter.myshopify.com";

// The questions asked before buying, in the order they come up. Their
// answers live with the rest in faq.tsx.
const ASKED = [
  "Will my store look like the demo?",
  "What do I get when I buy?",
  "How does the install work?",
  "Will I lose my products or reviews?",
  "Can I pay in installments?",
  "What if it doesn't work on my store?",
];
// Asked here first, so its answer lives here.
const DEMO_QUESTION = {
  q: "Will my store look like the demo?",
  a: "It will look as good as your photos and products. Aether makes strong imagery look its best, and we set it up with yours. If your photos need work, the guides that come with it show how to shoot products and choose images that sell.",
};
const ASKED_QUESTIONS = ASKED.map((q) => (q === DEMO_QUESTION.q ? DEMO_QUESTION : QUESTIONS.find((x) => x.q === q))).filter(
  (x): x is { q: string; a: string } => Boolean(x),
);

// Structured data for this page only: the product, and the questions it
// answers. Lived in the root layout before, which put a product offer on
// every page of the studio site.
const AETHER_JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Aether",
    "alternateName": "Aether Shopify Theme",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Shopify",
    "url": "https://byinertia.com/aether",
    "description": "A Shopify theme that turns more visits into orders and makes a growing brand look established. Installed for you the same day.",
    "offers": {
      "@type": "Offer",
      "price": "125",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": "https://byinertia.com/aether#pricing",
    },
    "publisher": { "@id": "https://byinertia.com/#organization" },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": ASKED_QUESTIONS.map(({ q, a }) => ({
      "@type": "Question",
      "name": q,
      "acceptedAnswer": { "@type": "Answer", "text": a },
    })),
  },
];


// Aether for someone deciding fast, mostly on a phone: what it is and the
// way to buy, with the stores running it; what it does, marked on the
// screens of a store doing it; what the free theme leaves out; what owners
// say; the price, with the SMS add-on to tick; and the questions asked
// before paying. Every heading says its point outright, so the page reads
// in its headings alone. Everything in the site's one system.
export default function AetherPage() {
  return (
    <main className="index-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(AETHER_JSON_LD) }} />
      <TrackAetherViewContent />

      <section className="index-col ae-open" data-hero>
        {/* The product's own mark, so a visitor knows whose page this is
            before the claim. Drawn as a mask so it takes the page's ink. */}
        <span role="img" aria-label="Aether" className="ae-open__mark" />
        <h1 className="ae-open__line">Turn 3 to 5x more visits into orders.</h1>
        <p className="ae-open__sub">
          A Shopify theme with upsells, restock alerts and a free shipping tracker built in. Installed for you today.
        </p>
        <div className="ae-open__actions">
          <BuyButton />
          <DemoButton href={DEMO_URL} password="aether" className="ae-demo ae-demo--icon">
            <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1.5 9S4.2 3.75 9 3.75 16.5 9 16.5 9 13.8 14.25 9 14.25 1.5 9 1.5 9z" />
              <circle cx="9" cy="9" r="2.25" />
            </svg>
            See it in action
          </DemoButton>
        </div>
        <Rating />
      </section>

      <div className="index-col">
        <Shots />
      </div>

      <section className="index-col ae-stores">
        <p className="ae-stores__line">Running on these stores today.</p>
        {/* Each mark on its own tile, like the homepage's client wall, so
            marks of every style read as one set; the store named under it,
            since a crest this size doesn't say who it is. A row of five from
            900px; on phones a row to swipe, the next tile peeking in. */}
        <ul className="ae-stores__marks" aria-label="Stores running Aether" style={{ "--mark": "clamp(3rem, 4.4vw, 3.75rem)" } as CSSProperties}>
          {STORES.map((s) => (
            <li key={s.name} className="ae-stores__item">
              <div className="ae-stores__tile">
                <Mark s={s} className="ae-stores__mark" />
              </div>
              <span className="ae-stores__name">{s.name}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="index-col ae-vs">
        <h2 className="ae-section-line">What Shopify&apos;s free theme leaves out.</h2>
        <Compare />
      </section>

      <section id={REVIEWS_ID} className="index-col ae-said">
        <h2 className="ae-section-line">Owners we&apos;ve built for, in their words.</h2>
        <Testimonials />
      </section>

      <section id={AETHER_PRICING_ID} className="index-col ae-price" data-dock-hide>
        <h2 className="ae-section-line">Pay once. We install it today.</h2>
        <Checkout />
      </section>

      <section className="index-col ae-faq">
        <h2 className="ae-section-line">Asked before buying.</h2>
        <Questions items={ASKED_QUESTIONS} />
      </section>
    </main>
  );
}
