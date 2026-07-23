import type { SVGAttributes } from 'react';
import { cn } from './cn';

/** Shared semantic colors used by Button / Alert / Tag / Badge / Progress / …. */
export type SemanticColor =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

/** Feedback status subset (Alert / Toast / Notification / Result). */
export type StatusColor = 'info' | 'success' | 'warning' | 'error';

export type SurfaceVariant = 'soft' | 'outline' | 'dash' | 'solid' | 'ghost';

type SurfaceTone = {
  solid: string;
  soft: string;
  outline: string;
  dash: string;
  ghost: string;
};

const SURFACE: Record<SemanticColor, SurfaceTone> = {
  neutral: {
    solid: 'border-transparent bg-muted text-surface-foreground',
    soft: 'border-muted-foreground/10 bg-muted text-surface-foreground',
    outline: 'border-border bg-transparent text-surface-foreground',
    dash: 'border-dashed border-border bg-transparent text-surface-foreground',
    ghost: 'border-transparent bg-transparent text-muted-foreground',
  },
  primary: {
    solid: 'border-transparent bg-primary text-primary-foreground',
    soft: 'border-primary/15 bg-primary/10 text-primary',
    outline: 'border-primary bg-transparent text-primary',
    dash: 'border-dashed border-primary bg-transparent text-primary',
    ghost: 'border-transparent bg-transparent text-primary',
  },
  secondary: {
    solid: 'border-transparent bg-secondary text-secondary-foreground',
    soft: 'border-secondary/15 bg-secondary/10 text-secondary',
    outline: 'border-secondary bg-transparent text-secondary',
    dash: 'border-dashed border-secondary bg-transparent text-secondary',
    ghost: 'border-transparent bg-transparent text-secondary',
  },
  info: {
    solid: 'border-transparent bg-info text-info-foreground',
    soft: 'border-info/15 bg-info/10 text-info',
    outline: 'border-info bg-transparent text-info',
    dash: 'border-dashed border-info bg-transparent text-info',
    ghost: 'border-transparent bg-transparent text-info',
  },
  success: {
    solid: 'border-transparent bg-success text-success-foreground',
    soft: 'border-success/15 bg-success/10 text-success',
    outline: 'border-success bg-transparent text-success',
    dash: 'border-dashed border-success bg-transparent text-success',
    ghost: 'border-transparent bg-transparent text-success',
  },
  warning: {
    solid: 'border-transparent bg-warning text-warning-foreground',
    soft: 'border-warning/15 bg-warning/10 text-warning',
    outline: 'border-warning bg-transparent text-warning',
    dash: 'border-dashed border-warning bg-transparent text-warning',
    ghost: 'border-transparent bg-transparent text-warning',
  },
  error: {
    solid: 'border-transparent bg-error text-error-foreground',
    soft: 'border-error/15 bg-error/10 text-error',
    outline: 'border-error bg-transparent text-error',
    dash: 'border-dashed border-error bg-transparent text-error',
    ghost: 'border-transparent bg-transparent text-error',
  },
};

/** Build `tailwind-variants` compoundVariants for color × surface style. */
export function semanticSurfaceCompounds<
  C extends SemanticColor,
  V extends SurfaceVariant,
>(
  colors: readonly C[] = [
    'neutral',
    'primary',
    'secondary',
    'info',
    'success',
    'warning',
    'error',
  ] as C[],
  variants: readonly V[] = [
    'soft',
    'outline',
    'dash',
    'solid',
    'ghost',
  ] as V[],
): Array<{ color: C; variant: V; class: string }> {
  return colors.flatMap((color) =>
    variants.map((variant) => ({
      color,
      variant,
      class: SURFACE[color][variant],
    })),
  );
}

const BAR: Record<Exclude<SemanticColor, 'neutral' | 'secondary'>, string> = {
  primary: 'bg-primary',
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
};

export type ProgressColor = keyof typeof BAR;

export function progressBarClass(color: ProgressColor = 'primary'): string {
  return BAR[color];
}

export function StatusIcon({
  color,
  className,
  size = 'md',
  ...props
}: {
  color: StatusColor | 'neutral';
  size?: 'sm' | 'md' | 'lg';
} & SVGAttributes<SVGSVGElement>) {
  const sizeClass =
    size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-12 w-12' : 'h-6 w-6';
  const common = cn(sizeClass, 'shrink-0 stroke-current', className);

  switch (color) {
    case 'success':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className={common}
          aria-hidden
          {...props}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case 'warning':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className={common}
          aria-hidden
          {...props}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      );
    case 'error':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className={common}
          aria-hidden
          {...props}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case 'neutral':
    case 'info':
    default:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className={common}
          aria-hidden
          {...props}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
  }
}
