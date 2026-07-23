import {
  createContext,
  useContext,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { type ControlColor } from '../../utils/controlColor';
import { Text } from '../../primitives/Text';

const checkboxBoxVariants = tv({
  base: cn(
    'relative inline-flex shrink-0 items-center justify-center rounded-sm border border-border bg-surface',
    'transition-[background-color,border-color,box-shadow]',
    'duration-fast ease-emphasized motion-reduce:transition-none',
  ),
  variants: {
    size: {
      sm: 'h-3.5 w-3.5',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    },
    color: {
      neutral: '',
      primary: '',
      secondary: '',
      info: '',
      success: '',
      warning: '',
      error: '',
    },
    checked: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    {
      checked: true,
      color: 'neutral',
      class: 'border-muted-foreground bg-muted-foreground',
    },
    {
      checked: true,
      color: 'primary',
      class: 'border-primary bg-primary',
    },
    {
      checked: true,
      color: 'secondary',
      class: 'border-secondary bg-secondary',
    },
    {
      checked: true,
      color: 'info',
      class: 'border-info bg-info',
    },
    {
      checked: true,
      color: 'success',
      class: 'border-success bg-success',
    },
    {
      checked: true,
      color: 'warning',
      class: 'border-warning bg-warning',
    },
    {
      checked: true,
      color: 'error',
      class: 'border-error bg-error',
    },
  ],
  defaultVariants: {
    size: 'md',
    color: 'primary',
    checked: false,
  },
});

interface CheckboxGroupContextValue {
  value: string[];
  onChange?: (value: string[]) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: ControlColor;
}

const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(
  null,
);

export interface CheckboxProps
  extends Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'size' | 'onChange' | 'color'
    >,
    VariantProps<typeof checkboxBoxVariants> {
  label?: ReactNode;
  onChange?: (checked: boolean) => void;
  checkboxValue?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: ControlColor;
}

export function Checkbox({
  className,
  label,
  checked,
  defaultChecked,
  disabled,
  onChange,
  checkboxValue,
  size = 'md',
  color = 'primary',
  ...props
}: CheckboxProps) {
  const group = useContext(CheckboxGroupContext);
  const isGrouped = group && checkboxValue !== undefined;
  const isChecked = isGrouped
    ? group.value.includes(checkboxValue)
    : checked;
  const isDisabled = disabled ?? group?.disabled;
  const resolvedSize = group?.size ?? size;
  const resolvedColor = group?.color ?? color;

  const handleChange = (next: boolean) => {
    if (isGrouped) {
      const current = group!.value;
      const nextValue = next
        ? [...current, checkboxValue!]
        : current.filter((v) => v !== checkboxValue);
      group!.onChange?.(nextValue);
      return;
    }
    onChange?.(next);
  };

  return (
    <label
      className={cn(
        'inline-flex cursor-pointer items-center gap-2',
        isDisabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={isChecked}
        defaultChecked={isGrouped ? undefined : defaultChecked}
        disabled={isDisabled}
        onChange={(e) => handleChange(e.target.checked)}
        {...props}
      />
      <span
        aria-hidden
        className={cn(
          checkboxBoxVariants({
            size: resolvedSize,
            color: resolvedColor,
            checked: Boolean(isChecked),
          }),
          'peer-focus-visible:ring-2 peer-focus-visible:ring-primary',
          'peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface',
          'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        )}
      >
        <svg
          viewBox="0 0 16 16"
          className={cn(
            'h-[70%] w-[70%] text-white transition-all duration-fast ease-emphasized motion-reduce:transition-none',
            isChecked ? 'scale-100 opacity-100' : 'scale-75 opacity-0',
          )}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3.5 8.5 6.5 11.5 12.5 5.5" />
        </svg>
      </span>
      {label ? <Text size="sm">{label}</Text> : null}
    </label>
  );
}

export interface CheckboxGroupProps {
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: ControlColor;
  className?: string;
  children?: ReactNode;
}

export function CheckboxGroup({
  value,
  defaultValue = [],
  onChange,
  disabled,
  size = 'md',
  color = 'primary',
  className,
  children,
}: CheckboxGroupProps) {
  const [internal, setInternal] = useControlledValue(value, defaultValue, onChange);

  return (
    <CheckboxGroupContext.Provider
      value={{ value: internal, onChange: setInternal, disabled, size, color }}
    >
      <div className={cn('flex flex-col gap-2', className)}>{children}</div>
    </CheckboxGroupContext.Provider>
  );
}

function useControlledValue<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (v: T) => void,
) {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;

  const setValue = (next: T) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  return [current, setValue] as const;
}
