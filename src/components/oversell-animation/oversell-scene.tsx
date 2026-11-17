import { BLUE, GREEN, type Point, SceneCanvas, WOOD } from "../job-shifts-animation/scene-kit";
import { Box, Counter, Crowd, crowdExit, span, TRIP_SECONDS, Trips, useSeconds, WARN, Wire } from "./flow-kit";

/** How long the scene runs, in seconds; it holds its finished frame for the last two. */
export const OVERSELL_SECONDS = 12;

const SELL_START = 1;
const SELL_END = 9;
/** When 「3 本帳本，各賣各的」 appears. */
const VERDICT_AT = 9.4;
/** One buyer leaves the crowd this often, in seconds. */
const SPAWN_EVERY = 0.12;

const CROWD = { x: 44, y: 92 };
const BALANCER = { x: 128, y: 116, width: 100, height: 56 };
const SHOP_X = 322;
const SHOP_WIDTH = 150;
const SHOP_HEIGHT = 66;
const SHOPS = [
  { port: "9001", y: 22, colour: BLUE },
  { port: "9002", y: 111, colour: GREEN },
  { port: "9003", y: 200, colour: WOOD },
];

const exit = crowdExit(CROWD.x, CROWD.y);
const balancerIn: Point = { x: BALANCER.x, y: BALANCER.y + BALANCER.height / 2 };
const balancerOut: Point = { x: BALANCER.x + BALANCER.width, y: balancerIn.y };
const shopIn = (y: number): Point => ({ x: SHOP_X, y: y + SHOP_HEIGHT / 2 });

const TRIPS = Array.from({ length: Math.floor((SELL_END - TRIP_SECONDS - SELL_START) / SPAWN_EVERY) + 1 }, (_, n) => {
  const shop = SHOPS[n % SHOPS.length];
  return {
    start: SELL_START + n * SPAWN_EVERY,
    path: [exit, balancerIn, balancerOut, shopIn(shop.y)],
    colour: shop.colour,
  };
});

/**
 * Why 3 copies of the shop sell 300 of 100: the load balancer deals buyers to 3 shops in turn,
 * each counting its own ledger of 100 down to 0, while the sold total climbs past 100 to 300.
 */
export function OversellScene() {
  const now = useSeconds();
  const shown = span(now, 0, 0.6);
  const sold = span(now, SELL_START + TRIP_SECONDS, SELL_END);
  const total = 300 * sold;
  const over = total > 100;
  return (
    <SceneCanvas name="oversell">
      <g opacity={shown}>
        <Wire from={exit} to={balancerIn} />
        {SHOPS.map((shop) => (
          <Wire key={shop.port} from={balancerOut} to={shopIn(shop.y)} />
        ))}
        <Trips trips={TRIPS} now={now} />
        <Crowd x={CROWD.x} y={CROWD.y} label="1,000 人搶購" left={1 - span(now, SELL_START, SELL_END - TRIP_SECONDS)} />
        <Box {...BALANCER} label="分流器" />
        {SHOPS.map((shop) => (
          <Box
            key={shop.port}
            x={SHOP_X}
            y={shop.y}
            width={SHOP_WIDTH}
            height={SHOP_HEIGHT}
            label={shop.port}
            colour={shop.colour}
            detail={`庫存 ${Math.round(100 * (1 - sold))}`}
          />
        ))}
      </g>
      <g opacity={shown}>
        <Counter
          x={28}
          y={322}
          label="已賣出"
          value={total}
          colour={over ? WARN : undefined}
          note={over ? "實際只有 100 件" : undefined}
        />
      </g>
      <text
        x={SHOP_X + SHOP_WIDTH / 2}
        y={296}
        textAnchor="middle"
        fontSize={19}
        fill={WARN}
        opacity={span(now, VERDICT_AT, VERDICT_AT + 0.5)}
      >
        3 本帳本，各賣各的
      </text>
    </SceneCanvas>
  );
}
