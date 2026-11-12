import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading } from "@/components/page-heading";
import { getContent } from "@/content/site-content";
import { pageAlternates } from "@/page-alternates";
import { OWNER_NAME } from "@/site-name";

export const metadata: Metadata = {
  title: "標籤",
  description: `${OWNER_NAME} 文章的所有標籤與篇數。`,
  alternates: pageAlternates("/tags"),
};

export default async function TagsPage() {
  const tags = (await getContent()).listTagsWithCounts();
  return (
    <>
      <PageHeading title="標籤" summary={`共 ${tags.length} 個標籤，文章多的在前。`} />
      <ul className="border-t border-ink">
        {tags.map(({ tag, count }) => (
          <li key={tag} className="flex items-baseline justify-between gap-6 border-b border-rule py-5 last:border-b-0">
            <Link href={`/tags/${tag}`} className="font-mono text-lg text-ink underline-offset-[3px] hover:underline">
              #{tag}
            </Link>
            <span className="text-[13px] text-ink-soft">{count} 篇</span>
          </li>
        ))}
      </ul>
    </>
  );
}
