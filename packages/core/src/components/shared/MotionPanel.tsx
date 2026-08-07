import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react';
import { cn } from '../../utils/cn';
import {
  resolvePanelVariants,
  resolveTransition,
  springSoft,
  type MotionPanelVariant,
} from '../../motion/presets';

export interface MotionPanelProps
  extends Omit<HTMLMotionProps<'div'>, 'children'> {
  variant?: MotionPanelVariant;
  children?: ReactNode;
}

/**
 * Overlay child panel driven by parent Overlay variant propagation
 * (`open` / `closed`). Use inside `<Overlay>`.
 */
export const MotionPanel = forwardRef<HTMLDivElement, MotionPanelProps>(
  function MotionPanel(
    { variant = 'center', className, children, style, ...props },
    ref,
  ) {
    const reduce = useReducedMotion();

    return (
      <motion.div
        ref={ref}
        className={cn(className)}
        variants={resolvePanelVariants(variant)}
        transition={resolveTransition(reduce, springSoft)}
        style={style}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);

export type MotionPanelComponentProps = ComponentPropsWithoutRef<
  typeof MotionPanel
>;
