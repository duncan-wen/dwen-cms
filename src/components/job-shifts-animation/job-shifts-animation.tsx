"use client";

import { Player, type PlayerRef } from "@remotion/player";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../use-reduced-motion";
import { JOB_SHIFTS, JOB_SHIFTS_CAPTION, JOB_SHIFTS_EXAMPLE, JOB_SHIFTS_HEADERS } from "./job-shifts";
import {
  FINISHED_FRAME,
  JobShiftsScene,
  SCENE_DURATION_IN_FRAMES,
  SCENE_FPS,
  SCENE_HEIGHT,
  SCENE_WIDTH,
} from "./job-shifts-scene";

/** Waiting for the Reader to scroll to it, playing, finished on the full table, or still for reduced motion. */
type Playback = "waiting" | "playing" | "finished" | "still";

/** How much of the animation must be on screen before it starts. */
const START_WHEN_VISIBLE = 0.5;

/**
 * The job shifts Animation, placed in a Post body as `<JobShiftsAnimation />`:
 * three eras of work pushed out and work that rose, drawn live by Remotion's
 * Player so it follows the theme. It plays once, silently, when half of it is
 * on screen, holds the finished table and offers 「重播」. Readers who ask for
 * reduced motion get the finished table, still. Screen readers get the same
 * table as a list.
 */
export function JobShiftsAnimation() {
  const reducedMotion = useReducedMotion();
  const player = useRef<PlayerRef>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [played, setPlayed] = useState<Exclude<Playback, "still">>("waiting");
  const playback: Playback = reducedMotion ? "still" : played;

  useEffect(() => {
    if (reducedMotion !== false) return;
    const ref = player.current;
    const box = frame.current;
    if (!ref || !box) return;
    const onEnded = () => setPlayed("finished");
    ref.addEventListener("ended", onEnded);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        ref.play();
        setPlayed("playing");
      },
      { threshold: START_WHEN_VISIBLE },
    );
    observer.observe(box);
    return () => {
      observer.disconnect();
      ref.removeEventListener("ended", onEnded);
    };
  }, [reducedMotion]);

  function replay() {
    player.current?.seekTo(0);
    player.current?.play();
    setPlayed("playing");
  }

  return (
    <figure className="not-prose my-8 grid max-w-[500px] gap-2" data-playback={playback}>
      <div className="relative">
        <div ref={frame} aria-hidden="true" style={{ aspectRatio: `${SCENE_WIDTH} / ${SCENE_HEIGHT}` }}>
          {reducedMotion !== null && (
            <Player
              key={String(reducedMotion)}
              ref={player}
              component={JobShiftsScene}
              durationInFrames={SCENE_DURATION_IN_FRAMES}
              fps={SCENE_FPS}
              compositionWidth={SCENE_WIDTH}
              compositionHeight={SCENE_HEIGHT}
              initialFrame={reducedMotion ? FINISHED_FRAME : 0}
              moveToBeginningWhenEnded={false}
              controls={false}
              clickToPlay={false}
              doubleClickToFullscreen={false}
              spaceKeyToPlayOrPause={false}
              initiallyMuted
              numberOfSharedAudioTags={0}
              acknowledgeRemotionLicense
              style={{ width: "100%" }}
            />
          )}
        </div>
        {playback === "finished" && (
          <button
            type="button"
            onClick={replay}
            className="absolute right-0 bottom-0 rounded-md border border-rule px-3 py-1 text-[13px] text-ink-soft hover:text-ink"
          >
            重播
          </button>
        )}
      </div>
      <ul className="sr-only">
        {JOB_SHIFTS.map((shift) => (
          <li key={shift.era}>
            {shift.era}：{JOB_SHIFTS_HEADERS.old}是{shift.old}，{JOB_SHIFTS_HEADERS.new}是{shift.new}。
          </li>
        ))}
        <li>{JOB_SHIFTS_EXAMPLE}</li>
      </ul>
      <figcaption className="text-[13px] text-ink-soft">{JOB_SHIFTS_CAPTION}</figcaption>
    </figure>
  );
}
