import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent } from "@/content/site-content";
import { MdxBody } from "@/mdx/mdx-body";

/** The About Page, or a 404 when the content directory has none. */
async function getAboutPage() {
  return (await getContent()).getPage("about") ?? notFound();
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getAboutPage();
  return { title: page.title, description: page.description };
}

export default async function AboutPage() {
  const page = await getAboutPage();
  return (
    <article className="prose prose-zinc max-w-none">
      <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>
      <MdxBody source={page.body} />
      {/* The site-wide AI disclosure lives in code, so rewriting the Page's copy can't drop it. */}
      <aside className="not-prose mt-12 border-t border-zinc-200 pt-6 text-sm text-zinc-600">
        <h2 className="font-semibold text-zinc-900">關於本站內容</h2>
        <p className="mt-2">
          本站內容由 AI 協助撰寫，每一篇都經過我親自審閱、確認後才發布。
        </p>
      </aside>
    </article>
  );
}
