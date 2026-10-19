import type { Metadata } from "next";
import type React from "react";
import { notFound } from "next/navigation";
import { getAllWork, getWork, getWorkGalleryImages } from "@/lib/work";
import { Close } from "@/components/close";
import { TileGlass, WorkTile, toTileWork } from "@/components/work-tile";

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

type Shot = { src: string; width: number; height: number; label?: string };

// What a shot shows, small and plain under it (Product page, Tier system
// cart).
function Caption({ label }: { label?: string }) {
  if (!label) return null;
  return <figcaption className="case-shot__label">{label}</figcaption>;
}

// One gallery block: a landscape shot at full width, or a row of portrait
// ones. Each figure in a row grows in proportion to its image's
// width-to-height ratio, so the images share one height and fill the row
// exactly. On phones the row swipes sideways instead, each image a fixed
// height. A lone portrait shot is held to a sensible width.
function Shots({ block, client, first = false }: { block: Shot[]; client: string; first?: boolean }) {
  const img = (s: Shot, className: string, style?: React.CSSProperties) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={s.src}
      alt={s.label ? `${client}, ${s.label}` : client}
      width={s.width}
      height={s.height}
      loading={first ? "eager" : "lazy"}
      fetchPriority={first ? "high" : undefined}
      className={className}
      style={{ background: "var(--tile)", ...style }}
    />
  );
  const portrait = block[0].height > block[0].width;
  if (!portrait || block.length === 1) {
    const s = block[0];
    return (
      <figure className={portrait ? "mx-auto w-full max-w-[28rem]" : ""}>
        {img(s, "block h-auto w-full rounded-[6px]")}
        <Caption label={s.label} />
      </figure>
    );
  }
  return (
    <div className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-px-6 px-6 sm:mx-0 sm:gap-4 sm:overflow-visible sm:px-0">
      {block.map((s) => (
        <figure
          key={s.src}
          className="shrink-0 snap-start sm:min-w-0 sm:shrink sm:[flex:var(--r)_1_0%]"
          style={{ ["--r" as string]: String(s.width / s.height) }}
        >
          {img(s, "block h-[30rem] w-auto rounded-[6px] object-cover sm:h-auto sm:w-full", { aspectRatio: `${s.width} / ${s.height}` })}
          <Caption label={s.label} />
        </figure>
      ))}
    </div>
  );
}

function ArrowOut() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
      <path d="M4.5 11.5l7-7M6 4.5h5.5V10" />
    </svg>
  );
}

// A case study: the name and one line, the work, then the next piece and the
// same close as every page. Nothing that doesn't need saying: no back pill,
// no spec list, no headings.
export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const piece = getWork(slug);
  if (!piece) notFound();

  const all = getAllWork();
  const meta = all.find((w) => w.slug === slug);
  const idx = all.findIndex((w) => w.slug === slug);
  const nextMeta = idx >= 0 ? all[(idx + 1) % all.length] : null;
  const next = nextMeta && nextMeta.slug !== slug ? toTileWork(nextMeta) : null;

  // Cover first, then the preview and every shot from the write-up, each
  // with its real size so the page doesn't jump as they load. A piece with
  // none falls back to its card.
  const gallery = await getWorkGalleryImages(piece);
  const shots = gallery.length ? gallery : meta?.card ? [{ src: meta.card, width: 4, height: 5 }] : [];
  // Landscape shots run full width, one each. Portrait ones (phone screens,
  // lookbook photos) would stand far too tall that way, so each run of them
  // is set in a row of up to three at one shared height.
  const blocks: (typeof shots)[] = [];
  for (const img of shots) {
    const last = blocks[blocks.length - 1];
    const portrait = img.height > img.width;
    if (portrait && last && last[0].height > last[0].width && last.length < 3) last.push(img);
    else blocks.push([img]);
  }

  return (
    <main className="index-page">
      <section className="index-col case-open">
        <h1 className="case-open__name">{piece.client}</h1>
        {piece.summary && <p className="case-open__line">{piece.summary}</p>}
        {piece.url && (
          <a href={piece.url} target="_blank" rel="noreferrer" className="case-open__visit">
            Visit site
            <ArrowOut />
          </a>
        )}
      </section>

      {blocks.length > 0 && (
        <section className="index-col case-shots" aria-label="The work">
          {blocks.map((block, i) => (
            <Shots key={block[0].src} block={block} client={piece.client} first={i === 0} />
          ))}
        </section>
      )}

      {next && (
        <section className="index-col case-next">
          <h2 className="index-spot__label">Next</h2>
          <div className="case-next__card">
            <WorkTile work={next} sizes="(max-width: 640px) 70vw, 360px" />
          </div>
          <TileGlass />
        </section>
      )}

      <Close />
    </main>
  );
}
