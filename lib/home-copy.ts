// The homepage's words, kept apart from app/home-client.tsx (a client
// component) so server code can read them too: the Markdown version of the
// homepage (app/index.md) is built from the same copy. [[Double brackets]]
// mark a key phrase, set in full ink on the page.

export const HERO_HEADING_LINES = [
  ["Your", "brand,", "rebuilt", "for", "the"],
  ["next", "generation", "of", "buyers."],
];

export const HERO_HEADING_LINES_MOBILE = [
  ["Your", "brand,", "rebuilt", "for"],
  ["the", "next", "generation"],
  ["of", "buyers."],
];

export const HERO_SUBLINE =
  "Inertia is a Gen Z-led studio. We redesign the identity and website of companies, brands and founders, so the customers they want most trust them sooner and come back. Audit, design and build, all in-house.";

// A little shorter on phones, so it sits in fewer lines under the heading.
export const HERO_SUBLINE_MOBILE =
  "A Gen Z-led studio redesigning identities and websites, so the customers you want most trust you sooner and come back.";

export const EXECUTION_INTRO =
  "Ideas and identity are rarely the problem. [[Execution is.]] We take what a company, brand, or person stands for and carry it through every page, transition and email, until it feels effortless to the customer moving through it.";

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

// What a client can hire us for, in the order most of them do it. Each label
// names its drawing in components/what-we-do-sketches.tsx.
export const WHAT_WE_DO_ITEMS = [
  {
    label: "Audit",
    description: "We go through your site and brand the way a new customer would, and hand you a ranked list of what's costing you. It's yours to keep whether or not we do the work.",
  },
  {
    label: "Identity",
    description: "A visual system built for who's buying next: mark, type, color and motion, with rules your team can actually follow.",
  },
  {
    label: "Build",
    description: "We design and develop the site ourselves, so the version you approved is the version that ships.",
  },
  {
    label: "Partnership",
    description: "After launch we stay on for new pages, campaigns and the small fixes that keep it sharp as you grow.",
  },
] as const;

// For an identity studio, a client's name is what they hand over.
export const CLIENTS_HEADING = "They trusted us with their name.";

/** Copy with the [[key phrase]] markers taken out. */
export function plainCopy(text: string): string {
  return text.replace(/\[\[|\]\]/g, "");
}
