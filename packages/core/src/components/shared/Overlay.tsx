import type { ReactNode } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from 'motion/react';
import { cn } from '../../utils/cn';
import {
  MOTION_DURATION_S,
  overlayScrimTransition,
  overlayScrimVariants,
  resolveTransition,
} from '../../motion/presets';

export type PresenceState = 'open' | 'closed';

export interface OverlayProps
  extends Omit<HTMLMotionProps<'div'>, 'children' | 'onClick'> {
  open?: boolean;
  onClick?: () => void;
  children?: ReactNode | ((state: PresenceState) => ReactNode);
  /** Exit animation duration in ms (kept for API compat; Motion uses seconds). */
  durationMs?: number;
}

/**
 * Full-screen scrim with enter/exit via Motion `AnimatePresence`.
 * Child `MotionPanel`s inherit `open` / `closed` variants.
 */
export function Overlay({
  open,
  onClick,
  className,
  children,
  durationMs: _durationMs = MOTION_DURATION_S * 1000,
  ...props
}: OverlayProps) {
  const reduce = useReducedMotion();
  const state: PresenceState = open ? 'open' : 'closed';
  const openScrimTransition = resolveTransition(
    reduce,
    overlayScrimTransition.open,
  );
  const closedScrimTransition = resolveTransition(
    reduce,
    overlayScrimTransition.closed,
  );

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="koi-overlay"
          className={cn('group/overlay fixed inset-0 z-50 bg-overlay', className)}
          role="presentation"
          initial="closed"
          animate="open"
          exit="closed"
          variants={{
            open: {
              ...overlayScrimVariants.open,
              transition: { ...openScrimTransition, when: 'beforeChildren' },
            },
            closed: {
              ...overlayScrimVariants.closed,
              transition: { ...closedScrimTransition, when: 'afterChildren' },
            },
          }}
          onClick={onClick}
          data-state="open"
          {...props}
        >
          {typeof children === 'function' ? children(state) : children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
