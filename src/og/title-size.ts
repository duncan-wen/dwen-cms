/** The tracking a build-time image sets its title with, in em; OgTitle sets it, the estimate counts it. */
export const TITLE_TRACKING_EM = 0.02;

/** CJK ideographs, kana, full-width punctuation and forms, and the dashes, ellipsis and curly quotes the serif face sets full-width: 1em each. */
const FULL_WIDTH = /[—‘’“”…⺀-鿿가-힯豈-﫿︰-﹏＀-￯]/u;

/** A bold capital such as the S, V and G of `SVG` is about this wide, in em. */
const CAPITAL_EM = 0.75;

/** Any other Latin letter, digit or space is about this wide, in em. */
const NARROW_GLYPH_EM = 0.6;

/** The share of the width a line may fill, so a line the estimate undercounts still fits. */
const SAFE_SHARE = 0.95;

/** One glyph's estimated width, in em, before tracking. */
function glyphEm(glyph: string): number {
  if (FULL_WIDTH.test(glyph)) return 1;
  if (/[A-Z]/.test(glyph)) return CAPITAL_EM;
  return NARROW_GLYPH_EM;
}

/**
 * The font size, at most `base`, at which every one of the title's lines fits `width`
 * pixels on one line. The OG renderer can't measure text the way fitPromoText measures
 * the promo images in a browser, so each line's width is estimated, with a margin:
 * full-width glyphs at 1em, capitals at 0.75em, everything else at 0.6em, plus the tracking.
 */
export function titleFontSize(lines: string[], width: number, base: number): number {
  const ems = (line: string) => [...line].reduce((sum, glyph) => sum + glyphEm(glyph) + TITLE_TRACKING_EM, 0);
  const longest = Math.max(...lines.map(ems));
  return Math.min(base, Math.floor((width * SAFE_SHARE) / longest));
}
