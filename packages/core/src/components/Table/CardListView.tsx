import type { ReactNode } from 'react';
import { Card } from '../Card/Card';
import { useKoiContext } from '../../provider/context';
import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import type { ColumnDef } from './TableView';

export interface CardListViewProps<T extends Record<string, unknown>> {
  columns: ColumnDef<T>[];
  data: T[];
  mobileFields?: (keyof T)[];
  loading?: boolean;
  emptyText?: string;
  onRowClick?: (row: T) => void;
}

export function CardListView<T extends Record<string, unknown>>({
  columns,
  data,
  mobileFields,
  loading = false,
  emptyText,
  onRowClick,
}: CardListViewProps<T>) {
  const { messages } = useKoiContext();
  const resolvedEmptyText = emptyText ?? messages.emptyText;
  const fields =
    mobileFields ?? columns.slice(0, 3).map((c) => c.key as keyof T);

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground">
        {messages.loadingText}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground">
        {resolvedEmptyText}
      </div>
    );
  }

  const getTitle = (col: ColumnDef<T>): ReactNode => col.title;

  return (
    <Stack gap={4}>
      {data.map((row, i) => (
        <Card
          key={i}
          hoverable={Boolean(onRowClick)}
          onClick={() => onRowClick?.(row)}
        >
          <Stack gap={2}>
            {fields.map((field) => {
              const col = columns.find((c) => c.key === field);
              if (!col) return null;
              return (
                <div key={String(field)} className="flex justify-between gap-4">
                  <Text size="sm" muted>
                    {getTitle(col)}
                  </Text>
                  <Text size="sm" weight="medium">
                    {col.render
                      ? col.render(row[field], row)
                      : String(row[field] ?? '')}
                  </Text>
                </div>
              );
            })}
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}
