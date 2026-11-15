import sharp from "sharp";

/** The width of a grid, in px: twice the reading column, so it stays sharp on a dense screen. */
export const GRID_WIDTH = 1600;
const GAP = 12;

/**
 * Several images as one JPEG: tiles in rows of `columns`, each cropped to the
 * first image's shape, with a white gap between them. A Post shows a set of
 * pictures (a comparison, the pages of a book) as one Body image this way.
 */
export async function imageGrid(images: Uint8Array[], columns: number): Promise<Buffer> {
  if (images.length === 0) throw new Error("A grid needs at least one image");
  if (!Number.isInteger(columns) || columns < 1)
    throw new Error(`columns must be a whole number from 1, not ${columns}`);
  const first = await sharp(images[0]).metadata();
  const tileWidth = Math.floor((GRID_WIDTH - (columns - 1) * GAP) / columns);
  const tileHeight = Math.round((tileWidth * first.height) / first.width);
  const rows = Math.ceil(images.length / columns);
  const tiles = await Promise.all(
    images.map(async (image, index) => ({
      input: await sharp(image).resize(tileWidth, tileHeight, { fit: "cover" }).toBuffer(),
      left: (index % columns) * (tileWidth + GAP),
      top: Math.floor(index / columns) * (tileHeight + GAP),
    })),
  );
  return sharp({
    create: {
      width: columns * tileWidth + (columns - 1) * GAP,
      height: rows * tileHeight + (rows - 1) * GAP,
      channels: 3,
      // White, as the pictures' own paper: a grid is a picture, so it keeps one look in both themes.
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite(tiles)
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();
}
