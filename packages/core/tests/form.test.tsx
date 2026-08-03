import { expect, test } from '@rstest/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { Button } from '../src/components/Button';
import { Form, FormItem, useForm, useWatch } from '../src/components/Form';
import { createFormInstance } from '../src/components/Form/store';
import { Input } from '../src/components/Input';
import { Switch } from '../src/components/Switch';
import { KoiProvider } from '../src/provider';
import { Text } from '../src/primitives/Text';

test('Form validates required fields on submit', async () => {
  let finished: Record<string, unknown> | null = null;
  let failed = false;

  render(
    <KoiProvider>
      <Form
        layout="vertical"
        onFinish={(values) => {
          finished = values;
        }}
        onFinishFailed={() => {
          failed = true;
        }}
      >
        <FormItem
          name="email"
          label="Email"
          rules={[
            { required: true, message: '邮箱必填' },
            { type: 'email', message: '邮箱格式错误' },
          ]}
        >
          <Input placeholder="email" />
        </FormItem>
        <Button type="submit">提交</Button>
      </Form>
    </KoiProvider>,
  );

  fireEvent.click(screen.getByRole('button', { name: '提交' }));

  await waitFor(() => {
    expect(screen.getByRole('alert')).toHaveTextContent('邮箱必填');
  });
  expect(failed).toBe(true);
  expect(finished).toBeNull();
});

test('Form submits values when valid', async () => {
  let finished: Record<string, unknown> | null = null;

  render(
    <KoiProvider>
      <Form
        layout="vertical"
        initialValues={{ email: 'a@b.com', newsletter: true }}
        onFinish={(values) => {
          finished = values;
        }}
      >
        <FormItem name="email" label="Email" rules={[{ required: true }]}>
          <Input />
        </FormItem>
        <FormItem name="newsletter" label="订阅" valuePropName="checked">
          <Switch />
        </FormItem>
        <Button type="submit">提交</Button>
      </Form>
    </KoiProvider>,
  );

  fireEvent.click(screen.getByRole('button', { name: '提交' }));

  await waitFor(() => {
    expect(finished).toEqual({ email: 'a@b.com', newsletter: true });
  });
});

test('useForm can set and reset fields', async () => {
  function Harness() {
    const [form] = useForm();
    return (
      <Form form={form} layout="vertical" initialValues={{ name: 'Ada' }}>
        <FormItem name="name" label="Name">
          <Input />
        </FormItem>
        <Button type="button" onClick={() => form.setFieldsValue({ name: 'Grace' })}>
          Set
        </Button>
        <Button type="button" onClick={() => form.resetFields()}>
          Reset
        </Button>
      </Form>
    );
  }

  render(
    <KoiProvider>
      <Harness />
    </KoiProvider>,
  );

  const input = screen.getByRole('textbox');
  await waitFor(() => {
    expect(input).toHaveValue('Ada');
  });

  fireEvent.click(screen.getByRole('button', { name: 'Set' }));
  expect(input).toHaveValue('Grace');

  fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
  expect(input).toHaveValue('Ada');
});

test('Form.Item validates on change', async () => {
  render(
    <KoiProvider>
      <Form layout="vertical">
        <FormItem
          name="code"
          label="Code"
          rules={[{ min: 4, message: '至少 4 位' }]}
        >
          <Input />
        </FormItem>
      </Form>
    </KoiProvider>,
  );

  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ab' } });

  await waitFor(() => {
    expect(screen.getByRole('alert')).toHaveTextContent('至少 4 位');
  });

  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'abcd' } });

  await waitFor(() => {
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

test('Form.Item does not rerender unrelated fields on value changes', async () => {
  let lastNameRenders = 0;

  function LastNameInput(props: ComponentProps<typeof Input>) {
    lastNameRenders += 1;
    return <Input placeholder="last" {...props} />;
  }

  render(
    <KoiProvider>
      <Form
        layout="vertical"
        initialValues={{ firstName: 'Ada', lastName: 'Lovelace' }}
      >
        <FormItem name="firstName" label="First">
          <Input placeholder="first" />
        </FormItem>
        <FormItem name="lastName" label="Last">
          <LastNameInput />
        </FormItem>
      </Form>
    </KoiProvider>,
  );

  await waitFor(() => {
    expect(screen.getByPlaceholderText('last')).toHaveValue('Lovelace');
  });

  const rendersAfterMount = lastNameRenders;
  fireEvent.change(screen.getByPlaceholderText('first'), {
    target: { value: 'Grace' },
  });

  expect(screen.getByPlaceholderText('first')).toHaveValue('Grace');
  expect(lastNameRenders).toBe(rendersAfterMount);
});

test('Form.useWatch tracks field values', async () => {
  function Preview() {
    const nickname = useWatch('nickname');
    return <Text data-testid="preview">{String(nickname ?? '')}</Text>;
  }

  render(
    <KoiProvider>
      <Form layout="vertical" initialValues={{ nickname: 'Ada' }}>
        <FormItem name="nickname" label="Nickname">
          <Input />
        </FormItem>
        <Preview />
      </Form>
    </KoiProvider>,
  );

  expect(screen.getByTestId('preview')).toHaveTextContent('Ada');
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'Grace' },
  });
  await waitFor(() => {
    expect(screen.getByTestId('preview')).toHaveTextContent('Grace');
  });
});

test('Form.scrollToField focuses the field control', () => {
  const form = createFormInstance();
  form.__INTERNAL__.setInitialValues({ email: '' });

  render(
    <KoiProvider>
      <Form form={form} layout="vertical" scrollToFirstError={false}>
        <FormItem name="email" label="Email">
          <Input />
        </FormItem>
      </Form>
    </KoiProvider>,
  );

  const input = screen.getByRole('textbox');
  let scrolled = false;
  input.scrollIntoView = (() => {
    scrolled = true;
  }) as typeof input.scrollIntoView;

  form.scrollToField('email');
  expect(scrolled).toBe(true);
  expect(document.activeElement).toBe(input);
});

test('Form releases cached field snapshots on reset, setInitialValues, and unregister', () => {
  const form = createFormInstance();
  form.__INTERNAL__.setInitialValues({ name: 'Ada' });
  const unregister = form.__INTERNAL__.registerField('name', {});

  const first = form.__INTERNAL__.getFieldSnapshot('name');
  expect(form.__INTERNAL__.getFieldSnapshot('name')).toBe(first);

  form.setFieldValue('name', 'Grace');
  form.resetFields(['name']);
  const afterReset = form.__INTERNAL__.getFieldSnapshot('name');

  expect(afterReset).not.toBe(first);
  expect(afterReset.value).toBe('Ada');

  form.__INTERNAL__.setInitialValues({ name: 'Katherine' });
  const afterInitialValues = form.__INTERNAL__.getFieldSnapshot('name');

  expect(afterInitialValues).not.toBe(afterReset);
  expect(afterInitialValues.value).toBe('Katherine');

  unregister();
  const afterUnregister = form.__INTERNAL__.getFieldSnapshot('name');

  expect(afterUnregister).not.toBe(afterInitialValues);
  expect(afterUnregister.value).toBe('Katherine');
});
