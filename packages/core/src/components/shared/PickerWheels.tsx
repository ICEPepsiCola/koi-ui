import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/cn';
import { controlTransition } from '../../utils/interaction';

export const WHEEL_ITEM_H = 32;
const SETTLE_MS = 48;

export interface WheelColumnData {
  key?: string;
  options: Array<{ value: string; label: ReactNode; disabled?: boolean }>;
  value: string;
  onChange: (value: string) => void;
}

export interface PickerWheelsProps {
  columns: WheelColumnData[];
  /** Preferred visible rows when columns are long enough for drum mode. */
  maxVisibleRows?: number;
  className?: string;
  /** Tighter horizontal inset for desktop float menus. */
  density?: 'comfortable' | 'compact';
  /**
   * `auto` — short columns (≤2) use compact list; longer use drum.
   * `drum` — always center-highlight wheel (mobile sheets).
   * `list` — always top-aligned compact rows.
   */
  mode?: 'auto' | 'drum' | 'list';
}

function densestColumnLength(columns: WheelColumnData[]) {
  return columns.reduce((max, col) => Math.max(max, col.options.length), 0);
}

/**
 * Drum (center highlight + spacers) only when columns are long enough.
 * Very short columns (≤2) use a compact top-aligned list — avoids a large empty gap.
 */
function resolveLayout(
  columns: WheelColumnData[],
  maxVisibleRows: number,
  mode: 'auto' | 'drum' | 'list',
) {
  const densest = densestColumnLength(columns);
  const drumMode =
    mode === 'drum' ? true : mode === 'list' ? false : densest > 2;
  const visibleRows = drumMode
    ? Math.min(
        maxVisibleRows,
        densest > 0 && densest < maxVisibleRows ? Math.max(densest, 3) : maxVisibleRows,
      )
    : Math.max(1, densest);
  return {
    densest,
    drumMode,
    visibleRows,
    viewportH: visibleRows * WHEEL_ITEM_H,
  };
}

function nearestEnabledIndex(
  options: WheelColumnData['options'],
  rawIndex: number,
) {
  if (options.length === 0) return -1;
  const clamped = Math.max(0, Math.min(options.length - 1, rawIndex));
  if (!options[clamped]?.disabled) return clamped;

  for (let distance = 1; distance < options.length; distance += 1) {
    const before = clamped - distance;
    const after = clamped + distance;
    if (before >= 0 && !options[before]?.disabled) return before;
    if (after < options.length && !options[after]?.disabled) return after;
  }
  return clamped;
}

/**
 * Shared multi-column picker surface.
 * Long lists → iOS-style drum; short lists → compact top-aligned rows.
 */
export function PickerWheels({
  columns,
  maxVisibleRows = 5,
  className,
  density = 'comfortable',
  mode = 'auto',
}: PickerWheelsProps) {
  const { drumMode, viewportH } = resolveLayout(
    columns,
    maxVisibleRows,
    mode,
  );
  const inset = density === 'compact' ? 'inset-x-2' : 'inset-x-3';

  return (
    <div className={cn('relative', className)} style={{ height: viewportH }}>
      {drumMode ? (
        <div
          className={cn(
            'pointer-events-none absolute top-1/2 z-1 h-8 -translate-y-1/2 rounded-md',
            inset,
            'bg-muted/70',
          )}
        />
      ) : null}
      <div
        className="relative z-2 grid h-full"
        style={{
          gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
        }}
      >
        {columns.map((col, idx) => (
          <WheelColumn
            key={col.key ?? idx}
            options={col.options}
            value={col.value}
            onChange={col.onChange}
            viewportH={viewportH}
            drumMode={drumMode}
          />
        ))}
      </div>
    </div>
  );
}

function WheelColumn({
  options,
  value,
  onChange,
  viewportH,
  drumMode,
}: {
  options: WheelColumnData['options'];
  value: string;
  onChange: (value: string) => void;
  viewportH: number;
  drumMode: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef(options);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const ignoreScrollRef = useRef(false);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const optionsKey = options.map((o) => o.value).join('\0');
  const spacerH = drumMode ? viewportH / 2 - WHEEL_ITEM_H / 2 : 0;
  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const [visualIndex, setVisualIndex] = useState(selectedIndex);

  useEffect(() => {
    optionsRef.current = options;
    valueRef.current = value;
    onChangeRef.current = onChange;
  });

  const snapToIndex = (index: number, behavior: ScrollBehavior = 'auto') => {
    const root = scrollerRef.current;
    if (!root || !drumMode) return;
    const top = index * WHEEL_ITEM_H;
    if (Math.abs(root.scrollTop - top) <= 1) return;
    ignoreScrollRef.current = true;
    root.scrollTo({ top, behavior });
    const release = () => {
      ignoreScrollRef.current = false;
    };
    if (behavior === 'smooth') {
      window.setTimeout(release, 180);
    } else {
      requestAnimationFrame(() => {
        requestAnimationFrame(release);
      });
    }
  };

  useLayoutEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const idx = options.findIndex((o) => o.value === value);
    if (idx < 0) return;
    setVisualIndex(idx);
    if (!drumMode) {
      const selectedTop = idx * WHEEL_ITEM_H;
      if (
        selectedTop < root.scrollTop ||
        selectedTop + WHEEL_ITEM_H > root.scrollTop + root.clientHeight
      ) {
        root.scrollTop = selectedTop;
      }
      return;
    }
    snapToIndex(idx, 'auto');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- optionsKey tracks content
  }, [value, optionsKey, viewportH, drumMode]);

  useEffect(() => {
    return () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, []);

  const commitFromScroll = (smoothSnap = true) => {
    if (!drumMode) return;
    const root = scrollerRef.current;
    if (!root || ignoreScrollRef.current) return;
    const raw = Math.round(root.scrollTop / WHEEL_ITEM_H);
    const nextIndex = nearestEnabledIndex(optionsRef.current, raw);
    if (nextIndex < 0) return;
    setVisualIndex(nextIndex);
    const opt = optionsRef.current[nextIndex];
    if (!opt) return;
    if (opt.value !== valueRef.current) {
      onChangeRef.current(opt.value);
    }
    snapToIndex(nextIndex, smoothSnap ? 'smooth' : 'auto');
  };

  const scheduleCommit = () => {
    if (!drumMode || ignoreScrollRef.current) return;
    const root = scrollerRef.current;
    if (root) {
      const raw = Math.round(root.scrollTop / WHEEL_ITEM_H);
      setVisualIndex(nearestEnabledIndex(optionsRef.current, raw));
    }
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    settleTimerRef.current = setTimeout(() => commitFromScroll(true), SETTLE_MS);
  };

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || !drumMode) return;
    const onScrollEnd = () => {
      if (ignoreScrollRef.current) return;
      const raw = Math.round(root.scrollTop / WHEEL_ITEM_H);
      const nextIndex = nearestEnabledIndex(optionsRef.current, raw);
      if (nextIndex < 0) return;
      setVisualIndex(nextIndex);
      const opt = optionsRef.current[nextIndex];
      if (opt && opt.value !== valueRef.current) {
        onChangeRef.current(opt.value);
      }
      const top = nextIndex * WHEEL_ITEM_H;
      if (Math.abs(root.scrollTop - top) > 1) {
        ignoreScrollRef.current = true;
        root.scrollTo({ top, behavior: 'auto' });
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            ignoreScrollRef.current = false;
          });
        });
      }
    };
    root.addEventListener('scrollend', onScrollEnd);
    return () => root.removeEventListener('scrollend', onScrollEnd);
  }, [drumMode]);

  return (
    <div
      ref={scrollerRef}
      data-picker-column
      role="listbox"
      className={cn(
        'h-full overflow-y-auto overscroll-contain [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden',
        drumMode && 'touch-pan-y snap-y snap-mandatory',
      )}
      style={
        drumMode
          ? {
              maskImage:
                'linear-gradient(to bottom, transparent, #000 18%, #000 82%, transparent)',
              WebkitMaskImage:
                'linear-gradient(to bottom, transparent, #000 18%, #000 82%, transparent)',
            }
          : undefined
      }
      onScroll={scheduleCommit}
    >
      {spacerH > 0 ? (
        <div className="shrink-0" style={{ height: spacerH }} aria-hidden />
      ) : null}
      {options.map((opt, index) => {
        const active = opt.value === value;
        const distance = Math.abs(index - visualIndex);
        const drumTone =
          distance === 0
            ? 'font-semibold text-surface-foreground scale-100'
            : distance === 1
              ? 'font-normal text-muted-foreground/70 scale-[0.96]'
              : 'font-normal text-muted-foreground/40 scale-[0.92]';
        return (
          <div
            key={opt.value}
            role="option"
            aria-selected={active}
            data-active={active}
            aria-disabled={opt.disabled || undefined}
            className={cn(
              'flex w-full shrink-0 items-center justify-center px-1 leading-none',
              drumMode ? 'text-[17px] tabular-nums' : 'text-[15px]',
              drumMode && 'snap-center [scroll-snap-stop:always]',
              controlTransition,
              drumMode
                ? drumTone
                : active
                  ? 'rounded-md bg-muted/80 font-semibold text-surface-foreground'
                  : 'font-normal text-muted-foreground/80',
              !drumMode && !active && 'hover:bg-muted/50',
              opt.disabled
                ? 'cursor-not-allowed opacity-35'
                : 'cursor-pointer',
            )}
            style={{ height: WHEEL_ITEM_H }}
            onClick={() => {
              if (opt.disabled) return;
              onChange(opt.value);
            }}
          >
            <span className="truncate">{opt.label}</span>
          </div>
        );
      })}
      {spacerH > 0 ? (
        <div className="shrink-0" style={{ height: spacerH }} aria-hidden />
      ) : null}
    </div>
  );
}
