"use client";

import { AnimationFigure } from "../animation-figure";
import { SCENE_FPS, SCENE_HEIGHT, SCENE_WIDTH } from "../job-shifts-animation/scene-kit";
import { AGENT_PARTS_CAPTION, AGENT_PARTS_STEPS } from "./agent-parts";
import { AGENT_PARTS_SECONDS, AgentPartsScene } from "./agent-parts-scene";

/**
 * The agent parts Animation, placed in a Post body as `<AgentPartsAnimation />`: one question
 * goes through an agent's brain and two tools, then the brain is marked bought and the tools built.
 */
export function AgentPartsAnimation() {
  return (
    <AnimationFigure
      scene={AgentPartsScene}
      width={SCENE_WIDTH}
      height={SCENE_HEIGHT}
      fps={SCENE_FPS}
      durationInFrames={AGENT_PARTS_SECONDS * SCENE_FPS}
      steps={AGENT_PARTS_STEPS}
      caption={AGENT_PARTS_CAPTION}
    />
  );
}
