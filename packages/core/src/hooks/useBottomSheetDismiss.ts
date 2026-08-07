import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { animate } from 'motion/react';
import {
  shouldDismissProjected,
  SHEET_DISMISS_OFFSET,
  SHEET_DISMISS_VELOCITY,
} from '../motion/gesture';
import { springMomentum } from '../motion/presets';
import { useVerticalDrag } from './useVerticalDrag';

export interface UseBottomSheetDismissOptions {
  open: boolean;
  /** @default true */
  enabled?: boolean;
  onDismiss: () => void;
}

export interface UseBottomSheetDismissResult {
  offset: number;
  dragging: boolean;
  /** Apply to the sheet body wrapper that follows the finger. */
  contentStyle: CSSProperties;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
}

/** Shared bottom-sheet dismiss check (projection + px/s velocity). */
export function shouldDismissBottomSheet(options: {
  offset: number;
  velocity: number;
}): boolean {
  return shouldDismissProjected({
    offset: options.offset,
    velocity: options.velocity,
    dismissOffset: SHEET_DISMISS_OFFSET,
    dismissVelocity: SHEET_DISMISS_VELOCITY,
  });
}

/**
 * Bottom-sheet drag dismiss: rubber-band past rest, projected release,
 * interruptible springMomentum settle. Shared by ActionSheet + mobile Modal.
 */
export function useBottomSheetDismiss({
  open,
  enabled = true,
  onDismiss,
}: UseBottomSheetDismissOptions): UseBottomSheetDismissResult {
  const onDismissRef = useRef(onDismiss);
  const springRef = useRef<{ stop: () => void } | null>(null);
  const setOffsetRef = useRef<(value: number) => void>(() => {});

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  const stopSpring = useCallback(() => {
    springRef.current?.stop();
    springRef.current = null;
  }, []);

  const handleDragEnd = useCallback(
    ({ offset, velocity }: { offset: number; velocity: number }) => {
      if (shouldDismissBottomSheet({ offset, velocity })) {
        onDismissRef.current();
        return;
      }

      stopSpring();
      springRef.current = animate(offset, 0, {
        ...springMomentum,
        velocity,
        onUpdate: (value) => {
          setOffsetRef.current(value);
        },
        onComplete: () => {
          springRef.current = null;
        },
      });
    },
    [stopSpring],
  );

  const {
    offset,
    setOffset,
    dragging,
    onPointerDown: dragPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  } = useVerticalDrag({
    enabled: enabled && open,
    axis: 'y',
    sign: 1,
    min: 0,
    dimension:
      typeof window !== 'undefined' ? window.innerHeight : 400,
    onDragEnd: handleDragEnd,
  });

  useEffect(() => {
    setOffsetRef.current = setOffset;
  }, [setOffset]);

  useEffect(() => {
    if (!open) {
      stopSpring();
      setOffset(0);
    }
  }, [open, setOffset, stopSpring]);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      stopSpring();
      dragPointerDown(event);
    },
    [stopSpring, dragPointerDown],
  );

  return {
    offset,
    dragging,
    contentStyle: {
      transform: `translateY(${offset}px)`,
      transition: dragging ? 'none' : undefined,
    },
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  };
}
