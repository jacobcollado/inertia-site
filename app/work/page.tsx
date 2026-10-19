import { getAllWork } from "@/lib/work";
import { Close } from "@/components/close";
import { TileGlass, WorkTile, toTileWork } from "@/components/work-tile";

// Every piece of work, and nothing else: the same cards as the homepage, no
// heading (the page says what it is by being it), then the same close.
export default function WorkIndexPage() {
  const work = getAllWork().flatMap((w) => {
    const tile = toTileWork(w);
    return tile ? [tile] : [];
  });

  return (
    <main className="index-page">
      <section className="index-col index-all" aria-label="Work">
        <div className="index-all__grid">
          {work.map((w, i) => (
            <WorkTile key={w.slug} work={w} sizes="(max-width: 768px) 50vw, 420px" priority={i < 3} />
          ))}
        </div>
        <TileGlass />
      </section>
      <Close />
    </main>
  );
}
