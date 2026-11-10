/**
 * Writes the fixture PDFs pdf-slides.test.ts reads, built the two ways a slide deck's PDF holds
 * its slides. Run it only to change them: `pnpm tsx src/deck/fixtures/make-fixtures.ts`.
 *
 * - `flate.pdf`: what NotebookLM writes, each page one RGB image compressed with Flate after PNG
 *   row filters (`/Predictor 15`), with a soft mask, an indirect `/Length`, indirect
 *   `/DecodeParms` and `/Resources`, and a nested page tree. Every row filter (0–4) is used.
 *   Page 1's pixel at (x, y) is [x·40, y·60, 100], page 2's [200, x·30, y·50]; both 6×5.
 * - `dct.pdf`: each page one JPEG (`/DCTDecode`), 16×8, solid red then solid blue.
 *
 * It writes PDFs on its own rather than through pdf-slides.ts, so the reader is checked against
 * an independent writer.
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { deflateSync } from "node:zlib";
import sharp from "sharp";

type PdfObject = { dict: string; stream?: Buffer };

/** A PDF file holding `objects`, numbered from 1, with `/Root` the first. */
function pdfFile(objects: PdfObject[]): Buffer {
  const parts: Buffer[] = [Buffer.from("%PDF-1.7\n%\xe2\xe3\xcf\xd3\n", "latin1")];
  const offsets: number[] = [];
  const size = () => parts.reduce((total, part) => total + part.length, 0);
  objects.forEach(({ dict, stream }, index) => {
    offsets.push(size());
    parts.push(Buffer.from(`${index + 1} 0 obj\n${dict}\n`, "latin1"));
    if (stream) parts.push(Buffer.from("stream\r\n", "latin1"), stream, Buffer.from("\nendstream\n", "latin1"));
    parts.push(Buffer.from("endobj\n", "latin1"));
  });
  const xref = size();
  const entries = offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  parts.push(
    Buffer.from(
      `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${entries}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`,
      "latin1",
    ),
  );
  return Buffer.concat(parts);
}

/** PNG-filters `pixels` (rows of width·bpp bytes), row y with filter type y % 5. */
function pngFilter(pixels: Uint8Array, width: number, height: number, bpp: number): Buffer {
  const stride = width * bpp;
  const out = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    const type = y % 5;
    out[y * (stride + 1)] = type;
    for (let x = 0; x < stride; x++) {
      const at = (dx: number, dy: number) => (x - dx >= 0 && y - dy >= 0 ? pixels[(y - dy) * stride + x - dx] : 0);
      const [a, b, c] = [at(bpp, 0), at(0, 1), at(bpp, 1)];
      const p = a + b - c;
      const paeth =
        Math.abs(p - a) <= Math.abs(p - b) && Math.abs(p - a) <= Math.abs(p - c)
          ? a
          : Math.abs(p - b) <= Math.abs(p - c)
            ? b
            : c;
      const predicted = [0, a, b, (a + b) >> 1, paeth][type];
      out[y * (stride + 1) + 1 + x] = (pixels[y * stride + x] - predicted) & 0xff;
    }
  }
  return out;
}

function rgb(width: number, height: number, pixel: (x: number, y: number) => number[]): Uint8Array {
  const pixels = new Uint8Array(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) pixels.set(pixel(x, y), (y * width + x) * 3);
  }
  return pixels;
}

const here = import.meta.dirname;

function writeFlate() {
  const [width, height] = [6, 5];
  const parms = `/Predictor 15 /Colors 3 /BitsPerComponent 8 /Columns ${width}`;
  const page1 = deflateSync(
    pngFilter(
      rgb(width, height, (x, y) => [x * 40, y * 60, 100]),
      width,
      height,
      3,
    ),
  );
  const page2 = deflateSync(
    pngFilter(
      rgb(width, height, (x, y) => [200, x * 30, y * 50]),
      width,
      height,
      3,
    ),
  );
  const mask = deflateSync(Buffer.alloc(width * height, 255));
  const image = `/Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode`;
  const page = (resources: string, contents: number) =>
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources ${resources} /Contents ${contents} 0 R >>`;
  const draw = Buffer.from(`q ${width} 0 0 ${height} 0 0 cm /X1 Do Q`, "latin1");
  writeFileSync(
    path.join(here, "flate.pdf"),
    pdfFile([
      /* 1 */ { dict: "<< /Type /Catalog /Pages 2 0 R >>" },
      /* 2 */ { dict: "<< /Type /Pages /Kids [3 0 R 11 0 R] /Count 2 >>" },
      /* 3 */ { dict: page("4 0 R", 5) },
      /* 4 */ { dict: "<< /ProcSet [/PDF /ImageC] /XObject << /X1 6 0 R >> >>" },
      /* 5 */ { dict: `<< /Length ${draw.length} >>`, stream: draw },
      /* 6 */ { dict: `<< ${image} /SMask 8 0 R /DecodeParms << ${parms} >> /Length 7 0 R >>`, stream: page1 },
      /* 7 */ { dict: String(page1.length) },
      /* 8 */ {
        dict: `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode /Length ${mask.length} >>`,
        stream: mask,
      },
      /* 9 */ { dict: `<< ${image} /DecodeParms 10 0 R /Length ${page2.length} >>`, stream: page2 },
      /* 10 */ { dict: `<< ${parms} >>` },
      /* 11 */ { dict: "<< /Type /Pages /Parent 2 0 R /Kids [12 0 R] /Count 1 >>" },
      /* 12 */ { dict: page("<< /XObject << /X1 9 0 R >> >>", 5).replace("/Parent 2 0 R", "/Parent 11 0 R") },
    ]),
  );
}

async function writeDct() {
  const [width, height] = [16, 8];
  const jpeg = (colour: { r: number; g: number; b: number }) =>
    sharp({ create: { width, height, channels: 3, background: colour } })
      .jpeg({ quality: 95 })
      .toBuffer();
  const [red, blue] = [await jpeg({ r: 255, g: 0, b: 0 }), await jpeg({ r: 0, g: 0, b: 255 })];
  const image = (filter: string, data: Buffer) => ({
    dict: `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter ${filter} /Length ${data.length} >>`,
    stream: data,
  });
  const page = (xobject: number) =>
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Im0 ${xobject} 0 R >> >> >>`;
  writeFileSync(
    path.join(here, "dct.pdf"),
    pdfFile([
      /* 1 */ { dict: "<< /Type /Catalog /Pages 2 0 R >>" },
      /* 2 */ { dict: "<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>" },
      /* 3 */ { dict: page(5) },
      /* 4 */ { dict: page(6) },
      /* 5 */ image("/DCTDecode", red),
      /* 6 */ image("[/DCTDecode]", blue),
    ]),
  );
}

writeFlate();
await writeDct();
