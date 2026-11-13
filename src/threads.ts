/** Threads' limit on a topic tag's length, in characters. */
export const THREADS_TAG_MAX = 50;

/** Whether Threads accepts a topic tag: 1–50 characters with no `.` or `&`. */
export function isValidThreadsTag(tag: string): boolean {
  const length = [...tag].length;
  return length >= 1 && length <= THREADS_TAG_MAX && !/[.&]/.test(tag);
}

/** A hashtag in running text: `#` and a letter, then anything up to whitespace. */
const HASHTAG = /#\p{L}\S*/gu;

/**
 * A Threads share's text split from its topic tag: the last line when it is a lone `#tag`.
 * `otherTags` are hashtags left in the text, which Threads would read as the topic instead.
 */
export function threadsTopicTag(source: string): { text: string; topicTag: string | undefined; otherTags: string[] } {
  const lines = source.trimEnd().split("\n");
  const last = lines.at(-1)?.trim() ?? "";
  const tag = /^#(\S+)$/.exec(last)?.[1];
  const text = (tag === undefined ? source : lines.slice(0, -1).join("\n")).trim();
  return { text, topicTag: tag, otherTags: text.match(HASHTAG) ?? [] };
}
