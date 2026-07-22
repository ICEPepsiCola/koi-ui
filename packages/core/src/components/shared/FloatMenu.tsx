import type { ReactNode } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from 'motion/react';
import { cn } from '../../utils/cn';
import {
  floatPanelVariants,
  motionTransition,
} from '../../motion/presets';
import { floatPanel } from '../../utils/interaction';

export interface FloatMenuProps
  extends Omit<HTMLMotionProps<'div'>, 'children'> {
  open: boolean;
  children?: ReactNode;
}

/**
 * Anchored dropdown shell with enter/exit motion for Select / Picker panels.
 */
export function FloatMenu({
  open,
  className,
  children,
  ...props
}: FloatMenuProps) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="koi-float-menu"
          initial="closed"
          animate="open"
          exit="closed"
          variants={floatPanelVariants}
          transition={reduce ? { duration: 0 } : motionTransition}
          className={cn(
            'absolute left-0 top-full z-50 mt-1.5 w-full origin-top',
            floatPanel,
            className,
          )}
          {...props}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
