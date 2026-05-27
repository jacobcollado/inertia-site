import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllWork, getWork, renderWorkMarkdown } from "@/lib/work";

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
  const title = `${piece.client} - Inertia Work`;
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
      images: [{ url: "/og.png", width: 1200, height: 630, alt: `${piece.client} - Inertia` }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  };
}

function GridRule() {
  return <div className="grid-rule" aria-hidden="true" />;
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const piece = getWork(slug);
  if (!piece) notFound();

  const html = await renderWorkMarkdown(piece.content);
  const all = getAllWork();
  const idx = all.findIndex((w) => w.slug === slug);
  const next = idx >= 0 ? all[(idx + 1) % all.length] : null;

  return (
    <main className="page-container mx-3 sm:mx-auto w-auto sm:w-full max-w-6xl min-h-screen flex flex-col">

      {/* Nav */}
      <div className="flex items-center justify-between px-6 sm:px-8 py-5">
        <Link
          href="/work"
          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] tracking-tight transition-opacity hover:opacity-70"
          style={{ border: "1px solid rgb(var(--fg) / 0.25)", color: "rgb(var(--fg))" }}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" aria-hidden="true">
            <path d="M10 3L5 8l5 5" />
          </svg>
          Work
        </Link>
        {piece.year && (
          <span className="text-[12px] tabular-nums tracking-tight text-[rgb(var(--muted))] opacity-40">
            {piece.year}
          </span>
        )}
      </div>

      <GridRule />

      {/* Two-col body */}
      <div className="flex flex-col sm:flex-row flex-1">

        {/* Left - text */}
        <div className="flex flex-col gap-8 px-6 sm:px-8 py-10 sm:py-14 sm:w-[42%] border-b sm:border-b-0 sm:border-r border-[rgb(var(--line))]">
          <div>
            <h1 className="text-[clamp(1.6rem,3.5vw,2.5rem)] font-[450] tracking-tighter leading-[1.05] text-[rgb(var(--fg))]">
              {piece.client}
            </h1>
            {(piece.role || piece.service) && (
              <p className="mt-2 text-[13px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.55 }}>
                {piece.role || piece.service}
              </p>
            )}
          </div>

          {piece.summary && (
            <p className="text-[14px] sm:text-[15px] leading-[1.65] tracking-tight text-[rgb(var(--muted))]">
              {piece.summary}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-col gap-4 mt-auto pt-4 border-t border-[rgb(var(--line))]">
            {piece.url && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-40">Live site</span>
                <a href={piece.url} target="_blank" rel="noreferrer" className="text-[13px] tracking-tight text-[rgb(var(--blue))] hover:opacity-70 transition-opacity">
                  {piece.url.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
            {piece.instagram && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-40">Instagram</span>
                <a href={`https://instagram.com/${piece.instagram}`} target="_blank" rel="noreferrer" className="text-[13px] tracking-tight text-[rgb(var(--blue))] hover:opacity-70 transition-opacity">
                  @{piece.instagram}
                </a>
              </div>
            )}
            {piece.year && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-40">Year</span>
                <span className="text-[13px] tabular-nums tracking-tight text-[rgb(var(--fg))]">{piece.year}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right - images */}
        <div className="flex flex-col sm:flex-1">
          {piece.cover && (
            <div className="border-b border-[rgb(var(--line))] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={piece.cover} alt={piece.client} className="w-full h-auto" style={{ display: "block" }} />
            </div>
          )}
          {piece.preview && (
            <div className="overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={piece.preview} alt={`${piece.client} preview`} className="w-full h-auto" style={{ display: "block" }} />
            </div>
          )}
        </div>

      </div>

      {/* Body markdown - only if there's content */}
      {html && html.trim() !== "" && (
        <>
          <GridRule />
          <div
            className="px-6 sm:px-8 py-10 space-y-5 text-[14px] sm:text-[15px] leading-relaxed tracking-tight max-w-2xl
              [&_h2]:text-[18px] [&_h2]:sm:text-[20px] [&_h2]:font-[500] [&_h2]:tracking-tighter [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-[rgb(var(--fg))]
              [&_h3]:text-[14px] [&_h3]:font-[500] [&_h3]:tracking-tight [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-[rgb(var(--fg))]
              [&_p]:text-[rgb(var(--muted))]
              [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-[rgb(var(--line))] hover:[&_a]:decoration-[rgb(var(--fg))]
              [&_img]:w-full [&_img]:border [&_img]:border-[rgb(var(--line))] [&_img]:my-6"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </>
      )}

      {/* Next project */}
      {next && next.slug !== slug && (
        <>
          <div className="flex-1" />
          <GridRule />
          <Link
            href={`/work/${next.slug}`}
            className="group flex items-center justify-between gap-6 px-6 sm:px-8 py-8 hover:bg-[rgb(var(--fg)/0.02)] transition-colors"
          >
            <div>
              <p className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-40 mb-2">Next project</p>
              <span className="text-[clamp(1.1rem,3vw,1.75rem)] font-[450] tracking-tighter text-[rgb(var(--fg))]">
                {next.client}
              </span>
            </div>
            <span
              className="text-xl text-[rgb(var(--muted))] opacity-30 group-hover:opacity-70 transition-all duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            >
              &#8594;
            </span>
          </Link>
        </>
      )}

    </main>
  );
}
