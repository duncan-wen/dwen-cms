import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getContent } from "@/content/site-content";
import { generateCover } from "@/cover/cover";
import { lightColours } from "@/og/light-colours";
import { serifFont } from "@/og/serif-font";

type Props = { params: Promise<{ slug: string }> };

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "文章標題與 Duncan Wen 的印章";

const SIGNATURE = "溫Duncan Wen";

export const dynamicParams = false;

/** One image per Published Post; previous and taken-down Slugs redirect or answer 410 instead. */
export async function generateStaticParams() {
  return (await getContent()).listPublishedPosts().map(({ slug }) => ({ slug }));
}

/**
 * A Post's social preview, generated at build time: its cover's contour lines behind
 * its title, signed with the seal, so a shared link looks like the site.
 */
export default async function OpenGraphImage({ params }: Props) {
  const { slug } = await params;
  const result = (await getContent()).resolveSlug(slug);
  if (result.kind !== "post") notFound();
  const { title } = result.post;
  const cover = generateCover(slug);
  const { paper, "paper-deep": paperDeep, ink, accent, "on-accent": onAccent } = await lightColours();

  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: paperDeep }}>
      <svg
        width={size.width}
        height={size.height}
        viewBox={`0 0 ${cover.width} ${cover.height}`}
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0 }}
      >
        <g fill="none" stroke={accent} strokeLinejoin="round">
          {cover.contours.map(({ d, heavy }) => (
            <path
              key={d}
              d={d}
              strokeOpacity={heavy ? 0.85 : 0.38}
              strokeWidth={heavy ? 2.4 : 1.3}
            />
          ))}
        </g>
      </svg>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "absolute",
          left: 64,
          right: 64,
          bottom: 64,
          minHeight: 300,
          padding: "48px 56px",
          background: paper,
          borderRadius: 12,
          fontFamily: "Noto Serif TC",
          color: ink,
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.35, letterSpacing: "0.02em" }}>
          {title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 36 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: 5,
              background: accent,
              color: onAccent,
              fontSize: 33,
              fontWeight: 900,
            }}
          >
            溫
          </div>
          <div style={{ fontSize: 30, fontWeight: 700 }}>Duncan Wen</div>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [await serifFont(700, title + SIGNATURE), await serifFont(900, "溫")],
    },
  );
}
