import type { HTMLAttributes, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { insetGroupedList } from '../../utils/interaction';

const listVariants = tv({
  base: '',
  variants: {
    bordered: {
      true: insetGroupedList,
      false: 'divide-y divide-separator',
    },
    size: {
      sm: '',
      md: '',
      lg: '',
    },
  },
  defaultVariants: {
    bordered: false,
    size: 'md',
  },
});

const itemPadding = {
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-6 py-4',
} as const;

export interface ListItem {
  key: string;
  title?: ReactNode;
  description?: ReactNode;
  extra?: ReactNode;
  avatar?: ReactNode;
  actions?: ReactNode;
}

export interface ListProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof listVariants> {
  items: ListItem[];
  header?: ReactNode;
  footer?: ReactNode;
}

export function List({
  className,
  bordered,
  size = 'md',
  items,
  header,
  footer,
  ...props
}: ListProps) {
  return (
    <div className={cn(listVariants({ bordered, size }), className)} {...props}>
      {header ? (
        <div
          className={cn(
            itemPadding[size ?? 'md'],
            'text-sm font-medium text-label-secondary',
          )}
        >
          {header}
        </div>
      ) : null}
      {items.map((item) => (
        <div
          key={item.key}
          className={cn(itemPadding[size ?? 'md'], 'flex items-start gap-3')}
        >
          {item.avatar ? <div className="shrink-0">{item.avatar}</div> : null}
          <div className="min-w-0 flex-1">
            {item.title ? (
              <div className="text-sm font-medium text-label">{item.title}</div>
            ) : null}
            {item.description ? (
              <div className="mt-0.5 text-sm text-label-secondary">
                {item.description}
              </div>
            ) : null}
            {item.actions ? (
              <div className="mt-2 flex gap-2">{item.actions}</div>
            ) : null}
          </div>
          {item.extra ? (
            <div className="shrink-0 text-sm text-label-secondary">
              {item.extra}
            </div>
          ) : null}
        </div>
      ))}
      {footer ? (
        <div
          className={cn(
            itemPadding[size ?? 'md'],
            'text-sm text-label-secondary',
          )}
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
}
