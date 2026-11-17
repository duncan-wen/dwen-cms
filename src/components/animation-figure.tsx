"use client";

import { Player, type PlayerRef } from "@remotion/player";
import { type ComponentType, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./use-reduced-motion";

/** Waiting for the Reader to scroll to it, playing, finished on its last frame, or still for reduced motion. */
type Playback = "waiting" | "playing" | "finished" | "still";

/** How much of the animation must be on screen before it starts. */
const START_WHEN_VISIBLE = 0.5;

type Props = {
  /** The Remotion composition drawn in the page. */
  scene: ComponentType;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  /** What the animation shows, step by step, for screen readers. */
  steps: string[];
  /** The visible caption under it, starting 「示意動畫：」. */
  caption: string;
};

/**
 * An Animation in a Post body: a scene drawn live by Remotion's Player, so it follows the theme.
 * It plays once, silently, when half of it is on screen, holds its last frame and offers
 * 「重播」. Readers who ask for reduced motion get the last frame, still. Screen readers get
 * `steps` as a list in its place. `data-playback` tells the smoke tests which state it is in.
 */
export function AnimationFigure({ scene, width, height, fps, durationInFrames, steps, caption }: Props) {
  const reducedMotion = useReducedMotion();
  const player = useRef<PlayerRef>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState<Exclude<Playback, "still">>("waiting");
  const playback: Playback = reducedMotion ? "still" : progress;

  useEffect(() => {
    if (reducedMotion !== false) return;
    const instance = player.current;
    const box = viewport.current;
    if (!instance || !box) return;
    const onEnded = () => setProgress("finished");
    instance.addEventListener("ended", onEnded);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        instance.play();
        setProgress("playing");
      },
      { threshold: START_WHEN_VISIBLE },
    );
    observer.observe(box);
    return () => {
      observer.disconnect();
      instance.removeEventListener("ended", onEnded);
    };
  }, [reducedMotion]);

  function replay() {
    player.current?.seekTo(0);
    player.current?.play();
    setProgress("playing");
  }

  return (
    <figure className="not-prose relative my-8 grid max-w-[500px] gap-2" data-animation data-playback={playback}>
      <div>
        <div ref={viewport} aria-hidden="true" style={{ aspectRatio: `${width} / ${height}` }}>
          {reducedMotion !== null && (
            <Player
              key={String(reducedMotion)}
              ref={player}
              component={scene}
              durationInFrames={durationInFrames}
              fps={fps}
              compositionWidth={width}
              compositionHeight={height}
              initialFrame={reducedMotion ? durationInFrames - 1 : 0}
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
            className="absolute right-0 -bottom-1 rounded-md border border-rule px-3 py-1 text-[13px] text-ink-soft hover:text-ink"
          >
            重播
          </button>
        )}
      </div>
      <ul className="sr-only">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ul>
      <figcaption className="pr-16 text-[13px] text-ink-soft">{caption}</figcaption>
    </figure>
  );
}
