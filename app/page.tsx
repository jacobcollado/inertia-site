import { getAllPosts } from "@/lib/posts";
import { getAllWork } from "@/lib/work";
import Home from "./home-client";

// The carousel marks are rendered as CSS masks off their raw public path, not
// through next/image, so preload the original file — warming the optimizer URL
// would prime a request the page never makes.
function CarouselLogoPreloads({ srcs }: { srcs: string[] }) {
  return (
    <>
      {srcs.map((src) => (
        <link
          key={src}
          rel="preload"
          as="image"
          href={src}
          fetchPriority="high"
        />
      ))}
    </>
  );
}

export default function Page() {
  const work = getAllWork();
  // Newest six, except posts marked `home: true` always make the cut; they
  // take the place of the oldest ones and keep their usual position.
  const allPosts = getAllPosts();
  const homeSlugs = new Set(allPosts.filter(p => p.home).map(p => p.slug));
  const fill = allPosts.filter(p => !p.home).slice(0, Math.max(0, 6 - homeSlugs.size)).map(p => p.slug);
  const shown = new Set([...homeSlugs, ...fill]);
  const initialPosts = allPosts.filter(p => shown.has(p.slug));
  // FT.GIOO stays on /work but is hidden from the homepage carousel.
  const initialWork = work.filter(w => w.slug !== "ft-gioo").map(w => ({
    slug: w.slug,
    client: w.client,
    blurb: w.blurb ?? w.summary,
    logo: w.logo,
    service: w.service,
    year: w.year,
    summary: w.summary ?? w.blurb,
    // First shot from the case study, used as the dialog's preview image.
    image: w.card ?? w.cover ?? w.images?.[0],
  }));

  const logoSrcs = Array.from(
    new Set(initialWork.map((w) => w.logo).filter((s): s is string => Boolean(s)))
  );

  return (
    <>
      <link rel="prefetch" href="/aether" />
      <CarouselLogoPreloads srcs={logoSrcs} />
      <Home initialWork={initialWork} initialPosts={initialPosts} />
    </>
  );
}
