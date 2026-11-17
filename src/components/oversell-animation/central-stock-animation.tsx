"use client";

import { AnimationFigure } from "../animation-figure";
import { SCENE_HEIGHT, SCENE_WIDTH } from "../job-shifts-animation/scene-kit";
import { CENTRAL_STOCK_CAPTION, CENTRAL_STOCK_STEPS, SCENE_FPS } from "./oversell";
import { CENTRAL_STOCK_SECONDS, CentralStockScene } from "./central-stock-scene";

/**
 * The central-stock Animation, placed in a Post body as `<CentralStockAnimation />`: the stock moved
 * to one central service sells exactly 100, then that service goes down and every request fails.
 */
export function CentralStockAnimation() {
  return (
    <AnimationFigure
      scene={CentralStockScene}
      width={SCENE_WIDTH}
      height={SCENE_HEIGHT}
      fps={SCENE_FPS}
      durationInFrames={CENTRAL_STOCK_SECONDS * SCENE_FPS}
      steps={CENTRAL_STOCK_STEPS}
      caption={CENTRAL_STOCK_CAPTION}
    />
  );
}
