// The homepage's words, kept apart from app/home-client.tsx (a client
// component) so server code can read them too: the Markdown version of the
// homepage (app/index.md) is built from the same copy. [[Double brackets]]
// mark a key phrase, set in full ink on the page.

// Written for founders: the company they're building toward, not the one
// their brand still shows. The earlier line was "What you build should look
// good as f*ck."
export const HERO_HEADING_LINES = [
  ["Look", "like", "the", "company"],
  ["you're", "becoming."],
];

export const HERO_HEADING_LINES_MOBILE = [
  ["Look", "like", "the"],
  ["company", "you're"],
  ["becoming."],
];

// One short line at every width. How we do it is the rest of the page's job.
export const HERO_SUBLINE =
  "Identity and websites for startups, designed as one.";

export const EXECUTION_INTRO =
  "Ideas are rarely the problem. [[Execution is.]] We carry what you stand for through every page, transition and email, until it feels effortless.";

// Each principle is one way of finishing "how we think about execution":
// the label names it, the line argues it, the illustration acts it out.
export const EXECUTION_PRINCIPLES = [
  {
    label: "Restraint",
    text: "The best design [[disappears into the experience]].",
  },
  {
    label: "Agreement",
    text: "Identity lives in [[a hundred small decisions that agree]].",
  },
  {
    label: "Follow-through",
    text: "Taste sets the direction. [[Finishing is what people feel.]]",
  },
] as const;

export const AI_APPROACH = [
  "AI hasn't changed what we believe about execution; [[it's changed how much of it we can afford]]. We explore more directions, drop the wrong ones sooner, and spend the time on the version worth shipping.",
  "None of that works without judgment, and [[judgment comes from reps]]. Years of projects built our grip on the fundamentals: design systems that hold up as a company grows, infrastructure that stays out of the way, and details people feel before they notice.",
] as const;

// What a client can hire us for, in the order most of them do it. Each label
// names its drawing in components/what-we-do-sketches.tsx.
export const WHAT_WE_DO_ITEMS = [
  {
    label: "Audit",
    description: "We go through your site the way a new customer would and rank what's costing you. Yours to keep, whether or not we do the work.",
  },
  {
    label: "Identity",
    description: "Mark, type, color and motion, with rules your team can actually follow.",
  },
  {
    label: "Build",
    description: "We design and develop it ourselves, so what you approved is what ships.",
  },
  {
    label: "Partnership",
    description: "After launch we stay on for new pages, campaigns and the small fixes that keep it sharp.",
  },
] as const;

// For an identity studio, a client's name is what they hand over.
export const CLIENTS_HEADING = "They trusted us with their name.";

/** Copy with the [[key phrase]] markers taken out. */
export function plainCopy(text: string): string {
  return text.replace(/\[\[|\]\]/g, "");
}
