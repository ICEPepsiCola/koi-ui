import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, expect, test } from '@rstest/core';
import { createVirtualModuleDataLoader } from '../src/node/virtual-module';
import { collectDependencyFiles, parseAll } from '../src/node/parser';
import type { PluginApiTableOptions } from '../src/types';

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) {
    fs.rmSync(root, { force: true, recursive: true });
  }
});

function createWorkspace() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'koi-api-table-'));
  roots.push(root);

  const componentDir = path.join(root, 'packages/core/src/components/Test');
  fs.mkdirSync(componentDir, { recursive: true });
  fs.writeFileSync(
    path.join(root, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        jsx: 'react-jsx',
        lib: ['DOM', 'ES2022'],
        module: 'ESNext',
        moduleResolution: 'bundler',
        skipLibCheck: true,
        strict: true,
      },
      include: ['packages/core/src'],
    }),
  );
  fs.writeFileSync(
    path.join(componentDir, 'Test.tsx'),
    [
      "import type { TestSize } from './types';",
      '',
      'export interface TestProps {',
      '  /** Display label. */',
      '  label: string;',
      '  size?: TestSize;',
      '}',
      '',
      'export function Test(props: TestProps) {',
      '  return <button>{props.label}</button>;',
      '}',
    ].join('\n'),
  );
  fs.writeFileSync(
    path.join(componentDir, 'types.ts'),
    "export type TestSize = 'sm' | 'md';\n",
  );

  const options = {
    coreTsconfig: 'tsconfig.json',
    getComponentNames: () => ['Test'],
  } satisfies PluginApiTableOptions;

  return {
    root,
    options,
    sourcePath: path.join(componentDir, 'Test.tsx'),
    typesPath: path.join(componentDir, 'types.ts'),
  };
}

test('collectDependencyFiles follows local TypeScript imports', () => {
  const { options, root, sourcePath, typesPath } = createWorkspace();

  expect(new Set(collectDependencyFiles(root, options))).toEqual(new Set([
    path.join(root, 'tsconfig.json'),
    sourcePath,
    typesPath,
  ]));
});

test('parseAll component signatures include imported type mtimes', () => {
  const { options, root, typesPath } = createWorkspace();
  const first = parseAll(options, root);

  fs.writeFileSync(typesPath, "export type TestSize = 'sm' | 'md' | 'lg';\n");
  fs.utimesSync(typesPath, new Date(), new Date(Date.now() + 5_000));

  const next = parseAll(options, root, first);

  expect(next.Test.sourceSignature).not.toBe(first.Test.sourceSignature);
  expect(next.Test).not.toBe(first.Test);
});

test('virtual module loader invalidates cache when imported types change', async () => {
  const { options, root, typesPath } = createWorkspace();
  const load = createVirtualModuleDataLoader({ options, workspaceRoot: root });

  expect((await load()).fromCache).toBe(false);
  expect((await load()).fromCache).toBe(true);

  fs.writeFileSync(typesPath, "export type TestSize = 'sm' | 'md' | 'lg';\n");
  fs.utimesSync(typesPath, new Date(), new Date(Date.now() + 5_000));

  expect((await load()).fromCache).toBe(false);
});
