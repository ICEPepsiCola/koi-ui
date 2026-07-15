import { useEffect, type RefObject } from 'react';

export interface UseDismissibleLayerOptions {
  open: boolean;
  onDismiss: () => void;
  containerRef: RefObject<HTMLElement | null>;
  closeOnEscape?: boolean;
  closeOnPointerDownOutside?: boolean;
}

export function useDismissibleLayer({
  open,
  onDismiss,
  containerRef,
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

    const handlePointerDown = (event: MouseEvent) => {
      if (!closeOnPointerDownOutside) return;
      const container = containerRef.current;
      if (!container) return;
      const target = event.target;
      if (target instanceof Node && !container.contains(target)) {
        onDismiss();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [
    closeOnEscape,
    closeOnPointerDownOutside,
    containerRef,
    onDismiss,
    open,
  ]);
}
