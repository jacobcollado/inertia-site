import Link from "next/link";
import { ACTION_RADIUS_CLASS } from "@/lib/cta-chrome";
import { AskAiLinks } from "@/components/ask-ai-links";
import { RevealDetail } from "./reveal-detail";

/* Only the doubts that stop a purchase. Each one is closed until tapped, so
 * the section still reads as one short line of reassurance at a glance. */
export const QUESTIONS = [
  {
    q: "Will I lose my products or reviews?",
    a: "No. A Shopify theme only changes how your store looks. Products, orders, customers and reviews stay exactly where they are.",
  },
  {
    q: "Can I switch back?",
    a: "Yes. Your current theme stays in your Shopify theme library, and you can republish it in one click whenever you want.",
  },
  {
    q: "Will my apps still work?",
    a: "Most Shopify apps add themselves to any theme. If one needs placing, we set it up while installing Aether.",
  },
  {
    q: "What if something breaks?",
    a: "For your first 14 days we fix anything that comes up. After that, support carries on in your dashboard.",
  },
  {
    q: "What does single store mean?",
    a: "One license covers one Shopify store. Moving to a different store? Reply to your purchase email and we'll move it over.",
  },
];

export function AetherFaq() {
  return (
    <section className="flex flex-col items-center justify-center px-3 py-16 sm:py-24 text-center rise rise--liquid">
      <h2 className="text-[28px] sm:text-[36px] font-normal tracking-[-0.04em] leading-tight text-[rgb(var(--fg))]">
        Setting it up is
        <br className="sm:hidden" aria-hidden="true" />
        {" "}easier than it sounds.
      </h2>
      {/* Capped near the heading's own width on mobile so the two read as one
          block; balance keeps the two lines even instead of leaving an orphan. */}
      <p className="mt-3 max-w-[16.5rem] sm:max-w-xl text-balance text-[15px] sm:text-[17px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">
        We install it for you the same day, or you can do it yourself with no code.
      </p>
      <div className="mt-8 w-full max-w-xl divide-y divide-dashed divide-[rgb(var(--line))] border-y border-dashed border-[rgb(var(--line))] text-left">
        {QUESTIONS.map(({ q, a }) => (
          <div key={q} className="py-4">
            <RevealDetail label={q}>
              <p className="pt-3 pl-7 text-[14px] leading-relaxed tracking-tight text-[rgb(var(--muted))] sm:text-[15px]">
                {a}
              </p>
            </RevealDetail>
          </div>
        ))}
      </div>
      <Link
        href="/docs?from=aether"
        className={`mt-8 inline-flex items-center justify-center gap-1.5 ${ACTION_RADIUS_CLASS} border border-[rgb(var(--line))] px-5 py-2.5 text-[15px] sm:text-[16px] font-medium tracking-tight text-[rgb(var(--fg))] hover:border-[rgb(var(--fg)/0.3)] transition-colors`}
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
