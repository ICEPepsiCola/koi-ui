import { useCallback, useSyncExternalStore } from 'react';
import {
  BREAKPOINTS,
  type Breakpoint,
  getBreakpoint,
  isBelowBreakpoint,
} from './breakpoints';

function getWidth(): number {
  if (typeof window === 'undefined') {
    return BREAKPOINTS.lg;
  }
  return window.innerWidth;
}

function subscribe(callback: () => void): () => void {
  const mediaQueries = Object.values(BREAKPOINTS).map((px) =>
    window.matchMedia(`(min-width: ${px}px)`),
  );

  const handler = () => callback();
  mediaQueries.forEach((mq) => mq.addEventListener('change', handler));
  window.addEventListener('resize', handler);

  return () => {
    mediaQueries.forEach((mq) => mq.removeEventListener('change', handler));
    window.removeEventListener('resize', handler);
  };
}

export interface BreakpointState {
  breakpoint: Breakpoint;
  width: number;
  isBelow: (bp: Breakpoint) => boolean;
  isMobile: boolean;
}

export function useBreakpoint(mobileBreakpoint: Breakpoint = 'lg'): BreakpointState {
  const width = useSyncExternalStore(subscribe, getWidth, () => BREAKPOINTS.lg);

  const isBelow = useCallback(
    (bp: Breakpoint) => isBelowBreakpoint(width, bp),
    [width],
  );

  return {
    breakpoint: getBreakpoint(width),
    width,
    isBelow,
    isMobile: isBelowBreakpoint(width, mobileBreakpoint),
  };
}
