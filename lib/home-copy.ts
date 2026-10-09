// The homepage's words, kept apart from app/home-client.tsx (a client
// component) so server code can read them too: the Markdown version of the
// homepage (app/index.md) is built from the same copy. [[Double brackets]]
// mark a key phrase, set in full ink on the page.

export const HERO_HEADING_LINES = [
  ["A", "design", "and", "development", "studio"],
  ["making", "websites", "people", "actually", "remember."],
];

export const HERO_HEADING_LINES_MOBILE = [
  ["A", "design", "and"],
  ["development", "studio"],
  ["making", "websites", "people"],
  ["actually", "remember."],
];

export const HERO_SUBLINE =
  "We work with local shops, artists and growing startups, taking each project from first idea to launch, all in-house.";

// A little shorter on phones, so it sits in fewer lines under the heading.
export const HERO_SUBLINE_MOBILE =
  "We work with local shops, artists and growing startups, from first idea to launch, all in-house.";

export const EXECUTION_INTRO =
  "Ideas and identity are rarely the problem. [[Execution is.]] We take what a company, brand, or person stands for and carry it through every detail, until the result feels effortless to the people moving through it.";

// Each principle is one way of finishing "how we think about execution":
// the label names it, the line argues it, the illustration acts it out.
export const EXECUTION_PRINCIPLES = [
  {
    label: "Restraint",
    text: "[[The best design disappears into the experience.]] Nobody applauds the restraint, and that's exactly how you know it landed.",
  },
  {
    label: "Agreement",
    text: "Identity isn't expressed in one big gesture. It's carried in [[a hundred small decisions that all agree with each other]].",
  },
  {
    label: "Follow-through",
    text: "Taste sets the direction, but [[finishing is what people actually feel]]. We stay on a thing until the last detail stops asking for attention.",
  },
] as const;

export const AI_APPROACH = [
  "AI hasn't changed what we believe about execution; [[it's changed how much of it we can afford]]. A studio our size can now explore more directions, discard the wrong ones sooner, and spend the saved time where it counts: on the version worth shipping.",
  "None of that works without judgment, and [[judgment comes from reps]]. Years of projects have built our grip on the fundamentals: design systems that hold up as a brand grows, infrastructure that stays out of the way, and details people feel before they notice.",
] as const;

export const WHAT_WE_DO_ITEMS = [
  {
    label: "Direction",
    description: "We figure out what the product or brand actually needs to be before anything gets designed.",
  },
  {
    label: "Design",
    description: "Interfaces, identity, and the small decisions in between, held to one standard of taste.",
  },
  {
    label: "Development",
    description: "We build what we design ourselves, so nothing is lost translating one team's vision to another's code.",
  },
  {
    label: "Launch",
    description: "We ship what we build and stay through launch, so what goes live matches what was designed.",
  },
] as const;

/** Copy with the [[key phrase]] markers taken out. */
export function plainCopy(text: string): string {
  return text.replace(/\[\[|\]\]/g, "");
}
