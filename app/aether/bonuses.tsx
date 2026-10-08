/* The extras that come with a license: guides for getting the most out of the
 * store, and short lists of people we'd send a buyer to. Listed in the
 * checkout card (inline-pricing.tsx), folded open under "5 bonus guides and
 * lists". Keep in step with what the license email sends (lib/bonuses.ts). */

export type Bonus = {
  title: string;
  desc: string;
  kind: "guide" | "list";
};

export const BONUSES: Bonus[] = [
  {
    title: "Getting the most from Aether",
    desc: "Which sections to use where, and the settings most stores never touch.",
    kind: "guide",
  },
  {
    title: "Shooting your products",
    desc: "Lighting, angles and backgrounds for clean shots, on a phone or a camera.",
    kind: "guide",
  },
  {
    title: "Imagery that converts",
    desc: "The kinds of photos that sell best on product and collection pages, and why.",
    kind: "guide",
  },
  {
    title: "Manufacturers we trust",
    desc: "The two manufacturers we've worked with and can recommend.",
    kind: "list",
  },
  {
    title: "Designers we trust",
    desc: "Designers for your logo, graphics and product artwork.",
    kind: "list",
  },
];
