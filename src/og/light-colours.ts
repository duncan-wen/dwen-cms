import { readFile } from "node:fs/promises";
import path from "node:path";

/** The colour tokens build-time images use. */
const NAMES = ["paper", "paper-deep", "ink", "accent", "on-accent"] as const;

export type LightColours = Record<(typeof NAMES)[number], string>;

/**
 * The light theme's colour tokens, read from the `:root` block of src/app/globals.css
 * so images drawn at build time (the OG images and the icon) use the same colours as
 * the pages. Those images can't use CSS variables, and a shared link has no theme.
 */
export async function lightColours(): Promise<LightColours> {
  const css = await readFile(
    path.join(/*turbopackIgnore: true*/ process.cwd(), "src/app/globals.css"),
    "utf8",
  );
  const root = css.match(/^:root \{([^}]*)\}/m)?.[1] ?? "";
  const entries = NAMES.map((name) => {
    const value = root.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]?.trim();
    if (!value) throw new Error(`src/app/globals.css has no --${name} in its :root block`);
    return [name, value] as const;
  });
  return Object.fromEntries(entries) as LightColours;
}
