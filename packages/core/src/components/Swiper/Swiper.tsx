import {
  Children,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type TransitionEvent,
} from 'react';
import { flushSync } from 'react-dom';
import { cn } from '../../utils/cn';
import { Icon } from '../Icon';

export interface SwiperProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  children?: ReactNode;
  loop?: boolean;
  autoplay?: boolean;
  interval?: number;
  /** 滑动切换阈值（px），默认 40 */
  threshold?: number;
  showDots?: boolean;
  showArrows?: boolean;
  onChange?: (index: number) => void;
}

function toLogical(trackIndex: number, count: number, looped: boolean) {
  if (!looped) return trackIndex;
  if (trackIndex === 0) return count - 1;
  if (trackIndex === count + 1) return 0;
  return trackIndex - 1;
}

/**
 * 滑块视图：Pointer 跟手拖拽，可选箭头 / 指示点。
 * loop 时用首尾克隆做无缝循环，避免末页硬切回首页。
 */
export function Swiper({
  className,
  children,
  loop = true,
  autoplay = false,
  interval = 3000,
  threshold = 40,
  showDots = true,
  showArrows = false,
  onChange,
  ...props
}: SwiperProps) {
  const slides = Children.toArray(children);
  const count = slides.length;
  const looped = loop && count > 1;

  const [trackIndex, setTrackIndex] = useState(() => (looped ? 1 : 0));
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [suppressTransition, setSuppressTransition] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const trackRef = useRef(trackIndex);
  const draggingRef = useRef(false);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    trackRef.current = trackIndex;
  }, [trackIndex]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useLayoutEffect(() => {
    if (!suppressTransition) return;
    const id = requestAnimationFrame(() => setSuppressTransition(false));
    return () => cancelAnimationFrame(id);
  }, [suppressTransition, trackIndex]);

  const emitChange = useCallback(
    (nextTrack: number) => {
      onChangeRef.current?.(toLogical(nextTrack, count, looped));
    },
    [count, looped],
  );

  const snapOffClone = useCallback(
    (from: number) => {
      if (!looped) return from;
      if (from === count + 1) {
        flushSync(() => {
          setSuppressTransition(true);
          setTrackIndex(1);
        });
        trackRef.current = 1;
        // Force layout so the jump commits before the next animated step
        void rootRef.current?.offsetWidth;
        return 1;
      }
      if (from === 0) {
        flushSync(() => {
          setSuppressTransition(true);
          setTrackIndex(count);
        });
        trackRef.current = count;
        void rootRef.current?.offsetWidth;
        return count;
      }
      return from;
    },
    [looped, count],
  );

  const goBy = useCallback(
    (delta: number) => {
      if (count <= 1) return;
      if (!looped) {
        const next = Math.max(0, Math.min(trackRef.current + delta, count - 1));
        if (next === trackRef.current) return;
        trackRef.current = next;
        setTrackIndex(next);
        emitChange(next);
        return;
      }
      // 停在首/尾克隆页时若继续快切，必须先落到真实页，否则 trackIndex 会越界出空白
      const current = snapOffClone(trackRef.current);
      const next = current + delta;
      trackRef.current = next;
      setTrackIndex(next);
      emitChange(next);
    },
    [count, looped, emitChange, snapOffClone],
  );

  const goToLogical = useCallback(
    (logical: number) => {
      if (count <= 0) return;
      const clamped = Math.max(0, Math.min(logical, count - 1));
      snapOffClone(trackRef.current);
      const next = looped ? clamped + 1 : clamped;
      if (next === trackRef.current) return;
      trackRef.current = next;
      setTrackIndex(next);
      emitChange(next);
    },
    [count, looped, emitChange, snapOffClone],
  );

  useEffect(() => {
    if (!autoplay || count <= 1 || dragging) return;
    const timer = setInterval(() => goBy(1), interval);
    return () => clearInterval(timer);
  }, [autoplay, interval, count, goBy, dragging]);

  const settleClone = (endedTrack: number) => {
    if (!looped) return;
    if (endedTrack === count + 1) {
      setSuppressTransition(true);
      setTrackIndex(1);
      trackRef.current = 1;
    } else if (endedTrack === 0) {
      setSuppressTransition(true);
      setTrackIndex(count);
      trackRef.current = count;
    }
  };

  const onTrackTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.propertyName !== 'transform') return;
    settleClone(trackRef.current);
  };

  const endDrag = (clientX: number) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;

    const diff = clientX - startX.current;
    const width = rootRef.current?.offsetWidth ?? 0;
    const commit =
      Math.abs(diff) >= threshold ||
      (width > 0 && Math.abs(diff) >= width * 0.2);

    if (commit && count > 1) {
      goBy(diff < 0 ? 1 : -1);
    }
    setDragX(0);
    setDragging(false);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (count <= 1 || e.button !== 0) return;
    // 箭头 / 指示点不触发拖拽
    if ((e.target as HTMLElement).closest('button')) return;
    draggingRef.current = true;
    startX.current = e.clientX;
    setDragging(true);
    setDragX(0);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    let dx = e.clientX - startX.current;
    if (!looped) {
      const i = trackRef.current;
      if ((i === 0 && dx > 0) || (i === count - 1 && dx < 0)) {
        dx *= 0.35;
      }
    }
    setDragX(dx);
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    endDrag(e.clientX);
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    }
  };

  const onPointerCancel = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragX(0);
    setDragging(false);
  };

  if (count === 0) return null;

  const trackSlides = looped
    ? [slides[count - 1], ...slides, slides[0]]
    : slides;
  const logicalIndex = toLogical(trackIndex, count, looped);

  return (
    <div
      ref={rootRef}
      {...props}
      className={cn(
        'relative select-none overflow-hidden touch-pan-y',
        count > 1 && 'cursor-grab active:cursor-grabbing',
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <div
        className={cn(
          'flex ease-out',
          dragging || suppressTransition
            ? 'transition-none'
            : 'transition-transform duration-300',
        )}
        style={{
          transform: `translateX(calc(-${trackIndex * 100}% + ${dragX}px))`,
        }}
        onTransitionEnd={onTrackTransitionEnd}
      >
        {trackSlides.map((slide, i) => (
          <div
            key={i}
            className="w-full shrink-0"
            aria-hidden={looped && (i === 0 || i === count + 1)}
          >
            {slide}
          </div>
        ))}
      </div>
      {showArrows && count > 1 ? (
        <>
          <button
            type="button"
            className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-surface-foreground shadow-sm ring-1 ring-border/60 transition-colors hover:bg-surface"
            onClick={() => goBy(-1)}
            aria-label="Previous"
          >
            <Icon name="arrow-left" size="sm" />
          </button>
          <button
            type="button"
            className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-surface-foreground shadow-sm ring-1 ring-border/60 transition-colors hover:bg-surface"
            onClick={() => goBy(1)}
            aria-label="Next"
          >
            <Icon name="arrow-right" size="sm" />
          </button>
        </>
      ) : null}
      {showDots && count > 1 ? (
        <div className="pointer-events-none absolute bottom-2 left-0 right-0 z-10 flex justify-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              tabIndex={-1}
              className={cn(
                'pointer-events-auto h-1.5 w-1.5 rounded-full transition-colors',
                i === logicalIndex ? 'bg-primary' : 'bg-border',
              )}
              onClick={() => goToLogical(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
