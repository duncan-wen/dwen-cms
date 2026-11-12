import { Feed } from "feed";
import { getContent } from "@/content/site-content";
import { dateValue } from "@/format-date";
import { SITE_LANGUAGE, SITE_NAME } from "@/site-name";
import { absoluteUrl } from "@/site-url";

export const dynamic = "force-static";

/** The RSS feed of every Published Post, newest first, written at build time: `/feed.xml`. */
export async function GET() {
  const posts = (await getContent()).listPublishedPosts();
  const feed = new Feed({
    id: absoluteUrl("/"),
    link: absoluteUrl("/"),
    title: SITE_NAME,
    description: `${SITE_NAME} 的文章：把 AI 做進真的產品裡，再把過程寫下來。`,
    language: SITE_LANGUAGE,
    copyright: `© ${SITE_NAME}`,
    updated: posts[0] && dateValue(posts[0].date),
    feedLinks: { rss: absoluteUrl("/feed.xml") },
    generator: false,
  });
  for (const post of posts) {
    const link = absoluteUrl(`/posts/${post.slug}`);
    feed.addItem({
      title: post.title,
      id: link,
      link,
      description: post.description,
      date: dateValue(post.date),
      category: post.tags.map((tag) => ({ name: tag, domain: absoluteUrl(`/tags/${tag}`) })),
    });
  }
  return new Response(feed.rss2(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
