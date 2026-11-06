/**
 * The colour tokens an Illustration may paint with, each written `var(--<name>)`:
 * the neutrals, the accent, and four series colours for things drawn side by side
 * (threads, processes). globals.css defines each for both themes.
 */
export const ILLUSTRATION_COLOURS = [
  "paper",
  "paper-deep",
  "ink",
  "ink-soft",
  "rule",
  "accent",
  "accent-wash",
  "on-accent",
  "series-1",
  "series-2",
  "series-3",
  "series-4",
] as const;

/** The body's small text, in px: no label may draw smaller once the Illustration fits the column. */
export const MIN_TEXT_PX = 13;

/** Attributes that paint a colour; each must name a token, `none` or `currentColor`. */
const COLOUR_ATTRIBUTES = new Set(["fill", "stroke", "stop-color", "flood-color", "lighting-color", "color"]);

/** Elements that run code, load something from elsewhere or carry their own CSS. */
const FORBIDDEN_ELEMENTS = new Set(["script", "style", "foreignObject", "image", "iframe", "a", "video", "audio"]);

const COLOUR_VALUE = new RegExp(`^(?:none|currentColor|var\\(--(?:${ILLUSTRATION_COLOURS.join("|")})\\))$`);

/** One broken rule in an Illustration: the rule's name and what to fix. */
export type IllustrationProblem = { rule: string; message: string };

/** What the content check learns from a valid Illustration. */
export type IllustrationShape = {
  /** Its viewBox's width and height, which it is drawn at, in px, when the column allows. */
  width: number;
  height: number;
  /** The narrowest it may be drawn, in px, before a label drops below MIN_TEXT_PX. */
  minWidth: number;
};

const COLOUR_HINT = `var(--ink), var(--accent) or var(--series-1)`;

/**
 * Checks an Illustration's SVG source against the rules a Writing Agent draws by:
 * well-formed SVG with a viewBox, nothing that runs or loads, colours only from
 * ILLUSTRATION_COLOURS (as attributes, never `style`), no font of its own, and
 * every label at least MIN_TEXT_PX when drawn at its viewBox size.
 */
export async function checkIllustration(
  source: string,
): Promise<{ problems: IllustrationProblem[]; shape?: IllustrationShape }> {
  const problems: IllustrationProblem[] = [];
  const report = (rule: string, message: string) => problems.push({ rule, message });
  const { DOMParser } = await domWindow();
  const doc = new DOMParser().parseFromString(source, "image/svg+xml");
  const root = doc.documentElement;
  if (doc.getElementsByTagName("parsererror").length > 0 || root.localName !== "svg") {
    report("illustration-syntax", "isn't a well-formed SVG file with <svg> at its root");
    return { problems };
  }

  const viewBox = (root.getAttribute("viewBox") ?? "").trim().split(/[\s,]+/).map(Number);
  const [, , width, height] = viewBox;
  const hasViewBox = viewBox.length === 4 && viewBox.every(Number.isFinite) && width > 0 && height > 0;
  if (!hasViewBox) report("illustration-viewbox", `needs a viewBox on <svg>, e.g. viewBox="0 0 640 360"`);

  const elements = [root, ...Array.from(root.getElementsByTagName("*"))];
  const unsafe = new Set<string>();
  const colours = new Set<string>();
  const fonts = new Set<string>();
  for (const element of elements) {
    if (FORBIDDEN_ELEMENTS.has(element.localName)) unsafe.add(`<${element.localName}>`);
    for (const { name, value } of Array.from(element.attributes)) {
      const local = name.replace(/^xlink:/, "");
      if (/^on/i.test(name)) unsafe.add(name);
      else if (local === "href" && !value.startsWith("#")) unsafe.add(`${name}="${value}"`);
      else if (name === "style") colours.add(`style="${value}"`);
      else if (COLOUR_ATTRIBUTES.has(name) && !COLOUR_VALUE.test(value.trim())) colours.add(`${name}="${value}"`);
      else if (name === "font-family" || name === "font") fonts.add(`${name}="${value}"`);
    }
  }
  if (unsafe.size > 0) {
    report("illustration-unsafe", `has ${list(unsafe)}, which could run code or load something from elsewhere; draw with shapes, paths and text only`);
  }
  if (colours.size > 0) {
    report(
      "illustration-colour",
      `paints with ${list(colours)}; give each colour as an attribute naming a site token (${COLOUR_HINT}; the tokens are ${ILLUSTRATION_COLOURS.join(", ")}), none or currentColor, so it follows the theme`,
    );
  }
  if (fonts.size > 0) report("illustration-font", `sets ${list(fonts)}; leave the font out, so the site's face draws Traditional Chinese`);

  const sizes = Array.from(root.getElementsByTagName("text")).map(fontSize);
  const small = sizes.filter((size) => size < MIN_TEXT_PX);
  if (small.length > 0) {
    report(
      "illustration-text-size",
      `has text at ${list(new Set(small.map((size) => `${size}px`)))}; every label needs font-size="${MIN_TEXT_PX}" or more, so it reads once the Illustration fits the column`,
    );
  }

  if (problems.length > 0 || !hasViewBox) return { problems };
  // Without text an Illustration may shrink as far as the column needs.
  const smallest = Math.min(Infinity, ...sizes);
  return { problems, shape: { width, height, minWidth: (width * MIN_TEXT_PX) / smallest } };
}

/**
 * An Illustration's SVG ready to inline: ids prefixed with `idPrefix` so several on a
 * page don't collide, drawn at its viewBox size (CSS shrinks it to the column), and
 * hidden from assistive tech, since the element holding it carries the alt text.
 */
export function illustrationSvg(source: string, idPrefix: string): string {
  // checkIllustration has made sure the viewBox is there.
  const [, , width, height] = (source.match(/\sviewBox="([^"]*)"/)?.[1] ?? "").trim().split(/[\s,]+/);
  return source
    .replace(/<\?xml[^>]*\?>|<!DOCTYPE[^>]*>|<!--[\s\S]*?-->/g, "")
    .trim()
    .replace(/<svg\b([^>]*)>/, (_, attributes: string) => {
      const kept = attributes.replace(/\s(?:width|height|aria-hidden)="[^"]*"/g, "");
      return `<svg${kept} width="${width}" height="${height}" aria-hidden="true" focusable="false">`;
    })
    .replace(/(\s)id="([^"]*)"/g, `$1id="${idPrefix}-$2"`)
    .replace(/url\(#([^)]*)\)/g, `url(#${idPrefix}-$1)`)
    .replace(/((?:xlink:)?href)="#([^"]*)"/g, `$1="#${idPrefix}-$2"`);
}

/**
 * An Illustration as a file of its own, for a link to it to open without the page:
 * its colour tokens defined there, in the given theme colours (each series colour
 * is the code colour globals.css maps it to).
 */
export function standaloneIllustration(source: string, colours: Record<string, string>): string {
  const series: Record<string, string> = {
    "series-1": colours["code-function"],
    "series-2": colours["code-keyword"],
    "series-3": colours["code-type"],
    "series-4": colours["code-string"],
  };
  const tokens = ILLUSTRATION_COLOURS.map((name) => `--${name}:${series[name] ?? colours[name]};`).join("");
  return source.replace(/<svg\b[^>]*>/, (tag) => `${tag}<style>:root{${tokens}}</style>`);
}

/** A text element's font size in px: its own or its nearest ancestor's `font-size`, else the 16px default. */
function fontSize(text: Element): number {
  for (let node: Element | null = text; node; node = node.parentElement) {
    const value = node.getAttribute("font-size");
    if (value !== null) return Number.parseFloat(value);
  }
  return 16;
}

function list(items: Set<string>): string {
  return [...items].join(", ");
}

let windowPromise: Promise<{ DOMParser: typeof DOMParser }> | undefined;

/** One jsdom window for every check: parsing needs a DOM, and Node has none. */
function domWindow() {
  windowPromise ??= import("jsdom").then(({ JSDOM }) => new JSDOM("").window as unknown as { DOMParser: typeof DOMParser });
  return windowPromise;
}
