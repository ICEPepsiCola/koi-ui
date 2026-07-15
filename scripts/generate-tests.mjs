import fs from 'node:fs';
import path from 'node:path';
import { TEST_CASES } from './test-case-registry.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const TESTS_DIR = path.join(ROOT, 'packages/core/tests/components');



fs.mkdirSync(TESTS_DIR, { recursive: true });

// Group tests into category files to keep files manageable
const chunks = [];
const chunkSize = 15;
for (let i = 0; i < TEST_CASES.length; i += chunkSize) {
  chunks.push(TEST_CASES.slice(i, i + chunkSize));
}

// Clean old generated files
for (const file of fs.readdirSync(TESTS_DIR)) {
  if (file.startsWith('smoke-') && file.endsWith('.test.tsx')) {
    fs.unlinkSync(path.join(TESTS_DIR, file));
  }
}

chunks.forEach((chunk, index) => {
  const imports = [...new Set(chunk.map((c) => c.imports).join('\n').split('\n').filter(Boolean))].join('\n');
  const tests = chunk
    .map(
      (c) => `
test('${c.name} renders without error', () => {
  const { container } = render(
    <KoiProvider>${c.code}</KoiProvider>,
  );
  expect(container.firstChild ?? document.body.firstElementChild).toBeTruthy();
});`,
    )
    .join('\n');

  const content = `/** Auto-generated smoke tests — run \`pnpm tests:generate\` to update */
import { expect, test } from '@rstest/core';
import { render } from '@testing-library/react';
import { KoiProvider } from '../../src/provider';
${imports}

${tests}
`;

  fs.writeFileSync(
    path.join(TESTS_DIR, `smoke-${index + 1}.test.tsx`),
    content,
  );
});

console.log(`Generated ${TEST_CASES.length} component smoke tests in ${chunks.length} files`);
