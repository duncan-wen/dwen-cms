import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeading } from "@/components/page-heading";
import { SeriesPostList } from "@/components/series-post-list";
import { getContent } from "@/content/site-content";
import { pageAlternates } from "@/page-alternates";

type Props = { params: Promise<{ id: string }> };

// A Series is derived from its Posts, never Published, so an id with no shown Series answers 404, not 410.
export const dynamicParams = false;

export async function generateStaticParams() {
  const content = await getContent();
  return content.listSeries().map(({ id }) => ({ id }));
}

async function findSeries(params: Props["params"]) {
  const { id } = await params;
  const series = (await getContent()).getSeries(id);
  if (series === undefined) notFound();
  return series;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const series = await findSeries(params);
  return {
    title: series.title,
    description: series.description,
    alternates: pageAlternates(`/series/${series.id}`),
  };
}

export default async function SeriesPage({ params }: Props) {
  const series = await findSeries(params);
  return (
    <>
      <PageHeading title={series.title} summary={series.description}>
        <p className="text-[13px] text-ink-soft">系列・共 {series.posts.length} 篇，由舊到新，從第 1 篇讀起。</p>
      </PageHeading>
      <SeriesPostList posts={series.posts} />
    </>
  );
}
