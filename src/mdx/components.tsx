import type { MDXComponents } from "mdx/types";
import { BodyImage } from "./body-image";
import { Callout } from "./callout";
import { Mermaid } from "./mermaid";
import { SlideDeck } from "./slide-deck";

/**
 * The single component map every MDX body renders through: Markdown elements
 * it overrides, and the components a body may use by name. Phase-2 Demos plug
 * in here too. Code blocks are highlighted while compiling (compileMdx), which
 * also turns each ```mermaid block into a Mermaid diagram.
 */
export const mdxComponents: MDXComponents = {
  img: BodyImage,
  Callout,
  Mermaid,
  SlideDeck,
};
