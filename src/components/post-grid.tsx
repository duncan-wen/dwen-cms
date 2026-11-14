import Link from "next/link";
import type { Post, Series } from "@/content/content";
import { isoDate } from "@/format-date";
import { PostCover } from "./post-cover";
import { SeriesLabel } from "./series-label";

type Props = {
  posts: Post[];
  /** A Post's shown Series by its Slug, as `getPostSeries` gives it, for its 「系列：<title>」. */
  seriesOf: (slug: string) => Series | undefined;
};

/**
 * Posts as cover cards, in the order given: the first spans the grid as the
 * lead, the rest sit in two columns (one on phones). The title's link stretches
 * over the whole card, so the card opens the Post; a Series label is its own
 * link stacked over that stretched link (`z-10`), since links can't nest.
 */
export function PostGrid({ posts, seriesOf }: Props) {
  return (
    <ul className="grid grid-cols-1 gap-x-8 gap-y-12 pt-8 sm:grid-cols-2">
      {posts.map((post, i) => {
        const lead = i === 0;
        return (
          <li key={post.slug} className={lead ? "sm:col-span-2" : undefined}>
            <article
              className={`group relative grid content-start gap-2.5 ${lead ? "sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] sm:items-center sm:gap-8" : ""}`}
            >
              <PostCover
                post={post}
                sizes={lead ? "(min-width: 640px) 370px, 100vw" : "(min-width: 640px) 305px, 100vw"}
                className={`rounded-md ${lead ? "aspect-[16/11]" : "aspect-[16/10]"}`}
              />
              <div className={`grid min-w-0 ${lead ? "gap-3" : "gap-2"}`}>
                <time dateTime={isoDate(post.date)} className="text-[13px] text-ink-soft">
                  {isoDate(post.date)}
                </time>
                <h3
                  className={
                    lead
                      ? "text-[clamp(24px,3.2vw,30px)] leading-[1.4] font-black group-hover:text-accent"
                      : "text-xl leading-normal font-bold group-hover:text-accent"
                  }
                >
                  <Link href={`/posts/${post.slug}`} className="after:absolute after:inset-0">
                    {post.title}
                  </Link>
                </h3>
                <p className={`text-ink-soft ${lead ? "text-[17px] leading-[1.75]" : "text-[15px] leading-[1.75]"}`}>
                  {post.description}
                </p>
                <SeriesLabel series={seriesOf(post.slug)} className="relative z-10" />
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
