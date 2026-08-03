import { useSyncExternalStore } from 'react';
import { useOptionalFormContext } from './FormContext';
import type { FieldName, FormInstance, FormStore, StoreValue } from './types';

function requireForm<Values extends FormStore>(
  form: FormInstance<Values> | undefined,
): FormInstance<Values> {
  if (!form) {
    throw new Error('Form.useWatch must be used inside Form or with a form instance');
  }
  return form;
}

/** Watch one field value. */
export function useWatch<Values extends FormStore = FormStore>(
  name: FieldName,
  form?: FormInstance<Values>,
): StoreValue;
/** Watch all field values (stable store snapshot). */
export function useWatch<Values extends FormStore = FormStore>(
  name: undefined,
  form?: FormInstance<Values>,
): Values;
export function useWatch<Values extends FormStore = FormStore>(
  name?: FieldName,
  form?: FormInstance<Values>,
): StoreValue | Values {
  const ctx = useOptionalFormContext();
  const instance = requireForm(
    (form ?? (ctx?.form as FormInstance<Values> | undefined)),
  );

  return useSyncExternalStore(
    instance.__INTERNAL__.subscribe,
    () =>
      name === undefined
        ? (instance.__INTERNAL__.getInternalSnapshot().values as Values)
        : instance.getFieldValue(name),
    () =>
      name === undefined
        ? (instance.__INTERNAL__.getInternalSnapshot().values as Values)
        : instance.getFieldValue(name),
  );
}
