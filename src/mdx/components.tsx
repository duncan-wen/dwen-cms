import type { MDXComponents } from "mdx/types";
import { BodyImage } from "./body-image";
import { Callout } from "./callout";

/**
 * The single component map every MDX body renders through: Markdown elements
 * it overrides, and the components a body may use by name. Phase-2 Demos plug
 * in here too. Code blocks are highlighted while compiling (compileMdx).
 */
export const mdxComponents: MDXComponents = {
  img: BodyImage,
  Callout,
};
