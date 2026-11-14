import Link from "next/link";
import type { ReactNode } from "react";
import type { Post } from "@/content/content";
import { PostCover } from "./post-cover";

type Props = {
  post: Post;
  /** What leads the row in its narrow first column: the Post list's `MM-DD` date, a Series' place. */
  marker: ReactNode;
  /** The title's heading level: h3 under the Post list's year headings, h2 on a Series page. */
  heading: "h2" | "h3";
  /** Shown between the title and the description, such as the date. */
  meta?: ReactNode;
  /** Shown under the description, such as the Tags. */
  footer?: ReactNode;
};

/**
 * One Post in a list: the marker, a cover thumbnail on wide screens, then the title linking
 * to the Post, and its description.
 */
export function PostRow({ post, marker, heading: Heading, meta, footer }: Props) {
  return (
    <article className="grid grid-cols-[52px_minmax(0,1fr)] gap-x-3 sm:grid-cols-[56px_120px_minmax(0,1fr)] sm:gap-x-6">
      {marker}
      {/* The one copy of the cover on this row; phones skip it to keep the text wide. */}
      <div className="hidden pt-1.5 sm:block">
        <PostCover post={post} sizes="120px" className="aspect-[3/2] rounded" />
      </div>
      <div className="grid min-w-0 gap-1.5">
        <Heading className="text-[21px] leading-normal font-bold">
          <Link href={`/posts/${post.slug}`} className="hover:text-accent">
            {post.title}
          </Link>
        </Heading>
        {meta}
        <p className="leading-[1.8] text-ink-soft">{post.description}</p>
        {footer}
      </div>
    </article>
  );
}
