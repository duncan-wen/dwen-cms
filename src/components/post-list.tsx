import type { Post, Series } from "@/content/content";
import { groupPostsByYear } from "@/content/posts-by-year";
import { isoDate, monthDay } from "@/format-date";
import { PostRow } from "./post-row";
import { SeriesLabel } from "./series-label";
import { TagList } from "./tag-list";

type Props = {
  posts: Post[];
  /** A Post's shown Series by its Slug, as `getSeriesOfPost` gives it, for its 「系列：<title>」. */
  seriesOf: (slug: string) => Series | undefined;
};

/**
 * Posts grouped under year headings (h2), in the order given. Each is a PostRow
 * led by its `MM-DD` date, its Series label and Tags under the description.
 */
export function PostList({ posts, seriesOf }: Props) {
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
                <PostRow
                  post={post}
                  heading="h3"
                  marker={
                    <time dateTime={isoDate(post.date)} className="pt-1.5 text-[13px] text-ink-soft">
                      {monthDay(post.date)}
                    </time>
                  }
                  footer={
                    <>
                      <SeriesLabel series={seriesOf(post.slug)} />
                      <TagList tags={post.tags} />
                    </>
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
