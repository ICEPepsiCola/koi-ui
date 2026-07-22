/**
 * Extract component prop tables into docs/api-data.json for <ApiDocs />.
 * Runs automatically before `pnpm doc` / `pnpm doc:build`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { allComponentNames } from '../docs/catalog.ts';

const require = createRequire(import.meta.url);
const { withCustomConfig } = require('react-docgen-typescript');

const ROOT = path.resolve(import.meta.dirname, '..');
const CORE_TSCONFIG = path.join(ROOT, 'packages/core/tsconfig.json');
const OUT = path.join(ROOT, 'docs/api-data.json');
const PRIMITIVE_COMPONENTS = new Set(['Box', 'Stack']);

const parser = withCustomConfig(CORE_TSCONFIG, {
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

function resolveSourcePath(name) {
  if (PRIMITIVE_COMPONENTS.has(name)) {
    return path.join(ROOT, `packages/core/src/primitives/${name}.tsx`);
  }
  return path.join(ROOT, `packages/core/src/components/${name}/${name}.tsx`);
}

/** @type {Record<string, unknown>} */
const data = {};

for (const name of allComponentNames()) {
  const sourcePath = resolveSourcePath(name);
  if (!fs.existsSync(sourcePath)) {
    data[name] = null;
    continue;
  }
  try {
    const docs = parser.parse(sourcePath).map((doc) => ({
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
    data[name] = docs;
  } catch (error) {
    console.warn(`API extract failed for ${name}:`, error.message);
    data[name] = null;
  }
}

fs.writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Wrote API data for ${Object.keys(data).length} components → docs/api-data.json`);
