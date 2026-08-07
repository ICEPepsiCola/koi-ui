import {
  useCallback,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  applyRubberband,
  velocityFromSamples,
  type PointSample,
} from '../motion/gesture';

const SAMPLE_BUFFER_MAX = 20;
const SAMPLE_BUFFER_MS = 200;

export interface UseVerticalDragOptions {
  enabled?: boolean;
  min?: number;
  max?: number;
  /** Viewport dimension for rubber-band resistance. */
  dimension?: number;
  onOffsetChange?: (offset: number) => void;
  onDragEnd?: (result: { offset: number; velocity: number }) => void;
  /** Minimum pointer travel (px) before counting as a drag. @default 4 */
  moveThreshold?: number;
}

export interface UseVerticalDragResult {
  offset: number;
  dragging: boolean;
  dragMoved: boolean;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
}

export function useVerticalDrag({
  enabled = true,
  min = 0,
  max,
  dimension = 300,
  onOffsetChange,
  onDragEnd,
  moveThreshold = 4,
}: UseVerticalDragOptions = {}): UseVerticalDragResult {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragMoved, setDragMoved] = useState(false);

  const offsetRef = useRef(0);
  const startYRef = useRef(0);
  const startOffsetRef = useRef(0);
  const samplesRef = useRef<PointSample[]>([]);
  const activePointerIdRef = useRef<number | null>(null);
  const dragMovedRef = useRef(false);

  const updateOffset = useCallback(
    (next: number) => {
      offsetRef.current = next;
      setOffset(next);
      onOffsetChange?.(next);
    },
    [onOffsetChange],
  );

  const pushSample = useCallback((sample: PointSample) => {
    const samples = samplesRef.current;
    samples.push(sample);
    const cutoff = sample.t - SAMPLE_BUFFER_MS;
    while (
      samples.length > SAMPLE_BUFFER_MAX ||
      (samples.length > 2 && samples[0].t < cutoff)
    ) {
      samples.shift();
    }
  }, []);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!enabled || event.button !== 0) return;
      activePointerIdRef.current = event.pointerId;
      startYRef.current = event.clientY;
      startOffsetRef.current = offsetRef.current;
      samplesRef.current = [{ y: event.clientY, t: performance.now() }];
      dragMovedRef.current = false;
      setDragMoved(false);
      setDragging(true);
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    [enabled],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!enabled || activePointerIdRef.current !== event.pointerId) return;

      const now = performance.now();
      const travel = event.clientY - startYRef.current;
      if (Math.abs(travel) > moveThreshold) {
        if (!dragMovedRef.current) {
          dragMovedRef.current = true;
          setDragMoved(true);
        }
      }

      const raw = startOffsetRef.current + travel;
      updateOffset(
        applyRubberband(raw, {
          min,
          max,
          dimension,
        }),
      );
      pushSample({ y: event.clientY, t: now });
    },
    [enabled, min, max, dimension, moveThreshold, pushSample, updateOffset],
  );

  const finishDrag = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (activePointerIdRef.current !== event.pointerId) return;

      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture?.(event.pointerId);
      }

      activePointerIdRef.current = null;
      setDragging(false);

      const velocity = velocityFromSamples(samplesRef.current);
      samplesRef.current = [];
      onDragEnd?.({ offset: offsetRef.current, velocity });
    },
    [onDragEnd],
  );

  return {
    offset,
    dragging,
    dragMoved,
    onPointerDown,
    onPointerMove,
    onPointerUp: finishDrag,
    onPointerCancel: finishDrag,
  };
}
