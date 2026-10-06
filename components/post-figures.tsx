import type React from "react";
import { PostFigureArt } from "@/components/post-figure-art";

/* In-body figures for blog posts, one per post, placed after the first
   paragraph of the section it illustrates (see ArticleBody in
   app/blog/[slug]/page.tsx). The drawings themselves are in
   post-figure-art.tsx (a client component, for the material textures); this
   lookup stays server-side so the page can decide where each one goes. */

// Keyed by post slug, then by the id of the section heading the figure
// belongs under (the slugified heading text, see renderMarkdown).
const POST_FIGURES: Record<string, Record<string, string>> = {
  "someone-still-has-to-pick": { "forty-options-is-its-own-problem": "FortyDirections" },
  "taste-is-trained": { "years-mostly-spent-wrong": "TasteGap" },
  "speed-is-a-feature": { "show-the-layout-before-the-data": "PerceivedSpeed" },
  "most-projects-fail-before-figma": { "nobody-actually-needs-a-redesign": "RequestVersusProblem" },
  "the-difference-you-feel": { "nudge-the-play-button-right": "OpticalCentre" },
  "copy-is-design": { "the-headline-that-runs-three-lines": "LengthIsLayout" },
  "design-systems-that-scale": { "page-one-always-fits": "TenthPage" },
  "consistency-beats-novelty": { "two-pixels-and-a-third-grey": "DriftAndGreys" },
};

export function postFigure(slug: string, headingId: string): React.ReactElement | null {
  const name = POST_FIGURES[slug]?.[headingId];
  return name ? <PostFigureArt name={name} /> : null;
}
