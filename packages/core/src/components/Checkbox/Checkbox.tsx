import {
  createContext,
  useContext,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import {
  controlCheckedBg,
  type ControlColor,
} from '../../utils/controlColor';
import { Text } from '../../primitives/Text';

const CHECKMARK =
  "checked:bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M3.5 8.5l3 3 6-6' stroke='%23fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")]";

const checkboxVariants = tv({
  base: cn(
    'shrink-0 appearance-none rounded-selector border border-border bg-surface',
    'bg-center bg-no-repeat transition-[background-color,border-color,box-shadow]',
    'duration-fast ease-emphasized',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
    'disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none',
    'checked:bg-[length:70%_70%]',
    CHECKMARK,
  ),
  variants: {
    size: {
      sm: 'h-3.5 w-3.5',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    },
    color: {
      neutral: controlCheckedBg.neutral,
      primary: controlCheckedBg.primary,
      secondary: controlCheckedBg.secondary,
      info: controlCheckedBg.info,
      success: controlCheckedBg.success,
      warning: controlCheckedBg.warning,
      error: controlCheckedBg.error,
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'primary',
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
    VariantProps<typeof checkboxVariants> {
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
        className={checkboxVariants({ size: resolvedSize, color: resolvedColor })}
        checked={isChecked}
        defaultChecked={isGrouped ? undefined : defaultChecked}
        disabled={isDisabled}
        onChange={(e) => handleChange(e.target.checked)}
        {...props}
      />
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
