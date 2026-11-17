/**
 * A `pnpm shots` path split into the path its usual shots are named after (without `?at=`) and the
 * seconds its `?at=` asks for, smallest first, each once: when to shoot each Animation mid-play,
 * counted from when it starts. No seconds when the path has no `?at=`.
 */
export function takeAt(path: string): { shotPath: string; atTimes: number[] } {
  const [route, query] = path.split(/\?(.*)/s);
  const params = (query ?? "").split("&").filter((param) => param !== "");
  const at = params.find((param) => param.startsWith("at="));
  const rest = params.filter((param) => param !== at);
  const shotPath = rest.length > 0 ? `${route}?${rest.join("&")}` : route;
  return { shotPath, atTimes: at === undefined ? [] : parseSeconds(path, at.slice("at=".length)) };
}

function parseSeconds(path: string, value: string): number[] {
  const parts = value.split(",");
  if (parts.some((part) => !/^\d+(\.\d+)?$/.test(part.trim()))) {
    throw new Error(`${path}: ?at= takes seconds after an Animation starts, such as ?at=2,5.5, not "${value}"`);
  }
  return [...new Set(parts.map(Number))].sort((a, b) => a - b);
}
