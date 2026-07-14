import { withRslibConfig } from '@rstest/adapter-rslib';
import { defineConfig } from '@rstest/core';

export default defineConfig({
  extends: withRslibConfig(),
  setupFiles: ['./rstest.setup.ts', './tests/setup.ts'],
  testEnvironment: 'happy-dom',
  coverage: {
    provider: 'istanbul',
    include: ['src/**/*.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.d.ts',
      '**/tests/**',
      '**/index.ts',
    ],
    reporters: ['text', 'html', 'json-summary'],
    reportsDirectory: './coverage',
    reportOnFailure: true,
  },
});
