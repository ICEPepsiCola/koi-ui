import { useEffect, type RefObject } from 'react';

export interface UseDismissibleLayerOptions {
  open: boolean;
  onDismiss: () => void;
  containerRef: RefObject<HTMLElement | null>;
  /** Extra node that counts as "inside" (e.g. portal trigger). */
  excludeRef?: RefObject<HTMLElement | null>;
  closeOnEscape?: boolean;
  closeOnPointerDownOutside?: boolean;
}

function isInside(
  target: EventTarget | null,
  ...refs: RefObject<HTMLElement | null>[]
) {
  if (!(target instanceof Node)) return false;
  return refs.some((ref) => ref.current?.contains(target));
}

export function useDismissibleLayer({
  open,
  onDismiss,
  containerRef,
  excludeRef,
  closeOnEscape = true,
  closeOnPointerDownOutside = false,
}: UseDismissibleLayerOptions) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!closeOnEscape || event.key !== 'Escape') return;
      event.preventDefault();
      onDismiss();
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!closeOnPointerDownOutside) return;
      if (isInside(event.target, containerRef, ...(excludeRef ? [excludeRef] : []))) {
        return;
      }
      onDismiss();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [
    closeOnEscape,
    closeOnPointerDownOutside,
    containerRef,
    excludeRef,
    onDismiss,
    open,
  ]);
}
