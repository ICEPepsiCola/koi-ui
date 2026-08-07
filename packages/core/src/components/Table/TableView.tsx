import {
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type UIEvent,
} from 'react';
import { cn } from '../../utils/cn';
import { useKoiContext } from '../../provider/context';
import { isActivationKey } from '../../utils/keyboard';
import { LoadingHint } from '../shared/LoadingHint';
import { Empty } from '../Empty/Empty';

const DEFAULT_ROW_HEIGHT = 44;
const DEFAULT_FIXED_WIDTH = 120;
const DEFAULT_MAX_HEIGHT = 384;
const DEFAULT_OVERSCAN = 6;

export interface ColumnDef<T> {
  key: keyof T & string;
  title: ReactNode;
  render?: (value: T[keyof T], row: T) => ReactNode;
  /**
   * Column width in px (recommended when `fixed` or `virtual` is on).
   * @since 1.14.0
   */
  width?: number;
  /**
   * Pin the column while scrolling horizontally.
   * @since 1.14.0
   */
  fixed?: 'left' | 'right';
}

export interface TableViewProps<T extends Record<string, unknown>> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  onRowClick?: (row: T) => void;
  /**
   * Pin the header while the table scrolls vertically.
   * Pair with `maxHeight` for a body scrollport.
   * @since 1.14.0
   */
  stickyHeader?: boolean;
  /**
   * Max height of the scroll container.
   * Required for a useful sticky header / virtual window.
   * Number means pixels.
   * @since 1.14.0
   */
  maxHeight?: number | string;
  /**
   * Window only visible rows (desktop). Implies a vertical scrollport.
   * @since 1.14.0
   */
  virtual?: boolean;
  /**
   * Row height used by virtualization (px).
   * @default 44
   * @since 1.14.0
   */
  rowHeight?: number;
  /**
   * Extra rows rendered above/below the viewport when `virtual`.
   * @default 6
   * @since 1.14.0
   */
  overscan?: number;
}

function columnWidth(col: ColumnDef<Record<string, unknown>>) {
  return col.width ?? (col.fixed ? DEFAULT_FIXED_WIDTH : undefined);
}

function buildFixedOffsets(columns: ColumnDef<Record<string, unknown>>[]) {
  const leftOffsets: Array<number | undefined> = Array(columns.length);
  const rightOffsets: Array<number | undefined> = Array(columns.length);

  let left = 0;
  columns.forEach((col, index) => {
    if (col.fixed !== 'left') return;
    leftOffsets[index] = left;
    left += columnWidth(col) ?? DEFAULT_FIXED_WIDTH;
  });

  let right = 0;
  for (let index = columns.length - 1; index >= 0; index -= 1) {
    const col = columns[index]!;
    if (col.fixed !== 'right') continue;
    rightOffsets[index] = right;
    right += columnWidth(col) ?? DEFAULT_FIXED_WIDTH;
  }

  return { leftOffsets, rightOffsets };
}

function cellStickyStyle(
  index: number,
  leftOffsets: Array<number | undefined>,
  rightOffsets: Array<number | undefined>,
  stickyHeader: boolean,
  isHeader: boolean,
): CSSProperties | undefined {
  const left = leftOffsets[index];
  const right = rightOffsets[index];
  if (left === undefined && right === undefined && !stickyHeader) return undefined;

  const style: CSSProperties = {};
  if (left !== undefined) {
    style.position = 'sticky';
    style.left = left;
    style.zIndex = isHeader ? 4 : 2;
  }
  if (right !== undefined) {
    style.position = 'sticky';
    style.right = right;
    style.zIndex = isHeader ? 4 : 2;
  }
  if (stickyHeader && isHeader) {
    style.position = 'sticky';
    style.top = 0;
    const baseZ = typeof style.zIndex === 'number' ? style.zIndex : 0;
    style.zIndex =
      left !== undefined || right !== undefined
        ? Math.max(baseZ, 5)
        : Math.max(baseZ, 3);
  }
  return style;
}

export function TableView<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyText,
  onRowClick,
  stickyHeader = false,
  maxHeight,
  virtual = false,
  rowHeight = DEFAULT_ROW_HEIGHT,
  overscan = DEFAULT_OVERSCAN,
}: TableViewProps<T>) {
  const { messages } = useKoiContext();
  const resolvedEmptyText = emptyText ?? messages.emptyText;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const { leftOffsets, rightOffsets } = useMemo(
    () => buildFixedOffsets(columns as ColumnDef<Record<string, unknown>>[]),
    [columns],
  );

  const needsScrollport = stickyHeader || virtual || columns.some((c) => c.fixed);
  const resolvedMaxHeight =
    maxHeight === undefined
      ? needsScrollport
        ? DEFAULT_MAX_HEIGHT
        : undefined
      : typeof maxHeight === 'number'
        ? maxHeight
        : maxHeight;

  const viewportHeight =
    typeof resolvedMaxHeight === 'number'
      ? resolvedMaxHeight
      : DEFAULT_MAX_HEIGHT;

  const handleRowKeyDown = (
    event: KeyboardEvent<HTMLTableRowElement>,
    row: T,
  ) => {
    if (!onRowClick || !isActivationKey(event.key)) return;
    event.preventDefault();
    onRowClick(row);
  };

  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!virtual) return;
    setScrollTop(event.currentTarget.scrollTop);
  };

  if (loading) {
    return <LoadingHint />;
  }

  if (data.length === 0) {
    return <Empty description={resolvedEmptyText} className="py-8" />;
  }

  let start = 0;
  let end = data.length;
  let topPad = 0;
  let bottomPad = 0;

  if (virtual) {
    const headerOffset = stickyHeader ? rowHeight : 0;
    const bodyViewport = Math.max(rowHeight, viewportHeight - headerOffset);
    start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    end = Math.min(
      data.length,
      Math.ceil((scrollTop + bodyViewport) / rowHeight) + overscan,
    );
    topPad = start * rowHeight;
    bottomPad = Math.max(0, (data.length - end) * rowHeight);
  }

  const visibleRows = data.slice(start, end);

  return (
    <div
      ref={scrollRef}
      className={cn(
        'w-full rounded-box border border-separator bg-surface shadow-field',
        needsScrollport ? 'overflow-auto' : 'overflow-x-auto',
      )}
      style={
        needsScrollport && resolvedMaxHeight !== undefined
          ? { maxHeight: resolvedMaxHeight }
          : undefined
      }
      onScroll={onScroll}
    >
      <table className="w-full min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead className="bg-fill/60">
          <tr>
            {columns.map((col, index) => {
              const width = columnWidth(col as ColumnDef<Record<string, unknown>>);
              return (
                <th
                  key={col.key}
                  className={cn(
                    'border-b border-separator bg-fill/60 px-4 py-3 font-medium text-label',
                    col.fixed && 'shadow-[1px_0_0_0_var(--color-separator)]',
                    col.fixed === 'right' &&
                      'shadow-[-1px_0_0_0_var(--color-separator)]',
                  )}
                  style={{
                    width,
                    minWidth: width,
                    maxWidth: width,
                    ...cellStickyStyle(
                      index,
                      leftOffsets,
                      rightOffsets,
                      stickyHeader || virtual,
                      true,
                    ),
                  }}
                >
                  {col.title}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {topPad > 0 ? (
            <tr aria-hidden>
              <td
                colSpan={columns.length}
                style={{ height: topPad, padding: 0, border: 0 }}
              />
            </tr>
          ) : null}
          {visibleRows.map((row, localIndex) => {
            const rowIndex = start + localIndex;
            return (
              <tr
                key={rowIndex}
                className={cn(
                  onRowClick &&
                    'cursor-pointer hover:bg-fill/50 focus-within:bg-fill/50',
                )}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={() => onRowClick?.(row)}
                onKeyDown={(event) => handleRowKeyDown(event, row)}
              >
                {columns.map((col, index) => {
                  const width = columnWidth(
                    col as ColumnDef<Record<string, unknown>>,
                  );
                  return (
                    <td
                      key={col.key}
                      className={cn(
                        'border-t border-separator bg-surface px-4 py-3 text-label',
                        col.fixed &&
                          'shadow-[1px_0_0_0_var(--color-separator)]',
                        col.fixed === 'right' &&
                          'shadow-[-1px_0_0_0_var(--color-separator)]',
                      )}
                      style={{
                        width,
                        minWidth: width,
                        maxWidth: width,
                        height: virtual ? rowHeight : undefined,
                        ...cellStickyStyle(
                          index,
                          leftOffsets,
                          rightOffsets,
                          false,
                          false,
                        ),
                      }}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key] ?? '')}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {bottomPad > 0 ? (
            <tr aria-hidden>
              <td
                colSpan={columns.length}
                style={{ height: bottomPad, padding: 0, border: 0 }}
              />
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
