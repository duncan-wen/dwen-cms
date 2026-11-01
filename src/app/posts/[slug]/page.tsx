import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { pageTitle, textLink } from "@/components/page-styles";
import { PostCover } from "@/components/post-cover";
import { Seal } from "@/components/seal";
import { TableOfContents } from "@/components/table-of-contents";
import { TagList } from "@/components/tag-list";
import { getContent } from "@/content/site-content";
import { formatDate } from "@/format-date";
import { compileMdx } from "@/mdx/compile-mdx";

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
  return { title: result.post.title, description: result.post.description };
}

/** Rendered for a taken-down Slug, which the proxy answers with 410 Gone. */
function TakenDown() {
  return (
    <>
      <h1 className={`${pageTitle} pt-8`}>這篇文章已移除</h1>
      <p className="mt-5 text-[17px] leading-[1.95] text-ink-soft">
        這個網址的文章已經被我移除，不會再回來了。歡迎看看其他文章。
      </p>
      <p className="mt-10 flex flex-wrap gap-7">
        <Link href="/posts" className={textLink}>
          所有文章
        </Link>
        <Link href="/" className={textLink}>
          回到首頁
        </Link>
      </p>
    </>
  );
}

export default async function PostPage({ params }: Props) {
  const result = await resolve(params);
  if (result.kind === "taken-down") return <TakenDown />;
  const { post } = result;
  const revision = post.latestRevision;
  const { Body, headings } = await compileMdx(post.body);
  return (
    <article>
      <PostCover slug={post.slug} className="aspect-[21/9] rounded-md" />
      {/* The table of contents hangs off the column's right edge, so the column never moves. */}
      <div className="relative">
        <header className="grid gap-[18px] pt-8 pb-10">
          <h1 className={pageTitle}>{post.title}</h1>
          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2 text-[13px] text-ink-soft">
            <time dateTime={post.date}>{post.date}</time>
            <TagList tags={post.tags} />
          </div>
          {revision && (
            <p className="border-l-2 border-accent pl-3.5 text-[15px] leading-[1.7] text-ink-soft">
              更新於{" "}
              <time dateTime={revision.date} className="text-[13px]">
                {revision.date}
              </time>
              ：{revision.note}
            </p>
          )}
        </header>
        <div className="prose prose-site max-w-none prose-h2:scroll-mt-6">
          <Body />
        </div>
        <footer className="mt-14 flex items-center gap-3.5 border-t border-rule pt-7">
          <Seal size="large" />
          <p className="grid leading-[1.6]">
            <b className="font-serif font-bold">Duncan Wen</b>
            <span className="text-sm text-ink-soft">寫於 {formatDate(post.date)}</span>
          </p>
        </footer>
        <p className="mt-7 flex flex-wrap gap-7">
          <Link href="/posts" className={textLink}>
            所有文章
          </Link>
          <Link href="/about#contact" className={textLink}>
            聯絡我
          </Link>
        </p>
        <TableOfContents headings={headings} />
      </div>
    </article>
  );
}
