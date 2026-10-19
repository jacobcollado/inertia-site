import { getAllWork } from "@/lib/work";
import type { Metadata } from "next";
import HomeIndex from "./home-index";
import { toTileWork } from "@/components/work-tile";

export const metadata: Metadata = {
  alternates: { canonical: "https://byinertia.com" },
};

// Every piece with a logo, in the site's order, for the homepage's
// carousel. The previous homepage lives on in ./home-client.tsx.
export default function Page() {
  const work = getAllWork().flatMap((w) => {
    const tile = toTileWork(w);
    return tile?.mark ? [tile] : [];
  });

  return <HomeIndex work={work} />;
}
