/** Auto-generated smoke tests — run `pnpm tests:generate` to update */
import { expect, test } from '@rstest/core';
import { render } from '@testing-library/react';
import { KoiProvider } from '../../src/provider';
import { Slider } from '../../src/components/Slider';
import { Switch } from '../../src/components/Switch';
import { TextArea } from '../../src/components/TextArea';
import { TimePicker } from '../../src/components/TimePicker';
import { Upload } from '../../src/components/Upload';
import { Cascader } from '../../src/components/Cascader';
import { Picker } from '../../src/components/Picker';
import { SearchBar } from '../../src/components/SearchBar';
import { Stepper } from '../../src/components/Stepper';
import { Avatar } from '../../src/components/Avatar';
import { Badge } from '../../src/components/Badge';
import { Calendar } from '../../src/components/Calendar';
import { Card } from '../../src/components/Card';
import { Collapse } from '../../src/components/Collapse';
import { Descriptions } from '../../src/components/Descriptions';


test('Slider renders without error', () => {
  const { container } = render(
    <KoiProvider><Slider value={30} /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Switch renders without error', () => {
  const { container } = render(
    <KoiProvider><Switch checked /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('TextArea renders without error', () => {
  const { container } = render(
    <KoiProvider><TextArea placeholder="文本" /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('TimePicker renders without error', () => {
  const { container } = render(
    <KoiProvider><TimePicker placeholder="时间" /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Upload renders without error', () => {
  const { container } = render(
    <KoiProvider><Upload /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Cascader renders without error', () => {
  const { container } = render(
    <KoiProvider><Cascader options={[{ label: '浙江', value: 'zj' }]} /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Picker renders without error', () => {
  const { container } = render(
    <KoiProvider><Picker columns={[{ options: [{ label: '周一', value: '1' }] }]} /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('SearchBar renders without error', () => {
  const { container } = render(
    <KoiProvider><SearchBar placeholder="搜索" /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Stepper renders without error', () => {
  const { container } = render(
    <KoiProvider><Stepper value={1} /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Avatar renders without error', () => {
  const { container } = render(
    <KoiProvider><Avatar fallback="张" /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Badge renders without error', () => {
  const { container } = render(
    <KoiProvider><Badge count={3}><span>消息</span></Badge></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Calendar renders without error', () => {
  const { container } = render(
    <KoiProvider><Calendar /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Card renders without error', () => {
  const { container } = render(
    <KoiProvider><Card title="卡片">内容</Card></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Collapse renders without error', () => {
  const { container } = render(
    <KoiProvider><Collapse items={[{ key: '1', label: '面板', children: '内容' }]} /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Descriptions renders without error', () => {
  const { container } = render(
    <KoiProvider><Descriptions items={[{ key: 'name', label: '姓名', children: '张三' }]} /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});
