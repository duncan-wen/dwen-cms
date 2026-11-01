import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { compileMdx } from "./compile-mdx";

describe("compileMdx", () => {
  test("lists the h2 headings as the table of contents, in order, with their ids and labels", async () => {
    const { headings } = await compileMdx("段落\n\n## 為什麼\n\n文字\n\n## Shape of a Post\n\n文字");

    expect(headings).toEqual([
      { id: "為什麼", label: "為什麼" },
      { id: "shape-of-a-post", label: "Shape of a Post" },
    ]);
  });

  test("renders each h2 with the id its table-of-contents entry links to", async () => {
    const { Body, headings } = await compileMdx("## 清單\n\n## 清單");

    expect(headings.map((h) => h.id)).toEqual(["清單", "清單-1"]);
    const html = renderToStaticMarkup(createElement(Body));
    expect(html).toBe('<h2 id="清單">清單</h2>\n<h2 id="清單-1">清單</h2>');
  });

  test("colours a code block's tokens through CSS variables, not a fixed theme", async () => {
    const { Body } = await compileMdx("```ts\nconst greeting = \"hi\";\n```");

    const html = renderToStaticMarkup(createElement(Body));
    expect(html).toContain('<span style="color:var(--shiki-token-keyword)">const</span>');
    expect(html).toContain("var(--shiki-token-string");
    expect(html).not.toMatch(/color:#/);
  });

  test("renders a Callout from the component map as an aside around its content", async () => {
    const { Body } = await compileMdx('<Callout title="注意">\n\n先備份資料。\n\n</Callout>');

    const html = renderToStaticMarkup(createElement(Body));
    expect(html).toMatch(/^<aside[^>]*>.*注意.*<p>先備份資料。<\/p>.*<\/aside>$/s);
  });

  test("renders a body image at its URL and dimensions, optimised", async () => {
    const { Body } = await compileMdx("![一張圖](./diagram.png)", {
      "./diagram.png": { src: "/posts/a-post/diagram.png", width: 1200, height: 800 },
    });

    const html = renderToStaticMarkup(createElement(Body));
    expect(html).toContain('alt="一張圖"');
    expect(html).toContain('width="1200"');
    expect(html).toContain('height="800"');
    expect(html).toContain("/_next/image?url=%2Fposts%2Fa-post%2Fdiagram.png");
  });

  test("gives a body with no h2 an empty table of contents, ignoring deeper headings", async () => {
    const { headings } = await compileMdx("段落\n\n### 第三層標題");

    expect(headings).toEqual([]);
  });
});
