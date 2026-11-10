/** The folder next to a Post that holds its Slide deck. */
export const DECK_DIR = "deck";

/** The download copy of the deck. */
export const DECK_PDF = "deck.pdf";

/** The slide size, and each slide's title and text, in order. */
export const DECK_TEXT = "deck.yml";

/** The largest the download PDF may be, which also stops an original being committed by mistake. */
export const DECK_PDF_LIMIT_BYTES = 5 * 1000 * 1000;

/** How wide a thumbnail is, in px. */
export const THUMB_WIDTH = 320;

/** How tall a thumbnail of a `width`×`height` slide is, in px. */
export const thumbHeight = (width: number, height: number) => Math.round((THUMB_WIDTH * height) / width);

/** Slide `number` as its files name it, two digits at least (1 is `01`). */
const slideName = (number: number) => String(number).padStart(2, "0");

/** Slide `number`'s image (1 is `01.webp`). */
export const slideFile = (number: number) => `${slideName(number)}.webp`;

/** Slide `number`'s thumbnail (1 is `01-thumb.webp`). */
export const thumbFile = (number: number) => `${slideName(number)}-thumb.webp`;
