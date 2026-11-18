import type { ReactNode } from "react";
import { ACCENT, BLUE, INK, SceneCanvas, SOFT, type Point } from "../job-shifts-animation/scene-kit";
import { Box, LEG_SECONDS, type Rect, span, type Trip, Trips, useSeconds, Wire } from "../oversell-animation/flow-kit";
import { AGENT_PARTS_LABELS as LABELS } from "./agent-parts";

/** How long the scene runs, in seconds; it holds its finished frame for the last three. */
export const AGENT_PARTS_SECONDS = 12;

const QUESTION_Y = 32;
const BRAIN: Rect = { x: 20, y: 52, width: 150, height: 56 };
const TOOLS = [
  { box: { x: 20, y: 144, width: 210, height: 66 }, ...LABELS.order },
  { box: { x: 270, y: 144, width: 210, height: 66 }, ...LABELS.shipping },
];
/** The line each tool's result shows on, under the tools. */
const RESULT_Y = 238;
/** The frame drawn round both tools and their results once they are marked built, and its tag under it. */
const BUILT_FRAME: Rect = { x: 8, y: 130, width: 484, height: 122 };
const BUILT_TAG_Y = 280;
const BOUGHT_TAG: Point = { x: 190, y: 86 };
const ANSWER: Point = { x: 20, y: 322 };
/** The gap between the two tools, where the answer travels down. */
const LANE_X = 250;

const centre = (box: Rect) => box.x + box.width / 2;
const top = (box: Rect): Point => ({ x: centre(box), y: box.y });
const brainFoot: Point = { x: centre(BRAIN), y: BRAIN.y + BRAIN.height };

/** When each beat starts, in seconds. */
const ASK = 0.8;
const CALLS = [1.6, 3.2];
const REPLY = 4.8;
const MARK_BOUGHT = 7;
const MARK_BUILT = 8.4;
/** How long a tool takes to look its answer up once the call lands. */
const LOOKUP = 0.3;

/** A request is drawn as three dots in a row, a short pulse, each at flow-kit's one pace. */
const PULSE = [0, 0.08, 0.16];
const pulse = (start: number, path: Point[]): Trip[] =>
  PULSE.map((delay) => ({ start: start + delay, path, colours: path.slice(1).map(() => BLUE) }));

/** When a tool's result shows: its one-leg call has landed and it has looked. */
const resultAt = (call: number) => call + LEG_SECONDS + LOOKUP;

const TRIPS: Trip[] = [
  ...pulse(ASK, [
    { x: 60, y: QUESTION_Y + 8 },
    { x: 60, y: BRAIN.y },
  ]),
  ...CALLS.flatMap((call, i) => [
    ...pulse(call, [brainFoot, top(TOOLS[i].box)]),
    ...pulse(resultAt(call), [top(TOOLS[i].box), brainFoot]),
  ]),
  ...pulse(REPLY, [
    { x: BRAIN.x + BRAIN.width, y: BRAIN.y + BRAIN.height / 2 },
    { x: LANE_X, y: BRAIN.y + BRAIN.height / 2 },
    { x: LANE_X, y: ANSWER.y - 24 },
    { x: 120, y: ANSWER.y - 24 },
  ]),
];
/** The answer shows once its three-leg pulse has arrived. */
const ANSWER_AT = REPLY + 3 * LEG_SECONDS;

type CrossfadeProps = { from: string; to: string; turn: number; children: (colour: string) => ReactNode };

/** A part drawn twice, its first colour fading into its second as `turn` goes 0 to 1. */
function Crossfade({ from, to, turn, children }: CrossfadeProps) {
  return (
    <g>
      <g opacity={1 - turn}>{children(from)}</g>
      <g opacity={turn}>{children(to)}</g>
    </g>
  );
}

/**
 * One question through an agent: the brain asks 查訂單 and 查物流 in turn, each reaching a company
 * system, and answers; then the brain is marked as bought and the two tools as built.
 */
export function AgentPartsScene() {
  const now = useSeconds();
  const bought = span(now, MARK_BOUGHT, MARK_BOUGHT + 0.5);
  const built = span(now, MARK_BUILT, MARK_BUILT + 0.5);
  return (
    <SceneCanvas name="agent-parts">
      <g opacity={span(now, 0, 0.6)}>
        <text x={20} y={QUESTION_Y} fontSize={20} fill={INK}>
          {LABELS.question}
        </text>
        {TOOLS.map(({ box }) => (
          <Wire key={box.x} from={brainFoot} to={top(box)} />
        ))}
        <Crossfade from={INK} to={SOFT} turn={bought}>
          {(colour) => <Box {...BRAIN} label={LABELS.brain} colour={colour} />}
        </Crossfade>
        <Crossfade from={INK} to={ACCENT} turn={built}>
          {(colour) => (
            <g>
              {TOOLS.map(({ box, tool, system }) => (
                <Box key={box.x} {...box} label={tool} detail={system} colour={colour} />
              ))}
            </g>
          )}
        </Crossfade>
        <Trips trips={TRIPS} now={now} />
      </g>
      {TOOLS.map(({ box, result }, i) => (
        <text
          key={box.x}
          x={centre(box)}
          y={RESULT_Y}
          textAnchor="middle"
          fontSize={19}
          fill={INK}
          opacity={span(now, resultAt(CALLS[i]), resultAt(CALLS[i]) + 0.4)}
        >
          {result}
        </text>
      ))}
      <text
        x={ANSWER.x}
        y={ANSWER.y}
        fontSize={20}
        fontWeight={700}
        fill={INK}
        opacity={span(now, ANSWER_AT, ANSWER_AT + 0.4)}
      >
        {LABELS.answer}
      </text>
      <text
        x={BOUGHT_TAG.x}
        y={BOUGHT_TAG.y}
        fontSize={19}
        fill={SOFT}
        opacity={span(now, MARK_BOUGHT + 0.2, MARK_BOUGHT + 0.7)}
      >
        {LABELS.bought}
      </text>
      <g opacity={built}>
        <rect {...BUILT_FRAME} rx={14} fill="none" stroke={ACCENT} strokeWidth={2} strokeDasharray="7 5" />
        <text x={centre(BUILT_FRAME)} y={BUILT_TAG_Y} textAnchor="middle" fontSize={19} fontWeight={600} fill={ACCENT}>
          {LABELS.built}
        </text>
      </g>
    </SceneCanvas>
  );
}
