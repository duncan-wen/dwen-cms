"use client";

import { Player } from "@remotion/player";
import { useSyncExternalStore } from "react";
import {
  AgentScene,
  FINISHED_FRAME,
  SCENE_DURATION_IN_FRAMES,
  SCENE_FPS,
  SCENE_HEIGHT,
  SCENE_WIDTH,
} from "./agent-scene";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Whether the reader asked for reduced motion; null on the server, where it isn't known yet. */
function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => null,
  );
}

/**
 * The home page's animation of an AI agent calling a tool, drawn live by
 * Remotion's Player so it follows the theme. It loops muted with no controls;
 * readers who ask for reduced motion get its finished frame, still. The
 * caption says what it shows, for everyone and for screen readers.
 */
export function AgentAnimation() {
  const reducedMotion = useReducedMotion();
  return (
    <figure className="grid gap-2">
      <div aria-hidden="true" style={{ aspectRatio: `${SCENE_WIDTH} / ${SCENE_HEIGHT}` }}>
        {reducedMotion !== null && (
          <Player
            key={String(reducedMotion)}
            component={AgentScene}
            durationInFrames={SCENE_DURATION_IN_FRAMES}
            fps={SCENE_FPS}
            compositionWidth={SCENE_WIDTH}
            compositionHeight={SCENE_HEIGHT}
            initialFrame={reducedMotion ? FINISHED_FRAME : 0}
            autoPlay={!reducedMotion}
            loop
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
      <figcaption className="text-[13px] text-ink-soft">示意動畫：AI agent 呼叫工具查資料後回答，資料是虛構的。</figcaption>
    </figure>
  );
}
