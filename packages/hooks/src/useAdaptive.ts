import { useBreakpoint } from './useBreakpoint';
import type { Breakpoint } from './breakpoints';

export function useAdaptive(mobileBreakpoint: Breakpoint = 'lg') {
  const { isMobile } = useBreakpoint(mobileBreakpoint);
  return { isMobile };
}
