import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeading } from "@/components/page-heading";
import { LinkRow } from "@/components/link-row";
import { contactLinks } from "@/contact-links";
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
    <article>
      <PageHeading size="page" title={page.title} />
      <div className="prose prose-site max-w-none">
        <MdxBody source={page.body} />
      </div>
      {/* The contact links live in code, so the home page's and Posts' 「聯絡我」 always land here. */}
      <section id="contact" className="mt-14 scroll-mt-6 border-t border-rule pt-8">
        <h2 className="text-[22px] leading-[1.5] font-bold">聯絡我</h2>
        <LinkRow className="mt-4" links={contactLinks} />
      </section>
      {/* The site-wide AI disclosure lives in code, so rewriting the Page's copy can't drop it. */}
      <aside className="mt-12 border-t border-rule pt-6 text-sm leading-[1.8] text-ink-soft">
        <h2 className="text-base font-bold text-ink">關於本站內容</h2>
        <p className="mt-2">
          本站內容由 AI 協助撰寫，每一篇都經過我親自審閱、確認後才發布。
        </p>
      </aside>
    </article>
  );
}
