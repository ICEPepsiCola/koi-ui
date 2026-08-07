import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react';
import { cn } from '../../utils/cn';
import {
  resolvePanelVariants,
  resolveTransition,
  springMomentum,
  springSoft,
  type MotionPanelVariant,
} from '../../motion/presets';
import { sheetSurface } from '../../utils/interaction';

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

    const isBottomSheet = variant === 'bottom';

    return (
      <motion.div
        ref={ref}
        className={cn(className, isBottomSheet && sheetSurface)}
        variants={resolvePanelVariants(variant)}
        transition={resolveTransition(
          reduce,
          isBottomSheet ? springMomentum : springSoft,
        )}
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
