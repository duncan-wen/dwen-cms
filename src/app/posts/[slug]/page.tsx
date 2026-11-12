import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { bodyColumnSizes } from "@/body-column";
import { FeedbackBlock } from "@/components/feedback-block";
import { JsonLd } from "@/components/json-ld";
import { LinkRow } from "@/components/link-row";
import { MutedParagraph } from "@/components/muted-paragraph";
import { PageHeading } from "@/components/page-heading";
import { PostCover } from "@/components/post-cover";
import { Seal } from "@/components/seal";
import { TableOfContents } from "@/components/table-of-contents";
import { TagList } from "@/components/tag-list";
import { contactFormHref } from "@/contact-links";
import { getContent } from "@/content/site-content";
import { slideDeckSource } from "@/deck/slide-deck-source";
import { formatDate, isoDate } from "@/format-date";
import { compileMdx } from "@/mdx/compile-mdx";
import { pageAlternates } from "@/page-alternates";
import { bodyImageSources } from "@/post-image-url";
import { blogPosting } from "@/structured-data";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const content = await getContent();
  return [
    ...content.listPublishedPosts().flatMap((post) => [post.slug, ...post.previousSlugs]),
    ...content.listTakenDownSlugs(),
  ].map((slug) => ({ slug }));
}

/** The Post or Takedown marker at a Slug; redirects a previous Slug, 404s an unknown one. */
async function resolve(params: Props["params"]) {
  const { slug } = await params;
  const result = (await getContent()).resolveSlug(slug);
  if (result.kind === "redirect") permanentRedirect(`/posts/${result.to}`);
  if (result.kind === "not-found") notFound();
  return result;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await resolve(params);
  if (result.kind === "taken-down") return { title: "文章已移除", robots: { index: false } };
  const { post } = result;
  return {
    title: post.title,
    description: post.description,
    alternates: pageAlternates(`/posts/${post.slug}`),
  };
}

/** Rendered for a taken-down Slug, which the proxy answers with 410 Gone. */
function TakenDown() {
  return (
    <>
      <PageHeading size="page" title="這篇文章已移除">
        <MutedParagraph>這個網址的文章已經被我移除，不會再回來了。歡迎看看其他文章。</MutedParagraph>
      </PageHeading>
      <LinkRow
        links={[
          { href: "/posts", label: "所有文章" },
          { href: "/", label: "回到首頁" },
        ]}
      />
    </>
  );
}

export default async function PostPage({ params }: Props) {
  const result = await resolve(params);
  if (result.kind === "taken-down") return <TakenDown />;
  const { post } = result;
  const revision = post.latestRevision;
  const { Body, headings } = await compileMdx(post.body, bodyImageSources(post), slideDeckSource(post));
  return (
    <article>
      <JsonLd data={blogPosting(post)} />
      <PostCover post={post} sizes={bodyColumnSizes} preload className="aspect-[21/9] rounded-md" />
      {/* The table of contents hangs off the column's right edge, so the column never moves. */}
      <div className="relative">
        <PageHeading size="page" title={post.title}>
          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2 text-[13px] text-ink-soft">
            <time dateTime={isoDate(post.date)}>{isoDate(post.date)}</time>
            <TagList tags={post.tags} />
          </div>
          {revision && (
            <p className="border-l-2 border-accent pl-3.5 text-[15px] leading-[1.7] text-ink-soft">
              更新於{" "}
              <time dateTime={isoDate(revision.date)} className="text-[13px]">
                {isoDate(revision.date)}
              </time>
              ：{revision.note}
            </p>
          )}
        </PageHeading>
        <div className="prose prose-site max-w-none prose-h2:scroll-mt-6">
          <Body />
        </div>
        <FeedbackBlock slug={post.slug} />
        <footer className="mt-14 flex items-center gap-3.5 border-t border-rule pt-7">
          <Seal size="large" />
          <p className="grid leading-[1.6]">
            {/* The byline links to the About Page, so Readers and search engines can tell who wrote it. */}
            <Link
              href="/about"
              className="justify-self-start font-serif font-bold underline decoration-rule decoration-1 underline-offset-[5px] hover:decoration-accent"
            >
              Duncan Wen
            </Link>
            <span className="text-sm text-ink-soft">寫於 {formatDate(post.date)}</span>
          </p>
        </footer>
        <LinkRow
          className="mt-7"
          links={[
            { href: "/posts", label: "所有文章" },
            { href: contactFormHref, label: "聯絡我" },
          ]}
        />
        <TableOfContents headings={headings} />
      </div>
    </article>
  );
}
