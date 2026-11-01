/** Tracking the title is set with, in em: `letterSpacing: "0.02em"`. */
const TRACKING = 0.02;

/** A Latin letter, digit or space in the serif face is about this wide, in em; a full-width glyph is 1em. */
const NARROW = 0.6;

/** CJK ideographs, kana, full-width punctuation and forms: each one em wide. */
const FULL_WIDTH = /[⺀-鿿가-힯豈-﫿︰-﹏＀-￯]/u;

/**
 * The font size, at most `base`, at which every one of the title's lines fits `width`
 * pixels on one line. The image renderer can't measure text, so each line's width is
 * estimated: full-width glyphs at 1em, everything else at 0.6em, plus the tracking.
 */
export function titleFontSize(lines: string[], width: number, base: number): number {
  const ems = (line: string) =>
    [...line].reduce((sum, glyph) => sum + (FULL_WIDTH.test(glyph) ? 1 : NARROW) + TRACKING, 0);
  const longest = Math.max(...lines.map(ems));
  return Math.min(base, Math.floor(width / longest));
}
