# Koi UI

Adaptive **React** component library for desktop and mobile — one API that switches layouts by breakpoint.

Inspired by the coverage of Ant Design + Ant Design Mobile, built with React 19, Tailwind CSS v4, Rslib, and Rspress.

[Documentation](https://icepepsicola.github.io/koi-ui/) · [Getting started](https://icepepsicola.github.io/koi-ui/guide/getting-started) · [Components](https://icepepsicola.github.io/koi-ui/components/button)

> Docs default to English and follow the browser language on first visit. Switch languages anytime in the navbar.

## Features

- **Adaptive core** — Table, Modal, Form, Select, and more switch desktop / mobile layouts automatically
- **Single install** — `@koi-ui/core` brings hooks and design tokens with it
- **Design tokens** — CSS variables, theming, and dark mode via `html.dark`
- **Strict TypeScript** — typed props and modern React APIs
- **Live docs** — desktop and phone previews side by side

## Install

```bash
pnpm add @koi-ui/core
```

```css
@import "@koi-ui/core/styles.css";
```

## Quick start

```tsx
import { KoiProvider, Button, Stack } from '@koi-ui/core';

export function App() {
  return (
    <KoiProvider>
      <Stack direction="row" gap={4}>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
      </Stack>
    </KoiProvider>
  );
}
```

```ts
import { toast } from '@koi-ui/core';

toast.success('Saved');
```

## Components

80 components across general, layout, navigation, data entry, data display, feedback, and more.

Adaptive standouts: **Table**, **Modal**, **Form**, **Select**, **Dropdown**, **DatePicker**, **Cascader**, **Picker**, **SearchBar**.

## Local development

```bash
pnpm install
pnpm dev          # library watch mode
pnpm doc          # docs at http://localhost:8877
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Contributing

Issues and pull requests are welcome. Please use [Conventional Commits](https://www.conventionalcommits.org/) (`feat`, `fix`, `docs`, …).

## License

MIT
