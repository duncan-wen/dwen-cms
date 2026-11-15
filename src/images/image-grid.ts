import sharp from "sharp";

/** The width of a grid, in px: twice the reading column, so it stays sharp on a dense screen. */
export const GRID_WIDTH = 1600;
const GAP = 12;
/** The gap's colour, and what shows through a transparent picture: a grid is a picture, so it keeps one look in both themes. */
const WHITE = { r: 255, g: 255, b: 255 };

/**
 * Several images as one JPEG: tiles in rows of `columns`, each cropped to the
 * first image's shape, with a white gap between them. A Post shows a set of
 * pictures (a comparison, the pages of a book) as one Body image this way.
 */
export async function imageGrid(images: Uint8Array[], columns: number): Promise<Buffer> {
  if (images.length === 0) throw new Error("A grid needs at least one image");
  if (!Number.isInteger(columns) || columns < 1)
    throw new Error(`columns must be a whole number from 1, not ${columns}`);
  // More columns than images would leave the rest of the row blank.
  columns = Math.min(columns, images.length);
  const first = await sharp(images[0]).metadata();
  // As the picture is shown: a photo stored on its side is turned upright, so its shape is the turned one.
  const shape = first.autoOrient;
  // A tile is never wider than the first image, so a small picture isn't blown up.
  const tileWidth = Math.min(Math.floor((GRID_WIDTH - (columns - 1) * GAP) / columns), shape.width);
  if (tileWidth < 1) throw new Error(`${columns} columns don't fit a grid ${GRID_WIDTH}px wide`);
  const tileHeight = Math.max(1, Math.round((tileWidth * shape.height) / shape.width));
  const rows = Math.ceil(images.length / columns);
  const tiles = await Promise.all(
    images.map(async (image, index) => ({
      // Raw pixels, so a tile is encoded once, as part of the grid.
      input: await sharp(image)
        .autoOrient()
        .resize(tileWidth, tileHeight, { fit: "cover" })
        .flatten({ background: WHITE })
        .toColourspace("srgb")
        .raw()
        .toBuffer(),
      raw: { width: tileWidth, height: tileHeight, channels: 3 as const },
      left: (index % columns) * (tileWidth + GAP),
      top: Math.floor(index / columns) * (tileHeight + GAP),
    })),
  );
  return sharp({
    create: {
      width: columns * tileWidth + (columns - 1) * GAP,
      height: rows * tileHeight + (rows - 1) * GAP,
      channels: 3,
      background: WHITE,
    },
  })
    .composite(tiles)
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();
}
