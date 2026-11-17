"use client";

import { AnimationFigure } from "../animation-figure";
import { JOB_SHIFTS, JOB_SHIFTS_CAPTION, JOB_SHIFTS_EXAMPLE, JOB_SHIFTS_HEADERS } from "./job-shifts";
import { JobShiftsScene, SCENE_DURATION_IN_FRAMES, SCENE_FPS, SCENE_HEIGHT, SCENE_WIDTH } from "./job-shifts-scene";

const STEPS = [
  ...JOB_SHIFTS.map(
    (shift) => `${shift.era}：${JOB_SHIFTS_HEADERS.old}是${shift.old}，${JOB_SHIFTS_HEADERS.new}是${shift.new}。`,
  ),
  JOB_SHIFTS_EXAMPLE,
];

/**
 * The job shifts Animation, placed in a Post body as `<JobShiftsAnimation />`: three illustrated
 * scenes of work pushed out and work that rose, ending on the summary. Screen readers get the
 * same table as a list.
 */
export function JobShiftsAnimation() {
  return (
    <AnimationFigure
      scene={JobShiftsScene}
      width={SCENE_WIDTH}
      height={SCENE_HEIGHT}
      fps={SCENE_FPS}
      durationInFrames={SCENE_DURATION_IN_FRAMES}
      steps={STEPS}
      caption={JOB_SHIFTS_CAPTION}
    />
  );
}
