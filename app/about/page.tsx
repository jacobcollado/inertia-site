import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, formatDate } from "@/lib/posts";

export const metadata: Metadata = {
  title: "About",
  description: "We build Shopify storefronts, brand identities, and digital products for independent brands. Small studio, high craft, real ownership over every detail we ship.",
};

const PRINCIPLES = [
  {
    title: "Time is the only non-renewable resource",
    body: "Most software steals it. We build things that give it back. Every product we make is measured against one question: does this free someone up, or does it slow them down?",
  },
  {
    title: "Automation should be invisible",
    body: "The best systems don't feel like systems. They just work. We build infrastructure that runs in the background so the people using it can focus on what actually matters.",
  },
  {
    title: "Better results, not just faster ones",
    body: "Speed without quality is just wasted time moved earlier. Our infrastructure is designed to optimize outcomes, not just remove friction.",
  },
  {
    title: "Vertical integration by design",
    body: "We don't build isolated tools. We build layers that connect, from storefronts to client ops to the products people use every day. Each layer makes the next one better.",
  },
];

const LINKS = [
  { label: "Aether Theme",       desc: "Our Shopify theme for independent brands.",       href: "/aether"   },
  { label: "Inertia Dashboard",  desc: "Client ops, in one place. In progress.",           href: "/roadmap"  },
  { label: "Work with us",       desc: "Custom Shopify builds and brand projects.",         href: "/contact"  },
  { label: "Careers",            desc: "Join the team.",                                   href: "/careers"  },
];

export default function AboutPage() {
  const latestPosts = getAllPosts().slice(0, 3);
  return (
    <main className="mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] min-h-screen flex flex-col pb-16 sm:pb-20">

      {/* Hero */}
      <section className="relative flex flex-col sm:flex-row gap-12 sm:gap-20 px-3 pt-16 sm:pt-24 pb-16 rise overflow-hidden">
        {/* Background orb */}

        {/* Left */}
        <div className="flex flex-col gap-7 flex-1">
          <p className="text-[13px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.5 }}>Our mission</p>
          <h1 className="text-[clamp(2.6rem,4.5vw,3.5rem)] font-normal tracking-[-0.04em] leading-[1.02] text-[rgb(var(--fg))]">
            Convert wasted time
            <br />
            <span style={{ background: "var(--accent-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>into momentum</span>
          </h1>
          <p className="text-[17px] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-md" style={{ opacity: 0.7 }}>
            We build infrastructure that replaces tedious, repetitive work with automation, vertically integrated into the products and workflows people already use.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium tracking-tight text-[rgb(var(--bg))] hover:opacity-85 transition-opacity"
              style={{ background: "var(--accent-gradient)" }}
            >
              Work with us
            </Link>
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--line))] px-5 py-2.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
            >
              See what we&apos;re building
            </Link>
          </div>
        </div>

        {/* Right — link cards */}
        <div className="flex flex-col gap-2 w-full sm:w-[340px] shrink-0 self-start sm:pt-12">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="group flex items-center justify-between gap-4 rounded-xl px-4 py-3.5 border border-[rgb(var(--line))] hover:border-[rgb(var(--fg)/0.2)] hover:bg-[rgb(var(--surface))] transition-all duration-200"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] font-medium tracking-tight text-[rgb(var(--fg))]">{l.label}</span>
                <span className="text-[12px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.5 }}>{l.desc}</span>
              </div>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0 text-[rgb(var(--muted))] opacity-30 group-hover:opacity-70 group-hover:translate-x-0.5 transition-all duration-200" aria-hidden="true">
                <path d="M4 12L12 4M7 4h5v5"/>
              </svg>
            </Link>
          ))}
        </div>

      </section>

      <div className="grid-rule" aria-hidden="true" />

      {/* Pull quote */}
      <section className="px-3 py-20 sm:py-32 rise">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[clamp(2rem,4.5vw,3.4rem)] font-normal tracking-[-0.04em] leading-[1.2] text-[rgb(var(--fg))]">
            Most people spend their days inside systems that were never designed to work for them. We think that&apos;s fixable.{" "}
            <span style={{ color: "rgb(var(--muted))", opacity: 0.4 }}>
              Not by doing things faster. By removing the need to do them at all.
            </span>
          </p>
        </div>
      </section>

      <div className="grid-rule" aria-hidden="true" />

      {/* Principles */}
      <section className="px-3 pt-16 sm:pt-24 pb-16 rise">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))]">How we think about it</p>
          <p className="text-[14px] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-xs" style={{ opacity: 0.6 }}>The principles behind every product we build.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[rgb(var(--line))]">
          {PRINCIPLES.map((p, i) => (
            <div
              key={p.title}
              className="flex gap-6 p-8 bg-[rgb(var(--bg))] hover:bg-[rgb(var(--surface))] transition-colors"
              style={{ ["--rise-delay" as any]: `${i * 60}ms` }}
            >
              <span className="text-[13px] tabular-nums text-[rgb(var(--muted))] shrink-0 pt-0.5" style={{ opacity: 0.35 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-2.5">
                <h3 className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))] leading-snug">{p.title}</h3>
                <p className="text-[14px] leading-relaxed tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.65 }}>{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid-rule" aria-hidden="true" />

      {/* Latest news */}
      {latestPosts.length > 0 && (
        <section className="px-3 pt-16 sm:pt-24 pb-14 rise">
          <div className="flex items-end justify-between gap-4 mb-10">
            <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))]">Latest news</p>
            <Link href="/blog" className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
              All posts
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {latestPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex flex-col gap-3">
                <div
                  className="w-full rounded-2xl overflow-hidden border border-[rgb(var(--line))] group-hover:border-[rgb(var(--fg)/0.2)] transition-colors"
                  style={{ aspectRatio: "1200/630", background: "rgb(var(--surface))" }}
                >
                  {post.image ? (
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-30">No image</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    {post.tag && <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-60">{post.tag}</span>}
                    <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-40">{formatDate(post.date)}</span>
                  </div>
                  <p className="text-[18px] tracking-tight text-[rgb(var(--fg))] leading-snug font-normal group-hover:opacity-70 transition-opacity">{post.title}</p>
                  {(post.subtitle || post.summary) && (
                    <p className="text-[14px] tracking-tight leading-relaxed text-[rgb(var(--muted))] line-clamp-2" style={{ opacity: 0.55 }}>{post.subtitle || post.summary}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="grid-rule" aria-hidden="true" />

      {/* Bottom CTA */}
      <section className="px-3 py-16 sm:py-24 rise">
        <div className="rounded-2xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] px-8 sm:px-16 py-14 sm:py-20 flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
          <p className="text-[clamp(1.6rem,2.8vw,2.2rem)] font-normal tracking-[-0.03em] leading-snug text-[rgb(var(--fg))]">We start with commerce</p>
          <p className="text-[15px] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-md" style={{ opacity: 0.7 }}>
            Shopify storefronts are where Inertia began, and where the infrastructure is most immediately useful. Aether is our first layer: a theme that runs the store so founders don&apos;t have to micromanage it.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <Link
              href="/aether"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium tracking-tight text-[rgb(var(--bg))] hover:opacity-85 transition-opacity"
              style={{ background: "var(--accent-gradient)" }}
            >
              See Aether
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--line))] px-5 py-2.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
            >
              See what&apos;s next
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
