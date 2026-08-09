import { getImageProps } from "next/image";
import { getAllWork, getWorkGalleryImages } from "@/lib/work";
import { getWorkIndexThumb } from "@/lib/work-thumb";
import WorkIndexPage from "./work-index-client";

// Desktop carousel swaps a couple of thumbs; preload those too so the
// first paint doesn't wait on a second request after hydration.
const CAROUSEL_THUMB_OVERRIDE: Record<string, string> = {
  inboundly: "/work/inboundly-1.png",
};

function WorkThumbPreloads({
  srcs,
}: {
  srcs: string[];
}) {
  return (
    <>
      {srcs.map((src) => {
        const { props } = getImageProps({
          src,
          alt: "",
          width: 1536,
          height: 1024,
          quality: 90,
          sizes: "(max-width: 640px) 100vw, 1536px",
        });
        return (
          <link
            key={src}
            rel="preload"
            as="image"
            href={props.src}
            imageSrcSet={props.srcSet}
            imageSizes={props.sizes}
            // First paint on /work is the thumbnails — start them ahead of
            // the rest of the page's fetch queue.
            fetchPriority="high"
          />
        );
      })}
    </>
  );
}

export default async function Page() {
  const work = getAllWork();
  const galleries = await Promise.all(work.map((w) => getWorkGalleryImages(w)));
  const workWithGalleries = work.map((w, i) => ({ ...w, gallery: galleries[i] }));

  const thumbSrcs = Array.from(
    new Set(
      work.flatMap((w) => {
        const index = getWorkIndexThumb(w);
        const carousel = CAROUSEL_THUMB_OVERRIDE[w.slug];
        return [index, carousel].filter((s): s is string => Boolean(s));
      })
    )
  );

  return (
    <>
      <WorkThumbPreloads srcs={thumbSrcs} />
      <WorkIndexPage initialWork={workWithGalleries} />
    </>
  );
}
