import type { CSSProperties } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { JOB_SHIFTS, JOB_SHIFTS_EXAMPLE, JOB_SHIFTS_HEADERS } from "./job-shifts";

/** The scene's size in its own pixels; the Player scales it to the reading column. */
export const SCENE_WIDTH = 500;
export const SCENE_HEIGHT = 330;
export const SCENE_FPS = 30;

/** Each era's row takes this long, in seconds, and they play one after another from ROW_LEAD. */
const ROW_SECONDS = 5.5;
const ROW_LEAD = 0.6;
/** Within a row, when each beat starts, in seconds from the row's start. */
const BEAT = { shown: 0, struck: 1.4, arrow: 2.1, risen: 2.8, example: 3.6 } as const;
/** The last row's beats end about 4 seconds in; the finished table then holds. */
const DURATION = ROW_LEAD + JOB_SHIFTS.length * ROW_SECONDS;

export const SCENE_DURATION_IN_FRAMES = Math.round(DURATION * SCENE_FPS);
/** The finished table, which is also the last frame: what Readers who ask for reduced motion see. */
export const FINISHED_FRAME = SCENE_DURATION_IN_FRAMES - 1;

/** The headers, era names and example line: the scene's small, soft text. */
const SMALL: CSSProperties = { fontSize: 20, color: "var(--ink-soft)" };

/** Column widths, in the scene's pixels: the work pushed out, the arrow, the work that rose. */
const COLUMNS = "190px 50px 1fr";
const CLAMPED = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

/** How far a beat has run, 0 to 1, over `seconds` from `start` seconds. */
function useBeat(start: number, seconds = 0.5) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return interpolate(frame, [start * fps, (start + seconds) * fps], [0, 1], { ...CLAMPED, easing: EASE_OUT });
}

function Header() {
  const shown = useBeat(0);
  const style = SMALL;
  return (
    <div style={{ display: "grid", gridTemplateColumns: COLUMNS, opacity: shown }}>
      <span style={style}>{JOB_SHIFTS_HEADERS.old}</span>
      <span />
      <span style={style}>{JOB_SHIFTS_HEADERS.new}</span>
    </div>
  );
}

type Props = {
  shift: (typeof JOB_SHIFTS)[number];
  /** When the row starts, in seconds. */
  start: number;
  /** Whether the example line shows under this row. */
  example: boolean;
};

/** One era: its name and old work appear, the old work greys out and is struck through, an arrow grows, the new work lights up. */
function Row({ shift, start, example }: Props) {
  const shown = useBeat(start + BEAT.shown);
  const struck = useBeat(start + BEAT.struck, 0.6);
  const arrow = useBeat(start + BEAT.arrow, 0.6);
  const risen = useBeat(start + BEAT.risen);
  const exampleShown = useBeat(start + BEAT.example);
  return (
    <div style={{ opacity: shown, translate: `0 ${(1 - shown) * 8}px` }}>
      <div style={{ ...SMALL, marginBottom: 2 }}>{shift.era}</div>
      <div style={{ display: "grid", gridTemplateColumns: COLUMNS, alignItems: "center", fontSize: 25 }}>
        <span style={{ position: "relative", justifySelf: "start", opacity: 1 - struck * 0.5 }}>
          {shift.old}
          <span
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "52%",
              height: 2,
              background: "var(--ink)",
              scale: `${struck} 1`,
              transformOrigin: "left",
            }}
          />
        </span>
        <Arrow drawn={arrow} />
        <span
          style={{
            color: "var(--accent)",
            fontWeight: 700,
            opacity: risen,
            translate: `${(1 - risen) * -10}px 0`,
          }}
        >
          {shift.new}
        </span>
      </div>
      {example && <div style={{ ...SMALL, marginTop: 2, opacity: exampleShown }}>{JOB_SHIFTS_EXAMPLE}</div>}
    </div>
  );
}

/** A right-pointing arrow that grows from the left as `drawn` runs 0 to 1. */
type ArrowProps = { drawn: number };

function Arrow({ drawn }: ArrowProps) {
  return (
    <svg width="40" height="14" viewBox="0 0 40 14" style={{ overflow: "visible" }}>
      <line
        x1="2"
        y1="7"
        x2={2 + 34 * drawn}
        y2="7"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity={drawn > 0 ? 1 : 0}
      />
      <polyline
        points={`${30 * drawn},2 ${36 * drawn},7 ${30 * drawn},12`}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={drawn > 0.6 ? 1 : 0}
      />
    </svg>
  );
}

/**
 * Three eras of work pushed out and work that rose, built row by row and held
 * as a finished table. Colours and fonts are the site's tokens.
 */
export function JobShiftsScene() {
  const style: CSSProperties = { color: "var(--ink)", fontFamily: "var(--font-sans)", lineHeight: 1.5 };
  return (
    <AbsoluteFill style={style}>
      <div style={{ display: "grid", gap: 16, padding: "4px 0" }}>
        <Header />
        {JOB_SHIFTS.map((shift, i) => (
          <Row key={shift.era} shift={shift} start={ROW_LEAD + i * ROW_SECONDS} example={i === JOB_SHIFTS.length - 1} />
        ))}
      </div>
    </AbsoluteFill>
  );
}
