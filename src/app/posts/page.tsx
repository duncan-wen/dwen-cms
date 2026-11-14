import type { Metadata } from "next";
import { PageHeading } from "@/components/page-heading";
import { PostList } from "@/components/post-list";
import { getContent } from "@/content/site-content";
import { pageAlternates } from "@/page-alternates";
import { OWNER_NAME } from "@/site-name";

export const metadata: Metadata = {
  title: "文章",
  description: `${OWNER_NAME} 的所有文章，由新到舊排列。`,
  alternates: pageAlternates("/posts"),
};

export default async function PostsPage() {
  const content = await getContent();
  const posts = content.listPublishedPosts();
  return (
    <>
      <PageHeading title="文章" summary={`共 ${posts.length} 篇，由新到舊。`} />
      <PostList posts={posts} seriesOf={(slug) => content.getPostSeries(slug)?.series} />
    </>
  );
}
