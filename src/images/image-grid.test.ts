import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { GRID_WIDTH, imageGrid } from "./image-grid";

type Rgb = { r: number; g: number; b: number };
const red = { r: 255, g: 0, b: 0 };
const green = { r: 0, g: 255, b: 0 };
const blue = { r: 0, g: 0, b: 255 };

function picture(width: number, height: number, background: Rgb): Promise<Buffer> {
  return sharp({ create: { width, height, channels: 3, background } })
    .png()
    .toBuffer();
}

describe("imageGrid", () => {
  it("lays images out in rows of the given columns, each tile in the first image's shape", async () => {
    const images = await Promise.all([picture(3000, 2000, red), picture(2000, 2000, green), picture(3000, 2000, blue)]);

    const grid = await sharp(await imageGrid(images, 2)).metadata();

    expect(grid.format).toBe("jpeg");
    expect(grid.width).toBeLessThanOrEqual(GRID_WIDTH);
    expect(grid.width).toBeGreaterThan(GRID_WIDTH - 2);
    // Two rows of 3:2 tiles, 794px wide, with one 12px gap between the rows.
    expect(grid.height).toBe(529 * 2 + 12);
  });

  it("puts each image in its own tile, in order", async () => {
    const images = await Promise.all([picture(300, 200, red), picture(300, 200, blue)]);

    const { data, info } = await sharp(await imageGrid(images, 2))
      .raw()
      .toBuffer({ resolveWithObject: true });
    const pixel = (x: number) => [...data.subarray((100 * info.width + x) * info.channels).subarray(0, 3)];

    const [leftRed, , leftBlue] = pixel(100);
    const [rightRed, , rightBlue] = pixel(info.width - 100);
    expect(leftRed).toBeGreaterThan(200);
    expect(leftBlue).toBeLessThan(50);
    expect(rightBlue).toBeGreaterThan(200);
    expect(rightRed).toBeLessThan(50);
  });

  it("keeps a picture narrower than a tile at its own size", async () => {
    const grid = await sharp(await imageGrid([await picture(300, 200, red)], 1)).metadata();

    expect([grid.width, grid.height]).toEqual([300, 200]);
  });

  it("fills the row when there are fewer images than columns", async () => {
    const one = await sharp(await imageGrid([await picture(3000, 2000, red)], 4)).metadata();

    expect(one.width).toBe(GRID_WIDTH);
  });

  it("turns a photo stored on its side upright", async () => {
    const sideways = await sharp({ create: { width: 300, height: 200, channels: 3, background: red } })
      .withMetadata({ orientation: 6 })
      .jpeg()
      .toBuffer();

    const grid = await sharp(await imageGrid([sideways], 1)).metadata();

    expect([grid.width, grid.height]).toEqual([200, 300]);
  });

  it("rejects an empty grid and a column count below 1", async () => {
    await expect(imageGrid([], 2)).rejects.toThrow("at least one image");
    await expect(imageGrid([await picture(10, 10, red)], 0)).rejects.toThrow("columns");
  });
});
