import type { HTMLAttributes, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { StatusIcon, type StatusColor } from '../../utils/semanticSurface';

const resultVariants = tv({
  base: 'flex flex-col items-center py-8 text-center',
  variants: {
    status: {
      success: 'text-success',
      error: 'text-error',
      info: 'text-info',
      warning: 'text-warning',
      '404': 'text-muted-foreground',
      '403': 'text-warning',
      '500': 'text-error',
    },
  },
  defaultVariants: {
    status: 'info',
  },
});

const STATUS_TO_ICON: Record<string, StatusColor | 'neutral'> = {
  success: 'success',
  error: 'error',
  info: 'info',
  warning: 'warning',
  '404': 'neutral',
  '403': 'warning',
  '500': 'error',
};

const HTTP_LABEL: Record<string, string> = {
  '404': '404',
  '403': '403',
  '500': '500',
};

export interface ResultProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof resultVariants> {
  title?: ReactNode;
  subTitle?: ReactNode;
  icon?: ReactNode;
  extra?: ReactNode;
  children?: ReactNode;
}

export function Result({
  className,
  status = 'info',
  title,
  subTitle,
  icon,
  extra,
  children,
  ...props
}: ResultProps) {
  const key = status ?? 'info';
  const httpLabel = HTTP_LABEL[key];
  const resolvedIcon =
    icon ??
    (httpLabel ? (
      <span className="text-5xl font-bold tracking-tight">{httpLabel}</span>
    ) : (
      <StatusIcon color={STATUS_TO_ICON[key] ?? 'info'} size="lg" />
    ));

  return (
    <div className={cn(resultVariants({ status }), className)} {...props}>
      <div className="mb-4">{resolvedIcon}</div>
      {title ? (
        <div className="mb-2 text-lg font-semibold text-surface-foreground">
          {title}
        </div>
      ) : null}
      {subTitle ? (
        <div className="mb-4 text-sm text-muted-foreground">{subTitle}</div>
      ) : null}
      {children}
      {extra ? <div className="mt-4">{extra}</div> : null}
    </div>
  );
}
