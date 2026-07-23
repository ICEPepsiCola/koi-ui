/**
 * Field wrapper: layout + rules + inject value/onChange into a single child.
 *
 * TODO(form): support `children={(control) => <Input {...control} />}`
 * TODO(form): subscribe only to this field's value/error (not full snapshot)
 * TODO(form): `dependencies` / `shouldUpdate` for cross-field UI
 */
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useSyncExternalStore,
  type ReactElement,
  type ReactNode,
} from 'react';import { cn } from '../../utils/cn';
import { Text } from '../../primitives/Text';
import { useOptionalFormContext } from './FormContext';
import { mergeValidateTriggers } from './store';
import type {
  FieldName,
  FieldStatus,
  FormInternalSnapshot,
  Rule,
  StoreValue,
  ValidateTrigger,
} from './types';

const EMPTY_SNAPSHOT: FormInternalSnapshot = {
  values: {},
  errors: {},
  touched: {},
  fields: new Map(),
};

function subscribeEmpty() {
  return () => undefined;
}

function getEmptySnapshot() {
  return EMPTY_SNAPSHOT;
}

export interface FormItemProps {
  name?: FieldName;
  label?: ReactNode;
  required?: boolean;
  rules?: Rule[];
  /** Default `onChange`. Use `onBlur` / `onSubmit` to delay validation. */
  validateTrigger?: ValidateTrigger | ValidateTrigger[];
  /** Which child prop carries the value. Switch/Checkbox → `checked`. */
  valuePropName?: string;
  getValueFromEvent?: (...args: unknown[]) => StoreValue;
  help?: ReactNode;
  /** Manual status; validation error overrides to `error`. */
  status?: FieldStatus;
  children?: ReactNode;
  className?: string;
}

function defaultGetValueFromEvent(
  valuePropName: string,
  args: unknown[],
): StoreValue {
  const first = args[0];
  if (
    first &&
    typeof first === 'object' &&
    'target' in (first as { target?: unknown })
  ) {
    const target = (first as { target: Record<string, unknown> }).target;
    if (valuePropName in target) return target[valuePropName];
    if ('checked' in target) return target.checked;
    if ('value' in target) return target.value;
  }
  return first as StoreValue;
}

function resolveRequired(rules?: Rule[], required?: boolean): boolean {
  if (required) return true;
  return Boolean(rules?.some((rule) => rule.required));
}

export function FormItem({
  name,
  label,
  required,
  rules,
  validateTrigger,
  valuePropName = 'value',
  getValueFromEvent,
  help,
  status: statusProp,
  children,
  className,
}: FormItemProps) {
  const ctx = useOptionalFormContext();
  const layout = ctx?.layout ?? 'vertical';
  const form = ctx?.form;
  const isHorizontal = layout === 'horizontal';
  const triggers = mergeValidateTriggers(validateTrigger);

  if (name && !form) {
    throw new Error('Form.Item with `name` must be used inside Form');
  }

  const snapshot = useSyncExternalStore(
    form ? form.__INTERNAL__.subscribe : subscribeEmpty,
    form ? form.__INTERNAL__.getInternalSnapshot : getEmptySnapshot,
    form ? form.__INTERNAL__.getInternalSnapshot : getEmptySnapshot,
  );
  useEffect(() => {
    if (!name || !form) return;
    return form.__INTERNAL__.registerField(name, { rules, validateTrigger });
  }, [form, name, rules, validateTrigger]);

  const fieldErrors = name ? (snapshot.errors[name] ?? []) : [];
  const errorMessage = fieldErrors[0];
  const status: FieldStatus = errorMessage ? 'error' : statusProp;
  const showRequired = resolveRequired(rules, required);

  let control = children;
  if (name && form && isValidElement(children)) {
    const child = Children.only(children) as ReactElement<
      Record<string, unknown>
    >;
    const value = snapshot.values[name];
    const childOnChange = child.props.onChange as
      | ((...args: unknown[]) => void)
      | undefined;
    const childOnBlur = child.props.onBlur as
      | ((...args: unknown[]) => void)
      | undefined;

    const boundValue =
      valuePropName === 'checked' ? Boolean(value) : value;

    const nextProps: Record<string, unknown> = {
      id: (child.props.id as string | undefined) ?? name,
      [valuePropName]: boundValue,
      onChange: (...args: unknown[]) => {
        const next = getValueFromEvent
          ? getValueFromEvent(...args)
          : defaultGetValueFromEvent(valuePropName, args);
        form.setFieldValue(name, next);
        childOnChange?.(...args);
        if (triggers.includes('onChange')) {
          void form.validateFields([name]).catch(() => undefined);
        }
      },
      onBlur: (...args: unknown[]) => {
        childOnBlur?.(...args);
        if (triggers.includes('onBlur')) {
          void form.validateFields([name]).catch(() => undefined);
        }
      },
    };

    // Component children: drive border via boolean error (message lives on Form.Item)
    if (typeof child.type !== 'string') {
      nextProps.error = status === 'error' ? true : undefined;
    }

    control = cloneElement(child, nextProps);
  }

  const messageTone =
    status === 'error'
      ? 'text-error'
      : status === 'warning'
        ? 'text-warning'
        : status === 'success'
          ? 'text-success'
          : 'text-muted-foreground';

  return (
    <div
      className={cn(
        isHorizontal
          ? 'grid grid-cols-1 gap-2 md:grid-cols-[120px_1fr] md:items-start'
          : 'flex flex-col gap-1.5',
        className,
      )}
    >
      {label ? (
        <label
          htmlFor={name}
          className={cn(
            'text-sm font-medium text-surface-foreground',
            isHorizontal && 'md:pt-2.5',
          )}
        >
          {label}
          {showRequired ? (
            <Text as="span" className="ml-1 text-error" aria-hidden>
              *
            </Text>
          ) : null}
        </label>
      ) : null}
      <div className="min-w-0">
        {control}
        {errorMessage || help ? (
          <p
            className={cn('mt-1 text-xs', messageTone)}
            role={status === 'error' ? 'alert' : undefined}
          >
            {errorMessage ?? help}
          </p>
        ) : null}
      </div>
    </div>
  );
}
