import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Prototype: the 工業革命 scene alone, to agree on the look before drawing the
 * other scenes. A weaver at a hand loom, the shuttle going back and forth; the
 * old way greys out, a power loom's gears start turning, and a mechanic with a
 * wrench steps in beside it.
 */
export const INDUSTRIAL_SECONDS = 7.5;

const CLAMPED = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

const INK = "var(--ink)";
const SOFT = "var(--ink-soft)";
const ACCENT = "var(--accent)";
const FILL = "var(--paper-deep)";
const PAPER = "var(--paper)";

/** When each beat starts, in seconds. */
const BEAT = {
  old: 0,
  weave: 0.6,
  fade: 2.8,
  arrow: 3.1,
  machine: 3.5,
  steam: 4.1,
  mechanic: 4.6,
  label: 5.4,
} as const;

function useProgress(start: number, seconds = 0.6) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return interpolate(frame, [start * fps, (start + seconds) * fps], [0, 1], { ...CLAMPED, easing: EASE_OUT });
}

/** Seconds since `start`, never below 0: drives the looping motions. */
function useSince(start: number) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return Math.max(0, frame / fps - start);
}

/** A gear outline centred on 0,0. */
function gearPath(teeth: number, outer: number, inner: number) {
  const points: string[] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    for (const [angle, r] of [
      [a - step * 0.25, inner],
      [a - step * 0.15, outer],
      [a + step * 0.15, outer],
      [a + step * 0.25, inner],
    ] as const) {
      points.push(`${(Math.cos(angle) * r).toFixed(2)},${(Math.sin(angle) * r).toFixed(2)}`);
    }
  }
  return `M${points.join("L")}Z`;
}

type FigureProps = { x: number; y: number; colour: string; seated?: boolean };

/** A faceless person: round head and a rounded body, standing or seated, feet at y. */
function Figure({ x, y, colour, seated = false }: FigureProps) {
  const body = seated ? 46 : 58;
  const legs = seated ? 0 : 34;
  const top = y - legs - body;
  return (
    <g>
      <circle cx={x} cy={top - 16} r={14} fill={colour} />
      <rect x={x - 17} y={top} width={34} height={body} rx={12} fill={colour} />
      {!seated && (
        <>
          <line x1={x - 7} y1={y - legs} x2={x - 9} y2={y} stroke={colour} strokeWidth={7} strokeLinecap="round" />
          <line x1={x + 7} y1={y - legs} x2={x + 9} y2={y} stroke={colour} strokeWidth={7} strokeLinecap="round" />
        </>
      )}
    </g>
  );
}

/** The old way: a wooden hand loom and its weaver, the shuttle crossing the warp. */
function HandLoom({ greyed }: { greyed: number }) {
  const since = useSince(BEAT.weave);
  const weaving = since > 0 && since < BEAT.fade - BEAT.weave + 0.3;
  const shuttleX = 92 + (Math.sin(since * Math.PI * 1.4 - Math.PI / 2) + 1) * 44;
  const colour = greyed > 0.5 ? SOFT : INK;
  return (
    <g opacity={1 - greyed * 0.55}>
      {/* frame */}
      <rect x={70} y={120} width={8} height={130} rx={2} fill={colour} />
      <rect x={176} y={120} width={8} height={130} rx={2} fill={colour} />
      <rect x={64} y={114} width={126} height={9} rx={3} fill={colour} />
      {/* warp threads */}
      {Array.from({ length: 9 }, (_, i) => (
        <line
          key={i}
          x1={90 + i * 10}
          y1={123}
          x2={90 + i * 10}
          y2={196}
          stroke={colour}
          strokeWidth={1.2}
          opacity={0.7}
        />
      ))}
      {/* cloth woven so far */}
      <rect x={84} y={196} width={92} height={18} rx={2} fill={FILL} stroke={colour} strokeWidth={1.5} />
      <rect x={70} y={214} width={114} height={7} rx={2} fill={colour} />
      {/* shuttle */}
      <ellipse cx={weaving ? shuttleX : 136} cy={186} rx={11} ry={4} fill={ACCENT} opacity={greyed > 0.5 ? 0 : 1} />
      {/* the weaver on a stool, arm to the loom */}
      <rect x={206} y={212} width={40} height={7} rx={2} fill={colour} />
      <line x1={212} y1={219} x2={210} y2={250} stroke={colour} strokeWidth={4} />
      <line x1={240} y1={219} x2={242} y2={250} stroke={colour} strokeWidth={4} />
      <Figure x={226} y={212} colour={colour} seated />
      <line
        x1={214}
        y1={180}
        x2={weaving ? Math.min(shuttleX + 30, 190) : 190}
        y2={190}
        stroke={colour}
        strokeWidth={7}
        strokeLinecap="round"
      />
    </g>
  );
}

/** The turn: an arrow growing from the old way to the new. */
function Arrow() {
  const drawn = useProgress(BEAT.arrow, 0.5);
  return (
    <g opacity={drawn > 0 ? 1 : 0}>
      <line x1={262} y1={170} x2={262 + 30 * drawn} y2={170} stroke={ACCENT} strokeWidth={3} strokeLinecap="round" />
      {drawn > 0.7 && (
        <polyline
          points="286,162 294,170 286,178"
          fill="none"
          stroke={ACCENT}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </g>
  );
}

/** The new way: a power loom with turning gears and a puffing chimney. */
function PowerLoom() {
  const shown = useProgress(BEAT.machine, 0.5);
  const turning = useSince(BEAT.machine) * 90;
  const steamSince = useSince(BEAT.steam);
  return (
    <g opacity={shown} transform={`translate(0 ${(1 - shown) * 12})`}>
      <rect x={310} y={150} width={110} height={92} rx={8} fill={FILL} stroke={INK} strokeWidth={2} />
      <rect x={322} y={196} width={86} height={16} rx={2} fill={PAPER} stroke={INK} strokeWidth={1.5} />
      {Array.from({ length: 7 }, (_, i) => (
        <line
          key={i}
          x1={330 + i * 12}
          y1={160}
          x2={330 + i * 12}
          y2={196}
          stroke={INK}
          strokeWidth={1.2}
          opacity={0.6}
        />
      ))}
      <rect x={316} y={242} width={10} height={8} fill={INK} />
      <rect x={404} y={242} width={10} height={8} fill={INK} />
      {/* chimney and steam */}
      <rect x={396} y={110} width={14} height={40} fill={INK} />
      {[0, 0.7, 1.4].map((offset) => {
        const t = ((steamSince + offset) % 2.1) / 2.1;
        return (
          <circle
            key={offset}
            cx={403 + t * 14}
            cy={104 - t * 46}
            r={5 + t * 9}
            fill={SOFT}
            opacity={steamSince > 0 ? (1 - t) * 0.5 : 0}
          />
        );
      })}
      {/* meshing gears */}
      <g transform={`translate(334 146) rotate(${turning})`}>
        <path d={gearPath(10, 24, 18)} fill={ACCENT} />
        <circle r={7} fill={PAPER} />
      </g>
      <g transform={`translate(370 126) rotate(${-turning * (10 / 7) + 12})`}>
        <path d={gearPath(7, 17, 12)} fill={ACCENT} />
        <circle r={5} fill={PAPER} />
      </g>
    </g>
  );
}

/** The new role: a mechanic stepping in with a wrench. */
function Mechanic() {
  const shown = useProgress(BEAT.mechanic, 0.6);
  const wiggle = Math.sin(useSince(BEAT.mechanic + 0.6) * 5) * 12;
  return (
    <g opacity={shown} transform={`translate(${(1 - shown) * 30} 0)`}>
      <Figure x={458} y={250} colour={ACCENT} />
      <g transform={`translate(440 186) rotate(${-30 + wiggle})`}>
        <line x1={0} y1={0} x2={-24} y2={0} stroke={ACCENT} strokeWidth={6} strokeLinecap="round" />
        <circle cx={-28} cy={0} r={7} fill="none" stroke={ACCENT} strokeWidth={4} />
      </g>
    </g>
  );
}

export function IndustrialScene() {
  const oldShown = useProgress(BEAT.old, 0.6);
  const greyed = useProgress(BEAT.fade, 0.6);
  const label = useProgress(BEAT.label, 0.5);
  return (
    <AbsoluteFill style={{ fontFamily: "var(--font-sans)", color: INK }}>
      <svg viewBox="0 0 500 320" width="100%" height="100%">
        <text x={0} y={24} fontSize={20} fill={SOFT}>
          工業革命
        </text>
        <line x1={20} y1={250} x2={480} y2={250} stroke={SOFT} strokeWidth={1.5} opacity={0.5} />
        <g opacity={oldShown}>
          <HandLoom greyed={greyed} />
        </g>
        <Arrow />
        <PowerLoom />
        <Mechanic />
        <text x={250} y={296} fontSize={22} textAnchor="middle" opacity={label}>
          <tspan fill={SOFT}>織布工</tspan>
          <tspan fill={INK}> → </tspan>
          <tspan fill={ACCENT} fontWeight={700}>
            機械師
          </tspan>
        </text>
      </svg>
    </AbsoluteFill>
  );
}
