import { renderMermaidSVG } from "beautiful-mermaid";

/**
 * Diagram colours are the site's colour tokens, so the SVG follows the theme
 * through the CSS cascade: the toggle switches it without re-rendering.
 */
const tokenColours = {
  bg: "var(--paper)",
  fg: "var(--ink)",
  line: "var(--ink-soft)",
  accent: "var(--accent)",
  muted: "var(--ink-soft)",
  surface: "var(--accent-wash)",
  border: "var(--accent)",
};

/**
 * Renders Mermaid source to an inline SVG string in Node, with no browser
 * (beautiful-mermaid; Vercel's build has none). `idPrefix` keeps the SVG's ids
 * unique when a page holds several diagrams. Throws on a diagram type the
 * renderer doesn't support; the content check reports that as a problem.
 */
export function mermaidSvg(source: string, idPrefix: string): string {
  // The figure's margin spaces it from the prose, so the canvas needs little padding of its own.
  const svg = renderMermaidSVG(source, { ...tokenColours, transparent: true, padding: 8 });
  return (
    svg
      // The renderer @imports a web font and sets one on every <text> on the page;
      // globals.css sets the diagram font instead, so Traditional Chinese renders.
      .replace(/^\s*@import url\([^)]*\);\n/gm, "")
      .replace(/^\s*text \{ font-family:[^}]*\}\n/m, "")
      .replace(/(\s)id="([^"]*)"/g, `$1id="${idPrefix}-$2"`)
      .replace(/url\(#([^)]*)\)/g, `url(#${idPrefix}-$1)`)
  );
}
