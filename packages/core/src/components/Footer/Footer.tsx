import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface FooterProps extends HTMLAttributes<HTMLElement> {
  copyright?: ReactNode;
  links?: Array<{ key: string; label: ReactNode; href?: string }>;
}

export function Footer({
  className,
  copyright,
  links,
  children,
  ...props
}: FooterProps) {
  return (
    <footer
      className={cn(
        'border-t border-border bg-surface px-4 py-6 text-center text-sm text-muted-foreground',
        className,
      )}
      {...props}
    >
      {children}
      {links && links.length > 0 ? (
        <nav className="mb-2 flex flex-wrap justify-center gap-4">
          {links.map((link) => (
            <a
              key={link.key}
              href={link.href ?? '#'}
              className="hover:text-surface-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
      ) : null}
      {copyright ? <div>{copyright}</div> : null}
    </footer>
  );
}
