import { describe, expect, it } from "vitest";
import { takeAt } from "./at-times";

describe("takeAt", () => {
  it("reads ?at= as seconds, smallest first, each once", () => {
    expect(takeAt("/posts/x?at=5,2,9.5,2")).toEqual({ shotPath: "/posts/x", atTimes: [2, 5, 9.5] });
  });

  it("leaves a path with no ?at= as it is", () => {
    expect(takeAt("/posts/x?open=所有頁面")).toEqual({ shotPath: "/posts/x?open=所有頁面", atTimes: [] });
  });

  it("keeps the path's other options, wherever ?at= sits among them", () => {
    expect(takeAt("/posts/x?open=放大圖表&at=3&scroll=100").shotPath).toBe("/posts/x?open=放大圖表&scroll=100");
    expect(takeAt("/?at=1.5&scroll=100")).toEqual({ shotPath: "/?scroll=100", atTimes: [1.5] });
  });

  it.each(["", "two", "-1", "2,,5", "1e999"])("fails on ?at=%s, naming the path", (value) => {
    expect(() => takeAt(`/posts/x?at=${value}`)).toThrow("/posts/x");
  });
});
