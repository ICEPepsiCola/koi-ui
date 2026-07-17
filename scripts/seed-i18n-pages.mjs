/**
 * One-shot / idempotent seeder for i18n/pages/*.json.
 * Run: node scripts/seed-i18n-pages.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { DEMOS } from './docs-demos.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const PAGES = path.join(ROOT, 'i18n/pages');
fs.mkdirSync(PAGES, { recursive: true });

const COMPONENT_ZH = {
  Button: '按钮',
  Icon: '图标',
  Typography: '排版',
  Divider: '分割线',
  Grid: '栅格',
  Layout: '布局',
  Space: '间距',
  Flex: '弹性布局',
  Stack: '堆叠',
  Box: '容器',
  SafeArea: '安全区',
  Affix: '固钉',
  Breadcrumb: '面包屑',
  Dropdown: '下拉菜单',
  Menu: '菜单',
  Pagination: '分页',
  Steps: '步骤条',
  Tabs: '标签页',
  NavBar: '导航栏',
  TabBar: '标签栏',
  IndexBar: '索引栏',
  AutoComplete: '自动完成',
  Checkbox: '多选框',
  DatePicker: '日期选择',
  Form: '表单',
  Input: '输入框',
  InputNumber: '数字输入',
  Radio: '单选框',
  Rate: '评分',
  Select: '选择器',
  Slider: '滑动输入',
  Switch: '开关',
  TextArea: '文本域',
  TimePicker: '时间选择',
  Upload: '上传',
  Cascader: '级联选择',
  Picker: '选择器(移动)',
  SearchBar: '搜索栏',
  Stepper: '步进器',
  Avatar: '头像',
  Badge: '徽标',
  Calendar: '日历',
  Card: '卡片',
  Collapse: '折叠面板',
  Descriptions: '描述列表',
  Empty: '空状态',
  Image: '图片',
  List: '列表',
  Popover: '气泡卡片',
  Segmented: '分段控制器',
  Statistic: '统计数值',
  Table: '表格',
  Tag: '标签',
  Timeline: '时间轴',
  Tooltip: '文字提示',
  Tree: '树形控件',
  NoticeBar: '通告栏',
  Swiper: '滑块视图',
  Ellipsis: '文本省略',
  Alert: '警告提示',
  Drawer: '抽屉',
  Modal: '对话框',
  Notification: '通知提醒',
  Popconfirm: '气泡确认',
  Progress: '进度条',
  Result: '结果',
  Skeleton: '骨架屏',
  Spin: '加载中',
  Toast: '轻提示',
  Popup: '弹出层',
  ActionSheet: '动作面板',
  Loading: '加载',
  Mask: '背景蒙层',
  Watermark: '水印',
  BackTop: '回到顶部',
  FloatButton: '悬浮按钮',
  PullToRefresh: '下拉刷新',
  Footer: '页脚',
  FloatingPanel: '浮动面板',
  InfiniteScroll: '无限滚动',
};

const ZH_DEMO_TO_KEY = {
  基础用法: 'basic',
  按钮类型: 'variants',
  尺寸与状态: 'sizeStatus',
  常用图标: 'commonIcons',
  标题层级: 'headingLevels',
  栅格偏移: 'offset',
  对齐方式: 'alignment',
  错误提示: 'errorState',
  受控输入: 'controlledInput',
  受控选择: 'controlledSelect',
  水平布局: 'horizontalLayout',
  受控多选: 'controlledCheckbox',
  受控单选: 'controlledRadio',
  带底部操作: 'withFooter',
  底部抽屉: 'bottomDrawer',
  不同类型: 'variants',
  空数据: 'emptyData',
  可关闭标签: 'closable',
  受控切换: 'controlledTabs',
  完成态: 'completed',
  受控日期: 'controlledDate',
  自定义提示: 'customHint',
  带标题描述: 'withDescription',
  禁用项: 'disabledItems',
  带底部区域: 'withFooterArea',
  多列布局: 'multiColumn',
  不同样式: 'styles',
  失败结果: 'errorResult',
  带右侧操作: 'withRightAction',
  受控搜索: 'controlledSearch',
};

const DEMO_EN = {
  basic: 'Basic usage',
  variants: 'Variants',
  sizeStatus: 'Size and status',
  commonIcons: 'Common icons',
  headingLevels: 'Heading levels',
  offset: 'Column offset',
  alignment: 'Alignment',
  errorState: 'Error state',
  controlledInput: 'Controlled input',
  controlledSelect: 'Controlled select',
  horizontalLayout: 'Horizontal layout',
  controlledCheckbox: 'Controlled checkbox group',
  controlledRadio: 'Controlled radio group',
  withFooter: 'With footer actions',
  bottomDrawer: 'Bottom drawer',
  emptyData: 'Empty data',
  closable: 'Closable tags',
  controlledTabs: 'Controlled tabs',
  completed: 'Completed steps',
  controlledDate: 'Controlled date',
  customHint: 'Custom hint',
  withDescription: 'Title and description',
  disabledItems: 'Disabled items',
  withFooterArea: 'With footer',
  multiColumn: 'Multi-column',
  styles: 'Styles',
  errorResult: 'Error result',
  withRightAction: 'With right action',
  controlledSearch: 'Controlled search',
};

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

// --- Component pages ---
for (const [name, zhTitle] of Object.entries(COMPONENT_ZH)) {
  const pageId = `components.${name.toLowerCase()}`;
  const demos = { basic: { en: DEMO_EN.basic, zh: '基础用法' } };

  for (const demo of DEMOS[name] ?? []) {
    if (demo.key === 'basic') continue;
    const key = demo.key;
    demos[key] = { en: DEMO_EN[key] ?? key, zh: DEMO_EN[key] ?? key };
  }

  // Alert uses 不同类型 -> variants key already; Button also has variants — OK per page
  writeJson(path.join(PAGES, `${pageId}.json`), {
    title: { en: name, zh: zhTitle },
    demos,
  });
}

// --- Home ---
writeJson(path.join(PAGES, 'home.json'), {
  hero: {
    name: { en: 'Koi UI', zh: 'Koi UI' },
    text: {
      en: 'Adaptive React components for desktop and mobile',
      zh: 'PC + 移动端自适应组件库',
    },
    tagline: {
      en: 'One API that switches layouts automatically across breakpoints.',
      zh: '同一 API，自动适配桌面与移动布局',
    },
    actionStart: { en: 'Get started', zh: '快速开始' },
    actionComponents: { en: 'Browse components', zh: '查看组件' },
  },
  features: {
    adaptive: {
      title: { en: 'Adaptive core', zh: '自适应内核' },
      details: {
        en: 'Table, Modal, Form, Select and more switch desktop / mobile layouts by breakpoint.',
        zh: 'Table、Modal、Form、Select 等组件按断点自动切换桌面 / 移动布局',
      },
    },
    tokens: {
      title: { en: 'Tailwind CSS v4', zh: 'Tailwind CSS v4' },
      details: {
        en: 'Design tokens with CSS variables and first-class dark mode overrides.',
        zh: '基于 Design Tokens，支持 CSS 变量主题与暗色覆盖',
      },
    },
    react: {
      title: { en: 'React 19', zh: 'React 19' },
      details: {
        en: 'Built for modern React with strict TypeScript types.',
        zh: '使用较新的 React 能力，TypeScript 严格类型',
      },
    },
    docs: {
      title: { en: 'Live docs', zh: 'Rspress 文档' },
      details: {
        en: 'Component previews include desktop and phone side-by-side.',
        zh: '组件预览内置桌面 / 手机双端对照',
      },
    },
  },
});

// --- Guides (full markdown bodies per locale) ---
writeJson(path.join(PAGES, 'guide.getting-started.json'), {
  title: { en: 'Getting started', zh: '快速开始' },
  body: {
    en: `## Install

Install the main package (it pulls in \`@koi-ui/hooks\` and \`@koi-ui/tokens\`):

\`\`\`bash
pnpm add @koi-ui/core
\`\`\`

## Styles

\`\`\`css
@import "@koi-ui/core/styles.css";
\`\`\`

## Basic usage

Wrap your app with \`KoiProvider\`:

\`\`\`tsx preview
import { KoiProvider, Button, Stack } from '@koi-ui/core';

export default () => (
  <KoiProvider>
    <Stack direction="row" gap={4}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
    </Stack>
  </KoiProvider>
);
\`\`\`

## Adaptive components

The same API switches layouts between desktop and mobile:

- \`Table\` → card list on mobile
- \`Modal\` → bottom sheet on mobile
- \`Form\` → stacked labels on mobile
- \`Select\` / \`Picker\` → bottom picker on mobile

Pass \`responsive={false}\` to lock the desktop layout.

## Imperative toast

\`\`\`ts
import { toast } from '@koi-ui/core';

toast.success('Saved');
\`\`\`

## Advanced: hooks / tokens only

Most apps never need this. Install separately only if you want breakpoint hooks or standalone tokens:

\`\`\`bash
pnpm add @koi-ui/hooks
pnpm add @koi-ui/tokens
\`\`\`
`,
    zh: `## 安装

只需安装主包（会自动带上 \`@koi-ui/hooks\`、\`@koi-ui/tokens\`）：

\`\`\`bash
pnpm add @koi-ui/core
\`\`\`

## 引入样式

\`\`\`css
@import "@koi-ui/core/styles.css";
\`\`\`

## 基础用法

根节点包一层 \`KoiProvider\`，即可使用组件：

\`\`\`tsx preview
import { KoiProvider, Button, Stack } from '@koi-ui/core';

export default () => (
  <KoiProvider>
    <Stack direction="row" gap={4}>
      <Button variant="primary">主要按钮</Button>
      <Button variant="secondary">次要按钮</Button>
    </Stack>
  </KoiProvider>
);
\`\`\`

## 自适应组件

同一 API 在桌面与移动端自动切换布局，无需再写两套代码：

- \`Table\` → 移动端卡片列表
- \`Modal\` → 移动端底部抽屉
- \`Form\` → 移动端标签竖排
- \`Select\` / \`Picker\` 等 → 移动端底部选择器

临时固定某一端布局时，可传 \`responsive={false}\`。

## 命令式提示

\`\`\`ts
import { toast } from '@koi-ui/core';

toast.success('保存成功');
\`\`\`

## 进阶：单独使用 hooks / tokens

绝大多数场景不需要。若只要断点 hook，或要单独覆盖 Design Tokens：

\`\`\`bash
pnpm add @koi-ui/hooks
pnpm add @koi-ui/tokens
\`\`\`
`,
  },
});

writeJson(path.join(PAGES, 'guide.theming.json'), {
  title: { en: 'Theming', zh: '主题定制' },
  body: {
    en: `Koi UI defines design tokens as CSS variables. Override them in your app as needed.

## Primary color

\`\`\`css
:root {
  --color-primary: hsl(160 84% 39%);
  --color-primary-foreground: hsl(0 0% 100%);
  --radius-md: 0.75rem;
}
\`\`\`

## Dark mode

Built-in dark tokens follow \`html.dark\` / \`html.rp-dark\` (compatible with the Rspress dark toggle). Override under the same selectors:

\`\`\`css
html.dark {
  --color-surface: hsl(222 47% 11%);
  --color-surface-foreground: hsl(210 40% 98%);
  --color-border: hsl(217 33% 22%);
}
\`\`\`

\`@koi-ui/core/styles.css\` includes tokens by default. Tokens only:

\`\`\`css
@import "@koi-ui/tokens/theme.css";
\`\`\`

## Common tokens

| Token | Description |
|-------|-------------|
| \`--color-primary\` | Brand color |
| \`--color-surface\` | Surface background |
| \`--color-muted\` | Muted background |
| \`--color-border\` | Border |
| \`--radius-sm/md/lg\` | Radius |
| \`--shadow-sm/md\` | Shadow |

## Breakpoint provider

\`KoiProvider\` can change the mobile breakpoint (default \`lg\` = 1024px):

\`\`\`tsx preview
import { KoiProvider, Button } from '@koi-ui/core';

export default () => (
  <KoiProvider breakpoint="md">
    <Button>Breakpoint md (768px)</Button>
  </KoiProvider>
);
\`\`\`
`,
    zh: `Koi UI 通过 CSS 变量定义 Design Tokens，可在业务项目中直接覆盖。

## 覆盖主色

\`\`\`css
:root {
  --color-primary: hsl(160 84% 39%);
  --color-primary-foreground: hsl(0 0% 100%);
  --radius-md: 0.75rem;
}
\`\`\`

## 暗色模式

库内置随 \`html.dark\` / \`html.rp-dark\` 切换的暗色 Token（与 Rspress 文档暗色开关兼容）。业务站若自建暗色，只要在同一选择器下覆盖变量即可：

\`\`\`css
html.dark {
  --color-surface: hsl(222 47% 11%);
  --color-surface-foreground: hsl(210 40% 98%);
  --color-border: hsl(217 33% 22%);
}
\`\`\`

默认通过 \`@koi-ui/core/styles.css\` 引入即可；若只要 tokens：

\`\`\`css
@import "@koi-ui/tokens/theme.css";
\`\`\`

## 常用 Tokens

| Token | 说明 |
|-------|------|
| \`--color-primary\` | 主色 |
| \`--color-surface\` | 表面背景 |
| \`--color-muted\` | 弱化背景 |
| \`--color-border\` | 边框 |
| \`--radius-sm/md/lg\` | 圆角 |
| \`--shadow-sm/md\` | 阴影 |

## 断点 Provider

\`KoiProvider\` 可改移动端分界断点（默认 \`lg\` = 1024px）：

\`\`\`tsx preview
import { KoiProvider, Button } from '@koi-ui/core';

export default () => (
  <KoiProvider breakpoint="md">
    <Button>断点改为 md (768px)</Button>
  </KoiProvider>
);
\`\`\`
`,
  },
});

writeJson(path.join(PAGES, 'guide.responsive.json'), {
  title: { en: 'Responsive', zh: '响应式原理' },
  body: {
    en: `## Breakpoints

| Breakpoint | Width |
|------------|-------|
| sm | 640px |
| md | 768px |
| lg | 1024px (default desktop / mobile split) |
| xl | 1280px |
| 2xl | 1536px |

## Component behavior

Most feedback / form / data components support \`responsive\`:

- Default \`true\`: switch between desktop and mobile layouts by viewport
- \`false\`: always use the desktop layout

\`\`\`tsx
<Table responsive={false} columns={cols} data={data} />
<Modal responsive={false} open={open} onClose={close}>...</Modal>
\`\`\`

The docs preview “Desktop / Mobile” toggle injects \`previewDevice\` so you can compare both layouts on one page.

## SSR

The server renders the desktop layout by default; the client hydrates to the real viewport. For mobile-first landings:

\`\`\`tsx
<KoiProvider ssrMode="mobile">...</KoiProvider>
\`\`\`
`,
    zh: `## 断点

| 断点 | 宽度 |
|------|------|
| sm | 640px |
| md | 768px |
| lg | 1024px（默认桌面 / 移动分界） |
| xl | 1280px |
| 2xl | 1536px |

## 组件侧行为

大部分反馈 / 表单 / 数据组件支持 \`responsive\`：

- 默认 \`true\`：按视口在桌面布局与移动布局间自动切换
- \`false\`：始终使用桌面布局（便于嵌入已有移动壳或固定样式）

\`\`\`tsx
<Table responsive={false} columns={cols} data={data} />
<Modal responsive={false} open={open} onClose={close}>...</Modal>
\`\`\`

文档预览里的「桌面端 / 移动端」开关会注入 \`previewDevice\`，便于在同一页面对照两端效果。

## SSR

服务端默认按桌面渲染，客户端 hydrate 后按真实视口切换。若落地页以移动为主，可用：

\`\`\`tsx
<KoiProvider ssrMode="mobile">...</KoiProvider>
\`\`\`
`,
  },
});

console.log(
  `Seeded ${Object.keys(COMPONENT_ZH).length} component pages + home + 3 guides`,
);
