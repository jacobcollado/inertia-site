import { getAllWork } from "@/lib/work";
import Home from "./home-client";

export default function Page() {
  const work = getAllWork();
  // FT.GIOO stays on /work but is hidden from the homepage carousel.
  const initialWork = work.filter(w => w.slug !== "ft-gioo").map(w => ({
    slug: w.slug,
    client: w.client,
    blurb: w.blurb ?? w.summary,
    logo: w.logo,
  }));
  return <Home initialWork={initialWork} />;
}
