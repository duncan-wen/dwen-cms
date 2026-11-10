import Link from "next/link";

type Props = { tags: string[] };

/** A Post's Tags, each linking to its Tag page. */
export function TagList({ tags }: Props) {
  return (
    <ul className="flex flex-wrap gap-x-3.5 gap-y-1 font-mono text-[13px]" aria-label="標籤">
      {tags.map((tag) => (
        <li key={tag}>
          <Link href={`/tags/${tag}`} className="text-accent underline-offset-[3px] hover:underline">
            #{tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}
