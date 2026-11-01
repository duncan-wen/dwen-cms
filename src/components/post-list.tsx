import Link from "next/link";
import type { Post } from "@/content/content";
import { groupPostsByYear } from "@/content/posts-by-year";
import { isoDate, monthDay } from "@/format-date";
import { PostCover } from "./post-cover";
import { TagList } from "./tag-list";

type Props = { posts: Post[] };

/**
 * Posts grouped under year headings (h2), in the order given. Each row shows
 * the `MM-DD` date, a cover thumbnail on wide screens, then the title (h3),
 * description and Tags.
 */
export function PostList({ posts }: Props) {
  return (
    <div className="space-y-12">
      {groupPostsByYear(posts).map(({ year, posts }) => (
        <section
          key={year}
          aria-label={`${year} 年`}
          className="grid gap-x-6 border-t border-ink sm:grid-cols-[104px_minmax(0,1fr)]"
        >
          <h2 className="pt-4 text-[28px] leading-tight font-black text-rule sm:pt-[22px]">{year}</h2>
          <ul>
            {posts.map((post) => (
              <li key={post.slug} className="border-b border-rule py-7 last:border-b-0">
                <article className="grid grid-cols-[52px_minmax(0,1fr)] gap-x-3 sm:grid-cols-[56px_120px_minmax(0,1fr)] sm:gap-x-6">
                  <time dateTime={isoDate(post.date)} className="pt-1.5 text-[13px] text-ink-soft">
                    {monthDay(post.date)}
                  </time>
                  {/* The one copy of the cover on this row; phones skip it to keep the text wide. */}
                  <div className="hidden pt-1.5 sm:block">
                    <PostCover post={post} sizes="120px" className="aspect-[3/2] rounded" />
                  </div>
                  <div className="grid min-w-0 gap-1.5">
                    <h3 className="text-[21px] leading-normal font-bold">
                      <Link href={`/posts/${post.slug}`} className="hover:text-accent">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="leading-[1.8] text-ink-soft">{post.description}</p>
                    <TagList tags={post.tags} />
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
