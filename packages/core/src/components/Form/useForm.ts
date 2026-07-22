import { useState } from 'react';
import { createFormInstance } from './store';
import type { FormInstance, FormStore } from './types';

export function useForm<Values extends FormStore = FormStore>(): [
  FormInstance<Values>,
] {
  const [form] = useState(() => createFormInstance<Values>());
  return [form];
}
