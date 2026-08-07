import { expect, test } from '@rstest/core';
import {
  floatPanelVariants,
  motionTransition,
  overlayScrimVariants,
  panelBottomVariants,
  springMomentum,
  springSnappy,
  springSoft,
} from '../src/motion/presets';

test('spring presets use spring type', () => {
  for (const t of [springSnappy, springSoft, springMomentum, motionTransition]) {
    expect(t).toMatchObject({ type: 'spring' });
  }
});

test('panel bottom uses momentum on open and soft on close', () => {
  expect(panelBottomVariants.open).toMatchObject({ transition: springMomentum });
  expect(panelBottomVariants.closed).toMatchObject({ transition: springSoft });
});

test('float panel uses snappy spring', () => {
  expect(floatPanelVariants.open).toMatchObject({ transition: springSnappy });
});

test('scrim uses short opacity tween', () => {
  expect(overlayScrimVariants.open).toMatchObject({
    transition: { duration: 0.25, ease: 'easeOut' },
  });
  expect(overlayScrimVariants.closed).toMatchObject({
    transition: { duration: 0.2, ease: 'easeIn' },
  });
});
