import Link from "next/link";
import { useId } from "react";
import type { Post, Series } from "@/content/content";
import { PostCover } from "./post-cover";
import { SeriesLabel } from "./series-label";

type Props = {
  /** The Post's Related Posts, as `listRelatedPosts` gives them. */
  posts: Post[];
  /** A Post's shown Series by its Slug, as `getSeriesOfPost` gives it, for its 「系列：<title>」. */
  seriesOf: (slug: string) => Series | undefined;
};

/**
 * 「接著讀」 at the end of a Post: its Related Posts, one row each with the Cover (on phones
 * too, since the Cover is what a Reader picks by), the title and two lines of the
 * description. The title's link stretches over the row; a Series label is its own link
 * stacked over it (`z-10`), since links can't nest. Nothing when there are none.
 */
export function RelatedPosts({ posts, seriesOf }: Props) {
  // Not a fixed id: a body heading's id comes from its text, and one could spell the same.
  const headingId = useId();
  if (posts.length === 0) return null;
  return (
    <nav aria-labelledby={headingId} className="mt-14 grid gap-6">
      <h2 id={headingId} className="text-[21px] font-bold">
        接著讀
      </h2>
      <ul className="grid gap-6">
        {posts.map((post) => (
          <li key={post.slug}>
            <div className="group relative grid grid-cols-[96px_minmax(0,1fr)] gap-x-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-x-6">
              <div className="pt-1">
                <PostCover post={post} sizes="(min-width: 640px) 120px, 96px" className="aspect-[3/2] rounded" />
              </div>
              <div className="grid min-w-0 content-start gap-1">
                <h3 className="text-[17px] leading-normal font-bold group-hover:text-accent sm:text-lg">
                  <Link href={`/posts/${post.slug}`} className="after:absolute after:inset-0">
                    {post.title}
                  </Link>
                </h3>
                <p className="line-clamp-2 text-[15px] leading-[1.75] text-ink-soft">{post.description}</p>
                <SeriesLabel series={seriesOf(post.slug)} className="relative z-10" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </nav>
  );
}
