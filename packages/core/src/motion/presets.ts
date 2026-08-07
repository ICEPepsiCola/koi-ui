import type { Transition, Variants } from 'motion/react';

/** Matches `--duration-normal` (200ms) — used for scrim timing and CSS fallbacks. */
export const MOTION_DURATION_S = 0.2;

/** Matches `--ease-emphasized` — used for CSS transitions outside Motion. */
export const MOTION_EASE = [0.16, 1, 0.3, 1] as const;

/** Critically damped-ish, snappy UI (~response 0.3s). */
export const springSnappy: Transition = {
  type: 'spring',
  bounce: 0,
  duration: 0.3,
};

/** Soft reposition / center modal (~response 0.4s). */
export const springSoft: Transition = {
  type: 'spring',
  bounce: 0,
  duration: 0.4,
};

/** Momentum sheet — slight bounce only when flick handed off later. */
export const springMomentum: Transition = {
  type: 'spring',
  bounce: 0.2,
  duration: 0.35,
};

/** Default overlay/panel transition — soft, no bounce. */
export const motionTransition: Transition = springSoft;

/** Scrim fade — predictable opacity tween, not spring. */
export const overlayScrimTransition = {
  open: { duration: 0.25, ease: 'easeOut' as const },
  closed: { duration: 0.2, ease: 'easeIn' as const },
} satisfies Record<'open' | 'closed', Transition>;

export function resolveTransition(
  reduce: boolean | null,
  transition: Transition = motionTransition,
): Transition {
  return reduce ? { duration: 0 } : transition;
}

export const overlayScrimVariants: Variants = {
  open: {
    opacity: 1,
    transition: overlayScrimTransition.open,
  },
  closed: {
    opacity: 0,
    transition: overlayScrimTransition.closed,
  },
};

export const panelCenterVariants: Variants = {
  open: { opacity: 1, y: 0, scale: 1, transition: springSoft },
  closed: { opacity: 0, y: 8, scale: 0.98, transition: springSoft },
};

export const panelBottomVariants: Variants = {
  open: { y: 0, transition: springMomentum },
  closed: { y: '100%', transition: springSoft },
};

export const panelSideVariants = {
  left: {
    open: { x: 0, transition: springSoft },
    closed: { x: '-100%', transition: springSoft },
  } satisfies Variants,
  right: {
    open: { x: 0, transition: springSoft },
    closed: { x: '100%', transition: springSoft },
  } satisfies Variants,
  top: {
    open: { y: 0, transition: springSoft },
    closed: { y: '-100%', transition: springSoft },
  } satisfies Variants,
  bottom: {
    open: { y: 0, transition: springSoft },
    closed: { y: '100%', transition: springSoft },
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

/** Accordion / collapse panel height — slightly slower than overlays so it reads. */
export const collapseTransition: Transition = springSoft;

export const collapsePanelVariants: Variants = {
  open: {
    height: 'auto',
    opacity: 1,
    transition: collapseTransition,
  },
  closed: {
    height: 0,
    opacity: 0,
    transition: collapseTransition,
  },
};

/** Anchored dropdown / listbox under a field trigger. */
export const floatPanelVariants: Variants = {
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springSnappy,
  },
  closed: {
    opacity: 0,
    y: -4,
    scale: 0.98,
    transition: springSnappy,
  },
};

/** Imperative toast presence — keyed by viewport position. */
export const toastPresenceVariants: Record<
  'center' | 'top' | 'bottom',
  Variants
> = {
  center: {
    open: { opacity: 1, y: 0, scale: 1, transition: springSoft },
    closed: {
      opacity: 0,
      y: 6,
      scale: 0.96,
      transition: springSnappy,
    },
  },
  top: {
    open: { opacity: 1, y: 0, transition: springSoft },
    closed: {
      opacity: 0,
      y: -10,
      transition: springSnappy,
    },
  },
  bottom: {
    open: { opacity: 1, y: 0, transition: springSoft },
    closed: {
      opacity: 0,
      y: 10,
      transition: springSnappy,
    },
  },
};
