import { compileMdx } from "./compile-mdx";

/** Renders an MDX body (server component). */
export async function MdxBody({ source }: { source: string }) {
  const { Body } = await compileMdx(source);
  return <Body />;
}
