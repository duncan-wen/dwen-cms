import { year as yearOf } from "../format-date";
import type { Post } from "./content";

/** The Posts published in one year, as YYYY. */
export type YearGroup = { year: string; posts: Post[] };

/**
 * Groups Posts under the year they were published, in the order given: pass
 * Posts newest first (as every content query returns them) and the years come
 * out newest first too.
 */
export function groupPostsByYear(posts: Post[]): YearGroup[] {
  const groups: YearGroup[] = [];
  for (const post of posts) {
    const year = yearOf(post.date);
    const last = groups.at(-1);
    if (last?.year === year) last.posts.push(post);
    else groups.push({ year, posts: [post] });
  }
  return groups;
}
