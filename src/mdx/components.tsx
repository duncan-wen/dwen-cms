import type { MDXComponents } from "mdx/types";
import { AgentPartsAnimation } from "@/components/agent-parts-animation/agent-parts-animation";
import { CentralStockAnimation } from "@/components/oversell-animation/central-stock-animation";
import { JobShiftsAnimation } from "@/components/job-shifts-animation/job-shifts-animation";
import { OversellAnimation } from "@/components/oversell-animation/oversell-animation";
import { BodyImage } from "./body-image";
import { Callout } from "./callout";
import { Demo } from "./demo";
import { Mermaid } from "./mermaid";
import { SlideDeck } from "./slide-deck";

/**
 * The single component map every MDX body renders through: Markdown elements
 * it overrides, and the components a body may use by name. Phase-2 Demos plug
 * in here too. Code blocks are highlighted while compiling (compileMdx), which
 * also turns each ```mermaid block into a Mermaid diagram.
 */
export const mdxComponents: MDXComponents = {
  img: BodyImage,
  AgentPartsAnimation,
  Callout,
  CentralStockAnimation,
  Demo,
  JobShiftsAnimation,
  Mermaid,
  OversellAnimation,
  SlideDeck,
};
