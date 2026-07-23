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

const radioVariants = tv({
  base: cn(
    'shrink-0 appearance-none rounded-full border-2 border-border bg-surface',
    'transition-[background-color,border-color,box-shadow] duration-fast ease-emphasized',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
    'disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none',
    'checked:shadow-[inset_0_0_0_0.2rem_var(--color-surface)]',
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

interface RadioGroupContextValue {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  color?: ControlColor;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

let radioGroupId = 0;

export interface RadioProps
  extends Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'size' | 'onChange' | 'color'
    >,
    VariantProps<typeof radioVariants> {
  label?: ReactNode;
  radioValue: string;
  onChange?: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
  color?: ControlColor;
}

export function Radio({
  className,
  label,
  radioValue,
  checked,
  disabled,
  onChange,
  size = 'md',
  color = 'primary',
  ...props
}: RadioProps) {
  const group = useContext(RadioGroupContext);
  const isChecked = group ? group.value === radioValue : checked;
  const isDisabled = disabled ?? group?.disabled;
  const resolvedSize = group?.size ?? size;
  const resolvedColor = group?.color ?? color;

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
        className={radioVariants({ size: resolvedSize, color: resolvedColor })}
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
  color?: ControlColor;
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
  color = 'primary',
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
        color,
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
