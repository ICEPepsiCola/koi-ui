import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/cn';
import { Spinner } from '../shared/Spinner';

export interface PullToRefreshProps extends HTMLAttributes<HTMLDivElement> {
  onRefresh: () => Promise<void> | void;
  children?: ReactNode;
  pullingText?: ReactNode;
  releaseText?: ReactNode;
  refreshingText?: ReactNode;
  threshold?: number;
}

/**
 * 下拉刷新：Pointer Events 同时支持触控与鼠标拖拽。
 */
export function PullToRefresh({
  className,
  onRefresh,
  children,
  pullingText = '下拉刷新',
  releaseText = '释放刷新',
  refreshingText = '刷新中...',
  threshold = 60,
  ...props
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const pullingRef = useRef(false);
  const distanceRef = useRef(0);
  const refreshingRef = useRef(false);

  useEffect(() => {
    refreshingRef.current = refreshing;
  }, [refreshing]);

  const setDistance = (value: number) => {
    distanceRef.current = value;
    setPullDistance(value);
  };

  const endPull = useCallback(async () => {
    if (!pullingRef.current) return;
    pullingRef.current = false;

    const distance = distanceRef.current;
    if (distance >= threshold && !refreshingRef.current) {
      setRefreshing(true);
      setDistance(threshold);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setDistance(0);
      }
      return;
    }
    setDistance(0);
  }, [onRefresh, threshold]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || refreshingRef.current) return;
    const el = containerRef.current;
    if (!el || el.scrollTop > 0) return;
    pullingRef.current = true;
    startY.current = e.clientY;
    setDistance(0);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pullingRef.current || refreshingRef.current) return;
    const el = containerRef.current;
    if (!el) return;
    // 已向下滚过则取消下拉
    if (el.scrollTop > 0) {
      pullingRef.current = false;
      setDistance(0);
      return;
    }
    const diff = e.clientY - startY.current;
    if (diff <= 0) {
      setDistance(0);
      return;
    }
    setDistance(Math.min(diff * 0.55, threshold * 1.6));
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pullingRef.current) return;
    void endPull();
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    }
  };

  const onPointerCancel = () => {
    if (!pullingRef.current) return;
    pullingRef.current = false;
    setDistance(0);
  };

  const statusText = refreshing
    ? refreshingText
    : pullDistance >= threshold
      ? releaseText
      : pullingText;

  const indicatorHeight = refreshing
    ? 44
    : Math.max(0, Math.min(pullDistance, threshold * 1.6));

  return (
    <div
      ref={containerRef}
      {...props}
      className={cn(
        'relative overflow-y-auto overscroll-y-contain touch-pan-y',
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <div
        className="flex items-center justify-center gap-2 overflow-hidden text-xs text-muted-foreground"
        style={{ height: indicatorHeight }}
        aria-live="polite"
      >
        {indicatorHeight > 12 ? (
          <>
            {refreshing ? <Spinner /> : null}
            <span>{statusText}</span>
          </>
        ) : null}
      </div>
      {children}
    </div>
  );
}
