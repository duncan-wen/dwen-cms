/** A hashtag as LinkedIn links one: `#` and a letter, then letters, digits or underscores. */
const HASHTAG = /(#\p{L}[\p{L}\p{N}_]*)/u;

/** Every hashtag in a LinkedIn share's text, in order, each with its `#`. */
export function linkedInHashtags(text: string): string[] {
  return text.split(HASHTAG).filter((_, index) => index % 2 === 1);
}

/**
 * A LinkedIn share's text in "little text", the format LinkedIn reads commentary in: these
 * characters are markup unless escaped, and a hashtag links only as {hashtag|\#|tag}.
 */
export function littleText(text: string): string {
  const escape = (plain: string) => plain.replace(/[\\|{}@[\]()<>#*_~]/g, "\\$&");
  return text
    .split(HASHTAG)
    .map((part, index) => (index % 2 === 1 ? `{hashtag|\\#|${escape(part.slice(1))}}` : escape(part)))
    .join("");
}
