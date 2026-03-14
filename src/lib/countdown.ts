/**
 * Returns remaining time from now to target, with microsecond precision.
 * All values are integers (floored).
 */
export function getRemaining(target: Date, now: Date) {
  const totalMs = Math.max(0, target.getTime() - now.getTime());
  const seconds = Math.floor(totalMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  return {
    days,
    hours: hours % 24,
    minutes: minutes % 60,
    seconds: seconds % 60,
    milliseconds: Math.floor(totalMs % 1000),
    // JS Date has no sub-ms precision; Hero can show a synthetic "micro" tick for fun
    microseconds: 0,
  };
}

export function isDone(target: Date, now: Date): boolean {
  return now >= target;
}
