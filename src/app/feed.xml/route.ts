import { Feed } from "feed";
import { getContent } from "@/content/site-content";
import { siteUrl } from "@/site-url";

export const dynamic = "force-static";

/** The RSS feed of every Published Post, newest first, written at build time: `/feed.xml`. */
export async function GET() {
  const base = siteUrl();
  const url = (path: string) => new URL(path, base).href;
  const posts = (await getContent()).listPublishedPosts();
  const feed = new Feed({
    id: url("/"),
    link: url("/"),
    title: "Duncan Wen",
    description: "Duncan Wen 的文章：把 AI 做進真的產品裡，再把過程寫下來。",
    language: "zh-Hant",
    copyright: "© Duncan Wen",
    updated: posts[0] && new Date(`${posts[0].date}T00:00:00Z`),
    feedLinks: { rss: url("/feed.xml") },
    generator: false,
  });
  for (const post of posts) {
    const link = url(`/posts/${post.slug}`);
    feed.addItem({
      title: post.title,
      id: link,
      link,
      description: post.description,
      date: new Date(`${post.date}T00:00:00Z`),
      category: post.tags.map((tag) => ({ name: tag, domain: url(`/tags/${tag}`) })),
    });
  }
  return new Response(feed.rss2(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
