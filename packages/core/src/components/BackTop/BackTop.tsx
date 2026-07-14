import {
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/cn';
import { useKoiContext } from '../../provider/context';
import { Portal } from '../../utils/portal';
import { getPreviewScrollRoot } from '../../utils/toPortalFixedPosition';

export interface BackTopProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  visibilityHeight?: number;
  target?: () => HTMLElement | Window | null;
  children?: ReactNode;
}

function resolveScrollTarget(
  target: (() => HTMLElement | Window | null) | undefined,
  previewDevice: 'desktop' | 'mobile' | undefined,
  portalContainer: HTMLElement | null | undefined,
): HTMLElement | Window {
  const custom = target?.();
  if (custom) return custom;

  if (previewDevice != null && portalContainer) {
    const viewport = getPreviewScrollRoot(portalContainer);
    if (viewport) return viewport;
  }

  return window;
}

export function BackTop({
  className,
  visibilityHeight = 400,
  target,
  children,
  onClick,
  ...props
}: BackTopProps) {
  const { previewDevice, portalContainer } = useKoiContext();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = resolveScrollTarget(target, previewDevice, portalContainer);
    const getScrollTop = () => {
      if (el === window) return window.scrollY;
      return (el as HTMLElement).scrollTop;
    };
    const handleScroll = () => setVisible(getScrollTop() >= visibilityHeight);
    handleScroll();
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [visibilityHeight, target, previewDevice, portalContainer]);

  const scrollToTop = () => {
    const el = resolveScrollTarget(target, previewDevice, portalContainer);
    if (el === window) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      (el as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!visible) return null;

  return (
    <Portal>
      <button
        type="button"
        className={cn(
          'fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-surface-foreground shadow-md hover:bg-muted',
          className,
        )}
        onClick={(e) => {
          scrollToTop();
          onClick?.(e);
        }}
        aria-label="回到顶部"
        {...props}
      >
        {children ?? '↑'}
      </button>
    </Portal>
  );
}
