import { getContent } from "@/content/site-content";

type Context = { params: Promise<{ slug: string; file: string[] }> };

export const dynamic = "force-static";
export const dynamicParams = false;

const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
};

/** Every image a Post uses (its cover and body images), written at build time next to its URL. */
export async function generateStaticParams() {
  return (await getContent()).listPublishedPosts().flatMap(({ slug, cover, images }) => {
    const files = new Set([cover, ...Object.values(images)].flatMap((image) => image?.file ?? []));
    return [...files].map((file) => ({ slug, file: file.split("/") }));
  });
}

/** An image stored next to a Post, which next/image optimises from this URL. */
export async function GET(_request: Request, { params }: Context) {
  const { slug, file } = await params;
  const path = file.map(decodeURIComponent).join("/");
  const bytes = await (await getContent()).readPostImage(slug, path);
  if (bytes === undefined) return new Response(null, { status: 404 });
  const type = CONTENT_TYPES[path.split(".").pop()?.toLowerCase() ?? ""] ?? "application/octet-stream";
  return new Response(bytes as Uint8Array<ArrayBuffer>, { headers: { "Content-Type": type } });
}
