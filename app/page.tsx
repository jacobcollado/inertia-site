import { getAllWork } from "@/lib/work";
import type { Metadata } from "next";
import HomeIndex from "./home-index";
import { toTileWork, type TileWork } from "@/components/work-tile";

export const metadata: Metadata = {
  alternates: { canonical: "https://byinertia.com" },
};

// The four pieces set in the homepage's opening line, in the order they
// appear in it. The previous homepage lives on in ./home-client.tsx.
const OPENING = ["allure-new-york", "ft-gioo", "samuel-norris", "trippie-redd"];

export default function Page() {
  const all = getAllWork();
  const work = OPENING.flatMap((slug) => {
    const w = all.find((x) => x.slug === slug);
    const tile = w ? toTileWork(w) : null;
    return tile ? [tile] : ([] as TileWork[]);
  });

  return <HomeIndex work={work} />;
}
