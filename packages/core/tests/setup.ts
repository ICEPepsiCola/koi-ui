import { afterEach } from '@rstest/core';
import { cleanup } from '@testing-library/react';
import { BREAKPOINTS } from '@koi-ui/hooks';

export function mockWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event('resize'));
}

afterEach(() => {
  cleanup();
  mockWidth(BREAKPOINTS.lg);
});
