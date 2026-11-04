/**
 * The parts of a Markdown (mdast) syntax tree node that the content check and
 * compileMdx read and write: enough for images, links and ```mermaid blocks.
 */
export type MdNode = {
  type: string;
  /** A JSX element's tag name. */
  name?: string | null;
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

/** The body's ```mermaid blocks, in document order. */
export function mermaidBlocks(tree: MdNode): MdNode[] {
  return mdNodes(tree).filter((node) => node.type === "code" && node.lang === "mermaid");
}
