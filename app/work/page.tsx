"use client";

import { useEffect, useState } from "react";
import type { WorkMeta } from "@/lib/work";

function serviceShort(s: string | undefined): string {
  if (!s) return "";
  return s.trim();
}

export default function WorkIndexPage() {
  const [work, setWork] = useState<WorkMeta[]>([]);

  useEffect(() => {
    fetch("/api/content").then(r => r.json()).then(d => {
      const sorted = (d.work ?? []).sort((a: WorkMeta, b: WorkMeta) => (a.order ?? 99) - (b.order ?? 99));
      setWork(sorted);
    });
  }, []);

  return (
    <main className="mx-3 sm:mx-auto w-auto sm:w-full max-w-[88rem] min-h-screen flex flex-col pb-20 pt-24">

      <div className="flex flex-col gap-20 px-3">
        {work.length > 0 ? work.map((w) => {
          const allImages = [
            ...(w.cover ? [w.cover] : []),
            ...(w.preview ? [w.preview] : []),
            ...(w.images ?? []),
          ];

          return (
            <div key={w.slug} className="flex flex-col gap-5">

              {/* Header */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-[18px] font-medium tracking-tight text-[rgb(var(--fg))]">{w.client}</span>
                  {w.service && (
                    <span className="text-[16px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.5 }}>
                      {serviceShort(w.service)}
                    </span>
                  )}
                </div>
                {w.year && (
                  <span className="text-[15px] tabular-nums tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.35 }}>
                    {w.year.match(/\d{4}/)?.[0]}
                  </span>
                )}
              </div>

              {/* Stacked images */}
              <div className="flex flex-col gap-3">
                {allImages.map((src, i) => (
                  <div key={i} className="w-full overflow-hidden rounded-xl bg-[rgb(var(--surface))]">
                    <img
                      src={src}
                      alt={`${w.client} ${i + 1}`}
                      className="w-full h-auto block"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>

            </div>
          );
        }) : (
          [...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col gap-5">
              <div className="h-5 w-40 rounded bg-[rgb(var(--surface))] animate-pulse" />
              <div className="w-full rounded-xl bg-[rgb(var(--surface))] animate-pulse" style={{ aspectRatio: "16/9" }} />
            </div>
          ))
        )}
      </div>

    </main>
  );
}
