import { describe, expect, it } from "vitest";
import { isValidThreadsTag, threadsTopicTag } from "./threads";

describe("threadsTopicTag", () => {
  it("takes a lone #tag on the last line as the topic, off the text", () => {
    expect(threadsTopicTag("一段介紹。\n\n#Python\n")).toEqual({
      text: "一段介紹。",
      topicTag: "Python",
      otherTags: [],
    });
  });

  it("finds no topic when the last line isn't a lone tag", () => {
    expect(threadsTopicTag("一段介紹 #Python")).toEqual({
      text: "一段介紹 #Python",
      topicTag: undefined,
      otherTags: ["#Python"],
    });
  });

  it("lists tags left in the text", () => {
    expect(threadsTopicTag("介紹 #Go 和其他。\n#AI").otherTags).toEqual(["#Go"]);
  });
});

describe("isValidThreadsTag", () => {
  it("takes 1–50 characters with no . or &", () => {
    expect(isValidThreadsTag("AI")).toBe(true);
    expect(isValidThreadsTag("字".repeat(50))).toBe(true);
    expect(isValidThreadsTag("字".repeat(51))).toBe(false);
    expect(isValidThreadsTag("Next.js")).toBe(false);
    expect(isValidThreadsTag("R&D")).toBe(false);
  });
});
