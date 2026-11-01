import Link from "next/link";
import { PostList } from "@/components/post-list";
import { getContent } from "@/content/site-content";

/** How many of the newest Posts the home page shows. */
const LATEST_COUNT = 5;

export default async function HomePage() {
  const latest = (await getContent()).listPublishedPosts().slice(0, LATEST_COUNT);
  return (
    <>
      <section className="mb-16">
        <h1 className="text-3xl font-bold tracking-tight">Duncan Wen</h1>
        <p className="mt-4 text-lg text-ink-soft">
          嗨，我是 Duncan。我在這裡寫軟體工程與 AI 應用的實作筆記，也展示我做過的東西。
        </p>
        <Link href="/about" className="mt-4 inline-block font-medium hover:underline">
          關於我 →
        </Link>
      </section>
      <section>
        <h2 className="mb-8 text-2xl font-bold tracking-tight">最新文章</h2>
        <PostList posts={latest} titleAs="h3" />
        <Link href="/posts" className="mt-10 inline-block font-medium hover:underline">
          所有文章 →
        </Link>
      </section>
    </>
  );
}
