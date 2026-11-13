import { JOB_SHIFTS } from "./job-shifts";
import {
  ACCENT,
  BERRY,
  BLUE,
  EraChip,
  GREEN,
  GROUND,
  Hair,
  Headphones,
  INK,
  PAPER,
  Person,
  SOFT,
  ShiftLabel,
  TwoWorlds,
  WALL,
  WOOD,
  scene,
  useProgress,
  useSince,
} from "./scene-kit";

/**
 * 電腦普及: a typist at a typewriter, the carriage sliding and the page rolling
 * up line by line, an adding machine's tape curling beside it; the office greys
 * out, and a programmer sits at a monitor that lights up with code.
 */
export const COMPUTER_SECONDS = 7;

const SHIFT = JOB_SHIFTS[1];
const TURN = 2.8;
const BEAT = { typing: 0.5, programmer: TURN + 0.6, screen: TURN + 0.9, code: TURN + 1.2, label: 5.6 };
/** One typed line every 0.6 seconds: the carriage slides left, then returns. */
const LINE_SECONDS = 0.6;

const IRON = scene("iron");
const IRON_LIGHT = scene("iron-light");
const WOOD_DARK = scene("wood-dark");

function Office({ since }: { since: number }) {
  return (
    <g>
      <rect x={8} y={40} width={236} height={GROUND - 40} rx={10} fill={WALL} />
      {/* wall clock */}
      <g transform="translate(150 78)">
        <circle r={16} fill={PAPER} stroke={IRON} strokeWidth={3} />
        <line x1={0} y1={0} x2={0} y2={-11} stroke={INK} strokeWidth={2} transform={`rotate(${since * 90})`} />
        <line x1={0} y1={0} x2={7} y2={0} stroke={INK} strokeWidth={2.5} transform={`rotate(${since * 8})`} />
        <circle r={2} fill={INK} />
      </g>
      {/* filing cabinet */}
      <rect x={206} y={146} width={32} height={GROUND - 146} rx={2} fill={IRON_LIGHT} />
      {[146, 184, 222].map((y) => (
        <g key={y}>
          <rect
            x={209}
            y={y + 4}
            width={26}
            height={32}
            rx={1.5}
            fill={scene("iron-light")}
            stroke={IRON}
            strokeWidth={1}
          />
          <rect x={216} y={y + 16} width={12} height={3} rx={1} fill={IRON} />
        </g>
      ))}
      <rect x={8} y={GROUND} width={236} height={10} fill={scene("floorboards")} />
    </g>
  );
}

/** The typewriter on the desk, typing `typed` seconds' worth of lines. */
function Typewriter({ typed }: { typed: number }) {
  const lines = Math.floor(typed / LINE_SECONDS);
  const carriage = typed > 0 ? -18 * ((typed % LINE_SECONDS) / LINE_SECONDS) : 0;
  const page = 16 + Math.min(lines, 5) * 5;
  return (
    <g>
      <g transform={`translate(${carriage} 0)`}>
        <rect x={112} y={162 - page} width={34} height={page} fill={PAPER} stroke={scene("thread")} strokeWidth={1} />
        {Array.from({ length: Math.min(lines, 5) }, (_, i) => (
          <line
            key={i}
            x1={116}
            y1={166 - page + i * 5}
            x2={i % 2 ? 136 : 142}
            y2={166 - page + i * 5}
            stroke={scene("thread")}
            strokeWidth={1.4}
          />
        ))}
        <rect x={100} y={158} width={58} height={10} rx={5} fill={IRON_LIGHT} />
        <circle cx={98} cy={163} r={4} fill={IRON} />
        <circle cx={160} cy={163} r={4} fill={IRON} />
        <line x1={160} y1={158} x2={170} y2={150} stroke={IRON} strokeWidth={2.5} strokeLinecap="round" />
      </g>
      <path d="M98,196 L158,196 L152,170 L104,170 Z" fill={IRON} />
      {[0, 1, 2].map((row) =>
        Array.from({ length: 8 - row }, (_, i) => (
          <circle key={`${row}-${i}`} cx={108 + row * 3 + i * 6} cy={191 - row * 6} r={1.9} fill={PAPER} />
        )),
      )}
    </g>
  );
}

/** An adding machine with its paper tape curling up as the crank turns. */
function AddingMachine({ typed }: { typed: number }) {
  const tape = Math.min(30, typed * 9);
  const crank = Math.sin(typed * 7) * 30;
  return (
    <g>
      <path
        d={`M172,180 L172,${180 - tape} Q172,${172 - tape} 180,${176 - tape}`}
        fill="none"
        stroke={PAPER}
        strokeWidth={6}
      />
      <path
        d={`M172,180 L172,${180 - tape} Q172,${172 - tape} 180,${176 - tape}`}
        fill="none"
        stroke={scene("thread")}
        strokeWidth={0.8}
        strokeDasharray="2 3"
      />
      <rect x={162} y={180} width={32} height={16} rx={2} fill={IRON_LIGHT} />
      {[0, 1].map((row) =>
        [0, 1, 2, 3].map((i) => (
          <rect key={`${row}-${i}`} x={166 + i * 6} y={184 + row * 5} width={3.5} height={3} fill={PAPER} />
        )),
      )}
      <line
        x1={194}
        y1={186}
        x2={194 + 10 * Math.cos((crank * Math.PI) / 180)}
        y2={186 - 10 * Math.sin(((crank + 40) * Math.PI) / 180)}
        stroke={IRON}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </g>
  );
}

function Typist({ typed }: { typed: number }) {
  const tap = typed > 0 ? Math.sin(typed * 22) * 6 : 0;
  return (
    <g>
      {/* office chair */}
      <rect x={52} y={176} width={6} height={44} rx={2} fill={WOOD_DARK} />
      <rect x={52} y={218} width={40} height={6} rx={2} fill={WOOD_DARK} />
      <rect x={70} y={224} width={4} height={GROUND - 30 - 224} fill={IRON} />
      <line x1={58} y1={GROUND - 30} x2={86} y2={GROUND - 30} stroke={IRON} strokeWidth={3} />
      <Person
        x={76}
        facing={1}
        seated
        shirt={scene("weaver-shirt")}
        trousers={scene("weaver-trousers")}
        near={{ shoulder: 76, elbow: 14 + tap }}
        far={{ shoulder: 72, elbow: 18 - tap }}
        headwear={<Hair />}
      />
      {/* desk */}
      <rect x={84} y={196} width={118} height={7} rx={2} fill={WOOD} />
      <rect x={90} y={203} width={5} height={GROUND - 203} fill={WOOD_DARK} />
      <rect x={192} y={203} width={5} height={GROUND - 203} fill={WOOD_DARK} />
    </g>
  );
}

function ModernRoom() {
  return (
    <g>
      <rect x={256} y={40} width={236} height={GROUND - 40} rx={10} fill={WALL} />
      <rect x={268} y={50} width={212} height={88} rx={4} fill={scene("sky")} stroke={IRON} strokeWidth={3} />
      {[
        [276, 92, 18, 46],
        [300, 74, 22, 64],
        [330, 98, 16, 40],
        [352, 66, 26, 72],
        [386, 88, 20, 50],
        [414, 78, 24, 60],
        [446, 96, 28, 42],
      ].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={i % 2 ? scene("city") : scene("city-far")} />
      ))}
      {[340, 374].map((x) => (
        <line key={x} x1={x + 34} y1={50} x2={x + 34} y2={138} stroke={IRON} strokeWidth={2} />
      ))}
      <rect x={256} y={GROUND} width={236} height={10} fill={scene("factory-floor")} />
      {/* plant */}
      <path d="M470,262 L466,234 L488,234 L484,262 Z" fill={scene("wood-light")} />
      {[
        [477, 222, -30],
        [470, 214, -60],
        [484, 212, 20],
        [478, 204, -5],
        [490, 224, 50],
      ].map(([x, y, a], i) => (
        <ellipse key={i} cx={x} cy={y} rx={4.5} ry={12} fill={scene("leaf")} transform={`rotate(${a} ${x} ${y})`} />
      ))}
    </g>
  );
}

/** The bars of code that fill the screen, one line every quarter second. */
const CODE = [
  { indent: 0, width: 34, colour: BERRY },
  { indent: 1, width: 40, colour: BLUE },
  { indent: 2, width: 28, colour: GREEN },
  { indent: 2, width: 44, colour: WOOD },
  { indent: 1, width: 22, colour: BLUE },
  { indent: 0, width: 12, colour: BERRY },
];

function Workstation({ since }: { since: number }) {
  const on = useProgress(BEAT.screen, 0.4);
  const codeSince = useSince(BEAT.code);
  const shown = Math.min(CODE.length, Math.floor(codeSince / 0.25));
  const cursor = Math.floor(since * 2.5) % 2 === 0;
  const steam = useSince(BEAT.programmer);
  const placed = useProgress(BEAT.programmer, 0.5);
  return (
    <g opacity={placed}>
      {/* desk */}
      <rect x={300} y={196} width={168} height={7} rx={2} fill={IRON_LIGHT} />
      <rect x={306} y={203} width={5} height={GROUND - 203} fill={IRON} />
      <rect x={456} y={203} width={5} height={GROUND - 203} fill={IRON} />
      {/* monitor */}
      <rect x={402} y={172} width={8} height={24} fill={IRON} />
      <rect x={390} y={193} width={32} height={3} rx={1} fill={IRON} />
      <rect x={362} y={112} width={88} height={62} rx={4} fill={IRON} />
      <rect x={367} y={117} width={78} height={52} rx={2} fill={PAPER} opacity={on} />
      <g opacity={on}>
        {CODE.slice(0, shown).map((line, i) => (
          <rect
            key={i}
            x={372 + line.indent * 7}
            y={122 + i * 7}
            width={line.width}
            height={3.5}
            rx={1.5}
            fill={line.colour}
          />
        ))}
        {cursor && on > 0.9 && (
          <rect
            x={372 + (CODE[Math.max(0, shown - 1)].indent * 7 + (shown ? CODE[Math.max(0, shown - 1)].width + 3 : 0))}
            y={121 + Math.max(0, shown - 1) * 7}
            width={2}
            height={5.5}
            fill={INK}
          />
        )}
      </g>
      {/* keyboard, mouse and mug */}
      <rect x={370} y={191} width={56} height={5} rx={1.5} fill={IRON_LIGHT} />
      <ellipse cx={436} cy={193} rx={4} ry={2.5} fill={IRON_LIGHT} />
      <rect x={446} y={180} width={12} height={16} rx={2} fill={PAPER} stroke={IRON} strokeWidth={1.2} />
      <path d="M458,184 Q464,186 458,192" fill="none" stroke={IRON} strokeWidth={1.5} />
      {[0, 0.8].map((offset) => {
        const t = ((steam + offset) % 1.6) / 1.6;
        return (
          <path
            key={offset}
            d={`M${450 + offset * 4},${176 - t * 14} q3,-4 0,-8`}
            fill="none"
            stroke={SOFT}
            strokeWidth={1.5}
            opacity={steam > 0 ? (1 - t) * 0.6 : 0}
          />
        );
      })}
    </g>
  );
}

function Programmer() {
  const shown = useProgress(BEAT.programmer, 0.5);
  const since = useSince(BEAT.code);
  const tap = since > 0 ? Math.sin(since * 20) * 5 : 0;
  return (
    <g opacity={shown} transform={`translate(${(1 - shown) * -16} 0)`}>
      <rect x={318} y={176} width={6} height={44} rx={2} fill={ACCENT} />
      <rect x={318} y={218} width={40} height={6} rx={2} fill={ACCENT} />
      <rect x={336} y={224} width={4} height={GROUND - 30 - 224} fill={IRON} />
      <line x1={324} y1={GROUND - 30} x2={352} y2={GROUND - 30} stroke={IRON} strokeWidth={3} />
      <Person
        x={342}
        facing={1}
        seated
        shirt={ACCENT}
        trousers={scene("weaver-trousers")}
        near={{ shoulder: 78, elbow: 12 + tap }}
        far={{ shoulder: 74, elbow: 16 - tap }}
        headwear={<Headphones />}
      />
    </g>
  );
}

export function ComputerScene() {
  const clock = useSince(0);
  const typed = Math.min(useSince(BEAT.typing), TURN - BEAT.typing);
  const since = useSince(BEAT.screen);
  return (
    <svg viewBox="0 0 500 340" width="100%" height="100%" style={{ fontFamily: "var(--font-sans)", color: INK }}>
      <EraChip era={SHIFT.era} />
      <TwoWorlds
        id="computer"
        turnAt={TURN}
        old={
          <>
            <Office since={clock} />
            <Typist typed={typed} />
            <Typewriter typed={typed} />
            <AddingMachine typed={typed} />
          </>
        }
        room={<ModernRoom />}
      >
        <Programmer />
        <Workstation since={since} />
      </TwoWorlds>
      <ShiftLabel at={BEAT.label} old={SHIFT.old} new={SHIFT.new} />
    </svg>
  );
}
