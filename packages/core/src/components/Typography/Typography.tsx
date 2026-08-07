import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { controlTransition, focusRing } from '../../utils/interaction';

const titleVariants = tv({
  base: 'text-label',
  variants: {
    level: {
      1: 'text-4xl font-bold tracking-[var(--text-display-tracking)] leading-[var(--text-display-leading)]',
      2: 'text-3xl font-semibold tracking-[var(--text-title-tracking)] leading-[var(--text-title-leading)]',
      3: 'text-2xl font-semibold tracking-[var(--text-title-tracking)] leading-[var(--text-title-leading)]',
      4: 'text-xl font-semibold tracking-[var(--text-title-tracking)]',
      5: 'text-lg font-medium tracking-[var(--text-body-tracking)]',
      6: 'text-base font-medium tracking-[var(--text-body-tracking)]',
    },
    ellipsis: {
      true: 'truncate',
      false: '',
    },
  },
  defaultVariants: {
    level: 1,
    ellipsis: false,
  },
});

const textVariants = tv({
  base: 'text-label leading-[var(--text-body-leading)] tracking-[var(--text-body-tracking)]',
  variants: {
    size: {
      xs: 'text-xs leading-[var(--text-caption-leading)] tracking-[var(--text-caption-tracking)]',
      sm: 'text-sm leading-[var(--text-caption-leading)] tracking-[var(--text-caption-tracking)]',
      md: 'text-base',
      lg: 'text-lg',
    },
    type: {
      default: '',
      secondary: 'text-label-secondary',
      info: 'text-info',
      success: 'text-success',
      warning: 'text-warning',
      error: 'text-error',
    },
    strong: {
      true: 'font-semibold',
      false: '',
    },
    ellipsis: {
      true: 'truncate',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    type: 'default',
    strong: false,
    ellipsis: false,
  },
});

const paragraphVariants = tv({
  base: 'text-base text-label leading-[var(--text-body-leading)] tracking-[var(--text-body-tracking)]',
  variants: {
    type: {
      default: '',
      secondary: 'text-label-secondary',
    },
    ellipsis: {
      true: 'line-clamp-3',
      false: '',
    },
  },
  defaultVariants: {
    type: 'default',
    ellipsis: false,
  },
});

const linkVariants = tv({
  base: cn(
    'rounded-selector text-primary underline-offset-4 hover:underline',
    controlTransition,
    focusRing,
  ),
  variants: {
    disabled: {
      true: 'pointer-events-none opacity-50',
      false: '',
    },
  },
  defaultVariants: {
    disabled: false,
  },
});

export interface TitleProps
  extends HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof titleVariants> {
  children?: ReactNode;
}

export function Title({
  level = 1,
  ellipsis,
  className,
  children,
  ...props
}: TitleProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  return (
    <Tag
      className={cn(titleVariants({ level, ellipsis }), className)}
      {...props}
    >
      {children}
    </Tag>
  );
}

export interface TypographyTextProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof textVariants> {
  children?: ReactNode;
  as?: 'span' | 'label' | 'div';
}

export function Text({
  size,
  type,
  strong,
  ellipsis,
  as: Tag = 'span',
  className,
  children,
  ...props
}: TypographyTextProps) {
  return (
    <Tag
      className={cn(textVariants({ size, type, strong, ellipsis }), className)}
      {...props}
    >
      {children}
    </Tag>
  );
}

export interface ParagraphProps
  extends HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof paragraphVariants> {
  children?: ReactNode;
}

export function Paragraph({
  type,
  ellipsis,
  className,
  children,
  ...props
}: ParagraphProps) {
  return (
    <p
      className={cn(paragraphVariants({ type, ellipsis }), className)}
      {...props}
    >
      {children}
    </p>
  );
}

export interface LinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  children?: ReactNode;
  href?: string;
}

export function Link({
  disabled,
  className,
  children,
  href = '#',
  onClick,
  ...props
}: LinkProps) {
  return (
    <a
      href={disabled ? undefined : href}
      className={cn(linkVariants({ disabled }), className)}
      aria-disabled={disabled}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </a>
  );
}

export const Typography = {
  Title,
  Text,
  Paragraph,
  Link,
};
