import { AdaptiveRender } from '../../adaptive/AdaptiveRender';
import { CardListView } from './CardListView';
import type { ColumnDef } from './TableView';
import { TableView } from './TableView';

export type { ColumnDef };

export interface TableProps<T extends Record<string, unknown>> {
  columns: ColumnDef<T>[];
  data: T[];
  mobileFields?: (keyof T)[];
  loading?: boolean;
  emptyText?: string;
  onRowClick?: (row: T) => void;
  responsive?: boolean;
  /**
   * Pin the header while the table scrolls (desktop view).
   * @since 1.14.0
   */
  stickyHeader?: boolean;
  /**
   * Max height of the scroll container when sticky / virtual / fixed columns need a scrollport.
   * @since 1.14.0
   */
  maxHeight?: number | string;
  /**
   * Window only visible rows on desktop.
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

export function Table<T extends Record<string, unknown>>({
  responsive = true,
  ...props
}: TableProps<T>) {
  return (
    <AdaptiveRender
      desktop={TableView}
      mobile={CardListView}
      props={props}
      responsive={responsive}
    />
  );
}
