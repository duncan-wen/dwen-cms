"use client";

import { AnimationFigure } from "../animation-figure";
import { SCENE_HEIGHT, SCENE_WIDTH } from "../job-shifts-animation/scene-kit";
import { OVERSELL_CAPTION, OVERSELL_STEPS, SCENE_FPS } from "./oversell";
import { OVERSELL_SECONDS, OversellScene } from "./oversell-scene";

/**
 * The oversell Animation, placed in a Post body as `<OversellAnimation />`: 3 copies of a shop,
 * each with its own ledger of 100, sell 300 between them.
 */
export function OversellAnimation() {
  return (
    <AnimationFigure
      scene={OversellScene}
      width={SCENE_WIDTH}
      height={SCENE_HEIGHT}
      fps={SCENE_FPS}
      durationInFrames={OVERSELL_SECONDS * SCENE_FPS}
      steps={OVERSELL_STEPS}
      caption={OVERSELL_CAPTION}
    />
  );
}
