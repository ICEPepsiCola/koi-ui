import type { HTMLAttributes, ReactNode } from 'react';
import { useKoiContext } from '../../provider/context';
import { cn } from '../../utils/cn';

function EmptyIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="10"
        y="18"
        width="44"
        height="32"
        rx="6"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.35"
      />
      <path
        d="M10 28h44"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.35"
      />
      <circle cx="22" cy="40" r="2.5" fill="currentColor" opacity="0.35" />
      <path
        d="M30 40h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.35"
      />
      <path
        d="M24 14c0-3.3 2.7-6 6-6s6 2.7 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

export interface EmptyProps extends HTMLAttributes<HTMLDivElement> {
  description?: ReactNode;
  image?: ReactNode;
  children?: ReactNode;
}

export function Empty({
  className,
  description,
  image,
  children,
  ...props
}: EmptyProps) {
  const { messages } = useKoiContext();

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className,
      )}
      {...props}
    >
      {image ?? (
        <EmptyIllustration className="mb-4 h-16 w-16 text-muted-foreground" />
      )}
      <p className="text-sm text-muted-foreground">
        {description ?? messages.emptyText}
      </p>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
