import { getContent } from "@/content/site-content";
import { coverSvg } from "@/cover/cover";

type Context = { params: Promise<{ file: string }> };

export const dynamic = "force-static";
export const dynamicParams = false;

/** One cover file per Published Post, written at build time: `/covers/<slug>.svg`. */
export async function generateStaticParams() {
  return (await getContent()).listPublishedPosts().map(({ slug }) => ({ file: `${slug}.svg` }));
}

/** A Post's generated cover as an SVG file, which PostCover uses as a CSS mask. */
export async function GET(_request: Request, { params }: Context) {
  const slug = (await params).file.replace(/\.svg$/, "");
  return new Response(coverSvg(slug), { headers: { "Content-Type": "image/svg+xml" } });
}
