import { validateRules } from './rules';
import type {
  FieldError,
  FieldMeta,
  FieldName,
  FormCallbacks,
  FormInstance,
  FormInternalSnapshot,
  FormStore,
  StoreValue,
  ValidateErrorEntity,
} from './types';

function cloneStore<T extends FormStore>(values: T): T {
  return { ...values };
}

export function createFormInstance<
  Values extends FormStore = FormStore,
>(): FormInstance<Values> {
  let values: FormStore = {};
  let initialValues: FormStore = {};
  let errors: Record<FieldName, string[]> = {};
  let touched: Record<FieldName, boolean> = {};
  const fields = new Map<FieldName, FieldMeta>();
  const listeners = new Set<() => void>();
  let callbacks: FormCallbacks<Values> = {};
  let snapshot: FormInternalSnapshot = {
    values,
    errors,
    touched,
    fields,
  };

  const notify = () => {
    snapshot = {
      values,
      errors,
      touched,
      fields,
    };
    listeners.forEach((listener) => listener());
  };

  const getSnapshot = (): FormInternalSnapshot => snapshot;
  const setErrors = (name: FieldName, next: string[]) => {
    if (next.length === 0) {
      if (!(name in errors)) return;
      const { [name]: _, ...rest } = errors;
      errors = rest;
    } else {
      errors = { ...errors, [name]: next };
    }
    notify();
  };

  const validateName = async (name: FieldName): Promise<string[]> => {
    const meta = fields.get(name);
    const nextErrors = await validateRules(meta?.rules, values[name]);
    setErrors(name, nextErrors);
    return nextErrors;
  };

  const instance: FormInstance<Values> = {
    getFieldValue: (name) => values[name],
    getFieldsValue: (names) => {
      if (!names) return cloneStore(values) as Values;
      const picked: FormStore = {};
      for (const name of names) picked[name] = values[name];
      return picked as Values;
    },
    setFieldValue: (name, value) => {
      values = { ...values, [name]: value };
      touched = { ...touched, [name]: true };
      notify();
      callbacks.onValuesChange?.(
        { [name]: value } as Partial<Values>,
        cloneStore(values) as Values,
      );
    },
    setFieldsValue: (next) => {
      values = { ...values, ...next };
      notify();
      callbacks.onValuesChange?.(
        next,
        cloneStore(values) as Values,
      );
    },
    getFieldError: (name) => errors[name] ?? [],
    getFieldsError: (names) => {
      const keys = names ?? Object.keys(errors);
      return keys
        .filter((name) => (errors[name]?.length ?? 0) > 0)
        .map((name) => ({ name, errors: errors[name] ?? [] }));
    },
    isFieldTouched: (name) => Boolean(touched[name]),
    resetFields: (names) => {
      const keys = names ?? [
        ...new Set([...Object.keys(initialValues), ...fields.keys()]),
      ];
      const nextValues = { ...values };
      const nextTouched = { ...touched };
      const nextErrors = { ...errors };
      for (const name of keys) {
        if (name in initialValues) nextValues[name] = initialValues[name];
        else delete nextValues[name];
        delete nextTouched[name];
        delete nextErrors[name];
      }
      values = nextValues;
      touched = nextTouched;
      errors = nextErrors;
      notify();
    },
    validateFields: async (names) => {
      const keys = names ?? [...fields.keys()];
      const errorFields: FieldError[] = [];
      for (const name of keys) {
        const fieldErrors = await validateName(name);
        if (fieldErrors.length) {
          errorFields.push({ name, errors: fieldErrors });
        }
      }
      if (errorFields.length) {
        const entity: ValidateErrorEntity<Values> = {
          values: cloneStore(values) as Values,
          errorFields,
        };
        return Promise.reject(entity);
      }
      return cloneStore(values) as Values;
    },
    submit: () => {
      void instance.validateFields().then(
        (allValues) => {
          callbacks.onFinish?.(allValues);
        },
        (errorInfo: ValidateErrorEntity<Values>) => {
          callbacks.onFinishFailed?.(errorInfo);
        },
      );
    },
    __INTERNAL__: {
      setCallbacks: (next) => {
        callbacks = next;
      },
      setInitialValues: (next, keep = false) => {
        initialValues = { ...next };
        if (!keep) {
          values = { ...initialValues };
          errors = {};
          touched = {};
          notify();
        }
      },
      registerField: (name, meta) => {
        fields.set(name, meta);
        // Keep meta mutable without notifying — rules arrays are new each render.
        if (!(name in values) && name in initialValues) {
          values = { ...values, [name]: initialValues[name] };
          notify();
        }
        return () => {
          fields.delete(name);
        };
      },
      subscribe: (listener) => {
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
        };
      },
      getInternalSnapshot: getSnapshot,
    },
  };

  return instance;
}

export function mergeValidateTriggers(
  trigger?: import('./types').ValidateTrigger | import('./types').ValidateTrigger[],
): import('./types').ValidateTrigger[] {
  if (!trigger) return ['onChange'];
  return Array.isArray(trigger) ? trigger : [trigger];
}

export type { StoreValue };
