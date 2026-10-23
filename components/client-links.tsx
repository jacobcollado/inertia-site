"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Scramble } from "@/components/scramble";

// The work, straight after the about sentence (styles are .client-links in
// globals.css): the clients' names, newest first, each with the year we made
// it under it in the mono the sentence is decoded from. Plain links to each
// case study. One name at a time glitches like the close's "building."
// (scramble.tsx), then hands over to another.

// How long each name glitches before the next takes over, in ms.
const TURN = 1600;

const WORK = [
  { name: "Allure New York", slug: "allure-new-york", year: "2026" },
  { name: "Inboundly", slug: "inboundly", year: "2026" },
  { name: "Ellora LA", slug: "ellora-la", year: "2026" },
  { name: "Aether", slug: "aether", year: "2026" },
  { name: "FT.GIOO", slug: "ft-gioo", year: "2025" },
  { name: "Trippie Redd", slug: "trippie-redd", year: "2025" },
];

export function ClientLinks() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      // Any other name, so it never stays in one place.
      setActive((i) => (i + 1 + Math.floor(Math.random() * (WORK.length - 1))) % WORK.length);
    }, TURN);
    return () => clearInterval(id);
  }, []);

  return (
    <ul className="index-col client-links">
      {WORK.map((w, i) => (
        <li key={w.slug}>
          <Link href={`/work/${w.slug}`} className="client-links__item">
            <span className="client-links__name">
              <Scramble text={w.name} active={i === active} />
            </span>
            <span className="client-links__year">{w.year}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
