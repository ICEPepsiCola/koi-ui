import type { HTMLAttributes, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { useKoiContext } from '../../provider/context';
import { Icon } from '../Icon/Icon';

const navBarVariants = tv({
  base: 'z-40 flex h-12 items-center border-b border-border bg-surface px-3',
  variants: {
    safeArea: {
      true: 'pt-[env(safe-area-inset-top)]',
      false: '',
    },
    bordered: {
      true: 'border-b border-border',
      false: 'border-b-0 shadow-sm',
    },
    fixed: {
      true: 'fixed inset-x-0 top-0',
      false: 'relative w-full',
    },
  },
  defaultVariants: {
    safeArea: true,
    bordered: true,
    fixed: true,
  },
});

export interface NavBarProps
  extends Omit<HTMLAttributes<HTMLElement>, 'title'>,
    VariantProps<typeof navBarVariants> {
  title?: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  onBack?: () => void;
  backIcon?: ReactNode;
  /**
   * 是否固定在视口顶部。
   * 文档预览（KoiProvider.previewDevice）下默认 false，避免脱出演示容器。
   */
  fixed?: boolean;
}

export function NavBar({
  title,
  left,
  right,
  onBack,
  backIcon,
  safeArea,
  bordered,
  fixed,
  className,
  children,
  ...props
}: NavBarProps) {
  const { previewDevice } = useKoiContext();
  const isFixed = fixed ?? previewDevice == null;

  const backButton = onBack ? (
    <button
      type="button"
      className="flex h-8 w-8 items-center justify-center rounded-md text-surface-foreground hover:bg-muted"
      onClick={onBack}
      aria-label="返回"
    >
      {backIcon ?? <Icon name="arrow-left" size="md" />}
    </button>
  ) : null;

  return (
    <header
      className={cn(
        navBarVariants({ safeArea, bordered, fixed: isFixed }),
        className,
      )}
      {...props}
    >
      <div className="flex w-20 shrink-0 items-center justify-start gap-1">
        {left ?? backButton}
      </div>
      <div className="flex flex-1 items-center justify-center truncate text-base font-medium text-surface-foreground">
        {title ?? children}
      </div>
      <div className="flex w-20 shrink-0 items-center justify-end gap-1">
        {right}
      </div>
    </header>
  );
}
