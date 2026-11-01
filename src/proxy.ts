import { type NextRequest, NextResponse } from "next/server";

const takenDownSlugs = new Set(process.env.TAKEN_DOWN_SLUGS?.split(",").filter(Boolean));

/**
 * A page can't choose its own status, so a taken-down Slug's URL is
 * rewritten to itself with 410 Gone; the Post page renders the explanation.
 */
export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/")[2];
  if (!takenDownSlugs.has(slug)) return NextResponse.next();
  return NextResponse.rewrite(request.nextUrl, { status: 410 });
}

export const config = { matcher: "/posts/:slug" };
