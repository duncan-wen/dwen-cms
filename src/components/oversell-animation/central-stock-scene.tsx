import { INK, type Point, SceneCanvas, SOFT } from "../job-shifts-animation/scene-kit";
import {
  arrival,
  Box,
  Counter,
  Crowd,
  crowdExit,
  departures,
  inPort,
  LEG_SECONDS,
  outPort,
  type Rect,
  SHOP_PORTS,
  span,
  type Trip,
  Trips,
  UNDEALT,
  useSeconds,
  WARN,
  Wire,
} from "./flow-kit";

/** How long the scene runs, in seconds; it holds its finished frame for the last two. */
export const CENTRAL_STOCK_SECONDS = 14;

/** Act 1: buyers go through a shop to the central stock, which sells its 100 to the first few. */
const SELL_START = 0.8;
const SOLD_OUT_AT = 3.4;
const ACT_ONE_LAST_DEPARTURE = 4.7;
/** Between the acts the central stock goes down and a new crowd arrives. */
const DOWN_AT = 6.4;
/** Act 2: every request reaches a central stock that is down. */
const FAIL_START = 7.2;
const FAIL_LAST_DEPARTURE = 10.4;
const SPAWN_EVERY = 0.15;

const CROWD = { x: 22, y: 112 };
const BALANCER: Rect = { x: 100, y: 133, width: 88, height: 52 };
const SHOPS = SHOP_PORTS.map((shop, i) => ({ ...shop, box: { x: 226, y: 66 + i * 68, width: 88, height: 50 } }));
const STOCK: Rect = { x: 360, y: 119, width: 120, height: 80 };

const exit = crowdExit(CROWD.x, CROWD.y);
const stockIn = inPort(STOCK);
/** Just short of the central stock: a request that fails turns to the warning colour here. */
const atStock: Point = { x: stockIn.x - 16, y: stockIn.y };
const toStock = (shop: Rect) => [exit, inPort(BALANCER), outPort(BALANCER), inPort(shop), outPort(shop), stockIn];
/** Legs from the crowd to the central stock. */
const LEGS_TO_STOCK = toStock(STOCK).length - 1;

const dealt = (colour: string, legs: number) => [UNDEALT, UNDEALT, ...Array<string>(legs - 2).fill(colour)];

/** Act 1's dots: those reaching the stock before it sells out are sold; later ones come back grey. */
const ACT_ONE: Trip[] = departures(SELL_START, ACT_ONE_LAST_DEPARTURE, SPAWN_EVERY).map((start, n) => {
  const shop = SHOPS[n % SHOPS.length];
  const sold = start + LEGS_TO_STOCK * LEG_SECONDS < SOLD_OUT_AT;
  return sold
    ? { start, path: toStock(shop.box), colours: dealt(shop.colour, LEGS_TO_STOCK) }
    : {
        start,
        path: [...toStock(shop.box), outPort(shop.box)],
        colours: [...dealt(shop.colour, LEGS_TO_STOCK), SOFT],
      };
});
/** Act 2's dots: each turns to the warning colour as it reaches the stock that is down. */
const ACT_TWO: Trip[] = departures(FAIL_START, FAIL_LAST_DEPARTURE, SPAWN_EVERY).map((start, n) => {
  const shop = SHOPS[n % SHOPS.length];
  const path = [...toStock(shop.box).slice(0, -1), atStock, stockIn];
  return { start, path, colours: [...dealt(shop.colour, path.length - 2), WARN] };
});
const FIRST_SALE = arrival(ACT_ONE[0], LEGS_TO_STOCK);
const FIRST_FAILURE = arrival(ACT_TWO[0]);
const LAST_FAILURE = arrival(ACT_TWO.at(-1)!);

/**
 * The fix and its new problem: the 3 shops keep no stock and ask the central stock, which sells
 * exactly 100; then the central stock goes down, and every request fails though the shops are up.
 */
export function CentralStockScene() {
  const now = useSeconds();
  const shown = span(now, 0, 0.6);
  const actTwo = span(now, DOWN_AT, DOWN_AT + 0.6);
  const sold = 100 * span(now, FIRST_SALE, SOLD_OUT_AT);
  const failed = 1000 * span(now, FIRST_FAILURE, LAST_FAILURE);
  const down = now >= DOWN_AT;
  const crowdLeft = down
    ? 1 - span(now, FAIL_START, FAIL_LAST_DEPARTURE)
    : 1 - span(now, SELL_START, ACT_ONE_LAST_DEPARTURE);
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
        <Wire from={exit} to={inPort(BALANCER)} />
        {SHOPS.map((shop) => (
          <g key={shop.port}>
            <Wire from={outPort(BALANCER)} to={inPort(shop.box)} />
            <Wire from={outPort(shop.box)} to={stockIn} />
          </g>
        ))}
        <Trips trips={[...ACT_ONE, ...ACT_TWO]} now={now} />
        <Crowd x={CROWD.x} y={CROWD.y} label="1,000 人" left={crowdLeft} />
        <Box {...BALANCER} label="分流器" />
        {SHOPS.map((shop) => (
          <Box key={shop.port} {...shop.box} label={shop.port} colour={shop.colour} />
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
        <g opacity={1 - actTwo}>
          <Counter x={22} y={322} label="已賣出" value={sold} />
        </g>
        <g opacity={actTwo}>
          <Counter x={22} y={322} label="失敗" value={failed} colour={WARN} />
        </g>
      </g>
    </SceneCanvas>
  );
}
