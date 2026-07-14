import { useEffect } from 'react';
import { useKoiContext } from '../provider/context';
import { getPreviewScrollRoot } from '../utils/toPortalFixedPosition';

function getScrollLockTarget(
  previewDevice: 'desktop' | 'mobile' | undefined,
  portalContainer: HTMLElement | null | undefined,
): HTMLElement | null {
  if (typeof document === 'undefined') return null;

  if (previewDevice != null && portalContainer) {
    const viewport = getPreviewScrollRoot(portalContainer);
    if (viewport) return viewport;
  }

  return document.body;
}

export function useScrollLock(lock: boolean) {
  const { previewDevice, portalContainer } = useKoiContext();

  useEffect(() => {
    if (!lock) return;

    const target = getScrollLockTarget(previewDevice, portalContainer);
    if (!target) return;

    const previous = target.style.overflow;
    target.style.overflow = 'hidden';

    return () => {
      if (previous) {
        target.style.overflow = previous;
      } else {
        target.style.removeProperty('overflow');
      }
    };
  }, [lock, previewDevice, portalContainer]);
}
