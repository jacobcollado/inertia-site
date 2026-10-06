// Posts with a material cover (components/post-covers.tsx). Kept outside
// that client module so server components can check it.
export const COVER_SLUGS = [
  "consistency-beats-novelty",
  "copy-is-design",
  "design-systems-that-scale",
  "someone-still-has-to-pick",
  "speed-is-a-feature",
  "taste-is-trained",
  "most-projects-fail-before-figma",
  "the-difference-you-feel",
] as const;

export function hasMaterialCover(slug: string) {
  return (COVER_SLUGS as readonly string[]).includes(slug);
}
