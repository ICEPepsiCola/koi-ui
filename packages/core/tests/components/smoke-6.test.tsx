/** Auto-generated smoke tests — run `pnpm tests:generate` to update */
import { expect, test } from '@rstest/core';
import { render } from '@testing-library/react';
import { KoiProvider } from '../../src/provider';
import { PullToRefresh } from '../../src/components/PullToRefresh';
import { Footer } from '../../src/components/Footer';
import { FloatingPanel } from '../../src/components/FloatingPanel';
import { InfiniteScroll } from '../../src/components/InfiniteScroll';


test('PullToRefresh renders without error', () => {
  const { container } = render(
    <KoiProvider><PullToRefresh onRefresh={async () => {}}><div>列表</div></PullToRefresh></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('Footer renders without error', () => {
  const { container } = render(
    <KoiProvider><Footer>页脚</Footer></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('FloatingPanel renders without error', () => {
  const { container } = render(
    <KoiProvider><FloatingPanel title="面板"><div>内容</div></FloatingPanel></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});

test('InfiniteScroll renders without error', () => {
  const { container } = render(
    <KoiProvider><InfiniteScroll hasMore={false} loadMore={async () => {}}><div>内容</div></InfiniteScroll></KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});
