import { createContext, useContext, type ReactNode } from 'react';
import type { FormInstance, FormLayout, FormStore } from './types';

export interface FormContextValue {
  layout: FormLayout;
  form: FormInstance<FormStore>;
}

const FormContext = createContext<FormContextValue | null>(null);

export function FormProvider({
  value,
  children,
}: {
  value: FormContextValue;
  children: ReactNode;
}) {
  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

export function useFormContext(): FormContextValue {
  const ctx = useContext(FormContext);
  if (!ctx) {
    throw new Error('Form.Item must be used inside Form');
  }
  return ctx;
}

/** Layout-only usage without throwing (legacy wrappers). */
export function useOptionalFormContext(): FormContextValue | null {
  return useContext(FormContext);
}
