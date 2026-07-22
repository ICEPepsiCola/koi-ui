/**
 * @koi-ui/rspress-plugin-api-table
 *
 * Rspress plugin: virtual module HMR + global MDX component `<API />`.
 * Register createApiTableVirtualModulePlugin in rspress `builderConfig.plugins`.
 */

import type { RspressPlugin } from '@rspress/core';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PluginApiTableOptions } from './types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUNTIME_API = path.resolve(__dirname, 'runtime/API.tsx');

export {
  createApiTableVirtualModulePlugin,
  VIRTUAL_MODULE_ID,
} from './node/virtual-module';
export { parseAll, collectDependencyFiles } from './node/parser';
export type {
  PluginApiTableOptions,
  ApiDataMap,
  ParsedComponent,
  ComponentDoc,
  PropDoc,
} from './types';

export function pluginApiTable(_options: PluginApiTableOptions): RspressPlugin {
  return {
    name: 'plugin-api-table',
    markdown: {
      globalComponents: [RUNTIME_API],
    },
  };
}
