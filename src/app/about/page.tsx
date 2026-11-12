import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeading } from "@/components/page-heading";
import { ContactForm } from "@/components/contact-form";
import { JsonLd } from "@/components/json-ld";
import { LinkRow } from "@/components/link-row";
import { contactFormHref, contactLinks } from "@/contact-links";
import { getContent } from "@/content/site-content";
import { MdxBody } from "@/mdx/mdx-body";
import { pageAlternates } from "@/page-alternates";
import { profilePage } from "@/structured-data";

/** The About Page, or a 404 when the content directory has none. */
async function getAboutPage() {
  return (await getContent()).getPage("about") ?? notFound();
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getAboutPage();
  return {
    title: page.title,
    description: page.description,
    alternates: pageAlternates("/about"),
  };
}

export default async function AboutPage() {
  const page = await getAboutPage();
  return (
    <article>
      <JsonLd data={profilePage()} />
      <PageHeading size="page" title={page.title} />
      <div className="prose prose-site max-w-none">
        <MdxBody source={page.body} />
      </div>
      {/* The Contact form and links live in code, so every 「聯絡我」 on the site always lands here. */}
      <section id="contact" className="mt-14 scroll-mt-6 border-t border-rule pt-8">
        <h2 className="text-[22px] leading-[1.5] font-bold">聯絡我</h2>
        <ContactForm />
        {/* The footer's link to this very form would only scroll to itself here. */}
        <LinkRow className="mt-8" links={contactLinks.filter(({ href }) => href !== contactFormHref)} />
      </section>
      {/* The site-wide AI disclosure lives in code, so rewriting the Page's copy can't drop it. */}
      <aside className="mt-12 border-t border-rule pt-6 text-sm leading-[1.8] text-ink-soft">
        <h2 className="text-base font-bold text-ink">關於本站內容</h2>
        <p className="mt-2">本站內容由 AI 協助撰寫，每一篇都經過我親自審閱、確認後才發布。</p>
      </aside>
    </article>
  );
}
