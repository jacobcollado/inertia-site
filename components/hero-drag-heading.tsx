"use client";

import { Fragment, type ReactNode } from "react";

// The homepage hero heading's words, laid out per breakpoint (see `layout`
// below). Static type: the words don't move.
//
// Renders the words only; the caller owns the <h1> and its type styles.

// `lines` is the heading from sm up. `mobileLines` is the phone version: a
// subset of the same words in the same order (matched ignoring case, so a
// word can be capitalised when it starts the phone line). Words render once,
// in one wrapping row; words missing from the phone version are hidden
// below sm, and a zero-height full-width break after each line end is
// switched on or off by breakpoint, so nothing swaps after hydration.
type Slot = { word: string; mobile: string | null; mEnd: boolean; dEnd: boolean };

function layout(lines: string[][], mobileLines: string[][]): Slot[] {
  const words = lines.flat();
  const slots: Slot[] = words.map((word) => ({ word, mobile: null, mEnd: false, dEnd: false }));
  let n = 0;
  lines.slice(0, -1).forEach((l) => (slots[(n += l.length) - 1].dEnd = true));
  let j = 0;
  mobileLines.forEach((line, li) => {
    line.forEach((mw, wi) => {
      while (j < slots.length && slots[j].word.toLowerCase() !== mw.toLowerCase()) j++;
      if (j === slots.length) return;
      slots[j].mobile = mw;
      if (li < mobileLines.length - 1 && wi === line.length - 1) slots[j].mEnd = true;
      j++;
    });
  });
  return slots;
}

// A "*" in a heading word is set as plain type, in the heading's own ink.
// Kept as a hook so a word can be treated specially again.
function censor(word: string): ReactNode {
  return word;
}

export function HeroDragHeading({
  lines,
  mobileLines = lines,
  align = "center",
}: {
  lines: string[][];
  mobileLines?: string[][];
  align?: "center" | "left";
}) {
  const slots = layout(lines, mobileLines);

  return (
    <span className={`flex w-full flex-wrap items-baseline ${align === "left" ? "justify-start" : "justify-center"}`} style={{ columnGap: "0.28em" }}>
      {slots.map(({ word, mobile, mEnd, dEnd }, i) => {
        const brk = mEnd && dEnd ? "block" : mEnd ? "block sm:hidden" : dEnd ? "hidden sm:block" : null;
        return (
          <Fragment key={i}>
            <span className={mobile === null ? "hidden sm:inline-block" : "inline-block"}>
              {mobile !== null && mobile !== word && mobile.toLowerCase() === word.toLowerCase() ? (
                // Only the case differs (a word starting the phone line):
                // one word, capitalised by CSS, so the text reads once.
                <span className="max-sm:capitalize">{censor(word)}</span>
              ) : mobile !== null && mobile !== word ? (
                <>
                  <span className="sm:hidden">{censor(mobile)}</span>
                  <span className="hidden sm:inline">{censor(word)}</span>
                </>
              ) : (
                censor(word)
              )}
            </span>
            {brk && <span aria-hidden="true" className={`${brk} h-0 basis-full my-0.5 sm:my-1`} />}
          </Fragment>
        );
      })}
    </span>
  );
}
