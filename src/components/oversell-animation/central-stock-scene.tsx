import { BLUE, GREEN, INK, type Point, SceneCanvas, SOFT, WOOD } from "../job-shifts-animation/scene-kit";
import { Box, Counter, Crowd, crowdExit, span, TRIP_SECONDS, Trips, useSeconds, WARN, Wire } from "./flow-kit";

/** How long the scene runs, in seconds; it holds its finished frame for the last two. */
export const CENTRAL_STOCK_SECONDS = 14;

/** Act 1: buyers go through a shop to the central stock, which sells its 100. */
const SELL_START = 0.8;
const SOLD_OUT_AT = 4.8;
const ACT_ONE_END = 6;
/** Between the acts the central stock goes down and a new crowd arrives. */
const DOWN_AT = 6.6;
/** Act 2: every request reaches a central stock that is down. */
const FAIL_START = 7.6;
const FAIL_END = 11.4;
const SPAWN_EVERY = 0.15;

const CROWD = { x: 22, y: 112 };
const BALANCER = { x: 100, y: 133, width: 88, height: 52 };
const SHOP_X = 226;
const SHOP_WIDTH = 88;
const SHOP_HEIGHT = 50;
const SHOPS = [
  { port: "9001", y: 66, colour: BLUE },
  { port: "9002", y: 134, colour: GREEN },
  { port: "9003", y: 202, colour: WOOD },
];
const STOCK = { x: 360, y: 119, width: 120, height: 80 };

const exit = crowdExit(CROWD.x, CROWD.y);
const balancerIn: Point = { x: BALANCER.x, y: BALANCER.y + BALANCER.height / 2 };
const balancerOut: Point = { x: BALANCER.x + BALANCER.width, y: balancerIn.y };
const shopIn = (y: number): Point => ({ x: SHOP_X, y: y + SHOP_HEIGHT / 2 });
const shopOut = (y: number): Point => ({ x: SHOP_X + SHOP_WIDTH, y: y + SHOP_HEIGHT / 2 });
const stockIn: Point = { x: STOCK.x, y: STOCK.y + STOCK.height / 2 };

const toStock = (y: number) => [exit, balancerIn, balancerOut, shopIn(y), shopOut(y), stockIn];

const trips = (from: number, to: number) =>
  Array.from({ length: Math.floor((to - from) / SPAWN_EVERY) + 1 }, (_, n) => ({
    n,
    start: from + n * SPAWN_EVERY,
    shop: SHOPS[n % SHOPS.length],
  }));

/** Act 1's dots: those reaching the stock before it sells out are sold; later ones come back grey. */
const ACT_ONE = trips(SELL_START, ACT_ONE_END - TRIP_SECONDS).map(({ start, shop }) =>
  start + TRIP_SECONDS < SOLD_OUT_AT
    ? { start, path: toStock(shop.y), colour: shop.colour }
    : { start, path: [...toStock(shop.y), shopOut(shop.y)], colour: shop.colour, endColour: SOFT },
);
/** Act 2's dots: each turns to the warning colour on its last leg, into the stock that is down. */
const ACT_TWO = trips(FAIL_START, FAIL_END).map(({ start, shop }) => ({
  start,
  path: toStock(shop.y),
  colour: shop.colour,
  endColour: WARN,
}));

/**
 * The fix and its new problem: the 3 shops keep no stock and ask the central stock, which sells
 * exactly 100; then the central stock goes down, and every request fails though the shops are up.
 */
export function CentralStockScene() {
  const now = useSeconds();
  const shown = span(now, 0, 0.6);
  const actTwo = span(now, DOWN_AT, DOWN_AT + 0.6);
  const sold = 100 * span(now, SELL_START + TRIP_SECONDS, SOLD_OUT_AT);
  const failed = 1000 * span(now, FAIL_START + TRIP_SECONDS, FAIL_END + TRIP_SECONDS);
  const down = now >= DOWN_AT;
  const crowdLeft = down ? 1 - span(now, FAIL_START, FAIL_END) : 1 - span(now, SELL_START, ACT_ONE_END - TRIP_SECONDS);
  const soldOutNote = span(now, SOLD_OUT_AT, SOLD_OUT_AT + 0.4) * (1 - actTwo);
  return (
    <SceneCanvas name="central-stock">
      <g opacity={shown}>
        <text x={250} y={32} textAnchor="middle" fontSize={20} fontWeight={600} fill={INK} opacity={1 - actTwo}>
          庫存交給總倉
        </text>
        <text x={250} y={32} textAnchor="middle" fontSize={20} fontWeight={600} fill={WARN} opacity={actTwo}>
          總倉關掉，再來 1,000 人
        </text>
        <Wire from={exit} to={balancerIn} />
        {SHOPS.map((shop) => (
          <g key={shop.port}>
            <Wire from={balancerOut} to={shopIn(shop.y)} />
            <Wire from={shopOut(shop.y)} to={stockIn} />
          </g>
        ))}
        <Trips trips={[...ACT_ONE, ...ACT_TWO]} now={now} />
        <Crowd x={CROWD.x} y={CROWD.y} label="1,000 人" left={crowdLeft} />
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
          />
        ))}
        <Box {...STOCK} label="總倉" detail={down ? undefined : `庫存 ${Math.round(100 - sold)}`} down={down} />
        <text
          x={STOCK.x + STOCK.width / 2}
          y={STOCK.y + STOCK.height + 28}
          textAnchor="middle"
          fontSize={19}
          fill={SOFT}
          opacity={soldOutNote}
        >
          賣完了
        </text>
      </g>
      <g opacity={shown}>
        <g opacity={1 - actTwo}>
          <Counter x={22} y={322} label="已賣出" value={sold} />
        </g>
        <g opacity={actTwo}>
          <Counter x={22} y={322} label="失敗" value={failed} colour={WARN} note="3 家店都還活著" />
        </g>
      </g>
    </SceneCanvas>
  );
}
