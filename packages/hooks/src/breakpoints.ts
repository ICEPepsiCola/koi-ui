export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export const BREAKPOINT_ORDER: Breakpoint[] = [
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
];

export function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  return 'sm';
}

export function isBelowBreakpoint(
  width: number,
  breakpoint: Breakpoint,
): boolean {
  return width < BREAKPOINTS[breakpoint];
}
