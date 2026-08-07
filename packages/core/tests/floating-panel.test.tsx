import { expect, test } from '@rstest/core';
import { shouldDismissFloatingPanel } from '../src/components/FloatingPanel/FloatingPanel';

test('dismisses only when a downward projection reaches the closed endpoint', () => {
  expect(
    shouldDismissFloatingPanel({
      projectedHeight: -1,
      gestureVelocity: 900,
    }),
  ).toBe(true);

  expect(
    shouldDismissFloatingPanel({
      projectedHeight: -1,
      gestureVelocity: -900,
    }),
  ).toBe(false);

  expect(
    shouldDismissFloatingPanel({
      projectedHeight: 1,
      gestureVelocity: 900,
    }),
  ).toBe(false);
});
