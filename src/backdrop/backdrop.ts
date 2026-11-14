import { type ContourLines, generateCover } from "@/cover/cover";

/**
 * How strongly the Backdrop's lines are drawn, one value for the whole site:
 * - `off`: no Backdrop at all;
 * - `faint`: the rule colour, the colour of the site's hairlines;
 * - `medium`: the rule colour with some soft ink mixed in;
 * - `accent`: the rule colour with some of the accent mixed in.
 * The three colours are `--backdrop-*` in `src/app/globals.css`.
 */
export type BackdropStrength = "off" | "faint" | "medium" | "accent";

/** The site's Backdrop strength. Only the Owner changes it, in a PR with screenshots. */
export const BACKDROP_STRENGTH: BackdropStrength = "medium";

/** The seed every page but a Post shares. */
const SITE_SEED = "site";

/** What seeds a page's Backdrop: a Post's Slug, so it matches the Post's generated cover, else the site's seed. */
export function backdropSeed(pathname: string): string {
  return /^\/posts\/([^/]+)/.exec(pathname)?.[1] ?? SITE_SEED;
}

/** The Backdrop's lines for a seed at a phase, or null when the Backdrop is off. */
export function backdropLines(strength: BackdropStrength, seed: string, phase: number): ContourLines | null {
  return strength === "off" ? null : generateCover(seed, phase);
}
