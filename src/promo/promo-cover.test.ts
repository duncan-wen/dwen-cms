import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PromoCover } from "./promo-cover";

describe("PromoCover", () => {
  it("fills the image with the Post's cover image when it has one", () => {
    const image = { bytes: new Uint8Array([1, 2, 3]), type: "image/jpeg" };
    const html = renderToStaticMarkup(createElement(PromoCover, { slug: "a-post", image }));
    expect(html).toContain('src="data:image/jpeg;base64,AQID"');
    expect(html).toContain('class="cover"');
    expect(html).not.toContain("<path");
  });

  it("draws the generated cover when the Post has no cover image", () => {
    const html = renderToStaticMarkup(createElement(PromoCover, { slug: "a-post", image: undefined }));
    expect(html).toContain("<svg");
    expect(html).toContain("<path");
    expect(html).not.toContain("<img");
  });
});
