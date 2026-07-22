import { pluginVirtualModule } from 'rsbuild-plugin-virtual-module';
import type { ApiDataMap, PluginApiTableOptions } from '../types';
import {
  collectDependencyFiles,
  computeFilesMtimeSignature,
  parseAll,
} from './parser';

export const VIRTUAL_MODULE_ID = 'virtual-koi-api';

export interface VirtualModulePayload {
  data: ApiDataMap;
  code: string;
  dependencies: string[];
  signature: string;
  fromCache: boolean;
}

export function createVirtualModuleDataLoader({
  options,
  workspaceRoot,
}: {
  options: PluginApiTableOptions;
  workspaceRoot: string;
}): () => Promise<VirtualModulePayload> {
  let cachedPayload: Omit<VirtualModulePayload, 'fromCache'> | null = null;

  return async () => {
    if (cachedPayload) {
      const nextSignature =
        computeFilesMtimeSignature(cachedPayload.dependencies) ?? '';
      if (nextSignature && nextSignature === cachedPayload.signature) {
        return { ...cachedPayload, fromCache: true };
      }
    }

    const data = parseAll(options, workspaceRoot, cachedPayload?.data);
    const dependencies = collectDependencyFiles(workspaceRoot, options);
    const signature = computeFilesMtimeSignature(dependencies) ?? '';
    const fromCache = false;
    cachedPayload = {
      data,
      dependencies,
      signature,
      code: `export const apiData = ${JSON.stringify(data)};`,
    };

    if (options.debug && !fromCache) {
      console.log(
        `[plugin-api-table] virtual module: ${Object.keys(data).length} component(s)`,
      );
    }

    return { ...cachedPayload, fromCache };
  };
}

export function createApiTableVirtualModulePlugin(
  options: PluginApiTableOptions,
  workspaceRoot: string,
): ReturnType<typeof pluginVirtualModule> {
  const loadPayload = createVirtualModuleDataLoader({ options, workspaceRoot });

  return pluginVirtualModule({
    virtualModules: {
      [VIRTUAL_MODULE_ID]: async ({ addDependency }) => {
        const payload = await loadPayload();

        for (const file of payload.dependencies) {
          addDependency(file);
        }

        return payload.code;
      },
    },
  });
}
