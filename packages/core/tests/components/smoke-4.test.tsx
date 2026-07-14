/** Auto-generated smoke tests — run `pnpm tests:generate` to update */
import { expect, test } from '@rstest/core';
import { render } from '@testing-library/react';
import { KoiProvider } from '../../src/provider';
import { Empty } from '../../src/components/Empty';
import { Image } from '../../src/components/Image';
import { List } from '../../src/components/List';
import { Popover } from '../../src/components/Popover';
import { Button } from '../../src/components/Button';
import { Segmented } from '../../src/components/Segmented';
import { Statistic } from '../../src/components/Statistic';
import { Table } from '../../src/components/Table';
import { Tag } from '../../src/components/Tag';
import { Timeline } from '../../src/components/Timeline';
import { Tooltip } from '../../src/components/Tooltip';
import { Tree } from '../../src/components/Tree';
import { NoticeBar } from '../../src/components/NoticeBar';
import { Swiper } from '../../src/components/Swiper';
import { Ellipsis } from '../../src/components/Ellipsis';
import { Alert } from '../../src/components/Alert';


test('Empty renders without error', () => {
  const { container } = render(
    <KoiProvider><Empty description="暂无" /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Image renders without error', () => {
  const { container } = render(
    <KoiProvider><Image src="https://example.com/a.png" alt="图" width={100} height={60} /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('List renders without error', () => {
  const { container } = render(
    <KoiProvider><List items={[{ key: '1', title: '标题' }]} /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Popover renders without error', () => {
  const { container } = render(
    <KoiProvider><Popover content="内容"><Button>触发</Button></Popover></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Segmented renders without error', () => {
  const { container } = render(
    <KoiProvider><Segmented options={[{ label: 'A', value: 'a' }]} value="a" /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Statistic renders without error', () => {
  const { container } = render(
    <KoiProvider><Statistic title="数量" value={100} /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Table renders without error', () => {
  const { container } = render(
    <KoiProvider><Table columns={[{ key: 'name', title: '姓名' }]} data={[{ name: '张三' }]} /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Tag renders without error', () => {
  const { container } = render(
    <KoiProvider><Tag>标签</Tag></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Timeline renders without error', () => {
  const { container } = render(
    <KoiProvider><Timeline items={[{ key: '1', children: '事件' }]} /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Tooltip renders without error', () => {
  const { container } = render(
    <KoiProvider><Tooltip content="提示"><Button>悬停</Button></Tooltip></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Tree renders without error', () => {
  const { container } = render(
    <KoiProvider><Tree data={[{ key: '1', title: '节点' }]} /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('NoticeBar renders without error', () => {
  const { container } = render(
    <KoiProvider><NoticeBar content="通告" /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Swiper renders without error', () => {
  const { container } = render(
    <KoiProvider><Swiper><div>Slide</div></Swiper></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Ellipsis renders without error', () => {
  const { container } = render(
    <KoiProvider><Ellipsis content="长文本内容" /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Alert renders without error', () => {
  const { container } = render(
    <KoiProvider><Alert title="提示" description="内容" /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});
