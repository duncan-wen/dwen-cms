import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostList } from "@/components/post-list";
import { getContent } from "@/content/site-content";

type Props = { params: Promise<{ tag: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const content = await getContent();
  return content.listTagsWithCounts().map(({ tag }) => ({ tag }));
}

async function findPosts(params: Props["params"]) {
  const { tag } = await params;
  const posts = (await getContent()).listPostsByTag(tag);
  if (posts.length === 0) notFound();
  return { tag, posts };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await findPosts(params);
  return { title: `#${tag}`, description: `Duncan Wen 標記為 #${tag} 的文章。` };
}

export default async function TagPage({ params }: Props) {
  const { tag, posts } = await findPosts(params);
  return (
    <>
      <h1 className="mb-10 text-3xl font-bold tracking-tight">#{tag}</h1>
      <PostList posts={posts} titleAs="h2" />
      <Link href="/tags" className="mt-10 inline-block font-medium hover:underline">
        所有標籤 →
      </Link>
    </>
  );
}
