import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, formatDate } from "@/lib/posts";

export const metadata: Metadata = {
  title: "About",
  description: "Inertia is a small studio building Shopify storefronts, brand identities, and digital products. A few projects at a time, full attention on every detail.",
};

const PRINCIPLES = [
  {
    title: "Time is the one thing you cannot buy back",
    body: "Most software quietly takes it. We try to build the opposite, things that hand it back. Every decision gets weighed against one question: does this free someone up, or does it tie them down?",
  },
  {
    title: "Good systems disappear",
    body: "If you can feel the machinery, it is not finished. The best infrastructure works quietly in the background, leaving people free to think about the things that actually need them.",
  },
  {
    title: "Faster is not the same as better",
    body: "Speed is easy to sell and easy to fake. We care about outcomes: a storefront that converts, a brand that holds up, a system that still makes sense a year from now.",
  },
  {
    title: "Layers that strengthen each other",
    body: "We do not make one-off tools. Storefront, brand, client ops, every piece is built to make the others better. The whole is the product.",
  },
];

const LINKS = [
  { label: "Aether Theme",       desc: "Our Shopify theme for founders who would rather not babysit their store.",  href: "/aether"   },
  { label: "Inertia Dashboard",  desc: "Your whole project in one calm place. Still in the works.",                href: "/roadmap"  },
  { label: "Work with us",       desc: "Storefronts, identities, and products, built with full attention.",         href: "/contact"  },
  { label: "Careers",            desc: "Small team, careful work. Come do it with us.",                             href: "/careers"  },
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
          <p className="text-[13px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.5 }}>Why we exist</p>
          <h1 className="text-[clamp(2.6rem,4.5vw,3.5rem)] font-normal tracking-[-0.04em] leading-[1.15] text-[rgb(var(--fg))]">
            We build the things
            <br />
            <span style={{ background: "var(--accent-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", display: "inline-block" }}>you keep putting off</span>
          </h1>
          <p className="text-[17px] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-md" style={{ opacity: 0.7 }}>
            We are a small studio that builds what independent brands run on: storefronts, identities, and the quiet systems underneath them. The aim is always the same. Less time spent running the machine, more time spent on the work only you can do.
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
            Most of the tools people rely on were built for someone else&apos;s workflow. We think the work should fit the person doing it.{" "}
            <span style={{ color: "rgb(var(--muted))", opacity: 0.4 }}>
              Not faster ways to do tedious things. Fewer tedious things to do.
            </span>
          </p>
        </div>
      </section>

      <div className="grid-rule" aria-hidden="true" />

      {/* Principles */}
      <section className="px-3 pt-16 sm:pt-24 pb-16 rise">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))]">What we hold onto</p>
          <p className="text-[14px] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-xs" style={{ opacity: 0.6 }}>Four ideas that shape everything we ship.</p>
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
          <p className="text-[clamp(1.6rem,2.8vw,2.2rem)] font-normal tracking-[-0.03em] leading-snug text-[rgb(var(--fg))]">It starts with the store</p>
          <p className="text-[15px] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-md" style={{ opacity: 0.7 }}>
            Inertia began with Shopify storefronts, and that is still where careful infrastructure pays off fastest. Aether is the first layer: a theme that keeps the store running well, so founders can stop micromanaging it and get back to the brand.
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
