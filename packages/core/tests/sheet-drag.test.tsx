import { expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { ActionSheet, shouldDismissActionSheet } from '../src/components/ActionSheet/ActionSheet';
import { Drawer, shouldDismissDrawer } from '../src/components/Drawer/Drawer';
import { KoiProvider } from '../src/provider';
import { project } from '../src/motion/physics';
import {
  SHEET_DISMISS_OFFSET,
  SHEET_DISMISS_VELOCITY,
} from '../src/motion/gesture';

test('ActionSheet dismisses on projected offset past threshold', () => {
  expect(
    shouldDismissActionSheet({
      offset: SHEET_DISMISS_OFFSET,
      velocity: 0,
    }),
  ).toBe(true);

  expect(
    shouldDismissActionSheet({
      offset: SHEET_DISMISS_OFFSET - 1,
      velocity: 0,
    }),
  ).toBe(false);
});

test('ActionSheet dismisses on flick velocity (px/s)', () => {
  expect(
    shouldDismissActionSheet({
      offset: 0,
      velocity: SHEET_DISMISS_VELOCITY,
    }),
  ).toBe(true);

  // Slow drag: projection stays under travel threshold.
  expect(
    shouldDismissActionSheet({
      offset: 0,
      velocity: 100,
    }),
  ).toBe(false);
});

test('ActionSheet dismisses when projection coasts past threshold', () => {
  const offset = 30;
  const velocity = 900;
  const projected = offset + project(velocity);
  expect(projected).toBeGreaterThan(SHEET_DISMISS_OFFSET);
  expect(shouldDismissActionSheet({ offset, velocity })).toBe(true);
});

test('ActionSheet handle drag past travel threshold closes', () => {
  let closed = false;
  render(
    <KoiProvider>
      <ActionSheet
        open
        onClose={() => {
          closed = true;
        }}
        actions={[{ key: 'a', text: '选项' }]}
      />
    </KoiProvider>,
  );

  const handle = document.querySelector(
    '[data-actionsheet-handle]',
  ) as HTMLDivElement;
  expect(handle).toBeTruthy();

  fireEvent.pointerDown(handle, { button: 0, clientY: 100, pointerId: 1 });
  fireEvent.pointerMove(handle, { clientY: 220, pointerId: 1 });
  fireEvent.pointerUp(handle, { clientY: 220, pointerId: 1 });

  expect(closed).toBe(true);
});

test('Drawer dismiss helpers match shared sheet thresholds', () => {
  expect(
    shouldDismissDrawer({
      offset: SHEET_DISMISS_OFFSET,
      velocity: 0,
    }),
  ).toBe(true);
  expect(
    shouldDismissDrawer({
      offset: 0,
      velocity: SHEET_DISMISS_VELOCITY,
    }),
  ).toBe(true);
  expect(
    shouldDismissDrawer({
      offset: 10,
      velocity: 50,
    }),
  ).toBe(false);
});

test('Drawer right edge handle drag past threshold closes', () => {
  let closed = false;
  render(
    <KoiProvider>
      <Drawer
        open
        placement="right"
        onClose={() => {
          closed = true;
        }}
        title="抽屉"
      >
        内容
      </Drawer>
    </KoiProvider>,
  );

  expect(screen.getByText('内容')).toBeInTheDocument();

  const handle = document.querySelector(
    '[data-drawer-drag-handle]',
  ) as HTMLDivElement;
  expect(handle).toBeTruthy();

  fireEvent.pointerDown(handle, { button: 0, clientX: 100, pointerId: 1 });
  fireEvent.pointerMove(handle, { clientX: 220, pointerId: 1 });
  fireEvent.pointerUp(handle, { clientX: 220, pointerId: 1 });

  expect(closed).toBe(true);
});

test('Drawer bottom handle drag past threshold closes', () => {
  let closed = false;
  render(
    <KoiProvider>
      <Drawer
        open
        placement="bottom"
        onClose={() => {
          closed = true;
        }}
      >
        底部
      </Drawer>
    </KoiProvider>,
  );

  const handle = document.querySelector(
    '[data-drawer-drag-handle]',
  ) as HTMLDivElement;
  expect(handle).toBeTruthy();

  fireEvent.pointerDown(handle, { button: 0, clientY: 100, pointerId: 1 });
  fireEvent.pointerMove(handle, { clientY: 220, pointerId: 1 });
  fireEvent.pointerUp(handle, { clientY: 220, pointerId: 1 });

  expect(closed).toBe(true);
});
