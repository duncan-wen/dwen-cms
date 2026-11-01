/** The reading column's widest rendered width, in px. */
export const BODY_COLUMN_PX = 640;

/**
 * The reading column's rendered width as an `img` sizes value, for next/image to pick a
 * size for anything as wide as the column: 640px from a 672px viewport up, else the viewport.
 */
export const bodyColumnSizes = `(min-width: 672px) ${BODY_COLUMN_PX}px, 100vw`;
