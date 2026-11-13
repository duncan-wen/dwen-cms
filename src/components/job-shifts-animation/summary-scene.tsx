import type { ReactNode } from "react";
import { JOB_SHIFTS, JOB_SHIFTS_EXAMPLE } from "./job-shifts";
import {
  ACCENT,
  Apron,
  Book,
  Cap,
  Clipboard,
  CrossPin,
  Hair,
  Headphones,
  Laptop,
  Orb,
  Overalls,
  Person,
  SOFT,
  SceneCanvas,
  Sheet,
  Shuttle,
  Wrench,
  scene,
  useProgress,
} from "./scene-kit";

/**
 * The summary the Animation settles on: the three shifts stacked top to
 * bottom, each the old figure greyed, an arrow, the new figure with its label.
 * It is the finished frame, what reduced motion and screenshots show.
 */
export const SUMMARY_SECONDS = 3;

/** Each row's floor line. */
const ROW_GROUND = [104, 204, 304];
const SIZE = 0.55;
const STANDING = { near: { shoulder: 20, elbow: 30 }, far: { shoulder: 8, elbow: 12 } };

type Figures = { old: ReactNode; new: ReactNode };

/** Each shift's two figures, in JOB_SHIFTS order, standing on a row's floor line. */
function figures(index: number, ground: number): Figures {
  const at = (x: number) => ({ x, ground, size: SIZE });
  const rows: Figures[] = [
    {
      old: (
        <Person
          {...at(34)}
          {...STANDING}
          facing={-1}
          shirt={scene("shirt-berry")}
          trousers={scene("trousers")}
          headwear={<Hair />}
          outfit={<Apron />}
          holding={(hand) => <Shuttle x={hand.x + 6} y={hand.y} />}
        />
      ),
      new: (
        <Person
          {...at(250)}
          {...STANDING}
          facing={1}
          shirt={scene("shirt-blue")}
          trousers={ACCENT}
          headwear={<Cap />}
          outfit={<Overalls />}
          holding={(hand) => <Wrench hand={hand} />}
        />
      ),
    },
    {
      old: (
        <Person
          {...at(34)}
          {...STANDING}
          facing={-1}
          shirt={scene("shirt-berry")}
          trousers={scene("trousers")}
          headwear={<Hair />}
          holding={(hand) => <Sheet x={hand.x + 8} y={hand.y - 6} angle={8} />}
        />
      ),
      new: (
        <Person
          {...at(250)}
          {...STANDING}
          near={{ shoulder: 35, elbow: 45 }}
          facing={1}
          shirt={ACCENT}
          trousers={scene("trousers")}
          headwear={<Headphones />}
          holding={(hand) => <Laptop hand={hand} />}
        />
      ),
    },
    {
      old: (
        <Person
          {...at(34)}
          {...STANDING}
          facing={-1}
          shirt={scene("shirt-blue")}
          trousers={scene("trousers")}
          headwear={<Hair />}
          holding={(hand) => <Book x={hand.x + 14} y={hand.y - 4} />}
        />
      ),
      new: (
        <Person
          {...at(250)}
          {...STANDING}
          near={{ shoulder: 110, elbow: -20 }}
          far={{ shoulder: 30, elbow: 70 }}
          facing={1}
          shirt={ACCENT}
          trousers={scene("trousers")}
          headwear={<Hair colour={scene("belt")} />}
          outfit={<CrossPin />}
          farHolding={(hand) => <Clipboard hand={hand} />}
        />
      ),
    },
  ];
  return rows[index];
}

type RowProps = { index: number };

function Row({ index }: RowProps) {
  const ground = ROW_GROUND[index];
  const shift = JOB_SHIFTS[index];
  const shown = useProgress(index * 0.35, 0.5);
  const drawn = figures(index, ground);
  const last = index === JOB_SHIFTS.length - 1;
  return (
    <g opacity={shown} transform={`translate(0 ${(1 - shown) * 8})`}>
      <text x={54} y={ground - 60} fontSize={15} fontWeight={700} fill={ACCENT}>
        {shift.era}
      </text>
      <g style={{ filter: "grayscale(1)" }} opacity={0.55}>
        {drawn.old}
      </g>
      <text x={54} y={ground - 32} fontSize={19} fill={SOFT} textDecoration="line-through">
        {shift.old}
      </text>
      <path
        d={`M198,${ground - 38} L222,${ground - 38} M216,${ground - 44} L222,${ground - 38} L216,${ground - 32}`}
        fill="none"
        stroke={ACCENT}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {drawn.new}
      {last && <Orb x={276} y={ground - 78} since={0} size={0.55} />}
      <text x={290} y={ground - 32} fontSize={20} fontWeight={700} fill={ACCENT}>
        {shift.new}
      </text>
      {last && (
        <text x={290} y={ground - 10} fontSize={14} fill={SOFT}>
          {JOB_SHIFTS_EXAMPLE}
        </text>
      )}
      {!last && <line x1={12} y1={ground + 2} x2={488} y2={ground + 2} stroke="var(--rule)" strokeWidth={1} />}
    </g>
  );
}

export function SummaryScene() {
  return (
    <SceneCanvas name="summary">
      {JOB_SHIFTS.map((shift, i) => (
        <Row key={shift.era} index={i} />
      ))}
    </SceneCanvas>
  );
}
