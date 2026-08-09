import { getImageProps } from "next/image";
import { getAllWork } from "@/lib/work";
import Home from "./home-client";

function CarouselLogoPreloads({ srcs }: { srcs: string[] }) {
  return (
    <>
      {srcs.map((src) => {
        const { props } = getImageProps({
          src,
          alt: "",
          width: 180,
          height: 180,
          quality: 75,
          sizes: "230px",
        });
        return (
          <link
            key={src}
            rel="preload"
            as="image"
            href={props.src}
            imageSrcSet={props.srcSet}
            imageSizes={props.sizes}
            fetchPriority="high"
          />
        );
      })}
    </>
  );
}

export default function Page() {
  const work = getAllWork();
  // FT.GIOO stays on /work but is hidden from the homepage carousel.
  const initialWork = work.filter(w => w.slug !== "ft-gioo").map(w => ({
    slug: w.slug,
    client: w.client,
    blurb: w.blurb ?? w.summary,
    logo: w.logo,
  }));

  const logoSrcs = Array.from(
    new Set(initialWork.map((w) => w.logo).filter((s): s is string => Boolean(s)))
  );

  return (
    <>
      <CarouselLogoPreloads srcs={logoSrcs} />
      <Home initialWork={initialWork} />
    </>
  );
}
