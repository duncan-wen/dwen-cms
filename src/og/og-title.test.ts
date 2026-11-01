import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import type { Post } from "@/content/content";
import { OgTitle, titleGlyphs } from "./og-title";

const post = (titleLines: string[] | undefined): Pick<Post, "title" | "promo"> => ({
  title: "讓 AI 幫部落格畫封面：程式畫結構，Fooocus 畫意境",
  promo: { template: "contour", titleLines, points: ["要點"] },
});

describe("OgTitle", () => {
  test("sets each of the Post's title lines on its own line that never wraps", () => {
    const html = renderToStaticMarkup(
      createElement(OgTitle, { post: post(["讓 AI 幫部落格畫封面：", "程式畫結構，Fooocus 畫意境"]), width: 960 }),
    );

    const lines = [...html.matchAll(/<div style="white-space:nowrap">([^<]*)<\/div>/g)].map((m) => m[1]);
    expect(lines).toEqual(["讓 AI 幫部落格畫封面：", "程式畫結構，Fooocus 畫意境"]);
  });

  test("sets the title as one wrapping block when the Post gives no title lines", () => {
    const html = renderToStaticMarkup(createElement(OgTitle, { post: post(undefined), width: 960 }));

    expect(html).not.toContain("nowrap");
    expect(html).toMatch(/^<div style="[^"]*">讓 AI 幫部落格畫封面：程式畫結構，Fooocus 畫意境<\/div>$/);
  });
});

describe("titleGlyphs", () => {
  test("is the title lines joined when the Post gives them, else the title", () => {
    expect(titleGlyphs(post(["讓 AI 幫部落格畫封面：", "程式畫結構"]))).toBe("讓 AI 幫部落格畫封面：程式畫結構");
    expect(titleGlyphs(post(undefined))).toBe("讓 AI 幫部落格畫封面：程式畫結構，Fooocus 畫意境");
  });
});
