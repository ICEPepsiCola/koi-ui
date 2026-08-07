import { expect, test } from '@rstest/core';
import { floatPanel, materialRegular, materialThick } from '../src/utils/interaction';

test('material fragments are non-empty', () => {
  expect(materialRegular.length).toBeGreaterThan(10);
  expect(materialThick.length).toBeGreaterThan(10);
  expect(floatPanel).toContain('shadow-float');
});
