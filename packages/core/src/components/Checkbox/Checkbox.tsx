import {
  createContext,
  useContext,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { Text } from '../../primitives/Text';

const checkboxVariants = tv({
  base: 'h-4 w-4 shrink-0 rounded border border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
  variants: {
    size: {
      sm: 'h-3.5 w-3.5',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

interface CheckboxGroupContextValue {
  value: string[];
  onChange?: (value: string[]) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(
  null,
);

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'>,
    VariantProps<typeof checkboxVariants> {
  label?: ReactNode;
  onChange?: (checked: boolean) => void;
  checkboxValue?: string;
  size?: 'sm' | 'md' | 'lg';
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
  ...props
}: CheckboxProps) {
  const group = useContext(CheckboxGroupContext);
  const isGrouped = group && checkboxValue !== undefined;
  const isChecked = isGrouped
    ? group.value.includes(checkboxValue)
    : checked;
  const isDisabled = disabled ?? group?.disabled;

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
        className={checkboxVariants({ size: group?.size ?? size })}
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
  className?: string;
  children?: ReactNode;
}

export function CheckboxGroup({
  value,
  defaultValue = [],
  onChange,
  disabled,
  size = 'md',
  className,
  children,
}: CheckboxGroupProps) {
  const [internal, setInternal] = useControlledValue(value, defaultValue, onChange);

  return (
    <CheckboxGroupContext.Provider
      value={{ value: internal, onChange: setInternal, disabled, size }}
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
