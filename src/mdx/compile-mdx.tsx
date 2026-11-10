import { evaluate } from "@mdx-js/mdx";
import rehypeShiki from "@shikijs/rehype";
import type { Element, Root, RootContent } from "hast";
import { toString } from "hast-util-to-string";
import type { ReactElement } from "react";
import * as runtime from "react/jsx-runtime";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { createCssVariablesTheme } from "shiki";
import { mdxComponents } from "./components";
import { type MdNode, mdNodes, mermaidBlocks } from "./md-tree";

/** One entry of a Post's table of contents: an `h2` heading's id and text. */
export type Heading = { id: string; label: string };

/** A compiled MDX body and the `h2` headings its table of contents links to. */
export type CompiledMdx = { Body: () => ReactElement; headings: Heading[] };

/**
 * Where a body image is served and its size, so it renders without layout shift. An
 * Illustration also gives its SVG source, the narrowest it may be drawn, and its phone copy if any.
 */
export type BodyImageSource = {
  src: string;
  width: number;
  height: number;
  svg?: string;
  minWidth?: number;
  phoneSvg?: string;
};

/** A Post's Slide deck as its player takes it: where each slide and the download PDF are served. */
export type SlideDeckSource = {
  width: number;
  height: number;
  slides: { src: string; thumb: string; title: string; text: string }[];
  /** The download PDF, and its size as a Reader reads it, e.g. `1.6 MB`. */
  pdf: { src: string; size: string };
};

/**
 * Code blocks colour each token with `var(--shiki-token-*)`, so globals.css
 * maps them onto the theme's code tokens.
 */
const codeTheme = createCssVariablesTheme();

/**
 * Compiles an MDX body, GitHub-flavoured (tables and the rest, remark-gfm per ADR-0003); every heading gets a stable id from its text (rehype-slug, per ADR-0003)
 * and fenced code with a language is highlighted (Shiki). `images` maps each image reference
 * the body writes, `./diagram.png`, to where it is served and its size; `deck` is the Post's
 * Slide deck, which `<SlideDeck />` plays.
 */
export async function compileMdx(
  source: string,
  images: Record<string, BodyImageSource> = {},
  deck?: SlideDeckSource,
): Promise<CompiledMdx> {
  const headings: Heading[] = [];
  const collectHeadings = () => (tree: Root) => {
    for (const node of tree.children) {
      if (node.type === "element" && node.tagName === "h2" && typeof node.properties.id === "string") {
        headings.push({ id: node.properties.id, label: toString(node) });
      }
    }
  };
  const resolveImages = () => (tree: Root) => {
    const visit = (node: Root | RootContent) => {
      if (node.type === "element" && node.tagName === "img") setImage(node);
      if ("children" in node) node.children.forEach(visit);
    };
    let illustrations = 0;
    const setImage = (img: Element) => {
      const image = images[String(img.properties.src)];
      if (image) Object.assign(img.properties, image);
      // Numbered per body, so the ids inside each inlined Illustration stay unique on the page.
      if (image?.svg) img.properties.illustrationId = `illustration-${++illustrations}`;
    };
    visit(tree);
  };
  const { default: Content } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm, remarkMermaid, [remarkSlideDeck, deck]],
    rehypePlugins: [
      rehypeSlug,
      collectHeadings,
      resolveImages,
      // Load each language the first time a block uses it, not every bundled one up front.
      [rehypeShiki, { theme: codeTheme, langs: [], lazy: true, fallbackLanguage: "text" }],
    ],
  });
  return { Body: () => <Content components={mdxComponents} />, headings };
}

/**
 * Turns each ```mermaid block into `<Mermaid chart="…" id="mermaid-N" />`, so the
 * diagram renders through the component map instead of as highlighted code.
 */
const remarkMermaid = () => (tree: MdNode) => {
  mermaidBlocks(tree).forEach((block, index) => {
    const attribute = (name: string, value: string) => ({ type: "mdxJsxAttribute", name, value });
    const chart = block.value ?? "";
    delete block.lang;
    delete block.value;
    Object.assign(block, {
      type: "mdxJsxFlowElement",
      name: "Mermaid",
      attributes: [attribute("chart", chart), attribute("id", `mermaid-${index + 1}`)],
      children: [],
    });
  });
};

/** Hands each `<SlideDeck />` the Post's deck, as `deck="<JSON>"`, since a body names it without props. */
const remarkSlideDeck = (deck: SlideDeckSource | undefined) => (tree: MdNode) => {
  if (!deck) return;
  for (const node of mdNodes(tree)) {
    if (node.type === "mdxJsxFlowElement" && node.name === "SlideDeck") {
      node.attributes = [{ type: "mdxJsxAttribute", name: "deck", value: JSON.stringify(deck) }];
    }
  }
};
