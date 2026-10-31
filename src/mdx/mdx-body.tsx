import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { mdxComponents } from "./components";

/** Renders an MDX body (server component). */
export async function MdxBody({ source }: { source: string }) {
  const { default: Body } = await evaluate(source, { ...runtime });
  return <Body components={mdxComponents} />;
}
