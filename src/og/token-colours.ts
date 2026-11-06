import { readFile } from "node:fs/promises";
import path from "node:path";

/** The colour tokens build-time images use. */
const NAMES = [
  "paper",
  "paper-deep",
  "ink",
  "ink-soft",
  "rule",
  "accent",
  "accent-wash",
  "on-accent",
  "code-keyword",
  "code-string",
  "code-comment",
  "code-function",
  "code-type",
] as const;

export type Colours = Record<(typeof NAMES)[number], string>;

/** Each theme's token block in src/app/globals.css, as its selector line starts it. */
const BLOCKS = {
  light: /^:root \{([^}]*)\}/m,
  dark: /^:root\[data-theme="dark"\] \{([^}]*)\}/m,
};

/**
 * The light theme's colour tokens, read from the `:root` block of src/app/globals.css
 * so images drawn at build time (the OG images and the icon) use the same colours as
 * the pages. Those images can't use CSS variables, and a shared link has no theme.
 */
export function lightColours(): Promise<Colours> {
  return themeColours("light");
}

/**
 * The dark theme's colour tokens, read from the `:root[data-theme="dark"]` block of
 * src/app/globals.css, for images drawn dark on purpose (the terminal promo image).
 */
export function darkColours(): Promise<Colours> {
  return themeColours("dark");
}

async function themeColours(theme: keyof typeof BLOCKS): Promise<Colours> {
  const css = await readFile(
    path.join(/*turbopackIgnore: true*/ process.cwd(), "src/app/globals.css"),
    "utf8",
  );
  const block = css.match(BLOCKS[theme])?.[1] ?? "";
  const entries = NAMES.map((name) => {
    const value = block.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]?.trim();
    if (!value) throw new Error(`src/app/globals.css has no --${name} in its ${theme} token block`);
    return [name, value] as const;
  });
  return Object.fromEntries(entries) as Colours;
}
