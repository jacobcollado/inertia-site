import type { Metadata } from "next";
import type React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllWork, getWork, renderWorkMarkdown } from "@/lib/work";
import { ACTION_RADIUS_CLASS, CTA_PILL_CLASS } from "@/lib/cta-chrome";
import { FigmaSelectionFrame, SELECTION_FRAME_COLOR } from "@/components/figma-frame";

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

// Handles sit on the page background so they read as cut-outs in the stroke.
const HANDLE_FILL = "rgb(var(--bg))";

// Homepage-style liquid reveal, staggered by a delay in ms.
const reveal = (delay = 0) =>
  ({ "--rise-delay": `${delay}ms` }) as React.CSSProperties;

const SPEC_COLS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
};

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const piece = getWork(slug);
  if (!piece) notFound();

  const html = await renderWorkMarkdown(piece.content);
  const all = getAllWork();
  const idx = all.findIndex((w) => w.slug === slug);
  const next = idx >= 0 ? all[(idx + 1) % all.length] : null;

  // The spec strip, like an inspector panel: only the fields this piece has.
  const specs = [
    piece.service && { label: "Service", value: piece.service },
    piece.year && { label: "Year", value: piece.year },
    piece.role && { label: "Scope", value: piece.role },
  ].filter(Boolean) as { label: string; value: string }[];

  const shots = [
    piece.cover && { src: piece.cover, alt: piece.client },
    piece.preview && { src: piece.preview, alt: `${piece.client} preview` },
  ].filter(Boolean) as { src: string; alt: string }[];

  return (
    <main className="mx-auto w-full max-w-[80rem] px-6 sm:px-8 min-h-screen flex flex-col pb-20 sm:pb-28">
      <div className="pt-8 sm:pt-10">
        <Link
          href="/work"
          className="inline-flex items-center gap-1.5 text-[14px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5" aria-hidden="true">
            <path d="M13 8H3M7 4L3 8l4 4" />
          </svg>
          All work
        </Link>
      </div>

      {/* Hero, set like the homepage hero: centred name, muted subline, the
          same pair of actions. */}
      <section className="flex flex-col items-center text-center gap-6 sm:gap-7 pt-14 sm:pt-20 pb-12 sm:pb-16">
        <h1
          className="rise rise--liquid max-w-3xl text-balance text-[clamp(2.5rem,7.8vw,3.55rem)] sm:text-[clamp(2.6rem,6vw,4.2rem)] tracking-tight leading-none text-[rgb(var(--fg))]"
          style={{ ...reveal(0), fontWeight: 450 }}
        >
          {piece.client}
        </h1>

        {piece.summary && (
          <p
            className="rise rise--liquid -mt-1 max-w-md sm:max-w-xl text-balance text-[16.5px] sm:text-[19px] leading-relaxed tracking-tight text-[rgb(var(--muted))]"
            style={reveal(80)}
          >
            {piece.summary}
          </p>
        )}

        {(piece.url || piece.instagram) && (
          <div className="rise rise--liquid flex flex-wrap items-center justify-center gap-3" style={reveal(160)}>
            {piece.url && (
              <a
                href={piece.url}
                target="_blank"
                rel="noreferrer"
                className={`${CTA_PILL_CLASS} gap-1.5 transition-transform duration-150 active:scale-[0.97]`}
                style={{ background: "rgb(var(--fg))", color: "rgb(var(--bg))", fontWeight: 450 }}
              >
                Visit site
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5" aria-hidden="true">
                  <path d="M4 12L12 4M7 4h5v5" />
                </svg>
              </a>
            )}
            {piece.instagram && (
              <a
                href={`https://instagram.com/${piece.instagram}`}
                target="_blank"
                rel="noreferrer"
                className={`${CTA_PILL_CLASS} transition-[transform,background-color] duration-150 active:scale-[0.97] bg-[rgb(var(--fg)/0.06)] hover:bg-[rgb(var(--fg)/0.1)]`}
                style={{ color: "rgb(var(--fg))", fontWeight: 450 }}
              >
                @{piece.instagram}
              </a>
            )}
          </div>
        )}
      </section>

      {specs.length > 0 && (
        <div className="rise rise--liquid" style={reveal(240)}>
          <FigmaSelectionFrame handleFill={HANDLE_FILL}>
            <dl
              className={`grid grid-cols-1 ${SPEC_COLS[specs.length]} divide-y sm:divide-y-0 sm:divide-x divide-[color:var(--rail)]`}
              style={{ ["--rail" as string]: SELECTION_FRAME_COLOR }}
            >
              {specs.map((s) => (
                <div key={s.label} className="min-w-0 px-4 py-4 sm:px-6 sm:py-6">
                  <dt className="text-[13px] leading-none tracking-tight text-[rgb(var(--muted))]">{s.label}</dt>
                  <dd
                    className="mt-2 text-[16px] sm:text-[18px] leading-snug tracking-tight text-[rgb(var(--fg))]"
                    style={{ fontWeight: 450 }}
                  >
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </FigmaSelectionFrame>
        </div>
      )}

      {shots.map((shot) => (
        <div key={shot.src} className="rise rise--liquid mt-10 sm:mt-14">
          <FigmaSelectionFrame handleFill={HANDLE_FILL}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shot.src} alt={shot.alt} className="block w-full h-auto" />
          </FigmaSelectionFrame>
        </div>
      ))}

      {html && html.trim() !== "" && (
        <section className="rise rise--liquid mx-auto w-full max-w-2xl mt-14 sm:mt-20">
          <div
            className="text-[16px] sm:text-[17px] leading-relaxed tracking-tight space-y-5
              [&_h2]:text-[clamp(1.35rem,3.2vw,1.75rem)] [&_h2]:font-[450] [&_h2]:tracking-[-0.025em] [&_h2]:leading-tight [&_h2]:mt-12 [&_h2]:mb-3 [&_h2]:text-[rgb(var(--fg))]
              [&_h3]:text-[17px] [&_h3]:font-[450] [&_h3]:tracking-tight [&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-[rgb(var(--fg))]
              [&_p]:text-[rgb(var(--muted))]
              [&_a]:text-[rgb(var(--fg))] [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-[#6bb8ef] hover:[&_a]:decoration-[rgb(var(--fg))]
              [&_img]:w-full [&_img]:border [&_img]:border-[#6bb8ef] [&_img]:my-8"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </section>
      )}

      {next && next.slug !== slug && (
        <section className="rise rise--liquid mt-16 sm:mt-24">
          <p className="mb-6 sm:mb-8 text-center text-[13px] sm:text-[14px] leading-snug tracking-tight text-[rgb(var(--muted))]">
            Next project
          </p>
          <FigmaSelectionFrame handleFill={HANDLE_FILL}>
            {/* Hover takes the selected-layer tint from the homepage grid. */}
            <Link
              href={`/work/${next.slug}`}
              className="group flex items-center justify-between gap-6 px-4 py-6 sm:px-6 sm:py-8 transition-colors duration-200 hover:bg-[rgb(107_184_239/0.08)]"
            >
              <span
                className="min-w-0 text-[clamp(1.4rem,4.6vw,2rem)] tracking-tight leading-none text-[rgb(var(--fg))]"
                style={{ fontWeight: 450 }}
              >
                {next.client}
              </span>
              <span className="flex shrink-0 items-center gap-3 text-[13px] sm:text-[14px] tracking-tight text-[rgb(var(--muted))]">
                {next.service && <span className="hidden sm:inline">{next.service}</span>}
                <span
                  className={`inline-flex size-9 items-center justify-center ${ACTION_RADIUS_CLASS} bg-[rgb(var(--fg)/0.06)] text-[rgb(var(--fg))] transition-transform duration-200 ease-out group-hover:translate-x-0.5`}
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </span>
              </span>
            </Link>
          </FigmaSelectionFrame>
        </section>
      )}
    </main>
  );
}
