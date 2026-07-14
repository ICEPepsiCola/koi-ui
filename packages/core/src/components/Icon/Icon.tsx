import type { ReactNode, SVGAttributes } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';

const iconVariants = tv({
  base: 'inline-block shrink-0',
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-8 w-8',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export type IconName =
  | 'search'
  | 'close'
  | 'check'
  | 'plus'
  | 'minus'
  | 'arrow-left'
  | 'arrow-right'
  | 'loading';

const ICON_PATHS: Record<IconName, ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6L6 18" />,
  check: <path d="M5 13l4 4L19 7" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  'arrow-left': <path d="M15 6l-6 6 6 6" />,
  'arrow-right': <path d="M9 6l6 6-6 6" />,
  loading: <path d="M12 3a9 9 0 109 9" />,
};

export interface IconProps
  extends Omit<SVGAttributes<SVGSVGElement>, 'name'>,
    VariantProps<typeof iconVariants> {
  name: IconName;
}

export function Icon({ name, size, className, ...props }: IconProps) {
  const isLoading = name === 'loading';

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={props['aria-label'] ? undefined : true}
      className={cn(
        iconVariants({ size }),
        isLoading && 'animate-spin',
        className,
      )}
      {...props}
    >
      {ICON_PATHS[name]}
    </svg>
  );
}
