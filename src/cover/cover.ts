/**
 * Generated Post covers: contour lines seeded by a Post's Slug, like a terrain map.
 * Ported from the approved prototype (variant X). Pure and DOM-free, so the cover
 * component and the OG image draw the same paths.
 */

/** One closed contour line, as SVG path data in the cover's coordinate space. */
export type Contour = { d: string; heavy: boolean };

/** A cover's coordinate space and its contours, innermost first. */
export type Cover = { width: number; height: number; contours: Contour[] };

const WIDTH = 1600;
const HEIGHT = 1000;
const CONTOURS = 22;
const POINTS = 120;

/** The contour-line cover for the Post with this Slug; the same Slug always gives the same cover. */
export function generateCover(slug: string): Cover {
  const random = seededRandom(hash(slug));
  const cx = WIDTH * (0.25 + random() * 0.5);
  const cy = HEIGHT * (0.3 + random() * 0.4);
  const waves = Array.from({ length: 4 }, (_, j) => ({
    amp: (0.22 / (j + 1)) * (0.6 + random()),
    phase: random() * 6.28,
    drift: (random() - 0.5) * 0.5,
  }));
  const step = (Math.hypot(WIDTH, HEIGHT) / CONTOURS) * 0.62;

  const contours = Array.from({ length: CONTOURS }, (_, index): Contour => {
    const k = index + 1;
    const points = Array.from({ length: POINTS }, (_, i) => {
      const a = (i / POINTS) * Math.PI * 2;
      const m = waves.reduce((sum, w, j) => sum + w.amp * Math.sin((j + 2) * a + w.phase + k * w.drift), 1);
      const r = k * step * m;
      return `${Math.round(cx + Math.cos(a) * r * 1.25)} ${Math.round(cy + Math.sin(a) * r * 0.85)}`;
    });
    return { d: `M${points.join("L")}Z`, heavy: k % 5 === 0 };
  });

  return { width: WIDTH, height: HEIGHT, contours };
}

/** FNV-1a over the Slug's code points. */
function hash(text: string): number {
  let h = 2166136261;
  for (const char of text) {
    h ^= char.codePointAt(0)!;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Mulberry32: a small seeded generator of numbers in [0, 1). */
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
