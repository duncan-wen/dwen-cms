import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { TagList } from "@/components/tag-list";
import { getContent } from "@/content/site-content";
import { formatDate } from "@/format-date";
import { MdxBody } from "@/mdx/mdx-body";

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
      <h1 className="text-3xl font-bold tracking-tight">這篇文章已移除</h1>
      <p className="mt-4 text-lg text-zinc-700">
        這個網址的文章已經被我移除，不會再回來了。歡迎看看其他文章。
      </p>
      <Link href="/posts" className="mt-10 inline-block font-medium hover:underline">
        所有文章 →
      </Link>
    </>
  );
}

export default async function PostPage({ params }: Props) {
  const result = await resolve(params);
  if (result.kind === "taken-down") return <TakenDown />;
  const { post } = result;
  return (
    <article className="prose prose-zinc max-w-none">
      <header className="not-prose mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
        <time dateTime={post.date} className="mt-2 block text-sm text-zinc-500">
          {formatDate(post.date)}
        </time>
        <TagList tags={post.tags} className="mt-3" />
      </header>
      <MdxBody source={post.body} />
    </article>
  );
}
