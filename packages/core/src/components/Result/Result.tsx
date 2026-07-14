import type { HTMLAttributes, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';

const resultVariants = tv({
  base: 'flex flex-col items-center py-8 text-center',
  variants: {
    status: {
      success: '',
      error: '',
      info: '',
      warning: '',
      '404': '',
      '403': '',
      '500': '',
    },
  },
  defaultVariants: {
    status: 'info',
  },
});

const statusIcons: Record<string, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '!',
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
  status,
  title,
  subTitle,
  icon,
  extra,
  children,
  ...props
}: ResultProps) {
  return (
    <div className={cn(resultVariants({ status }), className)} {...props}>
      <div className="mb-4 text-4xl text-muted-foreground">
        {icon ?? statusIcons[status ?? 'info']}
      </div>
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
