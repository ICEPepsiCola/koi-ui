/** Shared color axis for form controls (Checkbox / Radio / Switch / Slider / Rate). */
export type ControlColor =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

/** Fill styles when a checkbox/radio is checked. */
export const controlCheckedBg: Record<ControlColor, string> = {
  neutral: 'checked:border-muted-foreground checked:bg-muted-foreground',
  primary: 'checked:border-primary checked:bg-primary',
  secondary: 'checked:border-secondary checked:bg-secondary',
  info: 'checked:border-info checked:bg-info',
  success: 'checked:border-success checked:bg-success',
  warning: 'checked:border-warning checked:bg-warning',
  error: 'checked:border-error checked:bg-error',
};

/** Switch track when on. */
export const controlOnBg: Record<ControlColor, string> = {
  neutral: 'bg-muted-foreground',
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
};

/** Range / rate accent. */
export const controlAccent: Record<ControlColor, string> = {
  neutral: 'accent-muted-foreground',
  primary: 'accent-primary',
  secondary: 'accent-secondary',
  info: 'accent-info',
  success: 'accent-success',
  warning: 'accent-warning',
  error: 'accent-error',
};

export const controlText: Record<ControlColor, string> = {
  neutral: 'text-muted-foreground',
  primary: 'text-primary',
  secondary: 'text-secondary',
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
};
