/**
 * Shared interaction / surface class fragments for consistent motion language.
 * Prefer these over one-off `transition-colors` / `opacity-90` hover hacks.
 */

/** Focus ring with surface-colored offset — used by buttons, fields, switches. */
export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface';

/** Fast control transitions (colors + transform + shadow). */
export const controlTransition =
  'transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-fast ease-emphasized motion-reduce:transition-none';

/** Subtle press feedback for clickable controls. */
export const pressable =
  'active:scale-[0.98] motion-reduce:active:scale-100';

/** Trigger / field chrome (Input, Select, SearchBar, …). */
export const fieldBase = [
  'rounded-field border border-border/90 bg-surface shadow-field',
  'transition-[color,background-color,border-color,box-shadow] duration-fast ease-emphasized',
  'hover:border-primary/40',
  focusRing,
  'disabled:cursor-not-allowed disabled:opacity-50',
  'motion-reduce:transition-none',
].join(' ');

/** Open / expanded state for picker-style field triggers. */
export const fieldTriggerOpen =
  'border-primary shadow-[0_0_0_3px] shadow-primary/15';

/** Floating menus / listboxes under a trigger. */
export const floatPanel =
  'rounded-field border border-border/80 bg-surface p-1 shadow-float';

/** Single option row inside float menus / sheets. */
export const optionRowBase = [
  'mx-0.5 flex w-[calc(100%-0.25rem)] items-center gap-2 rounded-selector px-2.5 py-2 text-left text-sm',
  controlTransition,
].join(' ');

export const optionRowInteractive =
  'cursor-pointer hover:bg-primary/[0.07] active:bg-primary/10';

export const optionRowActive = 'bg-primary/10 font-medium text-primary';

export const optionRowSelected = 'font-medium text-primary';

/** Cards, alerts, empty shells. */
export const boxSurface =
  'rounded-box border border-border/80 bg-surface shadow-field';
