import type { ReactNode } from "react";
import { ACCENT, BLUE, INK, SceneCanvas, SOFT, type Point } from "../job-shifts-animation/scene-kit";
import { Box, type Rect, span, type Trip, Trips, useSeconds, Wire } from "../oversell-animation/flow-kit";
import { AGENT_PARTS_LABELS as LABELS } from "./agent-parts";

/** How long the scene runs, in seconds; it holds its finished frame for the last three. */
export const AGENT_PARTS_SECONDS = 12;

const BRAIN: Rect = { x: 20, y: 60, width: 150, height: 66 };
const ORDER: Rect = { x: 20, y: 168, width: 210, height: 66 };
const SHIPPING: Rect = { x: 270, y: 168, width: 210, height: 66 };

const brainFoot: Point = { x: BRAIN.x + BRAIN.width / 2, y: BRAIN.y + BRAIN.height };
const top = (box: Rect): Point => ({ x: box.x + box.width / 2, y: box.y });
const centre = (box: Rect) => box.x + box.width / 2;

/** When each beat starts, in seconds. */
const ASK = 0.8;
const CALL_ORDER = 1.6;
const CALL_SHIPPING = 3.2;
/** How long a tool takes to answer once the call lands. */
const LOOKUP = 0.3;
const ANSWER = 4.8;
const MARK_BOUGHT = 7;
const MARK_BUILT = 8.4;

/** A request is drawn as three dots in a row, a short pulse. */
const PULSE = [0, 0.08, 0.16];
const pulse = (start: number, path: Point[]): Trip[] =>
  PULSE.map((delay) => ({ start: start + delay, path, colours: path.slice(1).map(() => BLUE) }));

/** The call to a tool goes down from the brain; its answer comes back up after the lookup. */
const call = (start: number, tool: Rect) => [
  ...pulse(start, [brainFoot, top(tool)]),
  ...pulse(start + 0.25 + LOOKUP + 0.25, [top(tool), brainFoot]),
];

const ANSWER_AT: Point = { x: 20, y: 300 };
const TRIPS: Trip[] = [
  ...pulse(ASK, [
    { x: 60, y: 44 },
    { x: BRAIN.x + 40, y: BRAIN.y },
  ]),
  ...call(CALL_ORDER, ORDER),
  ...call(CALL_SHIPPING, SHIPPING),
  ...pulse(ANSWER, [
    { x: BRAIN.x + BRAIN.width, y: BRAIN.y + BRAIN.height / 2 },
    { x: 250, y: BRAIN.y + BRAIN.height / 2 },
    { x: 250, y: 284 },
    { x: 120, y: 284 },
  ]),
];

/** When a tool's result shows under it: once its call has landed and it has looked. */
const resultAt = (start: number) => start + 0.25 + LOOKUP;

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
  const shown = span(now, 0, 0.6);
  const thinking = span(now, ASK + 0.4, ASK + 0.8);
  const bought = span(now, MARK_BOUGHT, MARK_BOUGHT + 0.5);
  const built = span(now, MARK_BUILT, MARK_BUILT + 0.5);
  return (
    <SceneCanvas name="agent-parts">
      <g opacity={shown}>
        <text x={20} y={36} fontSize={20} fill={INK}>
          {LABELS.question}
        </text>
        <Wire from={brainFoot} to={top(ORDER)} />
        <Wire from={brainFoot} to={top(SHIPPING)} />
        <Crossfade from={INK} to={SOFT} turn={bought}>
          {(colour) => (
            <Box {...BRAIN} label={LABELS.brain} detail={thinking > 0 ? LABELS.thinking : undefined} colour={colour} />
          )}
        </Crossfade>
        <Crossfade from={INK} to={ACCENT} turn={built}>
          {(colour) => (
            <g>
              <Box {...ORDER} label={LABELS.order.tool} detail={LABELS.order.system} colour={colour} />
              <Box {...SHIPPING} label={LABELS.shipping.tool} detail={LABELS.shipping.system} colour={colour} />
            </g>
          )}
        </Crossfade>
        <Trips trips={TRIPS} now={now} />
      </g>
      <text
        x={centre(ORDER)}
        y={262}
        textAnchor="middle"
        fontSize={19}
        fill={INK}
        opacity={span(now, resultAt(CALL_ORDER), resultAt(CALL_ORDER) + 0.4)}
      >
        {LABELS.order.result}
      </text>
      <text
        x={centre(SHIPPING)}
        y={262}
        textAnchor="middle"
        fontSize={19}
        fill={INK}
        opacity={span(now, resultAt(CALL_SHIPPING), resultAt(CALL_SHIPPING) + 0.4)}
      >
        {LABELS.shipping.result}
      </text>
      <text
        x={ANSWER_AT.x}
        y={ANSWER_AT.y}
        fontSize={20}
        fontWeight={700}
        fill={INK}
        opacity={span(now, ANSWER + 0.6, ANSWER + 1)}
      >
        {LABELS.answer}
      </text>
      <text x={190} y={100} fontSize={19} fill={SOFT} opacity={span(now, MARK_BOUGHT + 0.2, MARK_BOUGHT + 0.7)}>
        {LABELS.bought}
      </text>
      <text
        x={250}
        y={332}
        textAnchor="middle"
        fontSize={19}
        fontWeight={600}
        fill={ACCENT}
        opacity={span(now, MARK_BUILT + 0.2, MARK_BUILT + 0.7)}
      >
        {LABELS.built}
      </text>
    </SceneCanvas>
  );
}
