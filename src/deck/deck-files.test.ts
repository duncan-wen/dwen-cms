import { readFile } from "node:fs/promises";
import path from "node:path";
import { load } from "js-yaml";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { deckFiles } from "./deck-files";
import { readPdfSlides } from "./pdf-slides";

const flatePdf = () => readFile(path.join(import.meta.dirname, "fixtures", "flate.pdf"));

describe("converting a NotebookLM PDF into a Slide deck's files", () => {
  it("writes each slide and its thumbnail as WebP, a download PDF and deck.yml, and nothing else", async () => {
    const files = await deckFiles(await flatePdf());

    expect([...files.keys()].sort()).toEqual([
      "01-thumb.webp",
      "01.webp",
      "02-thumb.webp",
      "02.webp",
      "deck.pdf",
      "deck.yml",
    ]);
  });

  it("keeps each slide at its size and makes each thumbnail 320px wide", async () => {
    const files = await deckFiles(await flatePdf());

    const slide = await sharp(files.get("01.webp")).metadata();
    const thumb = await sharp(files.get("02-thumb.webp")).metadata();

    expect(slide).toMatchObject({ format: "webp", width: 6, height: 5 });
    expect(thumb).toMatchObject({ format: "webp", width: 320 });
  });

  it("rebuilds the download PDF from JPEGs, one page per slide", async () => {
    const files = await deckFiles(await flatePdf());

    const pages = readPdfSlides(files.get("deck.pdf") as Uint8Array);

    expect(pages.map(({ format, width, height }) => ({ format, width, height }))).toEqual([
      { format: "jpeg", width: 6, height: 5 },
      { format: "jpeg", width: 6, height: 5 },
    ]);
  });

  it("turns a grey slide into an RGB JPEG in the download PDF, as the PDF declares it", async () => {
    const files = await deckFiles(await readFile(path.join(import.meta.dirname, "fixtures", "grey.pdf")));
    const pdf = files.get("deck.pdf") as Uint8Array;

    const [page] = readPdfSlides(pdf);
    const jpeg = page.format === "jpeg" ? await sharp(page.data).metadata() : undefined;

    expect(jpeg?.channels).toBe(3);
    expect(Buffer.from(pdf).toString("latin1")).toMatch(/\/ColorSpace \/DeviceRGB\b/);
  });

  it("leaves deck.yml the slide size and an empty title and text per slide, for the Writing Agent to fill", async () => {
    const files = await deckFiles(await flatePdf());

    expect(load(String(files.get("deck.yml")))).toEqual({
      width: 6,
      height: 5,
      slides: [
        { title: "", text: "" },
        { title: "", text: "" },
      ],
    });
  });
});
