import type { Metadata } from "next";
import Link from "next/link";
import { getContent } from "@/content/site-content";

export const metadata: Metadata = {
  title: "標籤",
  description: "Duncan Wen 文章的所有標籤與篇數。",
};

export default async function TagsPage() {
  const tags = (await getContent()).listTagsWithCounts();
  return (
    <>
      <h1 className="mb-10 text-3xl font-bold tracking-tight">標籤</h1>
      <ul className="space-y-3">
        {tags.map(({ tag, count }) => (
          <li key={tag}>
            <Link href={`/tags/${tag}`} className="text-lg font-medium hover:underline">
              #{tag}
            </Link>
            <span className="ml-2 text-sm text-ink-soft">{count} 篇</span>
          </li>
        ))}
      </ul>
    </>
  );
}
