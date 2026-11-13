import type { ReactNode } from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * What every job shifts scene is drawn with: the canvas, the colours (site
 * tokens and the `--scene-*` mixes in globals.css), timing helpers, a faceless
 * Person with their clothes and tools, and the frame a scene's two worlds sit in.
 */

/** The canvas, in the scene's own pixels; the Player scales it to the column. */
export const SCENE_WIDTH = 500;
export const SCENE_HEIGHT = 340;
/** The floor line of both worlds. */
export const GROUND = 262;

export const INK = "var(--ink)";
export const SOFT = "var(--ink-soft)";
export const ACCENT = "var(--accent)";
export const PAPER = "var(--paper)";
export const WALL = "var(--paper-deep)";
export const RULE = "var(--rule)";
export const WOOD = "var(--code-type)";
export const BLUE = "var(--code-function)";
export const BERRY = "var(--code-keyword)";
export const GREEN = "var(--code-string)";
export const scene = (name: string) => `var(--scene-${name})`;

const CLAMPED = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.45, 0, 0.55, 1);

/** How far a beat has run, 0 to 1, over `seconds` from `start` seconds. */
export function useProgress(start: number, seconds = 0.6, easing = EASE_OUT) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return interpolate(frame, [start * fps, (start + seconds) * fps], [0, 1], { ...CLAMPED, easing });
}

/** Seconds since `start`, never below 0: drives the running motions. */
export function useSince(start: number) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return Math.max(0, frame / fps - start);
}

export const rad = (deg: number) => (deg * Math.PI) / 180;

/** A gear outline centred on 0,0. */
export function gearPath(teeth: number, outer: number, inner: number) {
  const step = (Math.PI * 2) / teeth;
  const points: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    for (const [angle, r] of [
      [a - step * 0.27, inner],
      [a - step * 0.14, outer],
      [a + step * 0.14, outer],
      [a + step * 0.27, inner],
    ] as const) {
      points.push(`${(Math.cos(angle) * r).toFixed(2)},${(Math.sin(angle) * r).toFixed(2)}`);
    }
  }
  return `M${points.join("L")}Z`;
}

export type Point = { x: number; y: number };
/** An arm's pose: degrees from hanging straight down, positive toward where the person faces. */
export type ArmPose = { shoulder: number; elbow: number };

function armJoints(shoulder: Point, pose: ArmPose) {
  const elbow = {
    x: shoulder.x + Math.sin(rad(pose.shoulder)) * 22,
    y: shoulder.y + Math.cos(rad(pose.shoulder)) * 22,
  };
  const hand = {
    x: elbow.x + Math.sin(rad(pose.shoulder + pose.elbow)) * 20,
    y: elbow.y + Math.cos(rad(pose.shoulder + pose.elbow)) * 20,
  };
  return { elbow, hand };
}

type PersonProps = {
  /** Where the person stands or sits, at floor level. */
  x: number;
  /** The floor line; GROUND unless the person stands in a summary row. */
  ground?: number;
  /** Drawn smaller in the summary. */
  size?: number;
  facing: 1 | -1;
  shirt: string;
  trousers: string;
  near: ArmPose;
  far: ArmPose;
  seated?: boolean;
  /** Walking: how far the legs swing, in degrees. */
  stride?: number;
  /** Drawn over the head: a scarf, a cap, headphones. */
  headwear?: ReactNode;
  /** Drawn over the torso: an apron, overalls, a pin. */
  outfit?: ReactNode;
  /** Drawn at the near hand, in the person's own coordinates. */
  holding?: (hand: Point) => ReactNode;
  /** Drawn at the far hand, behind the body. */
  farHolding?: (hand: Point) => ReactNode;
};

/**
 * A faceless person, drawn facing right in their own coordinates (feet at 0,0)
 * and mirrored to face left. No face, so no age, gender or looks: their clothes
 * and tools say what the job is.
 */
export function Person({
  x,
  ground = GROUND,
  size = 1,
  facing,
  shirt,
  trousers,
  near,
  far,
  seated,
  stride = 0,
  headwear,
  outfit,
  holding,
  farHolding,
}: PersonProps) {
  const nearShoulder = { x: 4, y: -88 };
  const farShoulder = { x: -4, y: -89 };
  const nearArm = armJoints(nearShoulder, near);
  const farArm = armJoints(farShoulder, far);
  /** An arm; the far one is shaded, as it sits in the body's shadow. */
  const arm = (shoulder: Point, joints: { elbow: Point; hand: Point }, shaded: boolean) => (
    <>
      {[shirt, ...(shaded ? [INK] : [])].map((colour) => (
        <polyline
          key={colour}
          points={`${shoulder.x},${shoulder.y} ${joints.elbow.x},${joints.elbow.y} ${joints.hand.x},${joints.hand.y}`}
          fill="none"
          stroke={colour}
          strokeOpacity={colour === INK ? 0.18 : 1}
          strokeWidth={8.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      <circle cx={joints.hand.x} cy={joints.hand.y} r={4.6} fill={scene("skin")} />
    </>
  );
  const leg = (side: number, swing: number) => (
    <g transform={`rotate(${swing} ${side * 4} -47)`}>
      <line x1={side * 4} y1={-47} x2={side * 5} y2={-7} stroke={trousers} strokeWidth={10.5} strokeLinecap="round" />
      <ellipse cx={side * 5 + 4} cy={-3} rx={8} ry={3.6} fill={scene("shoe")} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${ground}) scale(${facing * size} ${size})`}>
      {farHolding?.(farArm.hand)}
      {arm(farShoulder, farArm, true)}
      {seated ? (
        <>
          {[trousers, INK].map((colour) => (
            <polyline
              key={colour}
              points="-2,-44 24,-44 26,-6"
              fill="none"
              stroke={colour}
              strokeOpacity={colour === INK ? 0.18 : 1}
              strokeWidth={10.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          <polyline
            points="2,-42 28,-42 30,-6"
            fill="none"
            stroke={trousers}
            strokeWidth={10.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <ellipse cx={34} cy={-3} rx={8} ry={3.6} fill={scene("shoe")} />
        </>
      ) : (
        <>
          {leg(-1, -stride)}
          {leg(1, stride)}
        </>
      )}
      <path d="M-13,-44 L-16,-84 Q-16,-95 -5,-96 L5,-96 Q16,-95 16,-84 L13,-44 Q0,-40 -13,-44 Z" fill={shirt} />
      <path d="M6,-95 Q16,-94 16,-84 L13,-44 Q8,-42 4,-42 Z" fill={INK} opacity={0.12} />
      {outfit}
      <rect x={-4} y={-103} width={8} height={9} rx={2} fill={scene("skin-shade")} />
      <circle cx={0} cy={-115} r={13} fill={scene("skin")} />
      <path d="M3,-127 A13,13 0 0 1 3,-103 A13,13 0 0 0 3,-127 Z" fill={scene("skin-shade")} opacity={0.5} />
      {headwear}
      {arm(nearShoulder, nearArm, false)}
      {holding?.(nearArm.hand)}
    </g>
  );
}

/* Clothes, in a Person's own coordinates. */

export const Headscarf = () => (
  <path
    d="M-14,-114 Q-14,-131 0,-131 Q14,-131 14,-114 Q8,-120 0,-120 Q-8,-120 -14,-114 Z M-14,-114 L-20,-104 L-11,-108 Z"
    fill={BERRY}
  />
);

export const Apron = () => <path d="M-9,-80 L9,-80 L11,-44 Q0,-41 -11,-44 Z" fill={scene("apron")} opacity={0.9} />;

export const Cap = () => (
  <>
    <path d="M-13,-117 Q-13,-130 0,-130 Q13,-130 13,-117 Z" fill={scene("cap")} />
    <path d="M8,-118 L22,-117 Q20,-114 8,-115 Z" fill={scene("cap")} />
  </>
);

export const Overalls = () => (
  <>
    <path d="M-11,-74 L11,-74 L13,-44 Q0,-40 -13,-44 Z" fill={ACCENT} />
    <line x1={-8} y1={-74} x2={-10} y2={-94} stroke={ACCENT} strokeWidth={3} />
    <line x1={8} y1={-74} x2={10} y2={-94} stroke={ACCENT} strokeWidth={3} />
    <rect x={-13} y={-52} width={26} height={4} fill={scene("belt")} />
  </>
);

/** Short hair, swept back. */
export const Hair = ({ colour = scene("weaver-trousers") }: { colour?: string }) => (
  <path d="M-13,-113 Q-14,-130 0,-130 Q12,-130 14,-118 Q6,-123 -2,-121 Q-9,-119 -13,-113 Z" fill={colour} />
);

export const Headphones = () => (
  <>
    <Hair />
    <path d="M-12,-116 Q-12,-134 2,-134 Q15,-134 15,-116" fill="none" stroke={INK} strokeWidth={3} />
    <rect x={-17} y={-120} width={7} height={11} rx={3} fill={ACCENT} />
  </>
);

/** A small pin with a medical cross, on the chest. */
export const CrossPin = () => (
  <g transform="translate(-6 -78)">
    <circle r={6.5} fill={PAPER} />
    <path d="M-1.6,-4.5 h3.2 v2.9 h2.9 v3.2 h-2.9 v2.9 h-3.2 v-2.9 h-2.9 v-3.2 h2.9 Z" fill={BERRY} />
  </g>
);

/* Tools, drawn at a hand. */

export function Wrench({ hand, turn = 0 }: { hand: Point; turn?: number }) {
  return (
    <g transform={`translate(${hand.x} ${hand.y}) rotate(${-20 + turn})`}>
      <rect x={-2} y={-2.5} width={22} height={5} rx={2} fill={scene("iron-light")} />
      <path d="M20,-7 A7,7 0 1 1 20,7 L24,3 L24,-3 Z" fill={scene("iron-light")} />
    </g>
  );
}

export function Shuttle({ x, y }: Point) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d="M-12,0 Q-6,-4 0,-4 Q6,-4 12,0 Q6,4 0,4 Q-6,4 -12,0 Z"
        fill={scene("wood-light")}
        stroke={scene("wood-dark")}
        strokeWidth={1}
      />
      <ellipse cx={0} cy={0} rx={4} ry={2} fill={BERRY} />
    </g>
  );
}

/** A sheet of paper with a few typed lines. */
export function Sheet({ x, y, lines = 4, angle = 0 }: Point & { lines?: number; angle?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <rect x={-11} y={-14} width={22} height={28} rx={1.5} fill={PAPER} stroke={scene("thread")} strokeWidth={1} />
      {Array.from({ length: lines }, (_, i) => (
        <line
          key={i}
          x1={-7}
          y1={-9 + i * 5}
          x2={i % 2 ? 3 : 7}
          y2={-9 + i * 5}
          stroke={scene("thread")}
          strokeWidth={1.2}
        />
      ))}
    </g>
  );
}

/** An open book. */
export function Book({ x, y, colour = BLUE }: Point & { colour?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0,-2 L-20,-6 L-20,10 L0,14 L20,10 L20,-6 Z" fill={colour} />
      <path d="M0,0 L-18,-4 L-18,8 L0,12 Z" fill={PAPER} />
      <path d="M0,0 L18,-4 L18,8 L0,12 Z" fill={WALL} />
    </g>
  );
}

/** A clipboard with a medical cross. */
export function Clipboard({ hand }: { hand: Point }) {
  return (
    <g transform={`translate(${hand.x - 4} ${hand.y - 6}) rotate(-8)`}>
      <rect x={-10} y={-12} width={20} height={26} rx={2} fill={scene("wood-light")} />
      <rect x={-7} y={-8} width={14} height={19} fill={PAPER} />
      <path d="M-1.5,-4 h3 v3 h3 v3 h-3 v3 h-3 v-3 h-3 v-3 h3 Z" fill={BERRY} />
      <rect x={-4} y={-14} width={8} height={4} rx={1} fill={scene("iron-light")} />
    </g>
  );
}

/** A laptop, open, seen from the side. */
export function Laptop({ hand }: { hand: Point }) {
  return (
    <g transform={`translate(${hand.x} ${hand.y})`}>
      <rect x={-2} y={-2} width={26} height={4} rx={1} fill={scene("iron")} />
      <rect x={-2} y={-22} width={4} height={21} rx={1} fill={scene("iron")} transform="rotate(-12 0 -2)" />
    </g>
  );
}

/** The scene's era, as a chip at the top left. */
export function EraChip({ era }: { era: string }) {
  const width = 22 + era.length * 16;
  return (
    <g>
      <rect x={8} y={6} width={width} height={26} rx={13} fill="var(--accent-wash)" />
      <text x={8 + width / 2} y={24} fontSize={15} fontWeight={700} textAnchor="middle" fill={ACCENT}>
        {era}
      </text>
    </g>
  );
}

type TurnProps = {
  /** The id of the scene, for its clip path. */
  id: string;
  /** When the old world greys out and the new one opens, in seconds. */
  turnAt: number;
  /** The old world, which plays from the start. */
  old: ReactNode;
  /** The new world's room, wiped in from the left at the turn. */
  room: ReactNode;
  /** What happens in the new world; times its own beats. */
  children: ReactNode;
};

/**
 * A scene's two worlds side by side: the old one fades in and plays, then at
 * `turnAt` greys out while the new room wipes open beside it and a badge with
 * an arrow pops up between them.
 */
export function TwoWorlds({ id, turnAt, old, room, children }: TurnProps) {
  const shown = useProgress(0, 0.5);
  const grey = useProgress(turnAt, 0.7);
  const wipe = useProgress(turnAt + 0.2, 0.7);
  const badge = useProgress(turnAt + 0.6, 0.5);
  return (
    <>
      <g opacity={shown * (1 - grey * 0.45)} style={{ filter: `grayscale(${grey})` }}>
        {old}
      </g>
      <clipPath id={`${id}-wipe`}>
        <rect x={256} y={40} width={236 * wipe} height={240} />
      </clipPath>
      <g clipPath={`url(#${id}-wipe)`} opacity={wipe}>
        {room}
      </g>
      {children}
      <g transform={`translate(250 150) scale(${badge})`} opacity={badge}>
        <circle r={17} fill={ACCENT} />
        <path
          d="M-7,0 L6,0 M1,-6 L7,0 L1,6"
          fill="none"
          stroke="var(--on-accent)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </>
  );
}

type LabelProps = {
  at: number;
  old: string;
  new: string;
  /** A smaller line under the label. */
  example?: string;
};

/** The scene's one line of text: the old job, an arrow, the new one. */
export function ShiftLabel({ at, old, new: rose, example }: LabelProps) {
  const shown = useProgress(at, 0.5);
  return (
    <g opacity={shown}>
      <text x={250} y={302} fontSize={20} textAnchor="middle">
        <tspan fill={SOFT}>{old}</tspan>
        <tspan fill={INK}>　→　</tspan>
        <tspan fill={ACCENT} fontWeight={700}>
          {rose}
        </tspan>
      </text>
      {example && (
        <text x={250} y={328} fontSize={15} textAnchor="middle" fill={SOFT}>
          {example}
        </text>
      )}
    </g>
  );
}
