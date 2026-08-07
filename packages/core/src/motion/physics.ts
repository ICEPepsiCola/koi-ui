/** Projected displacement after exponential deceleration (Apple UIScrollView formula). */
export function project(
  initialVelocity: number,
  decelerationRate = 0.998,
): number {
  return (
    ((initialVelocity / 1000) * decelerationRate) / (1 - decelerationRate)
  );
}

/** Rubber-band resistance when overshooting a scroll bound. */
export function rubberband(
  overshoot: number,
  dimension: number,
  constant = 0.55,
): number {
  if (dimension === 0) return 0;
  return (
    (overshoot * dimension * constant) /
    (dimension + constant * Math.abs(overshoot))
  );
}

/** Gesture velocity normalized by remaining distance to target. */
export function relativeVelocity(
  gestureVelocity: number,
  current: number,
  target: number,
): number {
  const delta = target - current;
  if (delta === 0) return 0;
  return gestureVelocity / delta;
}
