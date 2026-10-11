import type { Metadata } from "next";
import type React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllWork, getWork, getWorkGalleryImages, renderWorkMarkdown } from "@/lib/work";
import { CTA_FILL, CTA_PILL_CLASS } from "@/lib/cta-chrome";
import { FrameRails, FrameRule } from "@/components/page-frame";
import { TeardownButton } from "@/components/teardown-dialog";

export function generateStaticParams() {
  return getAllWork().map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const piece = getWork(slug);
  if (!piece) return { title: "Not found" };
  const title = `${piece.client}, work by Inertia`;
  // The project's own shot shares better than the generic card.
  const image = piece.card ?? piece.cover ?? "/og.png";
  const description = piece.summary || `A project built by Inertia for ${piece.client}.`;
  const canonical = `https://byinertia.com/work/${slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonical,
      images: [{ url: image, alt: `${piece.client}, work by Inertia` }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

// Homepage-style liquid reveal, staggered by a delay in ms.
const reveal = (delay = 0) =>
  ({ "--rise-delay": `${delay}ms` }) as React.CSSProperties;

// A split between cells, as on the homepage and /aether/changelog. The page
// pads its content in from the cell edges, so the split steps back out
// across that padding to meet the rails.
function Split() {
  return (
    <div className="-mx-3 sm:-mx-8">
      <FrameRule tone="light" className="py-8 sm:py-12" />
    </div>
  );
}

function Arrow({ out = false, className = "size-3.5" }: { out?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={out ? "M4 12L12 4M7 4h5v5" : "M3 8h10M9 4l4 4-4 4"} />
    </svg>
  );
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const piece = getWork(slug);
  if (!piece) notFound();

  // Written notes, if a piece has any. Its images are laid out separately.
  const notes = piece.content.replace(/!\[[^\]]*\]\([^)]*\)\s*/g, "").trim();
  const html = notes ? await renderWorkMarkdown(notes) : "";

  const all = getAllWork();
  const meta = all.find((w) => w.slug === slug);
  const idx = all.findIndex((w) => w.slug === slug);
  const next = idx >= 0 ? all[(idx + 1) % all.length] : null;

  // Cover first, then the preview and every shot from the write-up, each
  // with its real size so the page doesn't jump as they load. A piece with
  // none falls back to its homepage card.
  const gallery = await getWorkGalleryImages(piece);
  const [lead, ...rest] = gallery.length ? gallery : meta?.card ? [{ src: meta.card, width: 4, height: 3 }] : [];

  const specs = [
    piece.service && { label: "Service", value: piece.service },
    piece.role && { label: "Scope", value: piece.role },
    piece.year && { label: "Launched", value: piece.year },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <main className="relative mx-auto w-full max-w-[80rem] min-h-screen flex flex-col px-3 sm:px-8">
      <FrameRails tone="light" />

      {/* The project in one screen: name, what it was, how to see it live,
          and the facts. Left-aligned like the homepage hero. */}
      <section className="w-full px-3 pt-8 sm:px-0 sm:pt-10">
        <Link
          href="/work"
          className="group inline-flex h-9 items-center gap-2 rounded-[6px] pl-3 pr-3.5 text-[14px] leading-none tracking-tight transition-colors hover:bg-[var(--tile-2)]"
          style={{ background: "var(--tile)", color: "var(--ink-2)" }}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-[1em] transition-transform duration-200 group-hover:-translate-x-0.5" aria-hidden="true">
            <path d="M13 8H3M7 4L3 8l4 4" />
          </svg>
          All work
        </Link>

        <div className="grid gap-10 pt-12 pb-4 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-end lg:gap-20">
          <div>
            <h1
              className="rise rise--liquid text-[clamp(2.6rem,11vw,3.4rem)] sm:text-[clamp(3rem,6vw,4.75rem)] tracking-[-0.045em] leading-[0.98]"
              style={{ ...reveal(0), color: "var(--ink)", fontWeight: 450 }}
            >
              {piece.client}
            </h1>
            {piece.summary && (
              <p
                className="rise rise--liquid mt-5 max-w-xl text-[16.5px] sm:text-[19px] leading-relaxed tracking-tight text-pretty"
                style={{ ...reveal(80), color: "var(--ink-2)" }}
              >
                {piece.summary}
              </p>
            )}
            {(piece.url || piece.instagram) && (
              <div className="rise rise--liquid mt-8 flex flex-wrap items-center gap-3" style={reveal(160)}>
                {piece.url && (
                  <a
                    href={piece.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`${CTA_PILL_CLASS} gap-1.5 transition-transform duration-150 active:scale-[0.97]`}
                    style={{ background: CTA_FILL, color: "var(--cta-fg)", fontWeight: 450 }}
                  >
                    Visit site <Arrow out />
                  </a>
                )}
                {piece.instagram && (
                  <a
                    href={`https://instagram.com/${piece.instagram}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`${CTA_PILL_CLASS} transition-[transform,background-color] duration-150 active:scale-[0.97] hover:bg-[var(--tile-3)]`}
                    style={{ background: "var(--tile-2)", color: "var(--ink)", fontWeight: 450 }}
                  >
                    @{piece.instagram}
                  </a>
                )}
              </div>
            )}
          </div>

          {specs.length > 0 && (
            <dl className="rise rise--liquid grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-1" style={reveal(240)}>
              {specs.map((s) => (
                <div key={s.label} className="min-w-0">
                  <dt className="text-[13px] tracking-tight" style={{ color: "var(--ink-4)" }}>{s.label}</dt>
                  <dd className="mt-1 text-[16px] sm:text-[17px] leading-snug tracking-tight" style={{ color: "var(--ink)" }}>
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {lead && (
        <>
          <Split />
          <div className="px-3 sm:px-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lead.src}
              alt={piece.client}
              width={lead.width}
              height={lead.height}
              className="rise rise--liquid block h-auto w-full rounded-[12px]"
              style={{ ...reveal(320), background: "var(--tile)" }}
            />
          </div>
        </>
      )}

      {(html || rest.length > 0) && (
        <>
          <Split />
          <section className="w-full px-3 sm:px-0">
            <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] tracking-[-0.03em] leading-[1.1]" style={{ color: "var(--ink)", fontWeight: 450 }}>
              The work
            </h2>
            {html && (
              <div
                className="mt-5 max-w-2xl space-y-5 text-[16.5px] sm:text-[19px] leading-relaxed tracking-tight
                  [&_p]:text-[var(--ink-2)] [&_strong]:font-[450] [&_strong]:text-[var(--ink)]
                  [&_h2]:mt-10 [&_h2]:text-[22px] [&_h2]:font-[450] [&_h2]:tracking-[-0.02em] [&_h2]:text-[var(--ink)]
                  [&_h3]:mt-8 [&_h3]:text-[18px] [&_h3]:font-[450] [&_h3]:text-[var(--ink)]
                  [&_a]:text-[var(--ink)] [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-[rgb(var(--ink-rgb)/0.3)] hover:[&_a]:decoration-[var(--ink)]
                  [&_ul]:list-disc [&_ul]:pl-5 [&_li]:text-[var(--ink-2)]"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            )}
            {rest.length > 0 && (
              <div className="mt-10 flex flex-col gap-3 sm:mt-14 sm:gap-4">
                {rest.map((img, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={img.src}
                    src={img.src}
                    alt={`${piece.client}, shot ${i + 1}`}
                    width={img.width}
                    height={img.height}
                    loading="lazy"
                    className="rise block h-auto w-full rounded-[12px]"
                    style={{ background: "var(--tile)" }}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <Split />

      {/* The close: the next project, and the same first step the homepage
          offers. */}
      <section className="grid w-full gap-3 px-3 sm:grid-cols-2 sm:px-0">
        {next && next.slug !== slug && (
          <Link
            href={`/work/${next.slug}`}
            className="group flex min-h-[15rem] flex-col justify-between rounded-[12px] p-6 transition-colors duration-300 hover:bg-[var(--tile-2)] sm:p-8"
            style={{ background: "var(--tile)" }}
          >
            <span className="text-[14px] tracking-tight" style={{ color: "var(--ink-4)" }}>Next project</span>
            <span className="flex items-end justify-between gap-6">
              <span>
                <span className="block text-[clamp(1.6rem,3vw,2.25rem)] leading-none tracking-[-0.03em]" style={{ color: "var(--ink)", fontWeight: 450 }}>
                  {next.client}
                </span>
                {next.service && (
                  <span className="mt-2 block text-[15px] tracking-tight" style={{ color: "var(--ink-2)" }}>{next.service}</span>
                )}
              </span>
              <span className="mb-1 shrink-0 transition-transform duration-300 group-hover:translate-x-1" style={{ color: "var(--ink)" }}>
                <Arrow className="size-5" />
              </span>
            </span>
          </Link>
        )}
        <div className="flex min-h-[15rem] flex-col justify-between gap-8 rounded-[12px] p-6 sm:p-8" style={{ background: "var(--tile)" }}>
          <div>
            <p className="text-[clamp(1.6rem,3vw,2.25rem)] leading-[1.05] tracking-[-0.03em]" style={{ color: "var(--ink)", fontWeight: 450 }}>
              Your name could be next.
            </p>
            <p className="mt-3 max-w-sm text-[15.5px] sm:text-[16px] leading-relaxed tracking-tight" style={{ color: "var(--ink-2)" }}>
              Start with a free teardown of your site: a short video, three things that may be costing you customers, yours to keep.
            </p>
          </div>
          <div>
            <TeardownButton />
          </div>
        </div>
      </section>

      <Split />
    </main>
  );
}
