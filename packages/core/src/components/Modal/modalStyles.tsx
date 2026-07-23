import type { ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import type { MotionPanelVariant } from '../../motion/presets';
import { Button } from '../Button';

/**
 * Modal panel: daisyUI-inspired box / actions / placement / size.
 * Desktop uses placement; mobile adaptive path stays a bottom sheet.
 */
export const modalBoxVariants = tv({
  base: cn(
    'relative overflow-y-auto overscroll-contain bg-surface p-6 text-surface-foreground',
    'shadow-[0_25px_50px_-12px_rgb(0_0_0_/_0.25)]',
  ),
  variants: {
    size: {
      sm: 'w-11/12 max-w-sm',
      md: 'w-11/12 max-w-lg',
      lg: 'w-11/12 max-w-2xl',
      xl: 'w-11/12 max-w-5xl',
      full: 'w-full max-w-none',
    },
    placement: {
      middle: 'max-h-[calc(100vh-5em)] rounded-box',
      top: 'w-full max-w-none max-h-[calc(100vh-5em)] rounded-b-box rounded-t-none',
      bottom:
        'w-full max-w-none max-h-[calc(100vh-5em)] rounded-t-box rounded-b-none',
      start:
        'h-full max-h-none w-auto max-w-sm rounded-r-box rounded-l-none sm:max-w-md',
      end: 'h-full max-h-none w-auto max-w-sm rounded-l-box rounded-r-none sm:max-w-md',
    },
  },
  defaultVariants: {
    size: 'md',
    placement: 'middle',
  },
});

export type ModalPlacement = NonNullable<
  VariantProps<typeof modalBoxVariants>['placement']
>;
export type ModalSize = NonNullable<
  VariantProps<typeof modalBoxVariants>['size']
>;

export const placementToMotion: Record<ModalPlacement, MotionPanelVariant> = {
  middle: 'center',
  top: 'top',
  bottom: 'bottom',
  start: 'left',
  end: 'right',
};

export const placementOverlayClass: Record<ModalPlacement, string> = {
  middle: 'grid place-items-center p-4',
  top: 'grid place-items-start',
  bottom: 'grid place-items-end',
  start: 'grid place-items-stretch justify-items-start',
  end: 'grid place-items-stretch justify-items-end',
};

export interface ModalBoxContentProps {
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  closable?: boolean;
  onClose: () => void;
  titleId: string;
  descriptionId: string;
  /** Extra top chrome (e.g. mobile drag handle). */
  headerExtra?: ReactNode;
}

export function ModalBoxContent({
  title,
  children,
  footer,
  closable = false,
  onClose,
  titleId,
  descriptionId,
  headerExtra,
}: ModalBoxContentProps) {
  return (
    <>
      {headerExtra}
      {closable ? (
        <Button
          type="button"
          size="sm"
          shape="circle"
          variant="ghost"
          color="neutral"
          className="absolute right-2 top-2"
          aria-label="Close"
          onClick={onClose}
        >
          ×
        </Button>
      ) : null}
      {title ? (
        <h3 id={titleId} className="pr-8 text-lg font-bold">
          {title}
        </h3>
      ) : null}
      <div
        id={descriptionId}
        className={cn(title || footer ? 'py-4' : undefined)}
      >
        {children}
      </div>
      {footer ? (
        <div className="mt-2 flex justify-end gap-2">{footer}</div>
      ) : null}
    </>
  );
}
