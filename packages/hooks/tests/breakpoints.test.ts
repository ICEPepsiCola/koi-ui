import { expect, test } from '@rstest/core';
import {
  BREAKPOINTS,
  getBreakpoint,
  isBelowBreakpoint,
} from '../src/breakpoints';

test('getBreakpoint returns correct values', () => {
  expect(getBreakpoint(500)).toBe('sm');
  expect(getBreakpoint(700)).toBe('sm');
  expect(getBreakpoint(800)).toBe('md');
  expect(getBreakpoint(1100)).toBe('lg');
  expect(getBreakpoint(1300)).toBe('xl');
  expect(getBreakpoint(1600)).toBe('2xl');
});

test('isBelowBreakpoint works', () => {
  expect(isBelowBreakpoint(900, 'lg')).toBe(true);
  expect(isBelowBreakpoint(1100, 'lg')).toBe(false);
  expect(isBelowBreakpoint(BREAKPOINTS.md, 'md')).toBe(false);
});
