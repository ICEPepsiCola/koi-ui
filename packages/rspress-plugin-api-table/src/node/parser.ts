/**
 * Build-time parser: react-docgen-typescript over koi-ui component sources.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import type { ApiDataMap, ComponentDoc, PluginApiTableOptions } from '../types';
import {
  collectComponentSourceFiles,
  resolveComponentSource,
} from './resolve-source';

const require = createRequire(import.meta.url);

function resolvePath(workspaceRoot: string, relOrAbs: string): string {
  return path.isAbsolute(relOrAbs)
    ? relOrAbs
    : path.resolve(workspaceRoot, relOrAbs);
}

function createParser(tsconfigAbs: string) {
  const { withCustomConfig } = require('react-docgen-typescript') as typeof import('react-docgen-typescript');
  return withCustomConfig(tsconfigAbs, {
    shouldExtractLiteralValuesFromEnum: true,
    propFilter: (prop) => {
      if (prop.declarations?.length) {
        return prop.declarations.some(
          (declaration) => !declaration.fileName.includes('node_modules'),
        );
      }
      return true;
    },
  });
}

function toComponentDocs(
  docs: ReturnType<ReturnType<typeof createParser>['parse']>,
): ComponentDoc[] {
  return docs.map((doc) => ({
    displayName: doc.displayName,
    description: doc.description ?? '',
    props: Object.fromEntries(
      Object.entries(doc.props ?? {}).map(([propName, prop]) => [
        propName,
        {
          name: prop.name,
          required: Boolean(prop.required),
          description: prop.description ?? '',
          type: { name: prop.type?.name ?? 'unknown' },
          defaultValue: prop.defaultValue?.value
            ? { value: String(prop.defaultValue.value) }
            : undefined,
        },
      ]),
    ),
  }));
}

export function computeFilesMtimeSignature(files: string[]): string | null {
  try {
    const mtimes: Record<string, number> = {};
    for (const abs of files) {
      mtimes[abs] = fs.statSync(abs).mtimeMs;
    }
    const sorted = Object.keys(mtimes).sort();
    const sigObj = sorted.map((k) => [k, mtimes[k]] as const);
    return crypto.createHash('sha1').update(JSON.stringify(sigObj)).digest('hex');
  } catch {
    return null;
  }
}

export function parseAll(
  options: PluginApiTableOptions,
  workspaceRoot: string,
  previous?: ApiDataMap,
): ApiDataMap {
  const tsconfigAbs = resolvePath(workspaceRoot, options.coreTsconfig);
  const componentNames = options.getComponentNames();
  const parser = createParser(tsconfigAbs);
  const result: ApiDataMap = {};

  for (const componentName of componentNames) {
    const sourcePath = resolveComponentSource(workspaceRoot, componentName);
    const prev = previous?.[componentName];

    if (!fs.existsSync(sourcePath)) {
      result[componentName] = {
        componentName,
        sourcePath,
        docs: null,
      };
      continue;
    }

    if (prev && prev.sourcePath === sourcePath) {
      const prevSig = computeFilesMtimeSignature([sourcePath]);
      const cachedSig = computeFilesMtimeSignature([prev.sourcePath]);
      if (prevSig && prevSig === cachedSig) {
        result[componentName] = prev;
        continue;
      }
    }

    try {
      const docs = toComponentDocs(parser.parse(sourcePath));
      result[componentName] = { componentName, sourcePath, docs };
      if (options.debug) {
        console.log(
          `[plugin-api-table] parsed ${componentName}: ${docs.length} export(s)`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[plugin-api-table] parse failed for ${componentName}: ${message}`);
      result[componentName] = { componentName, sourcePath, docs: null };
    }
  }

  return result;
}

export function collectDependencyFiles(
  workspaceRoot: string,
  options: PluginApiTableOptions,
): string[] {
  const componentNames = options.getComponentNames();
  const files = new Set<string>([
    resolvePath(workspaceRoot, options.coreTsconfig),
    ...collectComponentSourceFiles(workspaceRoot, componentNames),
    ...(options.watchFiles ?? []).map((file) =>
      resolvePath(workspaceRoot, file),
    ),
  ]);
  return [...files].sort();
}
