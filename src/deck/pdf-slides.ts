import { inflateSync } from "node:zlib";

/**
 * One slide of a Slide deck's PDF: its page's image, either as raw pixels (rows of `width`
 * pixels, `channels` bytes each: 3 for RGB, 1 for grey) or, for a JPEG page, the JPEG file.
 */
export type SlideImage =
  | { format: "raw"; width: number; height: number; channels: 1 | 3; pixels: Uint8Array }
  | { format: "jpeg"; width: number; height: number; data: Uint8Array };

/** A JPEG slide, as the download PDF holds it. */
export type JpegSlide = Extract<SlideImage, { format: "jpeg" }>;

/**
 * Reads the slides of a PDF whose every page is one full-page image, as NotebookLM writes a
 * Slide deck: Flate-compressed (with or without PNG predictors) or DCT (JPEG). A page's soft
 * mask is ignored, since slides are opaque. Throws, naming the page, on anything else.
 */
export function readPdfSlides(pdf: Uint8Array): SlideImage[] {
  const file = new PdfFile(pdf);
  const pages = file.pages();
  if (pages.length === 0) throw new Error("the PDF has no pages (or keeps them in object streams, which aren't read)");
  return pages.map(({ dict, resources }, index) => file.slide(dict, resources, index + 1));
}

/** A PDF of one page per JPEG slide, each image filling its page: the Slide deck's download copy. */
export function jpegPdf(slides: JpegSlide[]): Uint8Array {
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let length = 0;
  const push = (chunk: string | Uint8Array) => {
    const bytes = typeof chunk === "string" ? latin1Bytes(chunk) : chunk;
    chunks.push(bytes);
    length += bytes.length;
  };
  const object = (id: number, ...body: (string | Uint8Array)[]) => {
    offsets[id] = length;
    push(`${id} 0 obj\n`);
    body.forEach(push);
    push("\nendobj\n");
  };
  // Objects: 1 the catalog, 2 the page tree, then a page, its contents and its image per slide.
  const ids = slides.map((_, index) => ({ page: 3 + index * 3, contents: 4 + index * 3, image: 5 + index * 3 }));
  push("%PDF-1.4\n%\xe2\xe3\xcf\xd3\n");
  object(1, "<< /Type /Catalog /Pages 2 0 R >>");
  object(2, `<< /Type /Pages /Kids [${ids.map(({ page }) => `${page} 0 R`).join(" ")}] /Count ${slides.length} >>`);
  slides.forEach(({ width, height, data }, index) => {
    const { page, contents, image } = ids[index];
    const draw = `q ${width} 0 0 ${height} 0 0 cm /Slide Do Q`;
    object(
      page,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Contents ${contents} 0 R /Resources << /XObject << /Slide ${image} 0 R >> >> >>`,
    );
    object(contents, `<< /Length ${draw.length} >>\nstream\n${draw}\nendstream`);
    object(
      image,
      `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${data.length} >>\nstream\n`,
      data,
      "\nendstream",
    );
  });
  const xref = length;
  const size = 3 + slides.length * 3;
  push(`xref\n0 ${size}\n0000000000 65535 f \n`);
  for (let id = 1; id < size; id++) push(`${String(offsets[id]).padStart(10, "0")} 00000 n \n`);
  push(`trailer\n<< /Size ${size} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  const pdf = new Uint8Array(length);
  let at = 0;
  for (const chunk of chunks) {
    pdf.set(chunk, at);
    at += chunk.length;
  }
  return pdf;
}

function latin1Bytes(text: string): Uint8Array {
  return Uint8Array.from(text, (char) => char.charCodeAt(0));
}

/** A PDF value: a number, a name (`{ name }`), text, a reference (`{ ref }`), a list or a dictionary. */
type PdfValue = number | boolean | null | string | { name: string } | { ref: number } | PdfValue[] | PdfDict;
type PdfDict = { dict: Map<string, PdfValue> };
type PdfObject = { value: PdfValue; stream?: Uint8Array };

const isDict = (value: PdfValue | undefined): value is PdfDict =>
  typeof value === "object" && value !== null && "dict" in value;
const isName = (value: PdfValue | undefined): value is { name: string } =>
  typeof value === "object" && value !== null && "name" in value;

/** The objects of a PDF, found by scanning the file for `N G obj` rather than trusting its xref table. */
class PdfFile {
  private readonly objects = new Map<number, PdfObject>();
  private readonly text: string;

  constructor(pdf: Uint8Array) {
    // A plain view, so slides cut from it are plain Uint8Arrays whether or not `pdf` is a Buffer.
    const bytes = new Uint8Array(pdf.buffer, pdf.byteOffset, pdf.byteLength);
    // Latin-1 keeps one character per byte, so offsets in the text are offsets in the file.
    this.text = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
    const header = /(\d+)\s+\d+\s+obj\b/g;
    let match: RegExpExecArray | null;
    while ((match = header.exec(this.text))) {
      const parser = new Parser(this.text, match.index + match[0].length);
      const value = parser.value();
      const id = Number(match[1]);
      if (parser.keyword("stream") && isDict(value)) {
        const start = parser.streamStart();
        const end = start + this.streamLength(value);
        this.objects.set(id, { value, stream: bytes.subarray(start, end) });
        header.lastIndex = end;
      } else {
        this.objects.set(id, { value });
        header.lastIndex = parser.at;
      }
    }
  }

  /** Every page in reading order, each with the resources it has or inherits. */
  pages(): { dict: PdfDict; resources: PdfValue | undefined }[] {
    const catalog = [...this.objects.values()].find(({ value }) => this.name(value, "Type") === "Catalog");
    const pages: { dict: PdfDict; resources: PdfValue | undefined }[] = [];
    const visit = (node: PdfValue | undefined, inherited: PdfValue | undefined, depth: number) => {
      const dict = this.resolve(node);
      if (!isDict(dict) || depth > 64) return;
      const resources = dict.dict.get("Resources") ?? inherited;
      if (this.name(dict, "Type") === "Page") pages.push({ dict, resources });
      const kids = this.resolve(dict.dict.get("Kids"));
      if (Array.isArray(kids)) for (const kid of kids) visit(kid, resources, depth + 1);
    };
    if (catalog && isDict(catalog.value)) visit(catalog.value.dict.get("Pages"), undefined, 0);
    return pages;
  }

  /** Page `number`'s slide: the largest image it draws. */
  slide(page: PdfDict, resources: PdfValue | undefined, number: number): SlideImage {
    const xObjects = this.resolve(
      isDict(this.resolve(resources)) ? (this.resolve(resources) as PdfDict).dict.get("XObject") : undefined,
    );
    const images = (isDict(xObjects) ? [...xObjects.dict.values()] : [])
      .map((ref) => (typeof ref === "object" && ref !== null && "ref" in ref ? this.objects.get(ref.ref) : undefined))
      .filter(
        (object): object is Required<PdfObject> & { value: PdfDict } =>
          object?.stream !== undefined && this.name(object.value, "Subtype") === "Image",
      );
    if (images.length === 0)
      throw new Error(`page ${number} has no image; a Slide deck's PDF holds one image per page`);
    const size = (image: PdfDict) => this.number(image, "Width") * this.number(image, "Height");
    const { value: image, stream } = images.reduce((a, b) => (size(b.value) > size(a.value) ? b : a));
    const width = this.number(image, "Width");
    const height = this.number(image, "Height");
    const filters = [this.resolve(image.dict.get("Filter"))]
      .flat()
      .filter(isName)
      .map(({ name }) => name);
    const filter = filters.join(", ") || "no filter";
    if (filter === "DCTDecode") return { format: "jpeg", width, height, data: stream };
    if (filter !== "FlateDecode")
      throw new Error(`page ${number}'s image uses ${filter}, which can't be read; only FlateDecode and DCTDecode are`);
    const channels = this.channels(image.dict.get("ColorSpace"));
    if (channels === undefined || this.number(image, "BitsPerComponent") !== 8) {
      throw new Error(`page ${number}'s image isn't 8-bit RGB or grey, which can't be read`);
    }
    const parms = this.resolve([this.resolve(image.dict.get("DecodeParms"))].flat()[0]);
    const predictor = isDict(parms) ? this.number(parms, "Predictor", 1) : 1;
    const zlib = inflateSync(stream);
    const inflated = new Uint8Array(zlib.buffer, zlib.byteOffset, zlib.byteLength);
    if (predictor === 1) return { format: "raw", width, height, channels, pixels: inflated };
    if (predictor < 10) throw new Error(`page ${number}'s image uses TIFF predictor ${predictor}, which can't be read`);
    return {
      format: "raw",
      width,
      height,
      channels,
      pixels: pngUnfilter(inflated, width * channels, height, channels),
    };
  }

  private channels(space: PdfValue | undefined): 1 | 3 | undefined {
    const resolved = this.resolve(space);
    const name = isName(resolved)
      ? resolved.name
      : Array.isArray(resolved) && isName(resolved[0])
        ? resolved[0].name
        : undefined;
    if (name === "DeviceRGB" || name === "CalRGB") return 3;
    if (name === "DeviceGray" || name === "CalGray") return 1;
    if (name === "ICCBased" && Array.isArray(resolved)) {
      const profile = this.resolve(resolved[1]);
      const count = isDict(profile) ? this.number(profile, "N") : 0;
      return count === 3 ? 3 : count === 1 ? 1 : undefined;
    }
    return undefined;
  }

  /** A stream's `/Length`, which may refer to an object defined after the stream. */
  private streamLength(dict: PdfDict): number {
    const length = dict.dict.get("Length");
    if (typeof length === "number") return length;
    if (typeof length === "object" && length !== null && "ref" in length) {
      const known = this.objects.get(length.ref)?.value;
      if (typeof known === "number") return known;
      const later = new RegExp(`(?:^|\\s)${length.ref}\\s+\\d+\\s+obj\\s*(\\d+)\\s*endobj`).exec(this.text);
      if (later) return Number(later[1]);
    }
    throw new Error("a stream in the PDF has no readable /Length");
  }

  private resolve(value: PdfValue | undefined): PdfValue | undefined {
    for (let hops = 0; typeof value === "object" && value !== null && "ref" in value && hops < 32; hops++) {
      value = this.objects.get(value.ref)?.value;
    }
    return value;
  }

  private name(value: PdfValue | undefined, key: string): string | undefined {
    const entry = isDict(value) ? this.resolve(value.dict.get(key)) : undefined;
    return isName(entry) ? entry.name : undefined;
  }

  private number(dict: PdfDict, key: string, fallback = 0): number {
    const entry = this.resolve(dict.dict.get(key));
    return typeof entry === "number" ? entry : fallback;
  }
}

const WHITESPACE = /[\0\t\n\f\r ]/;
const DELIMITER = /[\0\t\n\f\r ()<>[\]{}/%]/;

/** Reads PDF values from `text`, starting at `at`. */
class Parser {
  constructor(
    private readonly text: string,
    public at: number,
  ) {}

  value(): PdfValue {
    this.skip();
    const { text } = this;
    if (text.startsWith("<<", this.at)) {
      this.at += 2;
      const dict = new Map<string, PdfValue>();
      while ((this.skip(), !text.startsWith(">>", this.at) && this.at < text.length)) {
        const key = this.value();
        dict.set(isName(key) ? key.name : String(key), this.value());
      }
      this.at += 2;
      return { dict };
    }
    const char = text[this.at];
    if (char === "[") {
      this.at++;
      const list: PdfValue[] = [];
      while ((this.skip(), text[this.at] !== "]" && this.at < text.length)) list.push(this.value());
      this.at++;
      return list;
    }
    if (char === "/") return { name: this.word(this.at + 1) };
    if (char === "(") return this.literalString();
    if (char === "<") {
      const end = text.indexOf(">", this.at);
      const hex = text.slice(this.at + 1, end).replace(/\s/g, "");
      this.at = end + 1;
      return (hex.match(/../g) ?? []).map((pair) => String.fromCharCode(parseInt(pair, 16))).join("");
    }
    const word = this.word(this.at);
    if (word === "true" || word === "false") return word === "true";
    if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(word)) return null;
    const number = Number(word);
    // `12 0 R` is a reference to object 12.
    const reference = /^\s+(\d+)\s+R(?![^\0\t\n\f\r ()<>[\]{}/%])/.exec(text.slice(this.at, this.at + 24));
    if (reference && Number.isInteger(number)) {
      this.at += reference[0].length;
      return { ref: number };
    }
    return number;
  }

  /** Whether `word` comes next, skipping it if so. */
  keyword(word: string): boolean {
    this.skip();
    if (!this.text.startsWith(word, this.at)) return false;
    this.at += word.length;
    return true;
  }

  /** Where a stream's bytes start, just after the end of the `stream` keyword's line. */
  streamStart(): number {
    if (this.text[this.at] === "\r") this.at++;
    if (this.text[this.at] === "\n") this.at++;
    return this.at;
  }

  private word(from: number): string {
    let end = from;
    while (end < this.text.length && !DELIMITER.test(this.text[end])) end++;
    this.at = end;
    return this.text.slice(from, end);
  }

  private literalString(): string {
    let depth = 0;
    let out = "";
    for (this.at++; this.at < this.text.length; this.at++) {
      const char = this.text[this.at];
      if (char === "\\") out += this.text[++this.at];
      else {
        if (char === "(") depth++;
        else if (char === ")" && depth-- === 0) break;
        out += char;
      }
    }
    this.at++;
    return out;
  }

  private skip() {
    const { text } = this;
    while (this.at < text.length) {
      if (WHITESPACE.test(text[this.at])) this.at++;
      else if (text[this.at] === "%") while (this.at < text.length && text[this.at] !== "\n") this.at++;
      else break;
    }
  }
}

/**
 * Undoes PNG row filters (a PDF `/Predictor` of 10 or more): each row of `stride` bytes
 * follows a byte naming its filter, which predicts each byte from the pixel `bpp` bytes to
 * its left, the one above, or both.
 */
function pngUnfilter(data: Uint8Array, stride: number, height: number, bpp: number): Uint8Array {
  const out = new Uint8Array(stride * height);
  for (let y = 0; y < height; y++) {
    const type = data[y * (stride + 1)];
    const row = y * (stride + 1) + 1;
    const o = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[o + x - bpp] : 0;
      const b = y > 0 ? out[o + x - stride] : 0;
      const c = x >= bpp && y > 0 ? out[o + x - stride - bpp] : 0;
      out[o + x] = (data[row + x] + predict(type, a, b, c)) & 0xff;
    }
  }
  return out;
}

function predict(type: number, a: number, b: number, c: number): number {
  if (type === 1) return a;
  if (type === 2) return b;
  if (type === 3) return (a + b) >> 1;
  if (type !== 4) return 0;
  const p = a + b - c;
  const [pa, pb, pc] = [Math.abs(p - a), Math.abs(p - b), Math.abs(p - c)];
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}
