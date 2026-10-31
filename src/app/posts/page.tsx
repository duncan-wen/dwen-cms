import type { Metadata } from "next";
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
      <h1 className="mb-10 text-3xl font-bold tracking-tight">文章</h1>
      <PostList posts={posts} titleAs="h2" />
    </>
  );
}
