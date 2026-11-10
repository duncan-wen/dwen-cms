import { getContent } from "@/content/site-content";
import { standaloneIllustration } from "@/mdx/illustration-svg";
import { lightColours } from "@/og/token-colours";

type Context = { params: Promise<{ slug: string; file: string[] }> };

export const dynamic = "force-static";
export const dynamicParams = false;

/** Every file served next to a Post (its images and its Slide deck's PDF), written at build time next to its URL. */
export async function generateStaticParams() {
  const content = await getContent();
  return content
    .listPublishedPosts()
    .flatMap(({ slug }) => content.listPostFiles(slug).map((file) => ({ slug, file: file.split("/") })));
}

/**
 * A file stored next to a Post: an image, which next/image optimises from this URL, or a Slide
 * deck's download PDF. An Illustration opens in the light theme.
 */
export async function GET(_request: Request, { params }: Context) {
  const { slug, file } = await params;
  const served = await (await getContent()).readPostFile(slug, file.map(decodeURIComponent).join("/"));
  if (served === undefined) return new Response(null, { status: 404 });
  if (served.type === "image/svg+xml") {
    // Opened on its own, an Illustration has no page to define its colour tokens.
    const svg = standaloneIllustration(Buffer.from(served.bytes).toString("utf8"), await lightColours());
    return new Response(svg, { headers: { "Content-Type": served.type } });
  }
  return new Response(served.bytes as Uint8Array<ArrayBuffer>, {
    headers: { "Content-Type": served.type },
  });
}
