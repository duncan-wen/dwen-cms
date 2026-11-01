import { describe, expect, test } from "vitest";
import { mermaidSvg } from "./mermaid-svg";
import { DRAWN_DIAGRAM_TYPES, parseMermaid } from "./parse-mermaid";

describe("the diagram types the content check accepts", () => {
  test.each([
    ["graph TD\n  A --> B", "flowchart-v2"],
    ["flowchart LR\n  A --> B", "flowchart-v2"],
    ["stateDiagram-v2\n  [*] --> A", "stateDiagram"],
    ["sequenceDiagram\n  A->>B: hi", "sequence"],
    ["classDiagram\n  A <|-- B", "classDiagram"],
    ["erDiagram\n  A ||--o{ B : has", "er"],
    ["xychart-beta\n  x-axis [a, b]\n  bar [1, 2]", "xychart"],
  ])("%j parses as a drawn type (%s) and draws", async (source, type) => {
    expect(await parseMermaid(source)).toBe(type);
    expect(DRAWN_DIAGRAM_TYPES.has(type)).toBe(true);
    expect(mermaidSvg(source, "d")).toMatch(/^<svg/);
  });

  test("leave out a type Mermaid parses but the site can't draw", async () => {
    const type = await parseMermaid('pie\n  "a" : 1');

    expect(DRAWN_DIAGRAM_TYPES.has(type)).toBe(false);
    expect(() => mermaidSvg('pie\n  "a" : 1', "d")).toThrow();
  });
});

test("a loop back to an earlier node keeps the flow's first node on top", () => {
  const svg = mermaidSvg("flowchart TD\n  a[撰寫] --> b{審閱}\n  b --> c[發布]\n  b --> a", "d");

  /** The top edge of each node's shape, by node id. */
  const top = (id: string) => {
    const node = svg.match(new RegExp(`data-id="${id}"[^>]*>\\s*<(rect|polygon)([^>]*)>`))!;
    const ys = node[1] === "rect"
      ? [Number(node[2].match(/ y="([\d.]+)"/)![1])]
      : [...node[2].matchAll(/[\d.]+,([\d.]+)/g)].map((m) => Number(m[1]));
    return Math.min(...ys);
  };
  expect(top("a")).toBeLessThan(top("b"));
  expect(top("b")).toBeLessThan(top("c"));
});

test("prefixes the SVG's ids and their references, so two diagrams on a page don't clash", () => {
  const svg = mermaidSvg("flowchart LR\n  A --> B", "mermaid-2");

  const ids = [...svg.matchAll(/\sid="([^"]*)"/g)].map((m) => m[1]);
  const refs = [...svg.matchAll(/url\(#([^)]*)\)/g)].map((m) => m[1]);
  expect(ids.length).toBeGreaterThan(0);
  expect(refs.length).toBeGreaterThan(0);
  for (const id of [...ids, ...refs]) expect(id).toMatch(/^mermaid-2-/);
  for (const ref of refs) expect(ids).toContain(ref);
});
