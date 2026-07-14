import {
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/cn';
import { useKoiContext } from '../../provider/context';
import { getPreviewScrollRoot } from '../../utils/toPortalFixedPosition';

export interface AffixProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  offsetTop?: number;
  offsetBottom?: number;
  target?: () => HTMLElement | Window | null;
  children?: ReactNode;
  onChange?: (affixed: boolean) => void;
}

function resolveScrollTarget(
  target: (() => HTMLElement | Window | null) | undefined,
  previewDevice: 'desktop' | 'mobile' | undefined,
  portalContainer: HTMLElement | null | undefined,
  node: HTMLElement | null,
): HTMLElement | Window {
  const custom = target?.();
  if (custom) return custom;

  if (previewDevice != null && portalContainer) {
    const viewport = getPreviewScrollRoot(portalContainer);
    if (viewport) return viewport;
  }

  // 优先使用最近的可滚动祖先，避免桌面端外层 panel 滚动时吸顶失效
  let parent = node?.parentElement ?? null;
  while (parent && parent !== document.body) {
    const { overflowY } = getComputedStyle(parent);
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      parent.scrollHeight > parent.clientHeight
    ) {
      return parent;
    }
    parent = parent.parentElement;
  }

  return window;
}

export function Affix({
  offsetTop = 0,
  offsetBottom,
  target,
  children,
  onChange,
  className,
  style,
  ...props
}: AffixProps) {
  const { previewDevice, portalContainer } = useKoiContext();
  const rootRef = useRef<HTMLDivElement>(null);
  const [affixed, setAffixed] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const scrollTarget = resolveScrollTarget(
      target,
      previewDevice,
      portalContainer,
      node,
    );

    const handleScroll = () => {
      const el = rootRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const containerTop =
        scrollTarget === window
          ? 0
          : (scrollTarget as HTMLElement).getBoundingClientRect().top;
      const containerBottom =
        scrollTarget === window
          ? window.innerHeight
          : (scrollTarget as HTMLElement).getBoundingClientRect().bottom;

      const next =
        offsetBottom !== undefined
          ? rect.bottom >= containerBottom - offsetBottom - 0.5
          : rect.top <= containerTop + offsetTop + 0.5;

      setAffixed((prev) => {
        if (prev !== next) onChange?.(next);
        return next;
      });
    };

    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      scrollTarget.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [offsetBottom, offsetTop, onChange, portalContainer, previewDevice, target]);

  return (
    <div
      ref={rootRef}
      className={cn(affixed && 'bg-surface shadow-sm', className)}
      style={{
        position: 'sticky',
        zIndex: 40,
        top: offsetBottom === undefined ? offsetTop : undefined,
        bottom: offsetBottom,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
