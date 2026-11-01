import { compileMdx } from "./compile-mdx";

type Props = { source: string };

/** Renders an MDX body (server component). */
export async function MdxBody({ source }: Props) {
  const { Body } = await compileMdx(source);
  return <Body />;
}
