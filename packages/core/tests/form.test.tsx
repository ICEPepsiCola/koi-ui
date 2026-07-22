import { expect, test } from '@rstest/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Button } from '../src/components/Button';
import { Form, FormItem, useForm } from '../src/components/Form';
import { Input } from '../src/components/Input';
import { Switch } from '../src/components/Switch';
import { KoiProvider } from '../src/provider';

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
