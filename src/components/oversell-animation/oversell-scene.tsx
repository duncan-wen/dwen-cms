import { SceneCanvas } from "../job-shifts-animation/scene-kit";
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

/** How long the scene runs, in seconds; it holds its finished frame for the last two and a half. */
export const OVERSELL_SECONDS = 12;

const SELL_START = 1;
const SELL_END = 9;
/** When 「3 本帳本，各賣各的」 appears. */
const VERDICT_AT = 9.4;
/** One buyer leaves the crowd this often, in seconds. */
const SPAWN_EVERY = 0.12;

const CROWD = { x: 44, y: 92 };
const BALANCER: Rect = { x: 128, y: 116, width: 100, height: 56 };
const SHOPS = SHOP_PORTS.map((shop, i) => ({ ...shop, box: { x: 322, y: 22 + i * 89, width: 150, height: 66 } }));

const exit = crowdExit(CROWD.x, CROWD.y);
const route = (shop: Rect) => [exit, inPort(BALANCER), outPort(BALANCER), inPort(shop)];
/** Every buyer goes through the load balancer, which deals them to the shops in turn. */
const TRIPS: Trip[] = departures(SELL_START, SELL_END - 3 * LEG_SECONDS, SPAWN_EVERY).map((start, n) => {
  const shop = SHOPS[n % SHOPS.length];
  return { start, path: route(shop.box), colours: [UNDEALT, UNDEALT, shop.colour] };
});
const FIRST_SALE = arrival(TRIPS[0]);

/**
 * Why 3 copies of the shop sell 300 of 100: the load balancer deals buyers to 3 shops in turn,
 * each counting its own ledger of 100 down to 0, while the sold total climbs past 100 to 300.
 */
export function OversellScene() {
  const now = useSeconds();
  const shown = span(now, 0, 0.6);
  const soldShare = span(now, FIRST_SALE, SELL_END);
  const total = 300 * soldShare;
  const over = total > 100;
  return (
    <SceneCanvas name="oversell">
      <g opacity={shown}>
        <Wire from={exit} to={inPort(BALANCER)} />
        {SHOPS.map((shop) => (
          <Wire key={shop.port} from={outPort(BALANCER)} to={inPort(shop.box)} />
        ))}
        <Trips trips={TRIPS} now={now} />
        <Crowd x={CROWD.x} y={CROWD.y} label="1,000 人搶購" left={1 - span(now, SELL_START, TRIPS.at(-1)!.start)} />
        <Box {...BALANCER} label="分流器" />
        {SHOPS.map((shop) => (
          <Box
            key={shop.port}
            {...shop.box}
            label={shop.port}
            colour={shop.colour}
            detail={`庫存 ${Math.round(100 * (1 - soldShare))}`}
          />
        ))}
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
        x={SHOPS[0].box.x + SHOPS[0].box.width / 2}
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
