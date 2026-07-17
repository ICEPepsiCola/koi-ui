import { expect, test } from '@rstest/core';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { useBreakpoint, BREAKPOINTS } from '@koi-ui/hooks';
import { Button } from '../src/components/Button';
import { Input } from '../src/components/Input';
import { Table } from '../src/components/Table';
import { Modal } from '../src/components/Modal';
import { KoiProvider } from '../src/provider';
import { AdaptiveRender } from '../src/adaptive/AdaptiveRender';
import { Select } from '../src/components/Select';
import { Picker } from '../src/components/Picker';
import { Swiper } from '../src/components/Swiper';
import { Tabs } from '../src/components/Tabs';
import { toast } from '../src/components/Toast';
import { mockWidth } from './setup';

test('Button renders children', () => {
  render(<Button>点击</Button>);
  expect(screen.getByText('点击')).toBeInTheDocument();
});

test('Button shows loading state', () => {
  render(<Button loading>提交</Button>);
  expect(screen.getByText('提交')).toBeInTheDocument();
});

test('Input calls onChange', () => {
  let value = '';
  const onChange = (v: string) => {
    value = v;
  };
  render(<Input placeholder="test" onChange={onChange} />);
  fireEvent.change(screen.getByPlaceholderText('test'), {
    target: { value: 'hello' },
  });
  expect(value).toBe('hello');
});

test('Input shows error message', () => {
  render(<Input error="必填项" />);
  expect(screen.getByText('必填项')).toBeInTheDocument();
});

test('Table renders desktop view on wide screen', () => {
  mockWidth(BREAKPOINTS.lg);
  const columns = [
    { key: 'name' as const, title: '姓名' },
    { key: 'age' as const, title: '年龄' },
  ];
  const data = [{ name: '张三', age: '20' }];
  render(
    <KoiProvider>
      <Table columns={columns} data={data} />
    </KoiProvider>,
  );
  expect(screen.getByRole('table')).toBeInTheDocument();
  expect(screen.getByText('张三')).toBeInTheDocument();
});

test('Table renders card list on mobile', () => {
  mockWidth(BREAKPOINTS.md);
  const columns = [
    { key: 'name' as const, title: '姓名' },
    { key: 'age' as const, title: '年龄' },
  ];
  const data = [{ name: '李四', age: '25' }];
  render(
    <KoiProvider>
      <Table columns={columns} data={data} />
    </KoiProvider>,
  );
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
  expect(screen.getByText('李四')).toBeInTheDocument();
});

test('Table rows are keyboard-operable when clickable', () => {
  mockWidth(BREAKPOINTS.lg);
  let clicked = '';
  const columns = [
    { key: 'name' as const, title: '姓名' },
    { key: 'age' as const, title: '年龄' },
  ];
  const data = [{ name: '张三', age: '20' }];

  render(
    <KoiProvider>
      <Table columns={columns} data={data} onRowClick={(row) => {
        clicked = row.name;
      }} />
    </KoiProvider>,
  );

  const row = screen.getByText('张三').closest('tr');
  expect(row).toHaveAttribute('tabindex', '0');
  fireEvent.keyDown(row!, { key: 'Enter' });
  expect(clicked).toBe('张三');
});

test('Modal renders when open', () => {
  render(
    <KoiProvider>
      <Modal open onClose={() => {}} title="标题">
        内容
      </Modal>
    </KoiProvider>,
  );
  const dialog = screen.getByRole('dialog');
  expect(dialog).toBeInTheDocument();
  expect(dialog).toHaveAttribute('aria-modal', 'true');
  expect(screen.getByText('内容')).toBeInTheDocument();
});

test('Modal traps focus and restores trigger focus on close', async () => {
  function Harness() {
    const [open, setOpen] = useState(false);
    return (
      <KoiProvider>
        <button type="button" onClick={() => setOpen(true)}>
          打开
        </button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="标题"
          footer={<button type="button">确认</button>}
        >
          <button type="button">内容按钮</button>
        </Modal>
      </KoiProvider>
    );
  }

  render(<Harness />);

  const trigger = screen.getByText('打开');
  trigger.focus();
  fireEvent.click(trigger);

  await waitFor(() => {
    expect(screen.getByRole('dialog')).toContainElement(
      document.activeElement as HTMLElement | null,
    );
  });

  fireEvent.keyDown(document, { key: 'Escape' });

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });
});

test('useBreakpoint detects mobile', () => {
  mockWidth(BREAKPOINTS.md);
  function Probe() {
    const { isMobile } = useBreakpoint();
    return <span data-testid="probe">{isMobile ? 'mobile' : 'desktop'}</span>;
  }
  render(<Probe />);
  expect(screen.getByTestId('probe')).toHaveTextContent('mobile');
});

test('AdaptiveRender switches by breakpoint', () => {
  mockWidth(BREAKPOINTS.md);
  const Desktop = () => <div data-testid="view">desktop</div>;
  const Mobile = () => <div data-testid="view">mobile</div>;
  render(
    <KoiProvider>
      <AdaptiveRender desktop={Desktop} mobile={Mobile} props={{}} />
    </KoiProvider>,
  );
  expect(screen.getByTestId('view')).toHaveTextContent('mobile');
});

test('AdaptiveRender respects previewDevice override', () => {
  mockWidth(BREAKPOINTS.xl);
  const Desktop = () => <div data-testid="view">desktop</div>;
  const Mobile = () => <div data-testid="view">mobile</div>;
  render(
    <KoiProvider previewDevice="mobile">
      <AdaptiveRender desktop={Desktop} mobile={Mobile} props={{}} />
    </KoiProvider>,
  );
  expect(screen.getByTestId('view')).toHaveTextContent('mobile');
});

test('Tabs support arrow-key navigation', () => {
  render(
    <Tabs
      items={[
        { key: 'a', label: 'Tab A', children: 'A' },
        { key: 'b', label: 'Tab B', children: 'B' },
      ]}
    />,
  );

  const firstTab = screen.getByRole('tab', { name: 'Tab A' });
  fireEvent.keyDown(firstTab, { key: 'ArrowRight' });
  expect(screen.getByRole('tab', { name: 'Tab B' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  expect(screen.getByRole('tabpanel')).toHaveTextContent('B');
});

test('Modal portals into preview container on mobile preview', async () => {
  mockWidth(BREAKPOINTS.xl);

  function PreviewHarness() {
    const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(
      null,
    );

    return (
      <KoiProvider previewDevice="mobile" portalContainer={portalContainer}>
        <div
          ref={setPortalContainer}
          data-testid="portal-root"
          style={{ position: 'relative', height: 400, transform: 'translateZ(0)' }}
        >
          <Modal open onClose={() => {}} title="标题">
            内容
          </Modal>
        </div>
      </KoiProvider>
    );
  }

  render(<PreviewHarness />);

  await waitFor(() => {
    const portalRoot = screen.getByTestId('portal-root');
    expect(portalRoot.querySelector('[role="dialog"]')).toBeTruthy();
    expect(screen.getByText('内容')).toBeInTheDocument();
  });
});

test('Portal mounts into desktop preview container when provided', async () => {
  mockWidth(BREAKPOINTS.xl);

  function PreviewHarness() {
    const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(
      null,
    );

    return (
      <KoiProvider previewDevice="desktop" portalContainer={portalContainer}>
        <div
          ref={setPortalContainer}
          data-testid="desktop-portal-root"
          style={{ position: 'relative', height: 400, transform: 'translateZ(0)' }}
        >
          <Modal open onClose={() => {}} title="桌面预览">
            桌面内容
          </Modal>
        </div>
      </KoiProvider>
    );
  }

  render(<PreviewHarness />);

  await waitFor(() => {
    const portalRoot = screen.getByTestId('desktop-portal-root');
    expect(portalRoot.querySelector('[role="dialog"]')).toBeTruthy();
    expect(screen.getByText('桌面内容')).toBeInTheDocument();
  });
});

test('useScrollLock restores mobile preview viewport scroll after picker closes', async () => {
  mockWidth(BREAKPOINTS.xl);

  function PreviewHarness() {
    const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(
      null,
    );

    return (
      <KoiProvider previewDevice="mobile" portalContainer={portalContainer}>
        <div className="koi-device-viewport" data-testid="viewport">
          <Select
            options={[
              { value: 'a', label: '选项 A' },
              { value: 'b', label: '选项 B' },
            ]}
          />
          <div ref={setPortalContainer} className="koi-device-portal" />
        </div>
      </KoiProvider>
    );
  }

  render(<PreviewHarness />);

  const viewport = screen.getByTestId('viewport');
  fireEvent.click(screen.getByRole('button'));
  expect(viewport.style.overflow).toBe('hidden');

  fireEvent.click(screen.getByText('选项 A'));
  await waitFor(() => {
    expect(viewport.style.overflow).toBe('');
  });
});

test('Select supports keyboard selection on desktop', async () => {
  mockWidth(BREAKPOINTS.xl);

  function Harness() {
    const [value, setValue] = useState('');
    return (
      <KoiProvider>
        <Select
          value={value}
          options={[
            { value: 'a', label: 'Option A' },
            { value: 'b', label: 'Option B' },
          ]}
          onChange={setValue}
        />
      </KoiProvider>
    );
  }

  render(<Harness />);

  const trigger = screen.getByRole('button');
  fireEvent.keyDown(trigger, { key: 'ArrowDown' });
  fireEvent.keyDown(trigger, { key: 'ArrowDown' });
  fireEvent.keyDown(trigger, { key: 'Enter' });

  await waitFor(() => {
    expect(trigger).toHaveTextContent('Option B');
  });
});

test('Picker desktop opens floating multi-column wheel panel', async () => {
  mockWidth(BREAKPOINTS.xl);
  let selected: string[] = [];

  function Harness() {
    const [value, setValue] = useState<string[]>([]);
    return (
      <KoiProvider>
        <Picker
          value={value}
          placeholder="选择"
          columns={[
            {
              options: [
                { label: '周一', value: '1' },
                { label: '周二', value: '2' },
              ],
            },
            {
              options: [
                { label: '上午', value: 'am' },
                { label: '下午', value: 'pm' },
              ],
            },
          ]}
          onChange={(next) => {
            selected = next;
            setValue(next);
          }}
        />
      </KoiProvider>
    );
  }

  const { container } = render(<Harness />);
  fireEvent.click(screen.getByRole('button', { name: /选择/ }));

  const panel = container.querySelector('[data-picker-panel="desktop"]');
  expect(panel).toBeTruthy();
  expect(panel?.className).toContain('absolute');
  expect(panel?.className).toContain('top-full');
  expect(panel?.querySelectorAll('[data-picker-column]').length).toBe(2);

  fireEvent.click(screen.getByRole('button', { name: '周二' }));
  fireEvent.click(screen.getByRole('button', { name: '下午' }));
  fireEvent.click(screen.getByRole('button', { name: '确定' }));

  await waitFor(() => {
    expect(selected).toEqual(['2', 'pm']);
    expect(screen.getByRole('button', { name: /周二 下午/ })).toBeInTheDocument();
  });
});

test('Picker keeps draft selection when columns prop is inline', async () => {
  mockWidth(BREAKPOINTS.xl);

  function Harness() {
    const [, setTick] = useState(0);
    return (
      <KoiProvider>
        <button type="button" onClick={() => setTick((n) => n + 1)}>
          rerender
        </button>
        <Picker
          placeholder="选日"
          columns={[
            {
              options: [
                { label: '一', value: '1' },
                { label: '二', value: '2' },
                { label: '三', value: '3' },
              ],
            },
          ]}
        />
      </KoiProvider>
    );
  }

  render(<Harness />);
  fireEvent.click(screen.getByRole('button', { name: /选日/ }));
  fireEvent.click(screen.getByRole('button', { name: '三' }));

  // Parent re-render with a fresh columns[] reference must not wipe draft
  fireEvent.click(screen.getByRole('button', { name: 'rerender' }));

  expect(screen.getByRole('button', { name: '三' }).querySelector('span'))
    .toHaveClass('text-primary');
});

test('Picker mobile commits draft from wheel scroll', async () => {
  mockWidth(BREAKPOINTS.md);

  let selected: string[] = [];

  function Harness() {
    const [value, setValue] = useState<string[]>([]);
    return (
      <KoiProvider>
        <Picker
          value={value}
          placeholder="滑动选择"
          columns={[
            {
              options: [
                { label: '一', value: '1' },
                { label: '二', value: '2' },
                { label: '三', value: '3' },
              ],
            },
          ]}
          onChange={(next) => {
            selected = next;
            setValue(next);
          }}
        />
      </KoiProvider>
    );
  }

  render(<Harness />);
  fireEvent.click(screen.getByRole('button', { name: /滑动选择/ }));

  const column = document.querySelector(
    '[data-picker-panel="mobile"] [data-picker-column]',
  ) as HTMLDivElement | null;
  expect(column).toBeTruthy();

  Object.defineProperty(column!, 'scrollTop', {
    configurable: true,
    get: () => 80,
    set: () => undefined,
  });
  fireEvent.scroll(column!);

  await waitFor(() => {
    expect(screen.getByRole('option', { name: '三' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  fireEvent.click(screen.getByRole('button', { name: '确定' }));

  await waitFor(() => {
    expect(selected).toEqual(['3']);
  });
});

test('Provider locale messages flow into runtime strings', () => {
  render(
    <KoiProvider locale="en-US">
      <>
        <Select options={[]} />
        <Table columns={[{ key: 'name' as const, title: 'Name' }]} data={[]} />
      </>
    </KoiProvider>,
  );

  expect(screen.getByRole('button')).toHaveTextContent('Please select');
  expect(screen.getByText('No data')).toBeInTheDocument();
});

test('Swiper switches slide on pointer swipe', () => {
  let current = 0;
  const handleChange = (i: number) => {
    current = i;
  };

  const { container } = render(
    <Swiper onChange={handleChange} threshold={40}>
      <div>A</div>
      <div>B</div>
      <div>C</div>
    </Swiper>,
  );

  const root = container.firstElementChild as HTMLElement;
  fireEvent.pointerDown(root, { clientX: 200, pointerId: 1, button: 0 });
  fireEvent.pointerMove(root, { clientX: 120, pointerId: 1 });
  fireEvent.pointerUp(root, { clientX: 120, pointerId: 1 });
  expect(current).toBe(1);

  fireEvent.pointerDown(root, { clientX: 100, pointerId: 2, button: 0 });
  fireEvent.pointerMove(root, { clientX: 180, pointerId: 2 });
  fireEvent.pointerUp(root, { clientX: 180, pointerId: 2 });
  expect(current).toBe(0);
});

test('Swiper loop wraps to first without modulo jump index', () => {
  let current = 0;
  const { container } = render(
    <Swiper
      loop
      threshold={40}
      onChange={(i) => {
        current = i;
      }}
    >
      <div>A</div>
      <div>B</div>
      <div>C</div>
    </Swiper>,
  );

  const root = container.firstElementChild as HTMLElement;
  // A -> B -> C -> (clone of A / logical 0)
  for (let i = 0; i < 3; i += 1) {
    fireEvent.pointerDown(root, { clientX: 200, pointerId: i + 1, button: 0 });
    fireEvent.pointerMove(root, { clientX: 100, pointerId: i + 1 });
    fireEvent.pointerUp(root, { clientX: 100, pointerId: i + 1 });
  }
  expect(current).toBe(0);

  const track = root.firstElementChild as HTMLElement;
  // 无缝轨道：末尾克隆 + 真实页 + 首页克隆 = 5
  expect(track.children.length).toBe(5);
});

test('Swiper rapid next past last slide stays within track (no blank)', () => {
  let current = 0;
  const { container } = render(
    <Swiper
      loop
      showArrows
      showDots={false}
      onChange={(i) => {
        current = i;
      }}
    >
      <div>A</div>
      <div>B</div>
      <div>C</div>
    </Swiper>,
  );

  const root = container.firstElementChild as HTMLElement;
  const next = screen.getByLabelText('Next');
  // 快切穿过末页克隆：4 次 next 覆盖「停在克隆上立即再切」路径
  for (let i = 0; i < 4; i += 1) {
    fireEvent.click(next);
  }

  const track = root.firstElementChild as HTMLElement;
  const match = track.style.transform.match(/-(\d+)%/);
  expect(match).not.toBeNull();
  const trackIndex = Number(match![1]) / 100;
  // loop 轨道合法下标：0 .. count+1（此处 0..4）
  expect(trackIndex).toBeGreaterThanOrEqual(0);
  expect(trackIndex).toBeLessThanOrEqual(4);
  expect(current).toBeGreaterThanOrEqual(0);
  expect(current).toBeLessThanOrEqual(2);
});

test('toast shows and clears content imperatively', async () => {
  toast.clear();
  toast.success('保存成功');
  await waitFor(() => {
    expect(screen.getByText('保存成功')).toBeInTheDocument();
  });
  toast.clear();
  await waitFor(() => {
    expect(screen.queryByText('保存成功')).not.toBeInTheDocument();
  });
});
