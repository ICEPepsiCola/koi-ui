import {
  useCallback,
  useEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/cn';
import { Spinner } from '../shared/Spinner';

export interface InfiniteScrollProps extends HTMLAttributes<HTMLDivElement> {
  loadMore: () => Promise<void> | void;
  hasMore: boolean;
  threshold?: number;
  children?: ReactNode;
  loadingText?: ReactNode;
  endText?: ReactNode;
}

export function InfiniteScroll({
  className,
  loadMore,
  hasMore,
  threshold = 100,
  children,
  loadingText = '加载中...',
  endText = '没有更多了',
  ...props
}: InfiniteScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleLoad = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    try {
      await loadMore();
    } finally {
      loadingRef.current = false;
    }
  }, [hasMore, loadMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) handleLoad();
      },
      { root: containerRef.current, rootMargin: `${threshold}px` },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleLoad, threshold]);

  return (
    <div
      ref={containerRef}
      className={cn('overflow-y-auto', className)}
      {...props}
    >
      {children}
      <div ref={sentinelRef} className="py-4 text-center text-xs text-muted-foreground">
        {hasMore ? (
          <span className="inline-flex items-center gap-2">
            <Spinner />
            {loadingText}
          </span>
        ) : (
          endText
        )}
      </div>
    </div>
  );
}
