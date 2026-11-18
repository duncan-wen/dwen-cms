import { ACCENT, BLUE, EASE_IN_OUT, INK, RULE, SceneCanvas, SOFT } from "../job-shifts-animation/scene-kit";
import { span, useSeconds, WARN } from "../oversell-animation/flow-kit";
import { ABILITIES, METHODS, START } from "./forgetting";

/** How long the scene runs, in seconds; it holds its finished frame for the last two. */
export const FORGETTING_SECONDS = 13;

/** The row labels' left edge, and where the first column starts. */
const LABEL_X = 20;
const GRID_X = 142;
const COLUMN_WIDTH = 112;
const COLUMN_GAP = 7;
/** A full bar: an ability of 100. */
const BAR_MAX = 104;
const BAR_HEIGHT = 28;
const HEADER_Y = 40;
const FIRST_ROW_Y = 66;
const ROW_STEP = 60;
const NOTE_Y = 322;

/** When the first column starts to move, how long each column moves, and the gap between columns. */
const FIRST_MOVE = 0.8;
const MOVE_SECONDS = 2.2;
const COLUMN_EVERY = 3.6;
/** How far below its start a bar must fall before it shows the warning colour. */
const FORGOTTEN = 15;

const columnX = (column: number) => GRID_X + column * (COLUMN_WIDTH + COLUMN_GAP);
const rowY = (row: number) => FIRST_ROW_Y + row * ROW_STEP;

type BarProps = { x: number; y: number; start: number; value: number; target: boolean };

/** One ability in one column: a faint outline of where it started, and the bar where it is now. */
function Bar({ x, y, start, value, target }: BarProps) {
  const forgotten = value < start - FORGOTTEN;
  const fill = target ? ACCENT : forgotten ? WARN : BLUE;
  return (
    <g>
      <rect x={x} y={y} width={BAR_MAX} height={BAR_HEIGHT} rx={4} fill="none" stroke={RULE} strokeWidth={1} />
      <rect x={x} y={y} width={(BAR_MAX * value) / 100} height={BAR_HEIGHT} rx={4} fill={fill} />
      <line
        x1={x + (BAR_MAX * start) / 100}
        x2={x + (BAR_MAX * start) / 100}
        y1={y - 4}
        y2={y + BAR_HEIGHT + 4}
        stroke={SOFT}
        strokeWidth={2}
        strokeDasharray="3 3"
      />
    </g>
  );
}

/**
 * One model learning the company's product knowledge three ways, a column each, played in turn:
 * full fine-tuning learns most and forgets most, LoRA learns less and forgets less, prompting with
 * RAG leaves the model as it was.
 */
export function ForgettingScene() {
  const now = useSeconds();
  return (
    <SceneCanvas name="forgetting">
      <g opacity={span(now, 0, 0.6)}>
        {ABILITIES.map((ability, row) => (
          <text key={ability} x={LABEL_X} y={rowY(row) + 21} fontSize={19} fill={row === 0 ? ACCENT : INK}>
            {ability}
          </text>
        ))}
        {METHODS.map(({ name, after }, column) => {
          const begins = FIRST_MOVE + column * COLUMN_EVERY;
          const moved = EASE_IN_OUT(span(now, begins, begins + MOVE_SECONDS));
          const x = columnX(column);
          return (
            <g key={name}>
              <text x={x + COLUMN_WIDTH / 2} y={HEADER_Y} textAnchor="middle" fontSize={19} fontWeight={600} fill={INK}>
                {name}
              </text>
              {ABILITIES.map((ability, row) => (
                <Bar
                  key={ability}
                  x={x + (COLUMN_WIDTH - BAR_MAX) / 2}
                  y={rowY(row)}
                  start={START[row]}
                  value={START[row] + (after[row] - START[row]) * moved}
                  target={row === 0}
                />
              ))}
            </g>
          );
        })}
      </g>
      {METHODS.map(({ name, note }, column) => {
        const settles = FIRST_MOVE + column * COLUMN_EVERY + MOVE_SECONDS;
        return (
          <text
            key={name}
            x={columnX(column) + COLUMN_WIDTH / 2}
            y={NOTE_Y}
            textAnchor="middle"
            fontSize={19}
            fontWeight={600}
            fill={column === 0 ? WARN : INK}
            opacity={span(now, settles + 0.2, settles + 0.6)}
          >
            {note}
          </text>
        );
      })}
    </SceneCanvas>
  );
}
