import type { ReactNode } from "react";
import { Orb } from "./ai-scene";
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
  Headscarf,
  INK,
  Laptop,
  Overalls,
  Person,
  SOFT,
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

function figures(ground: number): Figures[] {
  const at = (x: number) => ({ x, ground, size: SIZE });
  return [
    {
      old: (
        <Person
          {...at(108)}
          {...STANDING}
          facing={-1}
          shirt={scene("weaver-shirt")}
          trousers={scene("weaver-trousers")}
          headwear={<Headscarf />}
          outfit={<Apron />}
          holding={(hand) => <Shuttle x={hand.x + 6} y={hand.y} />}
        />
      ),
      new: (
        <Person
          {...at(280)}
          {...STANDING}
          facing={1}
          shirt={scene("mechanic-shirt")}
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
          {...at(108)}
          {...STANDING}
          facing={-1}
          shirt={scene("weaver-shirt")}
          trousers={scene("weaver-trousers")}
          headwear={<Hair />}
          holding={(hand) => <Sheet x={hand.x + 8} y={hand.y - 6} angle={8} />}
        />
      ),
      new: (
        <Person
          {...at(280)}
          {...STANDING}
          near={{ shoulder: 35, elbow: 45 }}
          facing={1}
          shirt={ACCENT}
          trousers={scene("weaver-trousers")}
          headwear={<Headphones />}
          holding={(hand) => <Laptop hand={hand} />}
        />
      ),
    },
    {
      old: (
        <Person
          {...at(108)}
          {...STANDING}
          facing={-1}
          shirt={scene("mechanic-shirt")}
          trousers={scene("weaver-trousers")}
          headwear={<Hair />}
          holding={(hand) => <Book x={hand.x + 14} y={hand.y - 4} />}
        />
      ),
      new: (
        <Person
          {...at(280)}
          {...STANDING}
          near={{ shoulder: 110, elbow: -20 }}
          far={{ shoulder: 30, elbow: 70 }}
          facing={1}
          shirt={ACCENT}
          trousers={scene("weaver-trousers")}
          headwear={<Hair colour={scene("belt")} />}
          outfit={<CrossPin />}
          farHolding={(hand) => <Clipboard hand={hand} />}
        />
      ),
    },
  ];
}

function Row({ index }: { index: number }) {
  const ground = ROW_GROUND[index];
  const shift = JOB_SHIFTS[index];
  const shown = useProgress(index * 0.35, 0.5);
  const drawn = figures(ground)[index];
  const last = index === JOB_SHIFTS.length - 1;
  return (
    <g opacity={shown} transform={`translate(0 ${(1 - shown) * 8})`}>
      <text x={12} y={ground - 34} fontSize={16} fontWeight={700} fill={ACCENT}>
        {shift.era}
      </text>
      <g style={{ filter: "grayscale(1)" }} opacity={0.55}>
        {drawn.old}
      </g>
      <text x={122} y={ground - 34} fontSize={16} fill={SOFT} textDecoration="line-through">
        {shift.old}
      </text>
      <path
        d={`M240,${ground - 39} L262,${ground - 39} M256,${ground - 45} L262,${ground - 39} L256,${ground - 33}`}
        fill="none"
        stroke={ACCENT}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {drawn.new}
      {last && <Orb x={306} y={ground - 76} since={0} size={0.55} />}
      <text x={316} y={ground - 34} fontSize={17} fontWeight={700} fill={ACCENT}>
        {shift.new}
      </text>
      {last && (
        <text x={316} y={ground - 13} fontSize={13} fill={SOFT}>
          {JOB_SHIFTS_EXAMPLE}
        </text>
      )}
      {!last && <line x1={12} y1={ground + 2} x2={488} y2={ground + 2} stroke="var(--rule)" strokeWidth={1} />}
    </g>
  );
}

export function SummaryScene() {
  return (
    <svg
      viewBox="0 0 500 340"
      width="100%"
      height="100%"
      data-scene="summary"
      style={{ fontFamily: "var(--font-sans)", color: INK }}
    >
      {JOB_SHIFTS.map((shift, i) => (
        <Row key={shift.era} index={i} />
      ))}
    </svg>
  );
}
