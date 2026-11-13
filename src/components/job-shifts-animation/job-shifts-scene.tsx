import type { ComponentType, ReactNode } from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { AI_SECONDS, AiScene } from "./ai-scene";
import { COMPUTER_SECONDS, ComputerScene } from "./computer-scene";
import { INDUSTRIAL_SECONDS, IndustrialScene } from "./industrial-scene";
import { CLAMPED, SCENE_HEIGHT, SCENE_WIDTH } from "./scene-kit";
import { SUMMARY_SECONDS, SummaryScene } from "./summary-scene";

export { SCENE_HEIGHT, SCENE_WIDTH };
export const SCENE_FPS = 30;

/** The scenes in the order they play, each for its own length; the summary comes last and holds. */
const SCENES: { Scene: ComponentType; seconds: number }[] = [
  { Scene: IndustrialScene, seconds: INDUSTRIAL_SECONDS },
  { Scene: ComputerScene, seconds: COMPUTER_SECONDS },
  { Scene: AiScene, seconds: AI_SECONDS },
  { Scene: SummaryScene, seconds: SUMMARY_SECONDS },
];
const STARTS = SCENES.reduce<number[]>((starts, { seconds }, i) => [...starts, starts[i] + seconds], [0]);

export const SCENE_DURATION_IN_FRAMES = Math.round(STARTS[SCENES.length] * SCENE_FPS);
/** The summary, which is also the last frame: what Readers who ask for reduced motion see. */
export const FINISHED_FRAME = SCENE_DURATION_IN_FRAMES - 1;

/** How long a scene takes to turn in or out, in seconds. */
const TURN_SECONDS = 0.35;

type SceneTurnProps = { seconds: number; last: boolean; children: ReactNode };

/** One scene turning like a page: it slides in, and slides out unless it is the last. */
function SceneTurn({ seconds, last, children }: SceneTurnProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const turn = TURN_SECONDS * fps;
  const end = seconds * fps;
  const inward = interpolate(frame, [0, turn], [0, 1], CLAMPED);
  const outward = last ? 0 : interpolate(frame, [end - turn, end], [0, 1], CLAMPED);
  return (
    <AbsoluteFill style={{ opacity: inward * (1 - outward), translate: `${(1 - inward) * 14 - outward * 14}px 0` }}>
      {children}
    </AbsoluteFill>
  );
}

/**
 * Three shifts in work, told as scenes (工業革命, 電腦普及, AI), each turning
 * like a page, then the summary of all three, which holds.
 */
export function JobShiftsScene() {
  return (
    <AbsoluteFill>
      {SCENES.map(({ Scene, seconds }, i) => {
        const last = i === SCENES.length - 1;
        return (
          <Sequence
            key={i}
            from={Math.round(STARTS[i] * SCENE_FPS)}
            durationInFrames={last ? Infinity : Math.round(seconds * SCENE_FPS)}
          >
            <SceneTurn seconds={seconds} last={last}>
              <Scene />
            </SceneTurn>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}
