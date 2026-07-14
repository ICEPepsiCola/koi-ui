import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
export interface ColumnDef<T> {
  key: keyof T & string;
  title: ReactNode;
  render?: (value: T[keyof T], row: T) => ReactNode;
}

export interface TableViewProps<T extends Record<string, unknown>> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  onRowClick?: (row: T) => void;
}

export function TableView<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyText = '暂无数据',
  onRowClick,
}: TableViewProps<T>) {
  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground">
        加载中...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-full text-left text-sm">
        <thead className="bg-muted">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 font-medium text-surface-foreground"
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className={cn(
                'border-t border-border',
                onRowClick && 'cursor-pointer hover:bg-muted/50',
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3">
                  {col.render
                    ? col.render(row[col.key], row)
                    : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
