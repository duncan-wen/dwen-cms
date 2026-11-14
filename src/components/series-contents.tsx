import Link from "next/link";
import type { Series } from "@/content/content";
import { SeriesPlace } from "./series-place";
import { linkUnderline } from "./text-link";

type Props = { series: Series; slug: string };

/**
 * A Post's Series in its opening: the Series' title linking to its page, then every Post in
 * the Series in order, the one being read (`slug`) marked rather than linked.
 */
export function SeriesContents({ series, slug }: Props) {
  return (
    <nav aria-label="系列目錄" className="grid gap-3 rounded-md border border-rule px-5 py-4 text-sm leading-[1.6]">
      <p className="text-[13px] text-ink-soft">
        系列・共 {series.posts.length} 篇{" "}
        <Link
          href={`/series/${series.id}`}
          className={`ml-1 font-serif text-[15px] font-bold text-ink ${linkUnderline}`}
        >
          {series.title}
        </Link>
      </p>
      <ol className="grid gap-1">
        {series.posts.map((post, i) => {
          const current = post.slug === slug;
          return (
            <li
              key={post.slug}
              className={`flex gap-2.5 border-l-2 py-1 pl-3.5 ${current ? "border-accent" : "border-rule"}`}
            >
              <SeriesPlace place={i + 1} className="font-mono text-[13px] leading-[1.6rem] text-ink-soft" />
              {current ? (
                <span aria-current="page" className="min-w-0 font-bold text-ink">
                  {post.title}
                </span>
              ) : (
                <Link href={`/posts/${post.slug}`} className="min-w-0 text-ink-soft hover:text-accent">
                  {post.title}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
