import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  source: {
    entry: {
      index: ['./src/**/*.ts', './src/**/*.tsx', './src/**/*.css'],
    },
    tsconfigPath: './tsconfig.build.json',
  },
  lib: [
    {
      bundle: false,
      dts: true,
      format: 'esm',
    },
  ],
  output: {
    target: 'web',
    externals: ['react', 'react-dom', '@koi-ui/hooks', '@koi-ui/icons'],
  },
  plugins: [pluginReact()],
});
