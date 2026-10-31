import { describe, expect, it } from "vitest";
import { siteUrl } from "./site-url";

describe("siteUrl", () => {
  it("uses SITE_URL when set", () => {
    expect(siteUrl({ SITE_URL: "https://dwen.example", VERCEL_URL: "x.vercel.app" }).href).toBe(
      "https://dwen.example/",
    );
  });

  it("falls back to the Vercel deployment URL on previews", () => {
    expect(siteUrl({ VERCEL_URL: "dwen-cms-git-x.vercel.app" }).href).toBe(
      "https://dwen-cms-git-x.vercel.app/",
    );
  });

  it("falls back to localhost in development", () => {
    expect(siteUrl({}).href).toBe("http://localhost:3000/");
  });

  it("ignores blank values", () => {
    expect(siteUrl({ SITE_URL: " ", VERCEL_URL: "" }).href).toBe("http://localhost:3000/");
  });
});
