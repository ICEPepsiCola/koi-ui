/**
 * Adaptive form with field store, rules, and `Form.Item` injection.
 *
 * Enough for typical app forms today. Next steps (do not expand casually):
 *
 * TODO(form): replace `cloneElement` with render-prop / `children(field)` API
 * TODO(form): nested `name` paths + `Form.List` for dynamic rows
 * TODO(form): per-field store subscription (avoid whole-form re-render)
 * TODO(form): scroll/focus first error on `onFinishFailed`
 * TODO(form): clarify `min`/`max` semantics (string length vs number magnitude)
 * TODO(form): optional external schema bridge (Zod) without adding a hard dependency
 */
import {
  useEffect,
  type FormEvent,
  type FormHTMLAttributes,
  type ReactNode,
} from 'react';
import { useKoiBreakpoint } from '../../hooks/useKoiBreakpoint';
import { cn } from '../../utils/cn';
import { FormProvider } from './FormContext';
import { FormItem } from './FormItem';
import { useForm } from './useForm';
import type {
  FormInstance,
  FormLayout,
  FormStore,
  ValidateErrorEntity,
} from './types';

export interface FormProps<Values extends FormStore = FormStore>
  extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'onChange'> {
  form?: FormInstance<Values>;
  initialValues?: Partial<Values>;
  layout?: FormLayout;
  responsive?: boolean;
  onValuesChange?: (
    changed: Partial<Values>,
    allValues: Values,
  ) => void;
  onFinish?: (values: Values) => void;
  onFinishFailed?: (errorInfo: ValidateErrorEntity<Values>) => void;
  children?: ReactNode;
}

function FormInner<Values extends FormStore = FormStore>({
  form: formProp,
  initialValues,
  layout = 'horizontal',
  responsive = true,
  onValuesChange,
  onFinish,
  onFinishFailed,
  className,
  children,
  ...props
}: FormProps<Values>) {
  const { isMobile } = useKoiBreakpoint();
  const resolvedLayout =
    responsive && isMobile ? 'vertical' : layout;

  const [internalForm] = useForm<Values>();
  const form = formProp ?? internalForm;

  useEffect(() => {
    form.__INTERNAL__.setCallbacks({
      onValuesChange,
      onFinish,
      onFinishFailed,
    });
  }, [form, onValuesChange, onFinish, onFinishFailed]);

  useEffect(() => {
    form.__INTERNAL__.setInitialValues(initialValues ?? {});
    // Intentionally mount-only — same as typical form libraries; later resets use resetFields().
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed once per form instance
  }, [form]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    form.submit();
  };

  return (
    <FormProvider
      value={{
        layout: resolvedLayout,
        form: form as FormInstance<FormStore>,
      }}
    >
      <form
        className={cn('flex flex-col gap-4', className)}
        onSubmit={handleSubmit}
        noValidate
        {...props}
      >
        {children}
      </form>
    </FormProvider>
  );
}

export const Form = Object.assign(FormInner, {
  Item: FormItem,
  useForm,
});
