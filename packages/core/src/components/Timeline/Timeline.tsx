import type { HTMLAttributes, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';

const timelineVariants = tv({
  base: 'relative pl-6',
  variants: {
    mode: {
      left: '',
      alternate: '',
    },
  },
  defaultVariants: {
    mode: 'left',
  },
});

export interface TimelineItem {
  key: string;
  label?: ReactNode;
  children?: ReactNode;
  color?: 'default' | 'primary' | 'destructive' | 'success';
  dot?: ReactNode;
}

export interface TimelineProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof timelineVariants> {
  items: TimelineItem[];
  pending?: ReactNode;
}

const dotColors = {
  default: 'bg-border',
  primary: 'bg-primary',
  destructive: 'bg-destructive',
  success: 'bg-emerald-500',
} as const;

export function Timeline({
  className,
  mode,
  items,
  pending,
  ...props
}: TimelineProps) {
  return (
    <div className={cn(timelineVariants({ mode }), className)} {...props}>
      <div className="absolute bottom-0 left-[7px] top-0 w-px bg-border" />
      {items.map((item) => (
        <div key={item.key} className="relative pb-6 last:pb-0">
          <div className="absolute -left-6 top-1">
            {item.dot ?? (
              <span
                className={cn(
                  'block h-3.5 w-3.5 rounded-full border-2 border-surface',
                  dotColors[item.color ?? 'default'],
                )}
              />
            )}
          </div>
          {item.label ? (
            <div className="mb-1 text-sm font-medium text-surface-foreground">
              {item.label}
            </div>
          ) : null}
          {item.children ? (
            <div className="text-sm text-muted-foreground">{item.children}</div>
          ) : null}
        </div>
      ))}
      {pending ? (
        <div className="relative text-sm text-muted-foreground">{pending}</div>
      ) : null}
    </div>
  );
}
