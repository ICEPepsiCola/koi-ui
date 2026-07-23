import type { Transition, Variants } from 'motion/react';

/** Matches `--duration-normal` (200ms). */
export const MOTION_DURATION_S = 0.2;

/** Matches `--ease-emphasized`. */
export const MOTION_EASE = [0.16, 1, 0.3, 1] as const;

export const motionTransition: Transition = {
  duration: MOTION_DURATION_S,
  ease: MOTION_EASE,
};

export const overlayScrimVariants: Variants = {
  open: {
    opacity: 1,
    transition: { ...motionTransition, when: 'beforeChildren' },
  },
  closed: {
    opacity: 0,
    transition: { ...motionTransition, when: 'afterChildren' },
  },
};

export const panelCenterVariants: Variants = {
  open: { opacity: 1, y: 0, scale: 1, transition: motionTransition },
  closed: { opacity: 0, y: 8, scale: 0.98, transition: motionTransition },
};

export const panelBottomVariants: Variants = {
  open: { y: 0, transition: motionTransition },
  closed: { y: '100%', transition: motionTransition },
};

export const panelSideVariants = {
  left: {
    open: { x: 0, transition: motionTransition },
    closed: { x: '-100%', transition: motionTransition },
  } satisfies Variants,
  right: {
    open: { x: 0, transition: motionTransition },
    closed: { x: '100%', transition: motionTransition },
  } satisfies Variants,
  top: {
    open: { y: 0, transition: motionTransition },
    closed: { y: '-100%', transition: motionTransition },
  } satisfies Variants,
  bottom: {
    open: { y: 0, transition: motionTransition },
    closed: { y: '100%', transition: motionTransition },
  } satisfies Variants,
} as const;

export type MotionPanelVariant =
  | 'center'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top';

export function resolvePanelVariants(variant: MotionPanelVariant): Variants {
  if (variant === 'center') return panelCenterVariants;
  if (variant === 'bottom') return panelBottomVariants;
  return panelSideVariants[variant];
}

/** Anchored dropdown / listbox under a field trigger. */
export const floatPanelVariants: Variants = {
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: motionTransition,
  },
  closed: {
    opacity: 0,
    y: -4,
    scale: 0.98,
    transition: { ...motionTransition, duration: 0.14 },
  },
};

/** Imperative toast presence — keyed by viewport position. */
export const toastPresenceVariants: Record<
  'center' | 'top' | 'bottom',
  Variants
> = {
  center: {
    open: { opacity: 1, y: 0, scale: 1, transition: motionTransition },
    closed: {
      opacity: 0,
      y: 6,
      scale: 0.96,
      transition: { ...motionTransition, duration: 0.16 },
    },
  },
  top: {
    open: { opacity: 1, y: 0, transition: motionTransition },
    closed: {
      opacity: 0,
      y: -10,
      transition: { ...motionTransition, duration: 0.16 },
    },
  },
  bottom: {
    open: { opacity: 1, y: 0, transition: motionTransition },
    closed: {
      opacity: 0,
      y: 10,
      transition: { ...motionTransition, duration: 0.16 },
    },
  },
};
