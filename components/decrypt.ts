// The decrypting type (the about sentence, why us): each word waits as noise
// in a grey mono and resolves into our type. Styles are .decrypt in
// globals.css.

export const GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789#%&$@!?";

// A mono glyph's advance, in its own em (JetBrains Mono, with the noise's
// tracking), and the noise's size against the type it stands in for.
export const ADVANCE = 0.58;
export const NOISE_SIZE = 0.78;

// The noise for a word, `count` glyphs long (as many as fit the resolved
// word's width; its own length until that's measured), keeping a closing
// comma or full stop so it still reads as a sentence being decoded. Seeded,
// so the server and the first client render agree.
export function noise(word: string, count: number, seed: number) {
  const end = /[,.]$/.test(word) ? word.slice(-1) : "";
  let n = seed;
  let out = "";
  for (let i = 0; i < Math.max(1, count - end.length); i++) {
    n = (n * 1103515245 + 12345) % 2147483648;
    out += GLYPHS[n % GLYPHS.length];
  }
  return out + end;
}

// How many glyphs of noise fit each of an element's words, at its type size.
export function fitNoise(el: HTMLElement) {
  const size = parseFloat(getComputedStyle(el).fontSize) * NOISE_SIZE * ADVANCE;
  return [...el.querySelectorAll<HTMLElement>(".decrypt__word")].map((w) => Math.max(1, Math.floor(w.offsetWidth / size)));
}
