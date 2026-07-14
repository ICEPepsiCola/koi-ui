# Koi UI 组件库设计规格

> 日期：2026-07-12  
> 状态：已实现

## 1. 概述

Koi UI 是一个基于 React 的通用组件库，核心差异点是**组件内部按断点自动切换布局与交互**（如 Table → CardList、Modal → Drawer），对用户暴露统一 API，无需手动处理响应式逻辑。样式基于 Tailwind CSS v4 和内置 Design Tokens，文档使用 Rspress 2.0。

### 目标场景

- 中后台管理系统（表格、表单、筛选、弹窗）
- C 端应用（内容展示、交互流程）
- 通用基础组件（Button、Input、Card 等）

### 非目标（MVP 阶段不做）

- Schema/JSON 驱动的低代码渲染
- 框架无关（Web Components）
- 基于 Radix UI 等 headless 原语（选择完全自研）
- 多框架支持（Vue、Solid 等）

---

## 2. 核心需求

| 维度 | 决策 |
|------|------|
| 自适应方式 | 组件内部自动切换，API 对用户透明 |
| 框架 | React 19 |
| 场景 | 中后台 + C 端 + 通用（分阶段推进） |
| 底层交互 | 完全自研 |
| 样式 | Tailwind CSS v4 + 内置 Design Tokens |
| 文档 | Rspress 2.0 |
| 架构 | 自适应内核 + 分层组件（monorepo） |

---

## 3. 技术栈

| 类别 | 选型 | 版本要求 |
|------|------|----------|
| 运行时 | React | 19.x |
| 语言 | TypeScript | 5.x，strict 模式 |
| 样式 | Tailwind CSS | v4（CSS-first，`@import "tailwindcss"`） |
| 变体管理 | tailwind-variants (tv) | latest |
| 组件构建 | Rslib | latest |
| 文档 | Rspress | 2.0 |
| 测试 | Rstest + @rstest/adapter-rslib | latest |
| 包管理 | pnpm workspace | latest |
| 脚手架 | create-rslib | 选 React + TS + Rspress |
| 路由 | React Router | 7.x（Rspress 内置） |
| 运行时环境 | Node.js | 20+ |
| 代码检查 | Rslint（可选） | latest |

整体归属 **Rstack** 工具链：Rslib（构建）+ Rspress（文档）+ Rstest（测试），配置互通。

---

## 4. 项目结构

```
koi-ui/
├── packages/
│   ├── tokens/                  # Design Tokens
│   │   ├── src/
│   │   │   ├── theme.css        # @theme 变量定义
│   │   │   └── reset.css        # 基础样式重置
│   │   └── package.json
│   ├── hooks/                   # 共享 hooks
│   │   ├── src/
│   │   │   ├── useBreakpoint.ts
│   │   │   ├── useMediaQuery.ts
│   │   │   └── useAdaptive.ts
│   │   └── package.json
│   ├── core/                    # 组件库主包 @koi-ui/core
│   │   ├── src/
│   │   │   ├── primitives/      # Box, Stack, Text, Flex
│   │   │   ├── components/      # Button, Table, Modal, Form...
│   │   │   ├── adaptive/        # AdaptiveRender 内核
│   │   │   ├── provider/        # KoiProvider 全局配置
│   │   │   └── index.ts
│   │   ├── rslib.config.ts
│   │   └── package.json
│   └── icons/                   # 图标包（后续）
├── apps/
│   └── docs/                    # Rspress 文档站
│       ├── docs/
│       │   ├── index.md
│       │   ├── guide/
│       │   │   ├── getting-started.mdx
│       │   │   ├── theming.mdx
│       │   │   └── responsive.mdx
│       │   └── components/
│       │       ├── button.mdx
│       │       ├── table.mdx
│       │       └── modal.mdx
│       └── rspress.config.ts
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
└── rstest.config.ts
```

### 包依赖关系

```
@koi-ui/tokens  ←  @koi-ui/hooks  ←  @koi-ui/core  ←  apps/docs
```

---

## 5. 自适应内核

### 5.1 断点策略

- 默认分界：`lg`（1024px），低于此宽度视为移动端
- 全局配置：通过 `KoiProvider` 的 `breakpoint` prop 覆盖
- 与 Tailwind 断点对齐：`sm:640` / `md:768` / `lg:1024` / `xl:1280` / `2xl:1536`

### 5.2 useBreakpoint

```ts
// packages/hooks/src/useBreakpoint.ts
type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

interface BreakpointState {
  /** 当前活跃断点 */
  breakpoint: Breakpoint
  /** 是否低于指定断点（默认 lg） */
  isBelow: (bp: Breakpoint) => boolean
  /** 是否移动端（< lg） */
  isMobile: boolean
}
```

实现基于 `window.matchMedia`，监听 resize 变化。提供 `useSyncExternalStore` 封装以兼容 React 19 concurrent 模式。

### 5.3 AdaptiveRender

```tsx
// packages/core/src/adaptive/AdaptiveRender.tsx
interface AdaptiveRenderProps<T> {
  /** 桌面端渲染 */
  desktop: React.ComponentType<T>
  /** 移动端渲染 */
  mobile: React.ComponentType<T>
  /** 共享 props */
  props: T
  /** 覆盖断点，默认从 KoiProvider 读取 */
  breakpoint?: Breakpoint
}

function AdaptiveRender<T>({ desktop: Desktop, mobile: Mobile, props }: AdaptiveRenderProps<T>) {
  const { isMobile } = useBreakpoint()
  const Component = isMobile ? Mobile : Desktop
  return <Component {...props} />
}
```

### 5.4 SSR 处理

- 服务端默认渲染 desktop 版本（内容更完整，利于 SEO）
- 客户端 hydrate 后根据实际视口切换
- 对自适应组件根节点添加 `suppressHydrationWarning`
- 可选：`KoiProvider ssrMode="mobile" | "desktop"` 供 SSR 框架指定初始渲染

### 5.5 KoiProvider

```tsx
interface KoiProviderProps {
  children: React.ReactNode
  /** 移动端分界断点，默认 'lg' */
  breakpoint?: Breakpoint
  /** SSR 初始渲染模式 */
  ssrMode?: 'mobile' | 'desktop'
  /** 主题覆盖 */
  theme?: Partial<KoiTheme>
}
```

---

## 6. Design Tokens

### 6.1 Token 定义（Tailwind v4 @theme）

```css
/* packages/tokens/src/theme.css */
@import "tailwindcss";

@theme {
  /* 颜色 */
  --color-primary: hsl(220 90% 56%);
  --color-primary-foreground: hsl(0 0% 100%);
  --color-surface: hsl(0 0% 100%);
  --color-surface-foreground: hsl(222 47% 11%);
  --color-muted: hsl(210 40% 96%);
  --color-border: hsl(214 32% 91%);
  --color-destructive: hsl(0 84% 60%);

  /* 圆角 */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;

  /* 间距 */
  --spacing-page: 1.5rem;

  /* 字体 */
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, monospace;

  /* 阴影 */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);

  /* 自适应断点（供 JS 读取） */
  --breakpoint-mobile: 1024px;
}
```

### 6.2 用户覆盖方式

用户在项目 CSS 中重新定义变量即可换肤，无需修改 Tailwind 配置：

```css
:root {
  --color-primary: hsl(160 84% 39%);
  --radius-md: 0.75rem;
}
```

### 6.3 组件样式约定

- 使用 `tailwind-variants` 定义组件变体（size、variant、state）
- 类名通过 token 引用：`bg-primary text-primary-foreground rounded-md`
- 禁止硬编码色值，所有颜色/间距/圆角走 token

---

## 7. 组件 API 设计

### 7.1 Primitives（纯 Tailwind 响应式，无断点切换）

```tsx
// Stack — 布局原语
<Stack direction="row" gap={4} align="center">
  <Text size="lg" weight="bold">标题</Text>
  <Text muted>描述</Text>
</Stack>

// Box — 通用容器
<Box p={4} rounded="md" bg="surface">
  {children}
</Box>
```

Primitives 通过 Tailwind 响应式前缀处理简单适配（`flex-col md:flex-row`），不使用 AdaptiveRender。

### 7.2 自适应组件

#### Table

```tsx
interface TableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  /** 移动端卡片中显示的字段，默认取前 3 列 */
  mobileFields?: (keyof T)[]
  loading?: boolean
  emptyText?: string
  onRowClick?: (row: T) => void
}

// 用法 — 无需关心设备
<Table columns={columns} data={users} onRowClick={handleClick} />
```

内部实现：
- Desktop：`TableView` — 标准 `<table>` 布局
- Mobile：`CardListView` — 每行数据渲染为 Card，展示 mobileFields 字段

#### Modal

```tsx
interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  /** 移动端是否全屏，默认 true */
  mobileFullscreen?: boolean
}

<Modal open={open} onClose={close} title="确认删除">
  <p>此操作不可撤销</p>
</Modal>
```

内部实现：
- Desktop：`ModalView` — 居中弹窗 + 遮罩
- Mobile：`DrawerView` — 底部滑出面板

#### Form / FormItem

```tsx
<Form layout="horizontal" onSubmit={handleSubmit}>
  <FormItem label="用户名" name="username" required>
    <Input />
  </FormItem>
  <FormItem label="邮箱" name="email">
    <Input type="email" />
  </FormItem>
</Form>
```

内部实现：
- Desktop：`layout="horizontal"` — label 和 input 横排
- Mobile：自动切换为 `layout="vertical"` — label 在上、input 在下

#### Select

```tsx
<Select
  options={options}
  value={value}
  onChange={setValue}
  placeholder="请选择"
/>
```

内部实现：
- Desktop：下拉菜单
- Mobile：底部全屏选择器（BottomSheet）

### 7.3 基础组件

#### Button

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  children: React.ReactNode
  onClick?: () => void
}
```

响应式：`size` 在移动端自动降一级（`lg → md`，`md → sm`），可通过 `responsiveSize={false}` 关闭。

#### Input

```tsx
interface InputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  type?: 'text' | 'password' | 'email' | 'number'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  error?: string
}
```

### 7.4 API 设计原则

1. **对用户透明** — 自适应是内部行为，props 不暴露 `isMobile` / `variant="responsive"`
2. **允许覆盖** — 提供 `responsive={false}` 关闭自动切换（少数场景需要固定形态）
3. **类型安全** — 所有 props 完整 TypeScript 类型，泛型组件（Table）类型推导
4. **一致性** — 所有组件遵循相同的 variant/size 命名约定

---

## 8. Rspress 文档站规划

### 8.1 配置

```ts
// apps/docs/rspress.config.ts
import { defineConfig } from '@rspress/core'
import { pluginPreview } from '@rspress/plugin-preview'
import { pluginApiDocgen } from '@rspress/plugin-api-docgen'
import { pluginWorkspaceDev } from '@rspress/plugin-workspace-dev'

export default defineConfig({
  root: 'docs',
  title: 'Koi UI',
  description: 'PC + 移动端自适应 React 组件库',
  lang: 'zh',
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: '组件', link: '/components/button' },
    ],
    sidebar: {
      '/guide/': [
        { text: '快速开始', link: '/guide/getting-started' },
        { text: '主题定制', link: '/guide/theming' },
        { text: '响应式原理', link: '/guide/responsive' },
      ],
      '/components/': [
        { text: '基础', items: [
          { text: 'Button 按钮', link: '/components/button' },
          { text: 'Input 输入框', link: '/components/input' },
          { text: 'Card 卡片', link: '/components/card' },
        ]},
        { text: '布局', items: [
          { text: 'Stack 堆叠', link: '/components/stack' },
          { text: 'Box 容器', link: '/components/box' },
        ]},
        { text: '反馈', items: [
          { text: 'Modal 弹窗', link: '/components/modal' },
        ]},
        { text: '数据展示', items: [
          { text: 'Table 表格', link: '/components/table' },
        ]},
        { text: '数据录入', items: [
          { text: 'Form 表单', link: '/components/form' },
          { text: 'Select 选择器', link: '/components/select' },
        ]},
      ],
    },
  },
  builderConfig: {
    plugins: [
      pluginWorkspaceDev({ startCurrent: true }),
    ],
  },
  plugins: [
    pluginPreview({
      defaultPreviewMode: 'iframe-fixed',
    }),
    pluginApiDocgen({
      entries: {
        Button: '@koi-ui/core/Button',
        Input: '@koi-ui/core/Input',
        Table: '@koi-ui/core/Table',
        Modal: '@koi-ui/core/Modal',
        Form: '@koi-ui/core/Form',
        Select: '@koi-ui/core/Select',
      },
      apiParseTool: 'react-docgen-typescript',
    }),
  ],
})
```

### 8.2 文档页面模板

每个组件文档 MDX 文件遵循统一结构：

```mdx
# Table 表格

用于展示结构化数据。桌面端渲染为标准表格，移动端自动切换为卡片列表。

## 基础用法

{/* 实时预览 */}
```tsx preview="iframe-fixed"
import { Table } from '@koi-ui/core'

const columns = [
  { key: 'name', title: '姓名' },
  { key: 'email', title: '邮箱' },
  { key: 'role', title: '角色' },
]

const data = [
  { name: '张三', email: 'zhang@example.com', role: '管理员' },
  { name: '李四', email: 'li@example.com', role: '用户' },
]

export default () => <Table columns={columns} data={data} />
```

## 移动端自适应

调整预览区域宽度到 1024px 以下，表格会自动切换为卡片列表布局。无需修改任何代码。

## API

<ApiDoc componentName="Table" />
```

### 8.3 文档目录

```
apps/docs/docs/
├── index.md                     # 首页
├── guide/
│   ├── getting-started.mdx      # 安装、快速上手
│   ├── theming.mdx              # Design Tokens 定制
│   └── responsive.mdx           # 自适应原理、断点配置
└── components/
    ├── _meta.json               # 组件目录排序
    ├── button.mdx
    ├── input.mdx
    ├── card.mdx
    ├── stack.mdx
    ├── box.mdx
    ├── modal.mdx
    ├── table.mdx
    ├── form.mdx
    └── select.mdx
```

---

## 9. MVP 路线图

### Phase 0：基础设施（第 1 周）

- [ ] `create-rslib` 初始化 monorepo
- [ ] 配置 pnpm workspace、TypeScript、Rslib 构建
- [ ] 搭建 `@koi-ui/tokens` 包（theme.css）
- [ ] 搭建 `@koi-ui/hooks` 包（useBreakpoint）
- [ ] 实现 AdaptiveRender + KoiProvider
- [ ] Rspress 文档站骨架 + 首页

### Phase 1：基础组件（第 2–3 周）

- [ ] Button（含 loading、variant、响应式 size）
- [ ] Input（含 error 状态）
- [ ] Card
- [ ] Stack / Box / Text primitives
- [ ] 对应 Rspress 文档页

### Phase 2：核心自适应组件（第 4–5 周）

- [ ] Modal（桌面弹窗 → 移动 Drawer）
- [ ] Table（桌面表格 → 移动 CardList）
- [ ] Form / FormItem（横排 → 竖排）
- [ ] 对应 Rspress 文档页 + 移动端预览演示

### Phase 3：复杂交互（第 6–8 周）

- [ ] Select（桌面下拉 → 移动 BottomSheet）
- [ ] Tabs
- [ ] Pagination
- [ ] a11y 基础测试（键盘导航、焦点管理、ARIA）
- [ ] Rstest 单元测试覆盖

### Phase 4：完善与发布（第 9 周+）

- [ ] npm 发布流程（@koi-ui/core）
- [ ] 完善指南文档（theming、responsive）
- [ ] CI/CD（构建 + 测试 + 文档部署）

---

## 10. 测试策略

| 层级 | 工具 | 覆盖范围 |
|------|------|----------|
| 单元测试 | Rstest + @testing-library/react | hooks、工具函数、组件渲染 |
| 自适应测试 | Rstest + matchMedia mock | 断点切换逻辑、AdaptiveRender |
| a11y 测试 | 手动 + 键盘事件测试 | Modal 焦点陷阱、Select 键盘导航 |
| 视觉验证 | Rspress iframe-fixed 预览 | 文档中的实时预览即视觉测试 |

Rstest 通过 `@rstest/adapter-rslib` 继承 Rslib 配置，测试环境与构建环境一致。

---

## 11. 风险与应对

| 风险 | 影响 | 应对 |
|------|------|------|
| 自研 Dialog/Select a11y | 键盘导航、屏幕阅读器支持差 | MVP 先做基础可用版，同步编写 a11y 测试；复杂组件推迟到 Phase 3 |
| SSR 水合闪烁 | 自适应组件在客户端切换时布局跳动 | 默认 SSR 渲染 desktop；提供 `ssrMode` 配置；关键组件 CSS 过渡 |
| Rslib 仍在 0.x | API 可能变动 | 锁定版本，关注 v1.0 milestone |
| Tailwind v4 生态 | 部分插件/工具可能不兼容 | 核心功能不依赖第三方 Tailwind 插件 |
| 范围过大（A+B+C） | 开发周期拉长 | 严格按 Phase 推进，MVP 只交付 Phase 0–2 |

---

## 12. 开发工作流

```bash
# 初始化
npm create rslib@latest koi-ui
# → React + TypeScript
# → 勾选 Rspress documentation

# 日常开发
pnpm dev          # Rslib watch，组件热更新
pnpm docs:dev     # Rspress 文档站 + 组件预览联动

# 质量
pnpm test         # Rstest
pnpm lint         # Rslint（可选）

# 构建
pnpm build        # Rslib → ESM + CJS + .d.ts
pnpm docs:build   # Rspress 静态站点
```

---

## 13. 自审清单

- [x] 无 TBD / TODO 占位符
- [x] 架构与功能描述一致（自适应内核贯穿组件设计）
- [x] 范围聚焦：MVP Phase 0–2 可独立交付
- [x] 「自动渲染」已明确为组件内部断点切换，非 Schema 驱动
- [x] 技术栈全部指向 Rstack 最新版本
- [x] 文档方案完整（Rspress 配置、目录、MDX 模板）
- [x] API 设计遵循「对用户透明」原则
