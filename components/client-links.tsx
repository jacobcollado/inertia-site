"use client";

import Link from "next/link";

// The work, straight after the about sentence (styles are .client-links in
// globals.css): the clients' names, newest first, each with the year we made
// it under it in the mono the sentence is decoded from. Plain links to each
// case study.

const WORK = [
  { name: "Allure New York", slug: "allure-new-york", year: "2026" },
  { name: "Inboundly", slug: "inboundly", year: "2026" },
  { name: "Ellora LA", slug: "ellora-la", year: "2026" },
  { name: "Aether", slug: "aether", year: "2026" },
  { name: "FT.GIOO", slug: "ft-gioo", year: "2025" },
  { name: "Trippie Redd", slug: "trippie-redd", year: "2025" },
];

export function ClientLinks() {
  return (
    <ul className="index-col client-links">
      {WORK.map((w) => (
        <li key={w.slug}>
          <Link href={`/work/${w.slug}`} className="client-links__item">
            <span className="client-links__name">{w.name}</span>
            <span className="client-links__year">{w.year}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
