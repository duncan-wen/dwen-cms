import Link from "next/link";

type Props = { tags: string[]; className?: string };

/** A Post's Tags, each linking to its Tag page. */
export function TagList({ tags, className = "" }: Props) {
  return (
    <ul className={`flex flex-wrap gap-2 text-sm ${className}`} aria-label="標籤">
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            href={`/tags/${tag}`}
            className="rounded bg-zinc-100 px-2 py-0.5 text-zinc-700 hover:bg-zinc-200"
          >
            #{tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}
