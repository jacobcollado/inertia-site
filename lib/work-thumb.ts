import type { WorkMeta } from "@/lib/work";

// /work index thumbnails — real deliverables, not homepage carousel art.
// Prefers in-page screenshots, then preview/cover, then card as fallback.
export function getWorkIndexThumb(w: WorkMeta): string | undefined {
  return w.images?.[0] ?? w.preview ?? w.cover ?? w.card;
}
