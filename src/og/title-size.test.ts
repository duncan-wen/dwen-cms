import { describe, expect, test } from "vitest";
import { titleFontSize } from "./title-size";

describe("titleFontSize", () => {
  test("keeps the base size when the longest line fits the width", () => {
    // 10 full-width glyphs at 64px (with 0.02em tracking) are about 653px, within 95% of 960px.
    expect(titleFontSize(["為什麼這個網站的文章", "寫在 git 裡"], 960, 64)).toBe(64);
  });

  test("shrinks so the longest line fits the width, with a margin", () => {
    // 20 full-width glyphs are 20.4em; 95% of 960px is 912px, so about 44px.
    expect(titleFontSize(["一二三四五六七八九十一二三四五六七八九十", "短"], 960, 64)).toBe(44);
  });

  test("counts lowercase Latin letters as narrower than full-width glyphs", () => {
    // 16 full-width glyphs are 16.32em (55px); 16 lowercase letters add 9.92em (26.24em: 34px),
    // where counting them full-width (32.64em) would give 27px.
    expect(titleFontSize(["一二三四五六七八九十一二三四五六"], 960, 64)).toBe(55);
    expect(titleFontSize(["一二三四五六七八九十一二三四五六abcdefghijklmnop"], 960, 64)).toBe(34);
  });

  test("counts capitals wider than lowercase letters, and dashes as full-width", () => {
    // 30 capitals are 23.1em (39px) where 30 lowercase letters are 18.6em (49px);
    // 20 em dashes are 20.4em, like full-width glyphs (44px).
    expect(titleFontSize(["A".repeat(30)], 960, 64)).toBe(39);
    expect(titleFontSize(["a".repeat(30)], 960, 64)).toBe(49);
    expect(titleFontSize(["—".repeat(20)], 960, 64)).toBe(44);
  });
});
