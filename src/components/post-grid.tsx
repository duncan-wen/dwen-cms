import Link from "next/link";
import type { Post } from "@/content/content";
import { isoDate } from "@/format-date";
import { PostCover } from "./post-cover";

type Props = { posts: Post[] };

/**
 * Posts as cover cards, in the order given: the first spans the grid as the
 * lead, the rest sit in two columns (one on phones). Each card is one link.
 */
export function PostGrid({ posts }: Props) {
  return (
    <ul className="grid grid-cols-1 gap-x-8 gap-y-12 pt-8 sm:grid-cols-2">
      {posts.map((post, i) => {
        const lead = i === 0;
        return (
          <li key={post.slug} className={lead ? "sm:col-span-2" : undefined}>
            <Link
              href={`/posts/${post.slug}`}
              className={`group grid content-start gap-2.5 ${lead ? "sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] sm:items-center sm:gap-8" : ""}`}
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
                  {post.title}
                </h3>
                <p
                  className={`text-ink-soft ${lead ? "text-[17px] leading-[1.75]" : "text-[15px] leading-[1.75]"}`}
                >
                  {post.description}
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
