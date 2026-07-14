import type { HTMLAttributes, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';

const avatarVariants = tv({
  base: 'relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-muted text-muted-foreground font-medium',
  variants: {
    size: {
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-16 w-16 text-lg',
    },
    shape: {
      circle: 'rounded-full',
      square: 'rounded-md',
    },
  },
  defaultVariants: {
    size: 'md',
    shape: 'circle',
  },
});

export interface AvatarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: ReactNode;
  children?: ReactNode;
}

export function Avatar({
  className,
  size,
  shape,
  src,
  alt,
  fallback,
  children,
  ...props
}: AvatarProps) {
  const content = children ?? fallback ?? (alt ? alt.charAt(0).toUpperCase() : '?');

  return (
    <div className={cn(avatarVariants({ size, shape }), className)} {...props}>
      {src ? (
        <img src={src} alt={alt ?? ''} className="h-full w-full object-cover" />
      ) : (
        <span>{content}</span>
      )}
    </div>
  );
}
