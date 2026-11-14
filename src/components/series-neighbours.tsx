import Link from "next/link";
import type { Post, SeriesPlace } from "@/content/content";

type Props = { place: SeriesPlace };

type NeighbourProps = { post: Post; label: "上一篇" | "下一篇"; className?: string };

/** One neighbour: its label over its title, the whole card a link. */
function Neighbour({ post, label, className = "" }: NeighbourProps) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className={`group grid gap-1 rounded-md border border-rule px-5 py-4 hover:border-accent ${className}`}
    >
      <span className="text-[13px] text-ink-soft">{label}</span>
      <span className="font-bold leading-[1.6] group-hover:text-accent">{post.title}</span>
    </Link>
  );
}

/**
 * The Posts around this one in its Series, after the body: 「上一篇」 on the left, 「下一篇」
 * on the right, just one of them on the first or last Post.
 */
export function SeriesNeighbours({ place: { previous, next } }: Props) {
  return (
    <nav aria-label="系列導覽" className="mt-14 grid gap-4 sm:grid-cols-2">
      {previous && <Neighbour post={previous} label="上一篇" />}
      {next && <Neighbour post={next} label="下一篇" className="sm:col-start-2 sm:text-right" />}
    </nav>
  );
}
