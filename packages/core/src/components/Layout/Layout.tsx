import type { HTMLAttributes, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';

const layoutVariants = tv({
  base: 'flex min-h-0 min-w-0 flex-col bg-surface',
  variants: {
    hasSider: {
      true: '',
      false: '',
    },
  },
  defaultVariants: {
    hasSider: false,
  },
});

const headerVariants = tv({
  base: 'shrink-0 border-b border-border bg-surface px-6 py-4',
});

const siderVariants = tv({
  base: 'shrink-0 border-r border-border bg-muted',
  variants: {
    collapsed: {
      true: 'w-16',
      false: 'w-60',
    },
  },
  defaultVariants: {
    collapsed: false,
  },
});

const contentVariants = tv({
  base: 'min-h-0 flex-1 overflow-auto p-6',
});

const footerVariants = tv({
  base: 'shrink-0 border-t border-border bg-surface px-6 py-4 text-sm text-muted-foreground',
});

export interface LayoutProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof layoutVariants> {
  children?: ReactNode;
}

export function Layout({ hasSider, className, children, ...props }: LayoutProps) {
  return (
    <div
      className={cn(
        layoutVariants({ hasSider }),
        hasSider && 'flex-row',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

export function Header({ className, children, ...props }: HeaderProps) {
  return (
    <header className={cn(headerVariants(), className)} {...props}>
      {children}
    </header>
  );
}

export interface SiderProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof siderVariants> {
  children?: ReactNode;
  width?: number | string;
}

export function Sider({
  collapsed,
  width,
  className,
  children,
  style,
  ...props
}: SiderProps) {
  return (
    <aside
      className={cn(siderVariants({ collapsed }), className)}
      style={{
        ...style,
        ...(width !== undefined
          ? { width: typeof width === 'number' ? `${width}px` : width }
          : {}),
      }}
      {...props}
    >
      {children}
    </aside>
  );
}

export interface ContentProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

export function Content({ className, children, ...props }: ContentProps) {
  return (
    <main className={cn(contentVariants(), className)} {...props}>
      {children}
    </main>
  );
}

export interface FooterProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

export function Footer({ className, children, ...props }: FooterProps) {
  return (
    <footer className={cn(footerVariants(), className)} {...props}>
      {children}
    </footer>
  );
}

Layout.Header = Header;
Layout.Sider = Sider;
Layout.Content = Content;
Layout.Footer = Footer;
