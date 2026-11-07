import { describe, expect, it } from "vitest";
import { linkedInHashtags, littleText } from "./linkedin";

describe("littleText", () => {
  it("escapes the characters LinkedIn would read as markup", () => {
    expect(littleText("用「一把刀」(GIL) 想 a_b @someone")).toBe("用「一把刀」\\(GIL\\) 想 a\\_b \\@someone");
  });

  it("writes each hashtag in the form LinkedIn links", () => {
    expect(littleText("#Python 和 #程式設計")).toBe("{hashtag|\\#|Python} 和 {hashtag|\\#|程式設計}");
  });

  it("escapes a hashtag's own reserved characters", () => {
    expect(littleText("#race_condition")).toBe("{hashtag|\\#|race\\_condition}");
  });
});

describe("linkedInHashtags", () => {
  it("lists each hashtag in the text, in order", () => {
    expect(linkedInHashtags("介紹 #Python\n\n#asyncio #程式設計")).toEqual(["#Python", "#asyncio", "#程式設計"]);
  });

  it("finds none in a text without one", () => {
    expect(linkedInHashtags("第 #1 名")).toEqual([]);
  });
});
