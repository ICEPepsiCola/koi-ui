/**
 * Form public types.
 *
 * TODO(form): `FieldName` as `string | (string | number)[]` for nested paths
 * TODO(form): split length rules vs numeric range rules in `RuleObject`
 */
export type FormLayout = 'horizontal' | 'vertical';

export type FieldName = string;

export type StoreValue = unknown;

export type FormStore = Record<FieldName, StoreValue>;

export type ValidateTrigger = 'onChange' | 'onBlur' | 'onSubmit';

export type FieldStatus = 'error' | 'warning' | 'success' | undefined;

export interface RuleObject {
  required?: boolean;
  message?: string;
  pattern?: RegExp;
  /** String length / number / array length */
  min?: number;
  max?: number;
  len?: number;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'email' | 'url';
  whitespace?: boolean;
  /** Reject / throw Error to fail; resolve / return to pass */
  validator?: (
    rule: RuleObject,
    value: StoreValue,
  ) => void | Promise<void>;
}

export type Rule = RuleObject;

export interface FieldError {
  name: FieldName;
  errors: string[];
}

export interface ValidateErrorEntity<Values extends FormStore = FormStore> {
  values: Values;
  errorFields: FieldError[];
}

export interface FormInstance<Values extends FormStore = FormStore> {
  getFieldValue: (name: FieldName) => StoreValue;
  getFieldsValue: (names?: FieldName[]) => Values;
  setFieldValue: (name: FieldName, value: StoreValue) => void;
  setFieldsValue: (values: Partial<Values>) => void;
  getFieldError: (name: FieldName) => string[];
  getFieldsError: (names?: FieldName[]) => FieldError[];
  isFieldTouched: (name: FieldName) => boolean;
  resetFields: (names?: FieldName[]) => void;
  validateFields: (names?: FieldName[]) => Promise<Values>;
  submit: () => void;
  /** Internal — bound by <Form> */
  __INTERNAL__: {
    setCallbacks: (callbacks: FormCallbacks<Values>) => void;
    setInitialValues: (values: Partial<Values>, keep?: boolean) => void;
    registerField: (name: FieldName, meta: FieldMeta) => () => void;
    subscribe: (listener: () => void) => () => void;
    getInternalSnapshot: () => FormInternalSnapshot;
  };
}

export interface FieldMeta {
  rules?: Rule[];
  validateTrigger?: ValidateTrigger | ValidateTrigger[];
}

export interface FormCallbacks<Values extends FormStore = FormStore> {
  onValuesChange?: (
    changed: Partial<Values>,
    allValues: Values,
  ) => void;
  onFinish?: (values: Values) => void;
  onFinishFailed?: (errorInfo: ValidateErrorEntity<Values>) => void;
}

export interface FormInternalSnapshot {
  values: FormStore;
  errors: Record<FieldName, string[]>;
  touched: Record<FieldName, boolean>;
  fields: Map<FieldName, FieldMeta>;
}
