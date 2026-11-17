import { describe, expect, it } from "vitest";
import { parseAtTimes } from "./at-times";

describe("parseAtTimes", () => {
  it("reads a comma-separated list of seconds, in order", () => {
    expect(parseAtTimes("/posts/x", "5,2,9.5")).toEqual([2, 5, 9.5]);
  });

  it("is empty when the path has no ?at=", () => {
    expect(parseAtTimes("/posts/x", null)).toEqual([]);
  });

  it.each(["", "two", "-1", "2,,5", "1e999"])("fails on %j, naming the path", (value) => {
    expect(() => parseAtTimes("/posts/x", value)).toThrow("/posts/x");
  });
});
