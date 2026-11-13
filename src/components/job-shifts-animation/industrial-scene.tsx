import type { ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Prototype: the 工業革命 scene alone, to agree on the look before drawing the
 * other scenes. A weaver at a hand loom in a sunlit cottage; the old way greys
 * out, a factory's belt-driven power loom starts running, and a mechanic walks
 * in with a wrench. Every colour is a site token, mixed for shading.
 */
export const INDUSTRIAL_SECONDS = 8;

const CLAMPED = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
const EASE_IN_OUT = Easing.bezier(0.45, 0, 0.55, 1);

const INK = "var(--ink)";
const SOFT = "var(--ink-soft)";
const ACCENT = "var(--accent)";
const PAPER = "var(--paper)";
const WALL = "var(--paper-deep)";
const RULE = "var(--rule)";
const WOOD = "var(--code-type)";
const WOOD_DARK = "var(--scene-wood-dark)";
const WOOD_LIGHT = "var(--scene-wood-light)";
const BLUE = "var(--code-function)";
const BERRY = "var(--code-keyword)";
const SKIN = "var(--scene-skin)";
const SKIN_SHADE = "var(--scene-skin-shade)";
const IRON = "var(--scene-iron)";
const IRON_LIGHT = "var(--scene-iron-light)";

const GROUND = 262;

/** When each beat starts, in seconds. */
const BEAT = {
  cottage: 0,
  weave: 0.5,
  grey: 3.0,
  factory: 3.2,
  arrow: 3.6,
  machine: 3.8,
  steam: 4.2,
  walk: 4.6,
  tighten: 5.8,
  label: 6.2,
} as const;
const WALK_SECONDS = 1.1;

function useProgress(start: number, seconds = 0.6, easing = EASE_OUT) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return interpolate(frame, [start * fps, (start + seconds) * fps], [0, 1], { ...CLAMPED, easing });
}

/** Seconds since `start`, never below 0: drives the running motions. */
function useSince(start: number) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return Math.max(0, frame / fps - start);
}

const rad = (deg: number) => (deg * Math.PI) / 180;

/** A gear outline centred on 0,0. */
function gearPath(teeth: number, outer: number, inner: number) {
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

type Point = { x: number; y: number };
/** An arm's pose: degrees from hanging straight down, positive toward where the person faces. */
type ArmPose = { shoulder: number; elbow: number };

/** Where an arm's elbow and hand fall, from the shoulder. */
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
  facing: 1 | -1;
  shirt: string;
  trousers: string;
  near: ArmPose;
  far: ArmPose;
  seated?: boolean;
  /** Walking: how far the legs swing, in degrees. */
  stride?: number;
  /** Drawn over the head: a scarf, a cap. */
  headwear?: ReactNode;
  /** Drawn over the torso: an apron, overalls. */
  outfit?: ReactNode;
  /** Drawn at the near hand, in the person's own coordinates. */
  holding?: (hand: Point) => ReactNode;
};

/** A faceless person, drawn facing right in their own coordinates (feet at 0,0) and mirrored to face left. */
function Person({ x, facing, shirt, trousers, near, far, seated, stride = 0, headwear, outfit, holding }: PersonProps) {
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
      <circle cx={joints.hand.x} cy={joints.hand.y} r={4.6} fill={SKIN} />
    </>
  );
  const leg = (side: number, swing: number) => (
    <g transform={`rotate(${swing} ${side * 4} -47)`}>
      <line x1={side * 4} y1={-47} x2={side * 5} y2={-7} stroke={trousers} strokeWidth={10.5} strokeLinecap="round" />
      <ellipse cx={side * 5 + 4} cy={-3} rx={8} ry={3.6} fill={"var(--scene-shoe)"} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${GROUND}) scale(${facing} 1)`}>
      {/* far arm behind the body */}
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
          <ellipse cx={34} cy={-3} rx={8} ry={3.6} fill={"var(--scene-shoe)"} />
        </>
      ) : (
        <>
          {leg(-1, -stride)}
          {leg(1, stride)}
        </>
      )}
      {/* torso */}
      <path d="M-13,-44 L-16,-84 Q-16,-95 -5,-96 L5,-96 Q16,-95 16,-84 L13,-44 Q0,-40 -13,-44 Z" fill={shirt} />
      <path d="M6,-95 Q16,-94 16,-84 L13,-44 Q8,-42 4,-42 Z" fill={INK} opacity={0.12} />
      {outfit}
      {/* neck and head */}
      <rect x={-4} y={-103} width={8} height={9} rx={2} fill={SKIN_SHADE} />
      <circle cx={0} cy={-115} r={13} fill={SKIN} />
      <path d="M3,-127 A13,13 0 0 1 3,-103 A13,13 0 0 0 3,-127 Z" fill={SKIN_SHADE} opacity={0.5} />
      {headwear}
      {/* near arm in front */}
      {arm(nearShoulder, nearArm, false)}
      {holding?.(nearArm.hand)}
    </g>
  );
}

/** The cottage: a plaster wall, an arched window and the morning sun on the floor. */
function Cottage() {
  return (
    <g>
      <rect x={8} y={40} width={236} height={GROUND - 40} rx={10} fill={WALL} />
      <polygon points="176,124 230,124 150,262 70,262" fill={"var(--scene-sun)"} opacity={0.35} />
      <path
        d="M176,118 L176,74 A27,27 0 0 1 230,74 L230,118 Z"
        fill={"var(--scene-sky)"}
        stroke={WOOD_DARK}
        strokeWidth={4}
      />
      <line x1={203} y1={48} x2={203} y2={118} stroke={WOOD_DARK} strokeWidth={3} />
      <line x1={176} y1={88} x2={230} y2={88} stroke={WOOD_DARK} strokeWidth={3} />
      <rect x={170} y={118} width={66} height={6} rx={2} fill={WOOD} />
      {/* floorboards */}
      <rect x={8} y={GROUND} width={236} height={10} fill={"var(--scene-floorboards)"} />
      {[40, 92, 150, 205].map((x) => (
        <line key={x} x1={x} y1={GROUND} x2={x} y2={GROUND + 10} stroke={WOOD_LIGHT} strokeWidth={1} />
      ))}
    </g>
  );
}

/** A basket of yarn spools by the weaver. */
function YarnBasket() {
  return (
    <g>
      {[
        { x: 218, colour: BERRY },
        { x: 230, colour: BLUE },
        { x: 224, colour: WOOD },
      ].map((spool, i) => (
        <circle key={i} cx={spool.x} cy={236 - (i === 2 ? 7 : 0)} r={7} fill={spool.colour} />
      ))}
      <path d="M208,238 L240,238 L236,262 L212,262 Z" fill={WOOD_LIGHT} stroke={WOOD_DARK} strokeWidth={1.5} />
      {[244, 250, 256].map((y) => (
        <line key={y} x1={210} y1={y} x2={238} y2={y} stroke={WOOD_DARK} strokeWidth={1} opacity={0.6} />
      ))}
    </g>
  );
}

/** The hand loom, its heddles lifting, the beater swinging and the shuttle crossing as the weaver works. */
function HandLoom({ weaving }: { weaving: number }) {
  // One pass every 0.7 seconds while weaving.
  const phase = weaving * (Math.PI / 0.7);
  const shuttleX = 68 + ((1 - Math.cos(phase)) / 2) * 70;
  const lift = Math.sin(phase) * 3.5;
  const beat = weaving > 0 ? Math.max(0, Math.cos(phase * 2)) * 6 : 0;
  const threads = Array.from({ length: 11 }, (_, i) => 66 + i * 7);
  return (
    <g>
      {/* back posts and top beam */}
      <rect x={48} y={104} width={9} height={GROUND - 104} rx={2} fill={WOOD_DARK} />
      <rect x={150} y={104} width={9} height={GROUND - 104} rx={2} fill={WOOD_DARK} />
      <rect x={42} y={98} width={124} height={10} rx={3} fill={WOOD} />
      <rect x={42} y={98} width={124} height={3} rx={1.5} fill={WOOD_LIGHT} />
      {/* warp threads */}
      {threads.map((tx) => (
        <line key={tx} x1={tx} y1={108} x2={tx} y2={204} stroke={"var(--scene-thread)"} strokeWidth={1} />
      ))}
      {/* heddle frames, lifting in turn */}
      <rect x={60} y={138 + lift} width={88} height={4} rx={1.5} fill={WOOD} />
      <rect x={60} y={150 - lift} width={88} height={4} rx={1.5} fill={WOOD_DARK} />
      {/* cloth woven so far, in stripes */}
      <rect x={62} y={196} width={84} height={20} fill={"var(--scene-cloth)"} />
      {[199, 205, 211].map((y) => (
        <line key={y} x1={62} y1={y} x2={146} y2={y} stroke={"var(--scene-stripe)"} strokeWidth={2} />
      ))}
      {/* the beater, swinging toward the cloth */}
      <rect x={56} y={180 + beat} width={96} height={6} rx={2} fill={WOOD} />
      {/* shuttle */}
      <g transform={`translate(${shuttleX} 176)`}>
        <path
          d="M-12,0 Q-6,-4 0,-4 Q6,-4 12,0 Q6,4 0,4 Q-6,4 -12,0 Z"
          fill={WOOD_LIGHT}
          stroke={WOOD_DARK}
          strokeWidth={1}
        />
        <ellipse cx={0} cy={0} rx={4} ry={2} fill={BERRY} />
      </g>
      {/* breast beam, cloth roll and front legs */}
      <rect x={40} y={216} width={128} height={8} rx={3} fill={WOOD} />
      <rect x={58} y={226} width={92} height={12} rx={6} fill={"var(--scene-cloth-roll)"} />
      <rect x={40} y={224} width={9} height={GROUND - 224} rx={2} fill={WOOD} />
      <rect x={159} y={224} width={9} height={GROUND - 224} rx={2} fill={WOOD} />
      {/* treadles */}
      <line
        x1={70}
        y1={GROUND - 6 + lift * 0.6}
        x2={150}
        y2={GROUND - 9}
        stroke={WOOD_DARK}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <line
        x1={76}
        y1={GROUND - 6 - lift * 0.6}
        x2={150}
        y2={GROUND - 4}
        stroke={WOOD}
        strokeWidth={4}
        strokeLinecap="round"
      />
    </g>
  );
}

/** The weaver on a bench, facing the loom, hands on the beater. */
function Weaver({ weaving }: { weaving: number }) {
  const phase = weaving * (Math.PI / 0.7);
  const reach = weaving > 0 ? Math.max(0, Math.cos(phase * 2)) * 8 : 0;
  return (
    <g>
      <rect x={168} y={218} width={40} height={7} rx={2} fill={WOOD} />
      <rect x={172} y={225} width={5} height={GROUND - 225} fill={WOOD_DARK} />
      <rect x={199} y={225} width={5} height={GROUND - 225} fill={WOOD_DARK} />
      <Person
        x={192}
        facing={-1}
        seated
        shirt={"var(--scene-weaver-shirt)"}
        trousers={"var(--scene-weaver-trousers)"}
        near={{ shoulder: 70 + reach, elbow: 20 }}
        far={{ shoulder: 66 + reach, elbow: 24 }}
        headwear={
          <path
            d="M-14,-114 Q-14,-131 0,-131 Q14,-131 14,-114 Q8,-120 0,-120 Q-8,-120 -14,-114 Z M-14,-114 L-20,-104 L-11,-108 Z"
            fill={BERRY}
          />
        }
        outfit={<path d="M-9,-80 L9,-80 L11,-44 Q0,-41 -11,-44 Z" fill={"var(--scene-apron)"} opacity={0.9} />}
      />
    </g>
  );
}

/** The factory: a brick wall, a tall window and the overhead line shaft. */
function Factory() {
  const rows = Array.from({ length: 17 }, (_, i) => 48 + i * 13);
  return (
    <g>
      <rect x={256} y={40} width={236} height={GROUND - 40} rx={10} fill={WALL} />
      {rows.map((y, r) => (
        <g key={y}>
          <line x1={256} y1={y} x2={492} y2={y} stroke={RULE} strokeWidth={1} />
          {Array.from({ length: 9 }, (_, c) => {
            const bx = 262 + c * 28 + (r % 2) * 14;
            return bx < 490 ? <line key={c} x1={bx} y1={y} x2={bx} y2={y + 13} stroke={RULE} strokeWidth={1} /> : null;
          })}
        </g>
      ))}
      <rect x={396} y={52} width={70} height={58} rx={3} fill={"var(--scene-sky)"} stroke={IRON} strokeWidth={3} />
      {[419, 443].map((x) => (
        <line key={x} x1={x} y1={52} x2={x} y2={110} stroke={IRON} strokeWidth={2} />
      ))}
      <line x1={396} y1={81} x2={466} y2={81} stroke={IRON} strokeWidth={2} />
      <rect x={256} y={GROUND} width={236} height={10} fill={"var(--scene-factory-floor)"} />
    </g>
  );
}

/** The power loom: a flywheel turned by a belt from the line shaft, a crank rod, meshing gears and cloth rolling out. */
function PowerLoom({ running }: { running: number }) {
  const turn = running * 160;
  const crank = { x: 352 + Math.cos(rad(turn)) * 16, y: 205 + Math.sin(rad(turn)) * 16 };
  const belt = running * 40;
  return (
    <g>
      {/* line shaft and pulley */}
      <rect x={262} y={70} width={226} height={6} rx={3} fill={IRON_LIGHT} />
      <rect x={300} y={62} width={6} height={14} fill={IRON} />
      <rect x={450} y={62} width={6} height={14} fill={IRON} />
      <g transform={`translate(352 73) rotate(${turn * 2.5})`}>
        <circle r={12} fill={IRON} />
        <line x1={-12} y1={0} x2={12} y2={0} stroke={IRON_LIGHT} strokeWidth={2} />
        <line x1={0} y1={-12} x2={0} y2={12} stroke={IRON_LIGHT} strokeWidth={2} />
      </g>
      {/* belt */}
      {[
        [340, 73, 324, 205],
        [364, 73, 380, 205],
      ].map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={"var(--scene-belt)"}
          strokeWidth={3}
          strokeDasharray="10 4"
          strokeDashoffset={i === 0 ? belt : -belt}
        />
      ))}
      {/* flywheel */}
      <g transform={`translate(352 205) rotate(${turn})`}>
        <circle r={28} fill="none" stroke={IRON} strokeWidth={6} />
        {[0, 60, 120].map((a) => (
          <line key={a} x1={-25} y1={0} x2={25} y2={0} stroke={IRON} strokeWidth={3} transform={`rotate(${a})`} />
        ))}
        <circle r={6} fill={ACCENT} />
      </g>
      <rect x={346} y={205} width={12} height={GROUND - 205} fill={IRON_LIGHT} />
      {/* crank rod to the loom */}
      <line x1={crank.x} y1={crank.y} x2={398} y2={200} stroke={ACCENT} strokeWidth={4} strokeLinecap="round" />
      <circle cx={crank.x} cy={crank.y} r={3.5} fill={PAPER} stroke={ACCENT} strokeWidth={2} />
      {/* the loom's iron frame */}
      <rect x={392} y={128} width={9} height={GROUND - 128} rx={2} fill={IRON} />
      <rect x={470} y={128} width={9} height={GROUND - 128} rx={2} fill={IRON} />
      <rect x={388} y={124} width={95} height={8} rx={3} fill={IRON} />
      {Array.from({ length: 10 }, (_, i) => (
        <line
          key={i}
          x1={406 + i * 6.5}
          y1={132}
          x2={406 + i * 6.5}
          y2={204}
          stroke={"var(--scene-thread)"}
          strokeWidth={1}
        />
      ))}
      <rect x={402} y={180 + Math.max(0, Math.sin(rad(turn * 2))) * 5} width={66} height={5} rx={2} fill={IRON_LIGHT} />
      {/* cloth rolling out, its stripes moving */}
      <rect x={402} y={204} width={66} height={22} fill={"var(--scene-cloth)"} />
      {[0, 1, 2, 3].map((i) => {
        const y = 204 + ((i * 6 + running * 14) % 22);
        return <line key={i} x1={402} y1={y} x2={468} y2={y} stroke={"var(--scene-stripe)"} strokeWidth={2} />;
      })}
      <rect x={398} y={226} width={74} height={12} rx={6} fill={"var(--scene-cloth-roll)"} />
      {/* meshing gears */}
      <g transform={`translate(412 128) rotate(${turn})`}>
        <path d={gearPath(12, 17, 13)} fill={ACCENT} />
        <circle r={5} fill={PAPER} />
      </g>
      <g transform={`translate(438 116) rotate(${-turn * (12 / 9) + 10})`}>
        <path d={gearPath(9, 13, 9.5)} fill={"var(--scene-gear-light)"} />
        <circle r={4} fill={PAPER} />
      </g>
    </g>
  );
}

/** Steam rising from a pipe at the factory's corner. */
function Steam({ since }: { since: number }) {
  return (
    <g>
      <path d="M484,262 L484,150 Q484,140 474,140 L474,132" fill="none" stroke={IRON} strokeWidth={6} />
      {[0, 0.6, 1.2, 1.8].map((offset) => {
        const t = ((since + offset) % 2.4) / 2.4;
        return (
          <circle
            key={offset}
            cx={474 - t * 10}
            cy={126 - t * 70}
            r={4 + t * 10}
            fill={SOFT}
            opacity={since > 0 ? (1 - t) * 0.45 : 0}
          />
        );
      })}
    </g>
  );
}

/** The mechanic: cap, overalls and a wrench, walking in and tightening the flywheel's hub. */
function Mechanic() {
  const walked = useProgress(BEAT.walk, WALK_SECONDS, EASE_IN_OUT);
  const walking = walked > 0 && walked < 1;
  const sinceWalk = useSince(BEAT.walk);
  const sinceTighten = useSince(BEAT.tighten);
  const stride = walking ? Math.sin(sinceWalk * Math.PI * 4) * 18 : 0;
  const tighten = Math.sin(sinceTighten * 6) * 14;
  const shown = useProgress(BEAT.walk, 0.3);
  return (
    <g opacity={shown}>
      <Person
        x={268 + walked * 34}
        facing={1}
        shirt={"var(--scene-mechanic-shirt)"}
        trousers={ACCENT}
        stride={stride}
        near={walking ? { shoulder: -stride, elbow: 20 } : { shoulder: 62 + tighten * 0.3, elbow: 40 }}
        far={{ shoulder: walking ? stride : 10, elbow: 15 }}
        outfit={
          <>
            <path d="M-11,-74 L11,-74 L13,-44 Q0,-40 -13,-44 Z" fill={ACCENT} />
            <line x1={-8} y1={-74} x2={-10} y2={-94} stroke={ACCENT} strokeWidth={3} />
            <line x1={8} y1={-74} x2={10} y2={-94} stroke={ACCENT} strokeWidth={3} />
            <rect x={-13} y={-52} width={26} height={4} fill={"var(--scene-belt)"} />
          </>
        }
        headwear={
          <>
            <path d="M-13,-117 Q-13,-130 0,-130 Q13,-130 13,-117 Z" fill={"var(--scene-cap)"} />
            <path d="M8,-118 L22,-117 Q20,-114 8,-115 Z" fill={"var(--scene-cap)"} />
          </>
        }
        holding={(hand) => (
          <g transform={`translate(${hand.x} ${hand.y}) rotate(${-20 + (walking ? 0 : tighten)})`}>
            <rect x={-2} y={-2.5} width={22} height={5} rx={2} fill={IRON_LIGHT} />
            <path d="M20,-7 A7,7 0 1 1 20,7 L24,3 L24,-3 Z" fill={IRON_LIGHT} />
          </g>
        )}
      />
    </g>
  );
}

/** The turn: a round badge with an arrow, between the two worlds. */
function TurnBadge() {
  const shown = useProgress(BEAT.arrow, 0.5);
  return (
    <g transform={`translate(250 150) scale(${shown})`} opacity={shown}>
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
  );
}

export function IndustrialScene() {
  const cottage = useProgress(BEAT.cottage, 0.5);
  const weaving = Math.min(useSince(BEAT.weave), BEAT.grey - BEAT.weave);
  const grey = useProgress(BEAT.grey, 0.7);
  const factory = useProgress(BEAT.factory, 0.7);
  const running = useSince(BEAT.machine);
  const machine = useProgress(BEAT.machine, 0.5);
  const label = useProgress(BEAT.label, 0.5);
  const steam = useSince(BEAT.steam);
  return (
    <AbsoluteFill style={{ fontFamily: "var(--font-sans)" }}>
      <svg viewBox="0 0 500 320" width="100%" height="100%">
        <g>
          <rect x={8} y={6} width={92} height={26} rx={13} fill="var(--accent-wash)" />
          <text x={54} y={24} fontSize={15} fontWeight={700} textAnchor="middle" fill={ACCENT}>
            工業革命
          </text>
        </g>
        <g opacity={cottage * (1 - grey * 0.45)} style={{ filter: `grayscale(${grey})` }}>
          <Cottage />
          <HandLoom weaving={weaving} />
          <YarnBasket />
          <Weaver weaving={weaving} />
        </g>
        <g opacity={factory}>
          <clipPath id="factory-wipe">
            <rect x={256} y={40} width={236 * factory} height={240} />
          </clipPath>
          <g clipPath="url(#factory-wipe)">
            <Factory />
          </g>
        </g>
        <g opacity={machine} transform={`translate(0 ${(1 - machine) * 10})`}>
          <PowerLoom running={running} />
          <Steam since={steam} />
        </g>
        <Mechanic />
        <TurnBadge />
        <text x={250} y={304} fontSize={20} textAnchor="middle" opacity={label}>
          <tspan fill={SOFT}>織布工</tspan>
          <tspan fill={INK}>　→　</tspan>
          <tspan fill={ACCENT} fontWeight={700}>
            機械師
          </tspan>
        </text>
      </svg>
    </AbsoluteFill>
  );
}
