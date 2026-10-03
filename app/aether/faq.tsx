import Link from "next/link";
import { ACTION_RADIUS_CLASS } from "@/lib/cta-chrome";
import { AskAiLinks } from "@/components/ask-ai-links";
import { FaqTabs } from "./faq-item";

/* The doubts that stop a purchase, grouped by where the buyer is: paying,
 * installing, their existing store, then life after. Each answer matches the
 * docs and the refund policy, so keep them in step. Feeds the FAQ JSON-LD on
 * /aether and llms.txt too. */
export const FAQ_GROUPS = ["Buying", "Install", "Your store", "After you buy"] as const;

export const QUESTIONS: { q: string; a: string; group: (typeof FAQ_GROUPS)[number] }[] = [
  {
    group: "Buying",
    q: "What do I get when I buy?",
    a: "The full Aether theme with all 41 sections, your license key by email within a minute, lifetime updates, priority support, install done for you, a personal dashboard and five bonus guides and lists.",
  },
  {
    group: "Buying",
    q: "Is it a one-time payment?",
    a: "Yes. $125 once, with no subscription and no renewals. Every future update is included.",
  },
  {
    group: "Buying",
    q: "Can I pay in installments?",
    a: "Yes. At checkout you can split it into 4 interest-free payments with Klarna. Cards, Apple Pay and Google Pay work too.",
  },
  {
    group: "Buying",
    q: "What if it doesn't work on my store?",
    a: "Contact us within 14 days of purchase and we'll fix it. If we can't, you get a full refund. Because the theme is delivered instantly, change of mind isn't covered.",
  },
  {
    group: "Install",
    q: "How does the install work?",
    a: "After you buy, we send a collaborator request to your Shopify store. Accept it in your Shopify admin with one click, and we install and set up Aether the same day.",
  },
  {
    group: "Install",
    q: "Will customers see anything change?",
    a: "No. Your current theme stays live the whole time. Nothing changes for your customers until you publish Aether.",
  },
  {
    group: "Install",
    q: "Can I install it myself?",
    a: "Yes, in about two minutes and with no code. Download the zip from your dashboard, then in Shopify go to Online Store, Themes, and upload it.",
  },
  {
    group: "Your store",
    q: "Will I lose my products or reviews?",
    a: "No. A Shopify theme only changes how your store looks. Products, orders, customers and reviews stay exactly where they are.",
  },
  {
    group: "Your store",
    q: "Can I switch back?",
    a: "Yes. Your current theme stays in your Shopify theme library, and you can republish it in one click whenever you want.",
  },
  {
    group: "Your store",
    q: "Will my apps still work?",
    a: "Most Shopify apps add themselves to any theme. If one needs placing, we set it up while installing Aether.",
  },
  {
    group: "After you buy",
    q: "Where do I find my license key?",
    a: "It arrives by email right after purchase, and it's always in your dashboard under Licenses.",
  },
  {
    group: "After you buy",
    q: "How do updates work?",
    a: "New versions show up in your dashboard. Nothing changes on your store until you choose to update, and you can preview the new version before publishing it.",
  },
  {
    group: "After you buy",
    q: "What if something breaks?",
    a: "For your first 14 days we fix anything that comes up. After that, support carries on in your dashboard.",
  },
  {
    group: "After you buy",
    q: "What does single store mean?",
    a: "One license covers one Shopify store. Moving to a different store? Reply to your purchase email and we'll move it over.",
  },
];
export function AetherFaq() {
  return (
    <section className="flex flex-col items-center justify-center px-3 pt-16 sm:pt-24 pb-16 sm:pb-24 text-center rise rise--liquid">
      {/* Named for what it is, in the same heading style as the sections
          above, so it's read as answers rather than another pitch. */}
      <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))] mb-10">
        Questions, answered
      </h2>
      {/* One topic at a time, so only three or four questions show at once.
          Every question still ships in the FAQ JSON-LD and llms.txt. */}
      <div className="w-full max-w-xl text-left">
        <FaqTabs groups={FAQ_GROUPS} questions={QUESTIONS} />
      </div>
      <p className="mt-8 text-[14px] sm:text-[15px] tracking-tight text-[rgb(var(--muted))]">
        Prefer to set it up yourself? It takes no code.
      </p>
      <Link
        href="/docs?from=aether"
        className={`mt-3 inline-flex items-center justify-center gap-1.5 ${ACTION_RADIUS_CLASS} border border-[rgb(var(--line))] px-5 py-2.5 text-[15px] sm:text-[16px] font-medium tracking-tight text-[rgb(var(--fg))] hover:border-[rgb(var(--fg)/0.3)] transition-colors`}
      >
        See the setup guide
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
          <line x1="3" y1="8" x2="13" y2="8" />
          <polyline points="9 4 13 8 9 12" />
        </svg>
      </Link>
    </section>
  );
}

const ASK_AI_PROMPT =
  // /aether/overview is the same page at an address Claude and Perplexity
  // will fetch (see the rewrite in next.config.mjs); llms.txt is the plain
  // text fallback with the same facts.
  "Read https://byinertia.com/aether/overview (if it won't load, use https://byinertia.com/llms.txt) and tell me what the Aether Shopify theme includes, what it costs, and whether it's a good fit for my store.";

export function AetherAskAi() {
  return (
    <section className="flex flex-col items-center justify-center px-3 py-16 sm:py-24 text-center rise rise--liquid">
      <h2 className="text-[28px] sm:text-[36px] font-normal tracking-[-0.04em] leading-tight text-[rgb(var(--fg))]">
        Still deciding?
      </h2>
      <p className="mt-3 max-w-xl text-[15px] sm:text-[17px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">
        Ask your AI of choice about Aether.
      </p>
      <AskAiLinks prompt={ASK_AI_PROMPT} className="mt-8 w-full max-w-xl" />
    </section>
  );
}
