import { JOB_SHIFTS } from "./job-shifts";
import {
  ACCENT,
  Apron,
  BERRY,
  BLUE,
  Cap,
  EASE_IN_OUT,
  EraChip,
  GROUND,
  Headscarf,
  INK,
  Overalls,
  PAPER,
  Person,
  RULE,
  SOFT,
  ShiftLabel,
  Shuttle,
  TwoWorlds,
  WALL,
  WOOD,
  Wrench,
  gearPath,
  rad,
  scene,
  useProgress,
  useSince,
} from "./scene-kit";

/**
 * 工業革命: a weaver at a hand loom in a sunlit cottage; the old way greys out,
 * a factory's belt-driven power loom starts running, and a mechanic walks in
 * with a wrench.
 */
export const INDUSTRIAL_SECONDS = 7.5;

const SHIFT = JOB_SHIFTS[0];
const TURN = 3.0;
const BEAT = { weave: 0.5, machine: TURN + 0.8, steam: TURN + 1.2, walk: TURN + 1.6, tighten: TURN + 2.8, label: 6 };
const WALK_SECONDS = 1.1;

const WOOD_DARK = scene("wood-dark");
const WOOD_LIGHT = scene("wood-light");
const IRON = scene("iron");
const IRON_LIGHT = scene("iron-light");

function Cottage() {
  return (
    <g>
      <rect x={8} y={40} width={236} height={GROUND - 40} rx={10} fill={WALL} />
      <polygon points="176,124 230,124 150,262 70,262" fill={scene("sun")} opacity={0.35} />
      <path
        d="M176,118 L176,74 A27,27 0 0 1 230,74 L230,118 Z"
        fill={scene("sky")}
        stroke={WOOD_DARK}
        strokeWidth={4}
      />
      <line x1={203} y1={48} x2={203} y2={118} stroke={WOOD_DARK} strokeWidth={3} />
      <line x1={176} y1={88} x2={230} y2={88} stroke={WOOD_DARK} strokeWidth={3} />
      <rect x={170} y={118} width={66} height={6} rx={2} fill={WOOD} />
      <rect x={8} y={GROUND} width={236} height={10} fill={scene("floorboards")} />
      {[40, 92, 150, 205].map((x) => (
        <line key={x} x1={x} y1={GROUND} x2={x} y2={GROUND + 10} stroke={WOOD_LIGHT} strokeWidth={1} />
      ))}
    </g>
  );
}

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

/** One pass of the shuttle every 0.7 seconds while weaving. */
const weavePhase = (weaving: number) => weaving * (Math.PI / 0.7);

/** The hand loom: heddles lifting in turn, the beater swinging, the shuttle crossing. */
function HandLoom({ weaving }: { weaving: number }) {
  const phase = weavePhase(weaving);
  const shuttleX = 68 + ((1 - Math.cos(phase)) / 2) * 70;
  const lift = Math.sin(phase) * 3.5;
  const beat = weaving > 0 ? Math.max(0, Math.cos(phase * 2)) * 6 : 0;
  return (
    <g>
      <rect x={48} y={104} width={9} height={GROUND - 104} rx={2} fill={WOOD_DARK} />
      <rect x={150} y={104} width={9} height={GROUND - 104} rx={2} fill={WOOD_DARK} />
      <rect x={42} y={98} width={124} height={10} rx={3} fill={WOOD} />
      <rect x={42} y={98} width={124} height={3} rx={1.5} fill={WOOD_LIGHT} />
      {Array.from({ length: 11 }, (_, i) => (
        <line key={i} x1={66 + i * 7} y1={108} x2={66 + i * 7} y2={204} stroke={scene("thread")} strokeWidth={1} />
      ))}
      <rect x={60} y={138 + lift} width={88} height={4} rx={1.5} fill={WOOD} />
      <rect x={60} y={150 - lift} width={88} height={4} rx={1.5} fill={WOOD_DARK} />
      <rect x={62} y={196} width={84} height={20} fill={scene("cloth")} />
      {[199, 205, 211].map((y) => (
        <line key={y} x1={62} y1={y} x2={146} y2={y} stroke={scene("stripe")} strokeWidth={2} />
      ))}
      <rect x={56} y={180 + beat} width={96} height={6} rx={2} fill={WOOD} />
      <Shuttle x={shuttleX} y={176} />
      <rect x={40} y={216} width={128} height={8} rx={3} fill={WOOD} />
      <rect x={58} y={226} width={92} height={12} rx={6} fill={scene("cloth-roll")} />
      <rect x={40} y={224} width={9} height={GROUND - 224} rx={2} fill={WOOD} />
      <rect x={159} y={224} width={9} height={GROUND - 224} rx={2} fill={WOOD} />
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

function Weaver({ weaving }: { weaving: number }) {
  const reach = weaving > 0 ? Math.max(0, Math.cos(weavePhase(weaving) * 2)) * 8 : 0;
  return (
    <g>
      <rect x={168} y={218} width={40} height={7} rx={2} fill={WOOD} />
      <rect x={172} y={225} width={5} height={GROUND - 225} fill={WOOD_DARK} />
      <rect x={199} y={225} width={5} height={GROUND - 225} fill={WOOD_DARK} />
      <Person
        x={192}
        facing={-1}
        seated
        shirt={scene("weaver-shirt")}
        trousers={scene("weaver-trousers")}
        near={{ shoulder: 70 + reach, elbow: 20 }}
        far={{ shoulder: 66 + reach, elbow: 24 }}
        headwear={<Headscarf />}
        outfit={<Apron />}
      />
    </g>
  );
}

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
      <rect x={396} y={52} width={70} height={58} rx={3} fill={scene("sky")} stroke={IRON} strokeWidth={3} />
      {[419, 443].map((x) => (
        <line key={x} x1={x} y1={52} x2={x} y2={110} stroke={IRON} strokeWidth={2} />
      ))}
      <line x1={396} y1={81} x2={466} y2={81} stroke={IRON} strokeWidth={2} />
      <rect x={256} y={GROUND} width={236} height={10} fill={scene("factory-floor")} />
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
      <rect x={262} y={70} width={226} height={6} rx={3} fill={IRON_LIGHT} />
      <rect x={300} y={62} width={6} height={14} fill={IRON} />
      <rect x={450} y={62} width={6} height={14} fill={IRON} />
      <g transform={`translate(352 73) rotate(${turn * 2.5})`}>
        <circle r={12} fill={IRON} />
        <line x1={-12} y1={0} x2={12} y2={0} stroke={IRON_LIGHT} strokeWidth={2} />
        <line x1={0} y1={-12} x2={0} y2={12} stroke={IRON_LIGHT} strokeWidth={2} />
      </g>
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
          stroke={scene("belt")}
          strokeWidth={3}
          strokeDasharray="10 4"
          strokeDashoffset={i === 0 ? belt : -belt}
        />
      ))}
      <g transform={`translate(352 205) rotate(${turn})`}>
        <circle r={28} fill="none" stroke={IRON} strokeWidth={6} />
        {[0, 60, 120].map((a) => (
          <line key={a} x1={-25} y1={0} x2={25} y2={0} stroke={IRON} strokeWidth={3} transform={`rotate(${a})`} />
        ))}
        <circle r={6} fill={ACCENT} />
      </g>
      <rect x={346} y={205} width={12} height={GROUND - 205} fill={IRON_LIGHT} />
      <line x1={crank.x} y1={crank.y} x2={398} y2={200} stroke={ACCENT} strokeWidth={4} strokeLinecap="round" />
      <circle cx={crank.x} cy={crank.y} r={3.5} fill={PAPER} stroke={ACCENT} strokeWidth={2} />
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
          stroke={scene("thread")}
          strokeWidth={1}
        />
      ))}
      <rect x={402} y={180 + Math.max(0, Math.sin(rad(turn * 2))) * 5} width={66} height={5} rx={2} fill={IRON_LIGHT} />
      <rect x={402} y={204} width={66} height={22} fill={scene("cloth")} />
      {[0, 1, 2, 3].map((i) => {
        const y = 204 + ((i * 6 + running * 14) % 22);
        return <line key={i} x1={402} y1={y} x2={468} y2={y} stroke={scene("stripe")} strokeWidth={2} />;
      })}
      <rect x={398} y={226} width={74} height={12} rx={6} fill={scene("cloth-roll")} />
      <g transform={`translate(412 128) rotate(${turn})`}>
        <path d={gearPath(12, 17, 13)} fill={ACCENT} />
        <circle r={5} fill={PAPER} />
      </g>
      <g transform={`translate(438 116) rotate(${-turn * (12 / 9) + 10})`}>
        <path d={gearPath(9, 13, 9.5)} fill={scene("gear-light")} />
        <circle r={4} fill={PAPER} />
      </g>
    </g>
  );
}

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

function Mechanic() {
  const walked = useProgress(BEAT.walk, WALK_SECONDS, EASE_IN_OUT);
  const shown = useProgress(BEAT.walk, 0.3);
  const sinceWalk = useSince(BEAT.walk);
  const sinceTighten = useSince(BEAT.tighten);
  const walking = walked > 0 && walked < 1;
  const stride = walking ? Math.sin(sinceWalk * Math.PI * 4) * 18 : 0;
  const tighten = Math.sin(sinceTighten * 6) * 14;
  return (
    <g opacity={shown}>
      <Person
        x={268 + walked * 34}
        facing={1}
        shirt={scene("mechanic-shirt")}
        trousers={ACCENT}
        stride={stride}
        near={walking ? { shoulder: -stride, elbow: 20 } : { shoulder: 62 + tighten * 0.3, elbow: 40 }}
        far={{ shoulder: walking ? stride : 10, elbow: 15 }}
        outfit={<Overalls />}
        headwear={<Cap />}
        holding={(hand) => <Wrench hand={hand} turn={walking ? 0 : tighten} />}
      />
    </g>
  );
}

export function IndustrialScene() {
  const weaving = Math.min(useSince(BEAT.weave), TURN - BEAT.weave);
  const running = useSince(BEAT.machine);
  const machine = useProgress(BEAT.machine, 0.5);
  const steam = useSince(BEAT.steam);
  return (
    <svg viewBox="0 0 500 340" width="100%" height="100%" style={{ fontFamily: "var(--font-sans)", color: INK }}>
      <EraChip era={SHIFT.era} />
      <TwoWorlds
        id="industrial"
        turnAt={TURN}
        old={
          <>
            <Cottage />
            <HandLoom weaving={weaving} />
            <YarnBasket />
            <Weaver weaving={weaving} />
          </>
        }
        room={<Factory />}
      >
        <g opacity={machine} transform={`translate(0 ${(1 - machine) * 10})`}>
          <PowerLoom running={running} />
          <Steam since={steam} />
        </g>
        <Mechanic />
      </TwoWorlds>
      <ShiftLabel at={BEAT.label} old={SHIFT.old} new={SHIFT.new} />
    </svg>
  );
}
