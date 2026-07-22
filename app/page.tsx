import { getAllWork } from "@/lib/work";
import Home from "./home-client";

export default function Page() {
  const work = getAllWork();
  const initialWork = work.map(w => ({
    slug: w.slug,
    client: w.client,
    blurb: w.blurb ?? w.summary,
    logo: w.logo,
    palette: w.palette,
    card: w.card,
  }));
  return <Home initialWork={initialWork} />;
}
