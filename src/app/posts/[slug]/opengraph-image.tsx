import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import type { Post } from "@/content/content";
import { getContent } from "@/content/site-content";
import { generateCover } from "@/cover/cover";
import { ImageSeal, sealFont } from "@/og/image-seal";
import { type Colours, lightColours } from "@/og/token-colours";
import { serifFont } from "@/og/serif-font";
import { OgTitle, titleGlyphs } from "@/og/og-title";
import { OWNER_NAME } from "@/site-name";

type Props = { params: Promise<{ slug: string }> };

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `文章標題與 ${OWNER_NAME} 的印章`;

/** How far the title panel sits from the image's sides, and its own side padding, in pixels. */
const PANEL_INSET = 64;
const PANEL_PADDING_X = 56;

/** The glyphs the image draws besides the title and the seal: the Owner's name by the seal. */
const SIGNATURE_GLYPHS = OWNER_NAME;

export const dynamicParams = false;

/** One image per Published Post; previous and taken-down Slugs redirect or answer 410 instead. */
export async function generateStaticParams() {
  return (await getContent()).listPublishedPosts().map(({ slug }) => ({ slug }));
}

/**
 * A Post's social preview, generated at build time: its cover behind its title, signed
 * with the seal, so a shared link looks like the site. The cover is the Post's cover
 * image when it has one, else its generated cover's contour lines.
 */
export default async function OpenGraphImage({ params }: Props) {
  const { slug } = await params;
  const result = (await getContent()).resolveSlug(slug);
  if (result.kind !== "post") notFound();
  const { post } = result;
  const colours = await lightColours();
  const { paper, "paper-deep": paperDeep, ink } = colours;
  const cover = await coverLayer(post, colours);

  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: paperDeep }}>
      {cover}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "absolute",
          left: PANEL_INSET,
          right: PANEL_INSET,
          bottom: PANEL_INSET,
          minHeight: 300,
          padding: `48px ${PANEL_PADDING_X}px`,
          background: paper,
          borderRadius: 12,
          fontFamily: "Noto Serif TC",
          color: ink,
        }}
      >
        <OgTitle post={post} width={size.width - 2 * PANEL_INSET - 2 * PANEL_PADDING_X} />
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 36 }}>
          <ImageSeal size={52} colours={colours} />
          <div style={{ fontSize: 30, fontWeight: 700 }}>{SIGNATURE_GLYPHS}</div>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [await serifFont(700, titleGlyphs(post) + SIGNATURE_GLYPHS), await sealFont()],
    },
  );
}

/**
 * The image's full-bleed background: the Post's cover image, cropped to fill, or its
 * generated cover. A function, not a component: the image renderer can't await components.
 */
async function coverLayer({ slug, cover }: Pick<Post, "slug" | "cover">, colours: Colours) {
  const fill = { position: "absolute", inset: 0 } as const;
  if (cover) {
    const image = (await (await getContent()).readPostImage(slug, cover.file))!;
    const src = `data:${image.type};base64,${Buffer.from(image.bytes).toString("base64")}`;
    return <img src={src} alt="" width={size.width} height={size.height} style={{ ...fill, objectFit: "cover" }} />;
  }
  const { width, height, contours } = generateCover(slug);
  return (
    <svg
      width={size.width}
      height={size.height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      style={fill}
    >
      <g fill="none" stroke={colours.accent} strokeLinejoin="round">
        {contours.map(({ d, heavy }) => (
          <path key={d} d={d} strokeOpacity={heavy ? 0.85 : 0.38} strokeWidth={heavy ? 2.4 : 1.3} />
        ))}
      </g>
    </svg>
  );
}
