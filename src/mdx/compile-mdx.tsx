import { evaluate } from "@mdx-js/mdx";
import type { Root } from "hast";
import { toString } from "hast-util-to-string";
import type { ReactElement } from "react";
import * as runtime from "react/jsx-runtime";
import rehypeSlug from "rehype-slug";
import { mdxComponents } from "./components";

/** One entry of a Post's table of contents: an `h2` heading's id and text. */
export type Heading = { id: string; label: string };

/** A compiled MDX body and the `h2` headings its table of contents links to. */
export type CompiledMdx = { Body: () => ReactElement; headings: Heading[] };

/** Compiles an MDX body; every heading gets a stable id from its text (rehype-slug, per ADR-0003). */
export async function compileMdx(source: string): Promise<CompiledMdx> {
  const headings: Heading[] = [];
  const collectHeadings = () => (tree: Root) => {
    for (const node of tree.children) {
      if (node.type === "element" && node.tagName === "h2" && typeof node.properties.id === "string") {
        headings.push({ id: node.properties.id, label: toString(node) });
      }
    }
  };
  const { default: Content } = await evaluate(source, {
    ...runtime,
    rehypePlugins: [rehypeSlug, collectHeadings],
  });
  return { Body: () => <Content components={mdxComponents} />, headings };
}
