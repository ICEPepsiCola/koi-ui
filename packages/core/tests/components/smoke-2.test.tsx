/** Auto-generated smoke tests — run `pnpm tests:generate` to update */
import { expect, test } from '@rstest/core';
import { render } from '@testing-library/react';
import { KoiProvider } from '../../src/provider';
import { Pagination } from '../../src/components/Pagination';
import { Steps } from '../../src/components/Steps';
import { Tabs } from '../../src/components/Tabs';
import { NavBar } from '../../src/components/NavBar';
import { TabBar } from '../../src/components/TabBar';
import { IndexBar } from '../../src/components/IndexBar';
import { AutoComplete } from '../../src/components/AutoComplete';
import { Checkbox } from '../../src/components/Checkbox';
import { DatePicker } from '../../src/components/DatePicker';
import { Form, FormItem } from '../../src/components/Form';
import { Input } from '../../src/components/Input';
import { InputNumber } from '../../src/components/InputNumber';
import { Radio } from '../../src/components/Radio';
import { Rate } from '../../src/components/Rate';
import { Select } from '../../src/components/Select';


test('Pagination renders without error', () => {
  const { container } = render(
    <KoiProvider><Pagination current={1} total={50} /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Steps renders without error', () => {
  const { container } = render(
    <KoiProvider><Steps current={0} items={[{ title: '步骤' }]} /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Tabs renders without error', () => {
  const { container } = render(
    <KoiProvider><Tabs items={[{ key: '1', label: 'Tab', children: '内容' }]} /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('NavBar renders without error', () => {
  const { container } = render(
    <KoiProvider><NavBar title="标题" /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('TabBar renders without error', () => {
  const { container } = render(
    <KoiProvider><TabBar activeKey="home" items={[{ key: 'home', label: '首页' }]} /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('IndexBar renders without error', () => {
  const { container } = render(
    <KoiProvider><IndexBar groups={[{ index: 'A', items: ['Apple'] }]} renderItem={(item) => <span>{item}</span>} /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('AutoComplete renders without error', () => {
  const { container } = render(
    <KoiProvider><AutoComplete options={[{ value: 'a', label: 'A' }]} /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Checkbox renders without error', () => {
  const { container } = render(
    <KoiProvider><Checkbox label="选项" checkboxValue="a" /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('DatePicker renders without error', () => {
  const { container } = render(
    <KoiProvider><DatePicker placeholder="日期" /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Form renders without error', () => {
  const { container } = render(
    <KoiProvider><Form><FormItem label="名称"><Input /></FormItem></Form></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Input renders without error', () => {
  const { container } = render(
    <KoiProvider><Input placeholder="输入" /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('InputNumber renders without error', () => {
  const { container } = render(
    <KoiProvider><InputNumber value={1} /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Radio renders without error', () => {
  const { container } = render(
    <KoiProvider><Radio label="选项" radioValue="a" /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Rate renders without error', () => {
  const { container } = render(
    <KoiProvider><Rate value={3} /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Select renders without error', () => {
  const { container } = render(
    <KoiProvider><Select options={[{ label: 'A', value: 'a' }]} /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});
