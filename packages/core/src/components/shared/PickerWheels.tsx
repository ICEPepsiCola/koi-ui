import {
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/cn';
import { controlTransition } from '../../utils/interaction';

export const WHEEL_ITEM_H = 32;

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
            'pointer-events-none absolute top-1/2 z-[1] h-8 -translate-y-1/2 rounded-md',
            inset,
            'bg-muted/70',
          )}
        />
      ) : null}
      <div
        className="relative z-[2] grid h-full"
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

  useEffect(() => {
    optionsRef.current = options;
    valueRef.current = value;
    onChangeRef.current = onChange;
  });

  useLayoutEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const idx = options.findIndex((o) => o.value === value);
    if (idx < 0) return;
    const nextTop = drumMode ? idx * WHEEL_ITEM_H : 0;
    if (!drumMode) {
      // List mode: keep selected in view without centering spacers.
      const selectedTop = idx * WHEEL_ITEM_H;
      if (
        selectedTop < root.scrollTop ||
        selectedTop + WHEEL_ITEM_H > root.scrollTop + root.clientHeight
      ) {
        root.scrollTop = selectedTop;
      }
      return;
    }
    if (Math.abs(root.scrollTop - nextTop) <= 1) return;
    ignoreScrollRef.current = true;
    root.scrollTop = nextTop;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ignoreScrollRef.current = false;
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- optionsKey tracks content
  }, [value, optionsKey, viewportH, drumMode]);

  useEffect(() => {
    return () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, []);

  const commitFromScroll = () => {
    if (!drumMode) return;
    const root = scrollerRef.current;
    if (!root || ignoreScrollRef.current) return;
    const idx = Math.round(root.scrollTop / WHEEL_ITEM_H);
    const clamped = Math.max(0, Math.min(optionsRef.current.length - 1, idx));
    const opt = optionsRef.current[clamped];
    if (!opt || opt.disabled) return;
    if (opt.value !== valueRef.current) {
      onChangeRef.current(opt.value);
    }
  };

  const scheduleCommit = () => {
    if (!drumMode || ignoreScrollRef.current) return;
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    settleTimerRef.current = setTimeout(commitFromScroll, 80);
  };

  return (
    <div
      ref={scrollerRef}
      data-picker-column
      role="listbox"
      className={cn(
        'h-full overflow-y-auto overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        drumMode && 'touch-pan-y snap-y snap-mandatory',
      )}
      style={
        drumMode
          ? {
              maskImage:
                'linear-gradient(to bottom, transparent, #000 22%, #000 78%, transparent)',
              WebkitMaskImage:
                'linear-gradient(to bottom, transparent, #000 22%, #000 78%, transparent)',
            }
          : undefined
      }
      onScroll={scheduleCommit}
    >
      {spacerH > 0 ? (
        <div className="shrink-0" style={{ height: spacerH }} aria-hidden />
      ) : null}
      {options.map((opt) => {
        const active = opt.value === value;
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
              drumMode && 'snap-center',
              controlTransition,
              active
                ? drumMode
                  ? 'font-semibold text-surface-foreground'
                  : 'rounded-md bg-muted/80 font-semibold text-surface-foreground'
                : drumMode
                  ? 'font-normal text-muted-foreground/55'
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
