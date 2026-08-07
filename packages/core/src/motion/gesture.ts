import { project, rubberband } from './physics';

/** Pointer position sample for velocity estimation. */
export type PointSample = { y: number; t: number; x?: number };

/** Default sheet / drawer dismiss travel (px). */
export const SHEET_DISMISS_OFFSET = 96;

/**
 * Default sheet / drawer flick dismiss velocity (px/s).
 * Matches legacy ActionSheet `0.55` px/ms.
 */
export const SHEET_DISMISS_VELOCITY = 550;

const VELOCITY_WINDOW_MS = 100;

function sampleCoord(sample: PointSample, axis: 'y' | 'x'): number {
  if (axis === 'x') return sample.x ?? sample.y;
  return sample.y;
}

/** Gesture velocity (px/s) from the trailing sample window. */
export function velocityFromSamples(
  samples: PointSample[],
  axis: 'y' | 'x' = 'y',
): number {
  if (samples.length < 2) return 0;

  const last = samples[samples.length - 1];
  const cutoff = last.t - VELOCITY_WINDOW_MS;
  let first = samples[0];

  for (let i = samples.length - 2; i >= 0; i -= 1) {
    if (samples[i].t < cutoff) {
      first = samples[i + 1];
      break;
    }
    first = samples[i];
  }

  const dt = last.t - first.t;
  if (dt <= 0) return 0;

  return (
    ((sampleCoord(last, axis) - sampleCoord(first, axis)) / dt) * 1000
  );
}

/** Closest snap anchor to a projected position (absolute px). */
export function nearestAnchor(
  projected: number,
  anchors: number[],
): number {
  if (anchors.length === 0) return projected;
  return anchors.reduce((prev, curr) =>
    Math.abs(curr - projected) < Math.abs(prev - projected) ? curr : prev,
  );
}

/** Whether a drag should dismiss based on offset and flick velocity. */
export function shouldDismiss(options: {
  velocity: number;
  offset: number;
  dismissOffset: number;
  dismissVelocity: number;
}): boolean {
  const { velocity, offset, dismissOffset, dismissVelocity } = options;
  return offset >= dismissOffset || velocity >= dismissVelocity;
}

/**
 * Dismiss when projected coasting distance or flick velocity crosses thresholds.
 * `offset` / `velocity` must be dismiss-positive (toward closed).
 */
export function shouldDismissProjected(options: {
  offset: number;
  velocity: number;
  dismissOffset?: number;
  dismissVelocity?: number;
}): boolean {
  const {
    offset,
    velocity,
    dismissOffset = SHEET_DISMISS_OFFSET,
    dismissVelocity = SHEET_DISMISS_VELOCITY,
  } = options;
  return shouldDismiss({
    velocity,
    offset: offset + project(velocity),
    dismissOffset,
    dismissVelocity,
  });
}

export interface RubberbandBounds {
  min: number;
  max?: number;
  dimension: number;
}

/** Map raw drag offset through rubber-band resistance past bounds. */
export function applyRubberband(
  value: number,
  { min, max, dimension }: RubberbandBounds,
): number {
  if (max !== undefined && value > max) {
    return max + rubberband(value - max, dimension);
  }
  if (value < min) {
    return min - rubberband(min - value, dimension);
  }
  return value;
}
