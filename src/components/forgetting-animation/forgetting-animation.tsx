"use client";

import { AnimationFigure } from "../animation-figure";
import { SCENE_FPS, SCENE_HEIGHT, SCENE_WIDTH } from "../job-shifts-animation/scene-kit";
import { FORGETTING_CAPTION, FORGETTING_STEPS } from "./forgetting";
import { FORGETTING_SECONDS, ForgettingScene } from "./forgetting-scene";

/**
 * The forgetting Animation, placed in a Post body as `<ForgettingAnimation />`: one model learns
 * the company's product knowledge by full fine-tuning, by LoRA and by prompting with RAG, and
 * each way's cost to its other abilities shows beside the others.
 */
export function ForgettingAnimation() {
  return (
    <AnimationFigure
      scene={ForgettingScene}
      width={SCENE_WIDTH}
      height={SCENE_HEIGHT}
      fps={SCENE_FPS}
      durationInFrames={FORGETTING_SECONDS * SCENE_FPS}
      steps={FORGETTING_STEPS}
      caption={FORGETTING_CAPTION}
    />
  );
}
