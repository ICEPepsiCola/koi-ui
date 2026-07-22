import * as path from 'node:path';
import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rspress/core';
import { pluginPreview } from '@rspress/plugin-preview';
import tailwindcss from '@tailwindcss/postcss';

import { themeLocales } from './docs/theme-locales';

const DOC_DEV_PORT = 8877;

const previewBuilderConfig = {
  plugins: [pluginReact()],
  tools: {
    postcss: {
      postcssOptions: {
        plugins: [tailwindcss()],
      },
    },
  },
  source: {
    preEntry: [path.join(__dirname, 'docs/preview.css')],
  },
};

function wrapDemoCode(code: string): string {
  if (code.includes('DevicePreviewShell') || code.includes('KoiProvider')) {
    return code;
  }

  const hasDefaultExport = /export\s+default/.test(code);
  if (!hasDefaultExport) return code;

  const shellPath = path
    .join(__dirname, 'docs/DevicePreviewShell')
    .replaceAll('\\', '/');

  return `import { DevicePreviewShell } from ${JSON.stringify(shellPath)};

${code.replace(/export\s+default\s+/, 'const __Demo = ')}

const __demoSource = ${JSON.stringify(code)};

export default function DemoWrapper() {
  return (
    <DevicePreviewShell code={__demoSource}>
      <__Demo />
    </DevicePreviewShell>
  );
}
`;
}

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  base: process.env.DOCS_BASE ?? '/',
  route: {
    exclude: [
      '**/superpowers/**',
      '**/Demo.tsx',
      '**/DevicePreviewShell.tsx',
      '**/IconGallery.tsx',
      '**/ThemeLab.tsx',
      '**/ApiDocs.tsx',
      '**/catalog.ts',
      '**/theme-locales.ts',
      '**/api-locale.ts',
      '**/icon-name-zh.ts',
      '**/mockups/**',
      '**/.generated/**',
    ],
  },
  title: 'Koi UI',
  description: 'Adaptive React component library for desktop and mobile',
  lang: 'en',
  locales: [
    {
      lang: 'en',
      label: 'English',
      title: 'Koi UI',
      description: 'Adaptive React component library for desktop and mobile',
    },
    {
      lang: 'zh',
      label: '简体中文',
      title: 'Koi UI',
      description: 'PC + 移动端自适应 React 组件库',
    },
  ],
  themeConfig: {
    localeRedirect: 'auto',
    locales: themeLocales as never,
  },
  globalStyles: path.join(__dirname, 'docs/styles.css'),
  builderConfig: {
    server: {
      port: DOC_DEV_PORT,
      strictPort: true,
    },
    plugins: [pluginReact()],
    tools: {
      postcss: {
        postcssOptions: {
          plugins: [tailwindcss()],
        },
      },
    },
  },
  plugins: [
    pluginPreview({
      defaultPreviewMode: 'internal',
      // Require `tsx preview` meta — bare `tsx` snippets must not SSG as live demos.
      defaultRenderMode: 'pure',
      previewCodeTransform(codeInfo) {
        return wrapDemoCode(codeInfo.code);
      },
      iframeOptions: {
        builderConfig: previewBuilderConfig,
      },
    }),
  ],
});
