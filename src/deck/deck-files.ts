import sharp from "sharp";
import { DECK_PDF, DECK_TEXT, slideFile, THUMB_WIDTH, thumbFile } from "./deck-names";
import { jpegPdf, readPdfSlides, type SlideImage } from "./pdf-slides";

/** WebP and JPEG quality for the slides and the download PDF. */
const QUALITY = 82;

/**
 * A Slide deck's files, by name in its `deck/` folder, made from a NotebookLM PDF: each
 * slide as WebP, its 320px thumbnail, a download PDF rebuilt from JPEGs, and `deck.yml` with
 * the slide size and an empty title and text per slide. The original PDF is not among them.
 */
export async function deckFiles(pdf: Uint8Array): Promise<Map<string, Uint8Array | string>> {
  const slides = readPdfSlides(pdf);
  const files = new Map<string, Uint8Array | string>();
  const jpegs = [];
  for (const [index, slide] of slides.entries()) {
    const image = () => decoded(slide);
    files.set(slideFile(index + 1), await image().webp({ quality: QUALITY }).toBuffer());
    files.set(thumbFile(index + 1), await image().resize(THUMB_WIDTH).webp({ quality: 70 }).toBuffer());
    const data = await image().jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer();
    jpegs.push({ format: "jpeg" as const, width: slide.width, height: slide.height, data });
  }
  files.set(DECK_PDF, jpegPdf(jpegs));
  const { width, height } = slides[0];
  files.set(
    DECK_TEXT,
    [
      "# Each slide's title and text, in order: its image's description and 「本頁文字」.",
      `width: ${width}`,
      `height: ${height}`,
      "slides:",
      ...slides.map((_, index) => `  - title: "" # ${slideFile(index + 1)}\n    text: ""`),
      "",
    ].join("\n"),
  );
  return files;
}

function decoded(slide: SlideImage) {
  if (slide.format === "jpeg") return sharp(slide.data);
  return sharp(slide.pixels, { raw: { width: slide.width, height: slide.height, channels: slide.channels } });
}
