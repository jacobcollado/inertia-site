import { getAllWork, getWorkGalleryImages } from "@/lib/work";
import WorkIndexPage from "./work-index-client";

export default async function Page() {
  const work = getAllWork();
  const galleries = await Promise.all(work.map((w) => getWorkGalleryImages(w)));
  const workWithGalleries = work.map((w, i) => ({ ...w, gallery: galleries[i] }));
  return <WorkIndexPage initialWork={workWithGalleries} />;
}
