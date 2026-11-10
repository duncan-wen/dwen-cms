import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

/** The scene's size in its own pixels; the Player scales it to the column. */
export const SCENE_WIDTH = 420;
export const SCENE_HEIGHT = 345;
export const SCENE_FPS = 30;

/** When each step starts, in seconds; the scene holds the finished answer, then fades out and loops. */
const STEP_START = { question: 0, call: 1.6, rows: 4.4, answer: 6.2 } as const;
const HOLD_FROM = 8.4;
const FADE_FROM = 11.2;
const DURATION = 12;

export const SCENE_DURATION_IN_FRAMES = DURATION * SCENE_FPS;
/** The finished scene, before the fade: what readers who ask for reduced motion see. */
export const FINISHED_FRAME = HOLD_FROM * SCENE_FPS;

const QUESTION = "上個月哪個商品退貨最多？";
const ANSWER = "藍芽耳機，42 筆，是第二名的兩倍多。";
const ROWS = [
  { name: "藍芽耳機", count: 42 },
  { name: "行動電源", count: 17 },
] as const;

/** The tool call, as coloured runs; typed out across runs in order. */
const CALL: { text: string; colour?: string }[] = [
  { text: "query_orders", colour: "var(--code-function)" },
  { text: "({\n  month: " },
  { text: '"2026-10"', colour: "var(--code-string)" },
  { text: ", status: " },
  { text: '"returned"', colour: "var(--code-string)" },
  { text: "\n})" },
];
/** Where each run of the tool call starts, counted in characters from the call's start. */
const CALL_OFFSETS = CALL.reduce<number[]>((offsets, run, i) => [...offsets, offsets[i] + run.text.length], [0]);
const CALL_LENGTH = CALL_OFFSETS[CALL.length];

/** The space between steps, in the scene's pixels; the rail bridges it. */
const STEP_GAP = 14;

const CLAMPED = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
/** Every ease-in: fast, then settling. */
const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

/** How many characters of a typed line show, typing at about 18 characters a second from `start`. */
function useTyped(length: number, start: number) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const from = (start + 0.25) * fps;
  return Math.floor(interpolate(frame, [from, from + (length / 18) * fps], [0, length], CLAMPED));
}

type Props = {
  label: string;
  /** When the step eases in, in seconds. */
  start: number;
  /** When the next step eases in, in seconds; the rail grows down to it just before. Left out on the last step. */
  next?: number;
  children: ReactNode;
};

/** One step: a dot, a role label and its content, easing in at `start`, with the rail down to the next step's dot. */
function Step({ label, start, next, children }: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shown = interpolate(frame, [start * fps, (start + 0.35) * fps], [0, 1], { ...CLAMPED, easing: EASE_OUT });
  const railDrawn =
    next === undefined
      ? 0
      : interpolate(frame, [(next - 0.4) * fps, next * fps], [0, 1], { ...CLAMPED, easing: EASE_OUT });
  return (
    <div style={{ position: "relative", paddingLeft: 26, opacity: shown, translate: `0 ${(1 - shown) * 8}px` }}>
      {next !== undefined && (
        <span
          style={{
            position: "absolute",
            left: 6,
            top: 16,
            bottom: -STEP_GAP - 5,
            width: 1,
            background: "var(--ink-soft)",
            opacity: 0.5,
            scale: `1 ${railDrawn}`,
            transformOrigin: "top",
          }}
        />
      )}
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 5,
          width: 9,
          height: 9,
          borderRadius: "50%",
          background: "var(--paper)",
          border: "2px solid var(--accent)",
        }}
      />
      <div style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}

function Question() {
  const typed = useTyped(QUESTION.length, STEP_START.question);
  return <div style={{ fontSize: 17 }}>{QUESTION.slice(0, typed)}</div>;
}

function Call() {
  const typed = useTyped(CALL_LENGTH, STEP_START.call);
  const runs = CALL.map((run, i) => (
    <span key={i} style={{ color: run.colour }}>
      {run.text.slice(0, Math.max(0, typed - CALL_OFFSETS[i]))}
    </span>
  ));
  return (
    <pre
      style={{
        margin: 0,
        padding: "8px 12px",
        minHeight: 3 * 22 + 16, // the call's three lines, so the box doesn't grow as it types
        borderRadius: 6,
        background: "var(--paper-deep)",
        fontFamily: "var(--font-mono)",
        fontSize: 14,
        lineHeight: "22px",
        whiteSpace: "pre",
      }}
    >
      {runs}
    </pre>
  );
}

function Rows() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const most = ROWS[0].count;
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {ROWS.map((row, i) => {
        const from = (STEP_START.rows + 0.2 + i * 0.25) * fps;
        const grown = interpolate(frame, [from, from + 0.6 * fps], [0, 1], { ...CLAMPED, easing: EASE_OUT });
        return (
          <div
            key={row.name}
            style={{
              display: "grid",
              gridTemplateColumns: "72px 1fr 48px",
              alignItems: "center",
              gap: 10,
              fontSize: 15,
            }}
          >
            <span>{row.name}</span>
            <span
              style={{
                height: 8,
                borderRadius: 4,
                background: "var(--accent)",
                width: `${(row.count / most) * grown * 100}%`,
              }}
            />
            <span style={{ fontFamily: "var(--font-mono)", textAlign: "right", opacity: grown }}>{row.count} 筆</span>
          </div>
        );
      })}
    </div>
  );
}

function Answer() {
  const typed = useTyped(ANSWER.length, STEP_START.answer);
  return <div style={{ fontSize: 17, fontWeight: 700 }}>{ANSWER.slice(0, typed)}</div>;
}

/**
 * An AI agent answering a question by calling a tool: the question, the tool
 * call, the rows it returns and the answer, each easing in, then a hold and a
 * fade before the loop. Colours and fonts are the site's tokens.
 */
export function AgentScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const style: CSSProperties = {
    color: "var(--ink)",
    fontFamily: "var(--font-sans)",
    lineHeight: 1.5,
    opacity: interpolate(frame, [FADE_FROM * fps, DURATION * fps], [1, 0], CLAMPED),
  };
  return (
    <AbsoluteFill style={style}>
      <div style={{ display: "grid", gap: STEP_GAP }}>
        <Step label="使用者" start={STEP_START.question} next={STEP_START.call}>
          <Question />
        </Step>
        <Step label="呼叫工具" start={STEP_START.call} next={STEP_START.rows}>
          <Call />
        </Step>
        <Step label="工具回傳" start={STEP_START.rows} next={STEP_START.answer}>
          <Rows />
        </Step>
        <Step label="AI 回答" start={STEP_START.answer}>
          <Answer />
        </Step>
      </div>
    </AbsoluteFill>
  );
}
