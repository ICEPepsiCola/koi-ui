import type { HTMLAttributes, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { controlTransition, focusRing, pressable } from '../../utils/interaction';
import { Icon } from '../Icon/Icon';

const breadcrumbVariants = tv({
  base: 'flex flex-wrap items-center gap-1 text-sm',
});

const itemVariants = tv({
  base: cn(
    'inline-flex items-center gap-1 rounded-selector',
    controlTransition,
  ),
  variants: {
    active: {
      true: 'font-medium text-surface-foreground',
      false: 'text-muted-foreground hover:text-surface-foreground',
    },
  },
  defaultVariants: {
    active: false,
  },
});

export interface BreadcrumbItem {
  title: ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof breadcrumbVariants> {
  items: BreadcrumbItem[];
  separator?: ReactNode;
}

export function Breadcrumb({
  items,
  separator = '/',
  className,
  ...props
}: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn(breadcrumbVariants(), className)} {...props}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const content = (
            <span className={cn(itemVariants({ active: isLast }))}>
              {item.title}
            </span>
          );

          return (
            <li key={index} className="inline-flex items-center gap-1">
              {item.href && !isLast ? (
                <a
                  href={item.href}
                  className={cn(itemVariants({ active: false }), focusRing, pressable)}
                  onClick={item.onClick}
                >
                  {item.title}
                </a>
              ) : item.onClick && !isLast ? (
                <button
                  type="button"
                  className={cn(itemVariants({ active: false }), focusRing, pressable)}
                  onClick={item.onClick}
                >
                  {item.title}
                </button>
              ) : (
                content
              )}
              {!isLast ? (
                <span className="text-muted-foreground" aria-hidden>
                  {separator}
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function BreadcrumbSeparator() {
  return <Icon name="arrow-right" size="xs" className="text-muted-foreground" />;
}
