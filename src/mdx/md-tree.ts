/**
 * The parts of a Markdown (mdast) syntax tree node that the content check and
 * compileMdx read and write: enough for images, links, ```mermaid blocks and `<SlideDeck />`.
 */
export type MdNode = {
  type: string;
  /** A JSX element's tag name. */
  name?: string | null;
  /** A JSX element's attributes. */
  attributes?: { type: string; name: string; value: string }[];
  url?: unknown;
  lang?: string | null;
  value?: string;
  position?: { start: { line: number } };
  children?: MdNode[];
};

/** Every node of the tree, the root first, in document order. */
export function mdNodes(tree: MdNode): MdNode[] {
  return [tree, ...(tree.children ?? []).flatMap(mdNodes)];
}

/**
 * Whether a node is a `<SlideDeck />` on a line of its own, the only place a body may put one:
 * the content check counts these and compileMdx hands each one the deck.
 */
export function isSlideDeck({ type, name }: MdNode): boolean {
  return type === "mdxJsxFlowElement" && name === "SlideDeck";
}

/** Whether a node is a `<SlideDeck />` inside a line of text, which the content check refuses. */
export function isInlineSlideDeck({ type, name }: MdNode): boolean {
  return type === "mdxJsxTextElement" && name === "SlideDeck";
}

/** The body's ```mermaid blocks, in document order. */
export function mermaidBlocks(tree: MdNode): MdNode[] {
  return mdNodes(tree).filter((node) => node.type === "code" && node.lang === "mermaid");
}

/** Whether a node is a `<Demo />` on a line of its own: the content check checks each one, and the body draws it. */
export function isDemo({ type, name }: MdNode): boolean {
  return type === "mdxJsxFlowElement" && name === "Demo";
}

/** Whether a node is a `<Demo />` inside a line of text, which the content check refuses. */
export function isInlineDemo({ type, name }: MdNode): boolean {
  return type === "mdxJsxTextElement" && name === "Demo";
}
