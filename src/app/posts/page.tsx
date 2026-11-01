import type { Metadata } from "next";
import { PageHeading } from "@/components/page-heading";
import { PostList } from "@/components/post-list";
import { getContent } from "@/content/site-content";

export const metadata: Metadata = {
  title: "文章",
  description: "Duncan Wen 的所有文章，由新到舊排列。",
};

export default async function PostsPage() {
  const posts = (await getContent()).listPublishedPosts();
  return (
    <>
      <PageHeading title="文章" summary={`共 ${posts.length} 篇，由新到舊。`} />
      <PostList posts={posts} />
    </>
  );
}
