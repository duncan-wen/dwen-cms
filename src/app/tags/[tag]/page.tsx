import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeading } from "@/components/page-heading";
import { PostList } from "@/components/post-list";
import { TextLink } from "@/components/text-link";
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
      <PageHeading title={<span className="font-mono font-medium">#{tag}</span>}>
        共 {posts.length} 篇，由新到舊。
      </PageHeading>
      <PostList posts={posts} />
      <p className="mt-12">
        <TextLink href="/tags">所有標籤</TextLink>
      </p>
    </>
  );
}
