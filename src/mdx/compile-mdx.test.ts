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

  test("gives a body with no h2 an empty table of contents, ignoring deeper headings", async () => {
    const { headings } = await compileMdx("段落\n\n### 第三層標題");

    expect(headings).toEqual([]);
  });
});
