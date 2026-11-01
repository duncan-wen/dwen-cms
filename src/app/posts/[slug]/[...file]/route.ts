import { getContent } from "@/content/site-content";

type Context = { params: Promise<{ slug: string; file: string[] }> };

export const dynamic = "force-static";
export const dynamicParams = false;

/** Every image a Post uses (its cover and body images), written at build time next to its URL. */
export async function generateStaticParams() {
  const content = await getContent();
  return content
    .listPublishedPosts()
    .flatMap(({ slug }) =>
      content.listPostImages(slug).map(({ file }) => ({ slug, file: file.split("/") })),
    );
}

/** An image stored next to a Post, which next/image optimises from this URL. */
export async function GET(_request: Request, { params }: Context) {
  const { slug, file } = await params;
  const image = await (await getContent()).readPostImage(slug, file.map(decodeURIComponent).join("/"));
  if (image === undefined) return new Response(null, { status: 404 });
  return new Response(image.bytes as Uint8Array<ArrayBuffer>, {
    headers: { "Content-Type": image.type },
  });
}
