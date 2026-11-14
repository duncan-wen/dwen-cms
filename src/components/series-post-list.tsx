import type { Post } from "@/content/content";
import { isoDate } from "@/format-date";
import { PostRow } from "./post-row";

type Props = { posts: Post[] };

/**
 * A Series' Posts as a numbered list, in the order given (oldest first): each a PostRow
 * led by its place (01, read as 第 1 篇), its date under the title.
 */
export function SeriesPostList({ posts }: Props) {
  return (
    <ol className="border-t border-ink">
      {posts.map((post, i) => (
        <li key={post.slug} className="border-b border-rule py-7">
          <PostRow
            post={post}
            heading="h2"
            marker={
              <p className="text-[28px] leading-tight font-black text-rule" aria-label={`第 ${i + 1} 篇`}>
                {String(i + 1).padStart(2, "0")}
              </p>
            }
            meta={
              <time dateTime={isoDate(post.date)} className="text-[13px] text-ink-soft">
                {isoDate(post.date)}
              </time>
            }
          />
        </li>
      ))}
    </ol>
  );
}
