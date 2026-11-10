import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { jpegPdf, readPdfSlides, type SlideImage } from "./pdf-slides";

// The fixtures, and how their pixels are laid out, are described in fixtures/make-fixtures.ts.
const fixture = (name: string) => readFile(path.join(import.meta.dirname, "fixtures", name));

/** A raw slide's pixel at (x, y) as [r, g, b]. */
function pixel(slide: SlideImage, x: number, y: number): number[] {
  if (slide.format !== "raw") throw new Error("not a raw slide");
  const at = (y * slide.width + x) * 3;
  return [...slide.pixels.subarray(at, at + 3)];
}

describe("reading a slide deck's PDF", () => {
  it("reads NotebookLM's Flate images with PNG predictors as pixels, one slide per page in order", async () => {
    const slides = readPdfSlides(await fixture("flate.pdf"));

    expect(slides.map(({ format, width, height }) => ({ format, width, height }))).toEqual([
      { format: "raw", width: 6, height: 5 },
      { format: "raw", width: 6, height: 5 },
    ]);
    // Every row uses a different PNG filter, so each row is checked.
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 6; x++) {
        expect(pixel(slides[0], x, y)).toEqual([x * 40, y * 60, 100]);
        expect(pixel(slides[1], x, y)).toEqual([200, x * 30, y * 50]);
      }
    }
  });

  it("reads DCT images as the JPEG files they are", async () => {
    const slides = readPdfSlides(await fixture("dct.pdf"));

    expect(slides.map(({ format, width, height }) => ({ format, width, height }))).toEqual([
      { format: "jpeg", width: 16, height: 8 },
      { format: "jpeg", width: 16, height: 8 },
    ]);
    const colours = await Promise.all(
      slides.map(async (slide) => {
        if (slide.format !== "jpeg") throw new Error("not a JPEG slide");
        const { dominant } = await sharp(slide.data).stats();
        return [dominant.r, dominant.g, dominant.b];
      }),
    );
    expect(colours[0][0]).toBeGreaterThan(240);
    expect(colours[0][2]).toBeLessThan(20);
    expect(colours[1][2]).toBeGreaterThan(240);
    expect(colours[1][0]).toBeLessThan(20);
  });

  it("refuses a PDF with no slide images", () => {
    expect(() => readPdfSlides(new TextEncoder().encode("%PDF-1.4\nnot really\n%%EOF\n"))).toThrow(/page/);
  });
});

describe("the download PDF", () => {
  it("holds one page per JPEG, read back as the same JPEGs", async () => {
    const original = readPdfSlides(await fixture("dct.pdf"));
    const jpegs = original.map((slide) => {
      if (slide.format !== "jpeg") throw new Error("not a JPEG slide");
      return slide;
    });

    const rebuilt = readPdfSlides(jpegPdf(jpegs));

    expect(rebuilt).toEqual(original);
  });
});
