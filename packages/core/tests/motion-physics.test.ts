import { expect, test } from '@rstest/core';
import { project, rubberband, relativeVelocity } from '../src/motion/physics';

test('project uses exponential deceleration', () => {
  const d = 0.998;
  const v = 1000; // px/s
  expect(project(v, d)).toBeCloseTo((v / 1000) * d / (1 - d), 5);
});

test('rubberband resists past bound', () => {
  expect(rubberband(100, 300, 0.55)).toBeLessThan(100);
  expect(rubberband(0, 300)).toBe(0);
});

test('relativeVelocity normalizes by remaining distance', () => {
  expect(relativeVelocity(50, 50, 150)).toBeCloseTo(0.5);
});
