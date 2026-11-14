/**
 * Generated Post covers: contour lines seeded by a Post's Slug, like a terrain map.
 * Ported from the approved prototype (variant X). Pure and DOM-free, so the cover
 * component and the OG image draw the same paths.
 */

/** One closed contour line, as SVG path data in the cover's coordinate space. */
export type Contour = { d: string; heavy: boolean };

/** A terrain's coordinate space and its contours, innermost first: a generated cover, or the Backdrop. */
export type ContourLines = { width: number; height: number; contours: Contour[] };

const WIDTH = 1600;
const HEIGHT = 1000;
const CONTOURS = 22;
const POINTS = 120;

/** How fast each of the terrain's four waves turns as the phase grows, alternating so the lines shift rather than spin. */
const WAVE_SPEEDS = [1, -1 / 2, 1 / 3, -1 / 4];

/**
 * The contour lines for a seed; the same seed always gives the same lines. A Post's generated
 * cover is seeded by its Slug.
 * A phase moves the same terrain, for the Backdrop: the same seed and phase always give the same
 * lines, and its points keep one decimal, so lines moved a little at a time don't jump between
 * whole pixels.
 */
export function generateCover(seed: string, phase?: number): ContourLines {
  const turn = phase ?? 0;
  const round = phase === undefined ? Math.round : (n: number) => Math.round(n * 10) / 10;
  const random = seededRandom(hash(seed));
  const cx = WIDTH * (0.25 + random() * 0.5);
  const cy = HEIGHT * (0.3 + random() * 0.4);
  const waves = WAVE_SPEEDS.map((speed, j) => ({
    amp: (0.22 / (j + 1)) * (0.6 + random()),
    phase: random() * 6.28,
    drift: (random() - 0.5) * 0.5,
    speed,
  }));
  const step = (Math.hypot(WIDTH, HEIGHT) / CONTOURS) * 0.62;

  const contours = Array.from({ length: CONTOURS }, (_, index): Contour => {
    const k = index + 1;
    const points = Array.from({ length: POINTS }, (_, i) => {
      const a = (i / POINTS) * Math.PI * 2;
      const m = waves.reduce(
        (sum, w, j) => sum + w.amp * Math.sin((j + 2) * a + w.phase + k * w.drift + turn * w.speed),
        1,
      );
      const r = k * step * m;
      return `${round(cx + Math.cos(a) * r * 1.25)} ${round(cy + Math.sin(a) * r * 0.85)}`;
    });
    return { d: `M${points.join("L")}Z`, heavy: k % 5 === 0 };
  });

  return { width: WIDTH, height: HEIGHT, contours };
}

/**
 * The cover as a standalone SVG document for use as a CSS mask. Only its alpha matters,
 * so the stroke colour is arbitrary (not a design colour) and the page paints the lines
 * in whatever colour the theme gives.
 * It covers its box when scaled (`slice`), and its strokes keep their width at any size.
 */
export function coverSvg(slug: string): string {
  const { width, height, contours } = generateCover(slug);
  const paths = contours
    .map(({ d, heavy }) => {
      const stroke = heavy ? 'stroke-opacity="0.85" stroke-width="1.6"' : 'stroke-opacity="0.38" stroke-width="0.9"';
      return `<path d="${d}" ${stroke} vector-effect="non-scaling-stroke"/>`;
    })
    .join("");
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid slice">` +
    `<g fill="none" stroke="black" stroke-linejoin="round">${paths}</g></svg>`
  );
}

/** FNV-1a over the seed's code points. */
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
