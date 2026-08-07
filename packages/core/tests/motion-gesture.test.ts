import { expect, test } from '@rstest/core';
import {
  applyRubberband,
  nearestAnchor,
  shouldDismiss,
  shouldDismissProjected,
  velocityFromSamples,
  type PointSample,
} from '../src/motion/gesture';

test('velocityFromSamples returns 0 for fewer than two samples', () => {
  expect(velocityFromSamples([])).toBe(0);
  expect(velocityFromSamples([{ y: 0, t: 0 }])).toBe(0);
});

test('velocityFromSamples computes px/s over the last window', () => {
  const samples: PointSample[] = [
    { y: 0, t: 0 },
    { y: 100, t: 100 },
  ];
  expect(velocityFromSamples(samples)).toBeCloseTo(1000, 5);
});

test('velocityFromSamples ignores samples outside the velocity window', () => {
  const samples: PointSample[] = [
    { y: 0, t: 0 },
    { y: 500, t: 50 },
    { y: 600, t: 150 },
  ];
  // Window starts at t=50 (150 - 100ms); first sample in window is y=500@50ms.
  expect(velocityFromSamples(samples)).toBeCloseTo(1000, 5);
});

test('velocityFromSamples supports x axis when x is present', () => {
  const samples: PointSample[] = [
    { x: 0, y: 0, t: 0 },
    { x: 80, y: 0, t: 80 },
  ];
  expect(velocityFromSamples(samples, 'x')).toBeCloseTo(1000, 5);
});

test('nearestAnchor picks the closest anchor', () => {
  expect(nearestAnchor(205, [100, 200, 300])).toBe(200);
  expect(nearestAnchor(260, [100, 200, 300])).toBe(300);
});

test('nearestAnchor returns projected when anchors is empty', () => {
  expect(nearestAnchor(120, [])).toBe(120);
});

test('shouldDismiss when offset crosses threshold', () => {
  expect(
    shouldDismiss({
      velocity: 0,
      offset: 96,
      dismissOffset: 96,
      dismissVelocity: 500,
    }),
  ).toBe(true);
  expect(
    shouldDismiss({
      velocity: 0,
      offset: 95,
      dismissOffset: 96,
      dismissVelocity: 500,
    }),
  ).toBe(false);
});

test('shouldDismiss when velocity crosses threshold toward dismiss', () => {
  expect(
    shouldDismiss({
      velocity: 500,
      offset: 0,
      dismissOffset: 96,
      dismissVelocity: 500,
    }),
  ).toBe(true);
  expect(
    shouldDismiss({
      velocity: -200,
      offset: 0,
      dismissOffset: 96,
      dismissVelocity: 500,
    }),
  ).toBe(false);
});

test('shouldDismissProjected uses coasting distance from project()', () => {
  // Small offset + strong flick → projected past 96.
  expect(
    shouldDismissProjected({
      offset: 20,
      velocity: 1200,
    }),
  ).toBe(true);

  // Below both travel and velocity thresholds.
  expect(
    shouldDismissProjected({
      offset: 40,
      velocity: 100,
    }),
  ).toBe(false);

  // Travel alone still dismisses at rest.
  expect(
    shouldDismissProjected({
      offset: 96,
      velocity: 0,
    }),
  ).toBe(true);
});

test('applyRubberband resists beyond min and max', () => {
  expect(applyRubberband(350, { min: 0, max: 300, dimension: 300 })).toBeLessThan(
    350,
  );
  expect(applyRubberband(-40, { min: 0, max: 300, dimension: 300 })).toBeGreaterThan(
    -40,
  );
  expect(applyRubberband(150, { min: 0, max: 300, dimension: 300 })).toBe(150);
});
