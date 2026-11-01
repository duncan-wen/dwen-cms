import type { Heading } from "@/mdx/compile-mdx";

type Props = { headings: Heading[] };

/**
 * A Post's table of contents, one link per `h2`, hung to the right of the reading column
 * and sticky while scrolling. Only shown where the screen is wide enough to fit it beside
 * the column; a Post with no `h2` gets none.
 */
export function TableOfContents({ headings }: Props) {
  if (headings.length === 0) return null;
  return (
    <aside className="absolute top-0 left-full ml-14 hidden h-full w-[200px] min-[1180px]:block">
      <nav aria-label="本文目錄" className="sticky top-12 mt-8 grid gap-1 text-sm leading-[1.6]">
        <p className="mb-2 text-[13px] text-ink-soft">本文目錄</p>
        {headings.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className="border-l-2 border-rule py-1 pl-3.5 text-ink-soft hover:border-accent hover:text-ink"
          >
            {label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
