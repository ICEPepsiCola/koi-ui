import {
  useState,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { Portal } from '../../utils/portal';

const avatarVariants = tv({
  base: 'relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-muted text-muted-foreground font-medium ring-2 ring-surface',
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

const statusDot = tv({
  base: 'absolute z-[1] rounded-full border-2 border-surface',
  variants: {
    size: {
      sm: 'h-2 w-2',
      md: 'h-2.5 w-2.5',
      lg: 'h-3 w-3',
      xl: 'h-3.5 w-3.5',
    },
    status: {
      online: 'bg-success',
      offline: 'bg-muted-foreground',
      busy: 'bg-error',
      away: 'bg-warning',
    },
    placement: {
      'bottom-right': 'bottom-0 right-0',
      'top-right': 'top-0 right-0',
    },
  },
  defaultVariants: {
    size: 'md',
    status: 'online',
    placement: 'bottom-right',
  },
});

export interface AvatarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'color'>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: ReactNode;
  children?: ReactNode;
  /** Click image to preview. Only works when `src` is set. @default true */
  preview?: boolean;
  /** Presence indicator. */
  status?: 'online' | 'offline' | 'busy' | 'away';
}

export function Avatar({
  className,
  size,
  shape,
  src,
  alt,
  fallback,
  children,
  preview = true,
  status,
  onClick,
  ...props
}: AvatarProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const content = children ?? fallback ?? (alt ? alt.charAt(0).toUpperCase() : '?');
  const hasImage = Boolean(src) && !imageFailed;
  const canPreview = preview && hasImage;

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    onClick?.(event);
    if (!canPreview || event.defaultPrevented) return;
    setPreviewOpen(true);
  };

  return (
    <>
      <div
        className={cn(
          'relative inline-flex shrink-0',
          canPreview && 'cursor-zoom-in',
          className,
        )}
        onClick={canPreview || onClick ? handleClick : onClick}
        {...props}
      >
        <div className={avatarVariants({ size, shape })}>
          {hasImage ? (
            <img
              src={src}
              alt={alt ?? ''}
              className="h-full w-full object-cover"
              draggable={false}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span>{content}</span>
          )}
        </div>
        {status ? (
          <span
            className={statusDot({ size, status })}
            aria-label={status}
          />
        ) : null}
      </div>
      {canPreview && previewOpen ? (
        <Portal>
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4"
            onClick={() => setPreviewOpen(false)}
            role="presentation"
          >
            <img
              src={src}
              alt={alt ?? ''}
              className="max-h-full max-w-full object-contain"
              draggable={false}
              onClick={(event) => event.stopPropagation()}
            />
          </div>
        </Portal>
      ) : null}
    </>
  );
}

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Max avatars before +N. */
  max?: number;
  size?: AvatarProps['size'];
}

export function AvatarGroup({
  children,
  max,
  size = 'md',
  className,
  ...props
}: AvatarGroupProps) {
  const items = Array.isArray(children) ? children : children ? [children] : [];
  const visible = max != null ? items.slice(0, max) : items;
  const rest = max != null ? Math.max(0, items.length - max) : 0;

  return (
    <div
      className={cn('flex items-center -space-x-2', className)}
      {...props}
    >
      {visible}
      {rest > 0 ? (
        <Avatar
          size={size}
          fallback={`+${rest}`}
          className="z-0"
          preview={false}
        />
      ) : null}
    </div>
  );
}

Avatar.Group = AvatarGroup;
