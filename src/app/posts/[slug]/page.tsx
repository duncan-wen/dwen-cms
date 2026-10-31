import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent } from "@/content/site-content";
import { formatDate } from "@/format-date";
import { MdxBody } from "@/mdx/mdx-body";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const content = await getContent();
  return content.listPublishedPosts().map((post) => ({ slug: post.slug }));
}

async function findPost(params: Props["params"]) {
  const { slug } = await params;
  const result = (await getContent()).resolveSlug(slug);
  if (result.kind !== "post") notFound();
  return result.post;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await findPost(params);
  return { title: post.title, description: post.description };
}

export default async function PostPage({ params }: Props) {
  const post = await findPost(params);
  return (
    <article className="prose prose-zinc max-w-none">
      <header className="not-prose mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
        <time dateTime={post.date} className="mt-2 block text-sm text-zinc-500">
          {formatDate(post.date)}
        </time>
      </header>
      <MdxBody source={post.body} />
    </article>
  );
}
