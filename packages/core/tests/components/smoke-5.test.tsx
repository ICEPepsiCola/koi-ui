/** Auto-generated smoke tests — run `pnpm tests:generate` to update */
import { expect, test } from '@rstest/core';
import { render } from '@testing-library/react';
import { KoiProvider } from '../../src/provider';
import { Drawer } from '../../src/components/Drawer';
import { Modal } from '../../src/components/Modal';
import { Notification } from '../../src/components/Notification';
import { Popconfirm } from '../../src/components/Popconfirm';
import { Button } from '../../src/components/Button';
import { Progress } from '../../src/components/Progress';
import { Result } from '../../src/components/Result';
import { Skeleton } from '../../src/components/Skeleton';
import { Spin } from '../../src/components/Spin';
import { Popup } from '../../src/components/Popup';
import { ActionSheet } from '../../src/components/ActionSheet';
import { Loading } from '../../src/components/Loading';
import { Mask } from '../../src/components/Mask';
import { Watermark } from '../../src/components/Watermark';
import { BackTop } from '../../src/components/BackTop';
import { FloatButton } from '../../src/components/FloatButton';


test('Drawer renders without error', () => {
  const { container } = render(
    <KoiProvider><Drawer open onClose={() => {}} title="抽屉">内容</Drawer></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Modal renders without error', () => {
  const { container } = render(
    <KoiProvider><Modal open onClose={() => {}} title="弹窗">内容</Modal></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Notification renders without error', () => {
  const { container } = render(
    <KoiProvider><Notification title="通知" /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Popconfirm renders without error', () => {
  const { container } = render(
    <KoiProvider><Popconfirm title="确认?"><Button>删除</Button></Popconfirm></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Progress renders without error', () => {
  const { container } = render(
    <KoiProvider><Progress percent={50} /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Result renders without error', () => {
  const { container } = render(
    <KoiProvider><Result status="success" title="成功" /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Skeleton renders without error', () => {
  const { container } = render(
    <KoiProvider><Skeleton active /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Spin renders without error', () => {
  const { container } = render(
    <KoiProvider><Spin /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Popup renders without error', () => {
  const { container } = render(
    <KoiProvider><Popup open onClose={() => {}}>弹出</Popup></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('ActionSheet renders without error', () => {
  const { container } = render(
    <KoiProvider><ActionSheet open onClose={() => {}} actions={[{ key: '1', text: '选项' }]} /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Loading renders without error', () => {
  const { container } = render(
    <KoiProvider><Loading open /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Mask renders without error', () => {
  const { container } = render(
    <KoiProvider><Mask open /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Watermark renders without error', () => {
  const { container } = render(
    <KoiProvider><Watermark content="Koi"><div className="h-10">区域</div></Watermark></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('BackTop renders without error', () => {
  const { container } = render(
    <KoiProvider><BackTop visibilityHeight={0} /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('FloatButton renders without error', () => {
  const { container } = render(
    <KoiProvider><FloatButton /></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});
