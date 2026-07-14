import {
  createContext,
  useContext,
  type FormHTMLAttributes,
  type ReactNode,
} from 'react';
import { useKoiBreakpoint } from '../../hooks/useKoiBreakpoint';
import { cn } from '../../utils/cn';
import { Text } from '../../primitives/Text';

type FormLayout = 'horizontal' | 'vertical';

interface FormContextValue {
  layout: FormLayout;
}

const FormContext = createContext<FormContextValue>({ layout: 'vertical' });

export function useFormContext() {
  return useContext(FormContext);
}

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  layout?: FormLayout;
  responsive?: boolean;
  children?: ReactNode;
}

export function Form({
  layout = 'horizontal',
  responsive = true,
  className,
  children,
  ...props
}: FormProps) {
  const { isMobile } = useKoiBreakpoint();
  const resolvedLayout =
    responsive && isMobile ? 'vertical' : layout;

  return (
    <FormContext.Provider value={{ layout: resolvedLayout }}>
      <form
        className={cn('flex flex-col gap-4', className)}
        {...props}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
}

export interface FormItemProps {
  label?: ReactNode;
  name?: string;
  required?: boolean;
  children?: ReactNode;
  className?: string;
}

export function FormItem({
  label,
  name,
  required,
  children,
  className,
}: FormItemProps) {
  const { layout } = useFormContext();
  const isHorizontal = layout === 'horizontal';

  return (
    <div
      className={cn(
        isHorizontal
          ? 'grid grid-cols-1 gap-2 md:grid-cols-[120px_1fr] md:items-center'
          : 'flex flex-col gap-2',
        className,
      )}
    >
      {label ? (
        <label htmlFor={name} className="text-sm font-medium">
          {label}
          {required ? (
            <Text as="span" className="ml-1 text-destructive">
              *
            </Text>
          ) : null}
        </label>
      ) : null}
      <div>{children}</div>
    </div>
  );
}
