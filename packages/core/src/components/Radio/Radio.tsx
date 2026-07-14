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

const radioVariants = tv({
  base: 'h-4 w-4 shrink-0 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
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

interface RadioGroupContextValue {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

let radioGroupId = 0;

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'>,
    VariantProps<typeof radioVariants> {
  label?: ReactNode;
  radioValue: string;
  onChange?: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function Radio({
  className,
  label,
  radioValue,
  checked,
  disabled,
  onChange,
  size = 'md',
  ...props
}: RadioProps) {
  const group = useContext(RadioGroupContext);
  const isChecked = group ? group.value === radioValue : checked;
  const isDisabled = disabled ?? group?.disabled;

  return (
    <label
      className={cn(
        'inline-flex cursor-pointer items-center gap-2',
        isDisabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <input
        type="radio"
        name={group?.name}
        value={radioValue}
        className={radioVariants({ size: group?.size ?? size })}
        checked={isChecked}
        disabled={isDisabled}
        onChange={() => {
          if (group) {
            group.onChange?.(radioValue);
            return;
          }
          onChange?.(radioValue);
        }}
        {...props}
      />
      {label ? <Text size="sm">{label}</Text> : null}
    </label>
  );
}

export interface RadioGroupProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  name?: string;
  className?: string;
  direction?: 'horizontal' | 'vertical';
  children?: ReactNode;
}

export function RadioGroup({
  value,
  defaultValue,
  onChange,
  disabled,
  size = 'md',
  name,
  className,
  direction = 'vertical',
  children,
}: RadioGroupProps) {
  const [internal, setInternal] = useControlled(value, defaultValue, onChange);
  const groupName = name ?? `koi-radio-${++radioGroupId}`;

  return (
    <RadioGroupContext.Provider
      value={{
        value: internal,
        onChange: setInternal,
        disabled,
        name: groupName,
        size,
      }}
    >
      <div
        className={cn(
          direction === 'horizontal'
            ? 'flex flex-wrap items-center gap-4'
            : 'flex flex-col gap-2',
          className,
        )}
        role="radiogroup"
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

function useControlled<T>(
  value: T | undefined,
  defaultValue: T | undefined,
  onChange?: (v: T) => void,
) {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = (isControlled ? value : internal) as T;

  const setValue = (next: T) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  return [current, setValue] as const;
}
