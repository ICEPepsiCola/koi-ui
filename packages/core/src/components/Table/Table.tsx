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
