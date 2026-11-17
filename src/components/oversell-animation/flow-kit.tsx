import { useCurrentFrame, useVideoConfig } from "remotion";
import {
  ACCENT,
  BERRY,
  BLUE,
  GREEN,
  INK,
  PAPER,
  RULE,
  SOFT,
  type Point,
  WOOD,
} from "../job-shifts-animation/scene-kit";

/** The warning colour: a count past what exists, a request that failed. */
export const WARN = BERRY;

/** Seconds into the scene. */
export function useSeconds() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
}

/** How far `now` is through [start, end], 0 to 1. */
export const span = (now: number, start: number, end: number) =>
  Math.min(1, Math.max(0, (now - start) / (end - start)));

/** The point `t` (0 to 1) of the way along a path of straight legs, each leg taking an equal share. */
export function along(path: Point[], t: number): Point {
  const legs = path.length - 1;
  const at = Math.min(legs - 1e-9, Math.max(0, t * legs));
  const leg = Math.floor(at);
  const into = at - leg;
  const from = path[leg];
  const to = path[leg + 1];
  return { x: from.x + (to.x - from.x) * into, y: from.y + (to.y - from.y) * into };
}

type BoxProps = Rect & {
  label: string;
  /** A second line under the label, such as a ledger's count. */
  detail?: string;
  colour?: string;
  /** Greyed out: a service that is down. */
  down?: boolean;
};

/** A service drawn as a rounded box with its name, and below it, when given, what it holds. */
export function Box({ x, y, width, height, label, detail, colour = INK, down = false }: BoxProps) {
  const ink = down ? SOFT : colour;
  const centre = { x: x + width / 2, y: y + height / 2 };
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={10}
        fill={PAPER}
        stroke={ink}
        strokeWidth={2}
        strokeDasharray={down ? "6 5" : undefined}
      />
      <text
        x={centre.x}
        y={detail ? centre.y - 5 : centre.y + 7}
        textAnchor="middle"
        fontSize={20}
        fontWeight={600}
        fill={ink}
      >
        {label}
      </text>
      {detail && (
        <text x={centre.x} y={centre.y + 21} textAnchor="middle" fontSize={20} fill={down ? SOFT : INK}>
          {detail}
        </text>
      )}
      {down && (
        <path
          d={`M${x + width - 22},${y + 8} l14,14 m0,-14 l-14,14`}
          stroke={WARN}
          strokeWidth={3}
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

type CrowdProps = {
  x: number;
  y: number;
  label: string;
  /** The share of the crowd still waiting, 0 to 1. */ left: number;
};

const CROWD_COLUMNS = 4;
const CROWD_ROWS = 6;
const CROWD_GAP = 16;

/** The buyers waiting their turn, a block of dots under a label, thinning as they go. */
export function Crowd({ x, y, label, left }: CrowdProps) {
  const total = CROWD_COLUMNS * CROWD_ROWS;
  const showing = Math.ceil(total * left);
  return (
    <g>
      <text x={x + ((CROWD_COLUMNS - 1) * CROWD_GAP) / 2} y={y - 18} textAnchor="middle" fontSize={19} fill={INK}>
        {label}
      </text>
      {Array.from({ length: total }, (_, i) => (
        <circle
          key={i}
          cx={x + (i % CROWD_COLUMNS) * CROWD_GAP}
          cy={y + Math.floor(i / CROWD_COLUMNS) * CROWD_GAP}
          r={5}
          fill={i < showing ? ACCENT : RULE}
        />
      ))}
    </g>
  );
}

/** Where a crowd sends its buyers from: the right edge of its block, half way down. */
export const crowdExit = (x: number, y: number): Point => ({
  x: x + (CROWD_COLUMNS - 1) * CROWD_GAP + 12,
  y: y + ((CROWD_ROWS - 1) * CROWD_GAP) / 2,
});

type CounterProps = { x: number; y: number; label: string; value: number; colour?: string; note?: string };

/** A running total: a label and its number, with an optional note after it. */
export function Counter({ x, y, label, value, colour = INK, note }: CounterProps) {
  return (
    <text x={x} y={y} fontSize={20} fill={INK}>
      {label}{" "}
      <tspan fontSize={28} fontWeight={700} fill={colour}>
        {Math.round(value).toLocaleString("en-US")}
      </tspan>
      {note && (
        <tspan dx={10} fontSize={18} fill={colour}>
          {note}
        </tspan>
      )}
    </text>
  );
}

/** A buyer's request on its way: it leaves at `start` and travels `path`, one leg at a time. */
export type Trip = {
  /** When the dot leaves, in seconds. */
  start: number;
  path: Point[];
  /** Its colour on each leg: neutral until the load balancer deals it, a shop's colour after. */
  colours: string[];
};

/** How long a dot takes over one leg of its path, in seconds: every dot moves at one pace. */
export const LEG_SECONDS = 0.25;

/** When a dot has travelled its first `legs` legs. */
export const arrival = (trip: Trip, legs = trip.path.length - 1) => trip.start + legs * LEG_SECONDS;

/** Departure times from `from` until `until`, one every `every` seconds. */
export const departures = (from: number, until: number, every: number) =>
  Array.from({ length: Math.floor((until - from) / every) + 1 }, (_, n) => from + n * every);

type TripsProps = { trips: Trip[]; now: number };

/** The dots in flight at `now`: each travels its path once, then disappears. */
export function Trips({ trips, now }: TripsProps) {
  return (
    <g>
      {trips.map((trip, i) => {
        const legs = trip.path.length - 1;
        const t = (now - trip.start) / (legs * LEG_SECONDS);
        if (t <= 0 || t >= 1) return null;
        const { x, y } = along(trip.path, t);
        return <circle key={i} cx={x} cy={y} r={5.5} fill={trip.colours[Math.floor(t * legs)]} />;
      })}
    </g>
  );
}

/** A service's box, in the scene's pixels. */
export type Rect = { x: number; y: number; width: number; height: number };

/** Where requests enter a box (its left edge) and leave it (its right edge), half way down. */
export const inPort = (box: Rect): Point => ({ x: box.x, y: box.y + box.height / 2 });
export const outPort = (box: Rect): Point => ({ x: box.x + box.width, y: box.y + box.height / 2 });

/** The 3 copies of the shop, by port, each drawn in its own colour. */
export const SHOP_PORTS = [
  { port: "9001", colour: BLUE },
  { port: "9002", colour: GREEN },
  { port: "9003", colour: WOOD },
];

/** The colour of a dot before the load balancer deals it to a shop. */
export const UNDEALT = ACCENT;

type WireProps = { from: Point; to: Point };

/** A thin line between two services, the way requests travel. */
export function Wire({ from, to }: WireProps) {
  return <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={RULE} strokeWidth={2} />;
}
