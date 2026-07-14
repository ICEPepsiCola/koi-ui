/** Auto-generated smoke tests — run `pnpm tests:generate` to update */
import { expect, test } from '@rstest/core';
import { render } from '@testing-library/react';
import { KoiProvider } from '../../src/provider';
import { Button } from '../../src/components/Button';
import { Icon } from '../../src/components/Icon';
import { Typography } from '../../src/components/Typography';
import { Divider } from '../../src/components/Divider';
import { Row, Col } from '../../src/components/Grid';
import { Layout } from '../../src/components/Layout';
import { Space } from '../../src/components/Space';
import { Flex } from '../../src/components/Flex';
import { Stack } from '../../src/primitives/Stack';
import { Box } from '../../src/primitives/Box';
import { SafeArea } from '../../src/components/SafeArea';
import { Affix } from '../../src/components/Affix';
import { Breadcrumb } from '../../src/components/Breadcrumb';
import { Dropdown } from '../../src/components/Dropdown';
import { Menu } from '../../src/components/Menu';


test('Button renders without error', () => {
  const { container } = render(
    <KoiProvider><Button>点击</Button></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Icon renders without error', () => {
  const { container } = render(
    <KoiProvider><Icon name="search" /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Typography renders without error', () => {
  const { container } = render(
    <KoiProvider><Typography.Title level={3}>标题</Typography.Title></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Divider renders without error', () => {
  const { container } = render(
    <KoiProvider><Divider>分割</Divider></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Grid renders without error', () => {
  const { container } = render(
    <KoiProvider><Row><Col span={12}>列</Col></Row></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Layout renders without error', () => {
  const { container } = render(
    <KoiProvider><Layout><Layout.Content>内容</Layout.Content></Layout></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Space renders without error', () => {
  const { container } = render(
    <KoiProvider><Space><span>A</span><span>B</span></Space></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Flex renders without error', () => {
  const { container } = render(
    <KoiProvider><Flex>弹性</Flex></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Stack renders without error', () => {
  const { container } = render(
    <KoiProvider><Stack><span>堆叠</span></Stack></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Box renders without error', () => {
  const { container } = render(
    <KoiProvider><Box>容器</Box></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('SafeArea renders without error', () => {
  const { container } = render(
    <KoiProvider><SafeArea>安全区</SafeArea></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Affix renders without error', () => {
  const { container } = render(
    <KoiProvider><Affix><Button>固定</Button></Affix></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Breadcrumb renders without error', () => {
  const { container } = render(
    <KoiProvider><Breadcrumb items={[{ title: '首页' }]} /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Dropdown renders without error', () => {
  const { container } = render(
    <KoiProvider><Dropdown trigger={<Button>菜单</Button>} items={[{ key: '1', label: '选项' }]} /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Menu renders without error', () => {
  const { container } = render(
    <KoiProvider><Menu items={[{ key: '1', label: '导航' }]} /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});
