import { describe, expect, test } from "vitest";
import { titleFontSize } from "./title-size";

describe("titleFontSize", () => {
  test("keeps the base size when the longest line fits the width", () => {
    // 10 full-width glyphs at 64px (with 0.02em tracking) are about 653px wide.
    expect(titleFontSize(["為什麼這個網站的文章", "寫在 git 裡"], 960, 64)).toBe(64);
  });

  test("shrinks so the longest line fits the width", () => {
    // 20 full-width glyphs at 64px are about 1306px wide, so 960px takes about 47px.
    expect(titleFontSize(["一二三四五六七八九十一二三四五六七八九十", "短"], 960, 64)).toBe(47);
  });

  test("counts Latin letters and spaces as narrower than full-width glyphs", () => {
    // 16 full-width glyphs (1045px) shrink; 16 of them plus 16 Latin letters would shrink more.
    const cjk = titleFontSize(["一二三四五六七八九十一二三四五六"], 960, 64);
    const mixed = titleFontSize(["一二三四五六七八九十一二三四五六abcdefghijklmnop"], 960, 64);
    expect(cjk).toBe(58);
    expect(mixed).toBeLessThan(cjk);
    expect(mixed).toBeGreaterThan(Math.floor((960 / (32 * 64 * 1.02)) * 64));
  });
});
