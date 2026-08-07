import { expect, test } from '@rstest/core';
import {
  floatPanel,
  materialRegular,
  materialThick,
  sheetSurface,
} from '../src/utils/interaction';

test('material fragments are non-empty', () => {
  expect(materialRegular.length).toBeGreaterThan(10);
  expect(materialThick.length).toBeGreaterThan(10);
  expect(materialRegular).toContain('backdrop-blur');
  expect(materialRegular).toContain('--material-regular-bg');
  expect(materialThick).toContain('backdrop-blur');
  expect(materialThick).toContain('--material-thick-bg');
  expect(floatPanel).toContain('shadow-float');
  expect(floatPanel).toContain('--material-regular-bg');
  expect(floatPanel).toContain('backdrop-blur');
  expect(floatPanel).toContain('overflow-hidden');
  expect(sheetSurface).toContain('--material-thick-bg');
  expect(sheetSurface).toContain('rounded-t-[1.25rem]');
  expect(sheetSurface).toContain('shadow-overlay');
});
