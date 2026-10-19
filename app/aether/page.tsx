import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import { DemoButton } from "./demo-button";
import { HeroLooks } from "./hero-looks";
import { HeroPhones } from "./hero-phones";
import { Mark, STORES } from "./stores-on-aether";
import { QUESTIONS } from "./faq";
import { BuyButton } from "./buy-button";
import { Questions } from "./questions";
import { Walkthrough, type WalkStep } from "./walkthrough";
import { TESTIMONIALS, type Testimonial } from "./reviews";
import { PolicyDisclaimer } from "./policy-disclaimer";
import { TrackAetherViewContent } from "./track-view-content";
import { PaymentMethodIcons } from "@/components/payment-method-icons";
import { AETHER_CHECKOUT_ID, AETHER_PRICING_ID } from "@/lib/scroll-to-hash";

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

const INCLUDES = ["The full theme, all 41 sections", "Updates for life, no renewals", "Full refund if we can\u2019t get it working"];

// A walk through a store on Aether: the home page, a product, the cart.
const STEPS: WalkStep[] = [
  {
    name: "Home",
    title: "Taken seriously on arrival.",
    line: "Editorial imagery and quiet type, so a new visitor reads you as established before they scroll.",
    desktop: { src: "/aether/demo/desktop-poster.jpg", w: 1440, h: 902 },
    mobile: { src: "/aether/feature-mobile-guided.png", w: 1300, h: 2642 },
  },
  {
    name: "Product",
    title: "Sold-out sizes, shown up front.",
    line: "Nobody clicks a size that isn\u2019t there, and a back-in-stock alert brings them back when it returns.",
    desktop: { src: "/aether/scarcity.png", w: 1024, h: 597 },
    mobile: { src: "/aether/feature-mobile-scarcity.png", w: 1300, h: 2642 },
  },
  {
    name: "Cart",
    title: "One more thing in the bag.",
    line: "Picks in the cart and a free shipping bar, right where shoppers decide.",
    desktop: { src: "/aether/checkout-cart-drawer.png", w: 1024, h: 687 },
    mobile: { src: "/aether/feature-mobile-upsell.png", w: 1300, h: 2642 },
  },
];

// The extras every license comes with (the guides and lists in bonuses.ts,
// which the license email sends), described short enough for a phone.
const icon = (d: string) => (
  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const EXTRAS = [
  {
    title: "Getting the most from Aether",
    desc: "The sections and settings worth knowing.",
    icon: icon("M2.5 3.5h13v4h-13zM2.5 10.5h6v4h-6zM11.5 10.5h4v4h-4z"),
  },
  {
    title: "Shooting your products",
    desc: "Clean shots on a phone or a camera.",
    icon: icon("M2.5 6a1.5 1.5 0 0 1 1.5-1.5h1.8l1.2-2h4l1.2 2H14A1.5 1.5 0 0 1 15.5 6v7a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 13zM9 12.25a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5z"),
  },
  {
    title: "Imagery that converts",
    desc: "The photos that sell, and why.",
    icon: icon("M3.5 2.5h11a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1zM2.5 12l3.5-3.5 3 3 2-2 4.5 4.5M11.75 6.75a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5z"),
  },
  {
    title: "Manufacturers we trust",
    desc: "Two we\u2019ve worked with and recommend.",
    icon: icon("M2.5 5.5 9 2.5l6.5 3v7L9 15.5l-6.5-3zM2.5 5.5 9 8.5l6.5-3M9 8.5v7"),
  },
  {
    title: "Designers we trust",
    desc: "For your logo, graphics and artwork.",
    icon: icon("M11.5 2.5l4 4-8.5 8.5H3v-4zM9.5 4.5l4 4"),
  },
];

// A review as its standout line, quoted exactly from what the store sent
// (the full text lives in reviews.ts), with the store under it.
function Quote({ t }: { t: Testimonial }) {
  const line = t.highlight ?? t.quote;
  return (
    <figure className="ae-quote">
      <blockquote className="ae-quote__text">
        &ldquo;{line.charAt(0).toUpperCase() + line.slice(1).replace(/[.!]$/, "")}&rdquo;
      </blockquote>
      <figcaption className="ae-quote__by">
        {t.logo && <Image src={t.logo} alt="" width={28} height={28} className="ae-quote__logo" />}
        {t.site ?? t.name}
      </figcaption>
    </figure>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="ae-check" aria-hidden="true">
      <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
    </svg>
  );
}

// Aether, as simple as a page that sells can be: the pain and the offer,
// the theme itself and the stores running it, a walk through a store doing
// its job, what owners say, the honest part about photos, the price once,
// and the questions asked before paying. Everything in the site's one
// system (the homepage's type and buttons).
export default function AetherPage() {
  return (
    <main className="index-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(AETHER_JSON_LD) }} />
      <TrackAetherViewContent />

      <section className="index-col ae-open" data-hero>
        <Image src="/work-logos/aether.png" alt="Aether" width={220} height={55} className="ae-open__mark" priority />
        <h1 className="ae-open__line">Your clothes look better than your store.</h1>
        <p className="ae-open__sub">
          Aether is a Shopify theme for fashion brands, built to turn visits into orders. We install it for you today.
        </p>
        <div className="ae-open__actions">
          <BuyButton />
          <div className="ae-open__demo">
            <DemoButton href={DEMO_URL} password="aether" />
          </div>
        </div>
        <p className="ae-open__note">One payment. Full refund if we can&apos;t get it working.</p>
      </section>

      <section className="index-col ae-looks" aria-label="Example stores">
        <div className="sm:hidden">
          <HeroPhones />
        </div>
        <div className="mx-auto hidden max-w-[56rem] sm:block">
          <HeroLooks />
        </div>
      </section>

      <section className="index-col ae-stores" aria-label="Stores running Aether">
        <p className="ae-stores__label">Running Aether today</p>
        <ul className="ae-stores__marks" style={{ "--mark": "2rem" } as CSSProperties}>
          {STORES.map((s) => (
            <li key={s.name} className="flex items-center">
              <Mark s={s} className="opacity-40" />
            </li>
          ))}
        </ul>
      </section>

      <Walkthrough steps={STEPS} />

      <section className="index-col ae-said" aria-label="What owners say">
        <h2 className="index-spot__label">From stores on Aether</h2>
        <div className="ae-said__grid">
          {TESTIMONIALS.map((t) => (
            <Quote key={t.name} t={t} />
          ))}
        </div>
      </section>

      <section className="index-col ae-photos">
        <h2 className="ae-photos__line">It looks as good as your photos.</h2>
        <p className="ae-photos__sub">So we help you get them there.</p>
        <div className="ae-extras">
          <p className="ae-extras__label">With every license</p>
          <ul className="ae-extras__list">
            {EXTRAS.map((x) => (
              <li key={x.title} className="ae-extras__item">
                <span className="ae-extras__icon">{x.icon}</span>
                <span className="ae-extras__text">
                  <span className="ae-extras__title">{x.title}</span>
                  <span className="ae-extras__desc">{x.desc}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id={AETHER_PRICING_ID} className="index-col ae-price" data-dock-hide>
        <h2 className="ae-price__lead">Installed by us today.</h2>
        <p className="ae-price__sub">Your current theme stays live until you say go.</p>
        <p className="ae-price__amount">
          $125 <span>once</span>
        </p>
        <p className="ae-price__klarna">or 4 interest-free payments of $31.25 with Klarna</p>
        <ul className="ae-price__includes">
          {INCLUDES.map((line) => (
            <li key={line}>
              <Check />
              {line}
            </li>
          ))}
        </ul>
        <BuyButton id={AETHER_CHECKOUT_ID} />
        <div className="ae-price__small">
          <PaymentMethodIcons />
          <PolicyDisclaimer />
        </div>
      </section>

      <section className="index-col ae-faq">
        <h2 className="index-spot__label">Before you buy</h2>
        <Questions items={ASKED_QUESTIONS} />
      </section>
    </main>
  );
}
