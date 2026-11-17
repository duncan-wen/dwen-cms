/**
 * The seconds a `pnpm shots` path's `?at=` asks for, smallest first: when to shoot each Animation
 * mid-play, counted from when it starts. None when the path has no `?at=`.
 */
export function parseAtTimes(path: string, value: string | null): number[] {
  if (value === null) return [];
  const times = value.split(",").map((part) => (/^\d+(\.\d+)?$/.test(part.trim()) ? Number(part) : NaN));
  if (times.length === 0 || times.some((time) => !Number.isFinite(time))) {
    throw new Error(`${path}: ?at= takes seconds after an Animation starts, such as ?at=2,5.5, not "${value}"`);
  }
  return times.sort((a, b) => a - b);
}
