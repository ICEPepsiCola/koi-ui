/**
 * Generate LLM-oriented docs for the docs site + npm package.
 *
 * Outputs (identical twins, gitignored — produced on CI):
 *   docs/public/{llms.txt,llms-full.txt,registry.json}
 *   packages/core/{llms.txt,llms-full.txt,registry.json}
 *
 * Invoked by `doc:build` and release prepare. Local: `pnpm llm:generate` (optional).
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(import.meta.dirname, '..');

const DOCS_ORIGIN = (
  process.env.KOI_DOCS_ORIGIN || 'https://icepepsicola.github.io/koi-ui'
).replace(/\/$/, '');
const DOCS_BASE = (process.env.DOCS_BASE || '/').replace(/\/?$/, '/');

const OUT_DIRS = [
  path.join(ROOT, 'docs/public'),
  path.join(ROOT, 'packages/core'),
];

const PRIMITIVE_COMPONENTS = new Set(['Box', 'Stack']);

function loadCatalog() {
  const src = fs.readFileSync(path.join(ROOT, 'docs/catalog.ts'), 'utf8');
  const categories = {};
  const catMatch = src.match(
    /export const CATEGORIES = \{([\s\S]*?)\n\} as const;/,
  );
  if (!catMatch) throw new Error('Failed to parse CATEGORIES from catalog.ts');

  for (const block of catMatch[1].matchAll(
    /(\w+):\s*\[([\s\S]*?)\],/g,
  )) {
    const key = block[1];
    const names = [...block[2].matchAll(/'([^']+)'/g)].map((m) => m[1]);
    categories[key] = names;
  }

  const zh = {};
  const zhMatch = src.match(
    /export const COMPONENT_ZH: Record<string, string> = \{([\s\S]*?)\n\};/,
  );
  if (zhMatch) {
    for (const m of zhMatch[1].matchAll(/(\w+):\s*'([^']*)'/g)) {
      zh[m[1]] = m[2];
    }
  }

  const categoryLabels = {};
  const labelMatch = src.match(
    /export const CATEGORY_LABELS = \{([\s\S]*?)\n\} as const;/,
  );
  if (labelMatch) {
    for (const m of labelMatch[1].matchAll(
      /(\w+):\s*\{\s*en:\s*'([^']*)',\s*zh:\s*'([^']*)'\s*\}/g,
    )) {
      categoryLabels[m[1]] = { en: m[2], zh: m[3] };
    }
  }

  return { categories, zh, categoryLabels };
}

function resolveComponentSource(name) {
  if (PRIMITIVE_COMPONENTS.has(name)) {
    return path.join(ROOT, `packages/core/src/primitives/${name}.tsx`);
  }
  return path.join(
    ROOT,
    `packages/core/src/components/${name}/${name}.tsx`,
  );
}

function readMdx(name) {
  const file = path.join(
    ROOT,
    `docs/en/components/${name.toLowerCase()}.mdx`,
  );
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, 'utf8');
}

function extractDescription(mdx) {
  const lines = mdx.split('\n');
  let i = 0;
  while (i < lines.length && !lines[i].startsWith('# ')) i += 1;
  i += 1;
  while (i < lines.length && lines[i].trim() === '') i += 1;
  const parts = [];
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('#') || line.startsWith('```') || line.startsWith('<')) {
      break;
    }
    if (line.trim() !== '') parts.push(line.trim());
    i += 1;
  }
  return parts
    .join(' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractExamples(mdx, limit = 2) {
  const examples = [];
  const re = /```tsx[^\n]*\n([\s\S]*?)```/g;
  let match;
  while ((match = re.exec(mdx)) && examples.length < limit) {
    const code = match[1].trim();
    if (code) examples.push(code);
  }
  return examples;
}

function formatPropType(prop) {
  const type = prop.type;
  if (!type) return 'unknown';
  if (type.name === 'enum') {
    if (type.raw && type.raw !== 'enum') return type.raw;
    if (Array.isArray(type.value) && type.value.length > 0) {
      return type.value
        .map((entry) => entry.value)
        .filter(Boolean)
        .join(' | ');
    }
  }
  if (type.raw && (type.name === 'unknown' || !type.name)) return type.raw;
  return type.name ?? type.raw ?? 'unknown';
}

function createPropParser() {
  const tsconfig = path.join(ROOT, 'packages/core/tsconfig.json');
  const { withCustomConfig } = require('react-docgen-typescript');
  return withCustomConfig(tsconfig, {
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    propFilter: (prop) => {
      if (prop.declarations?.length) {
        return prop.declarations.some(
          (d) => !d.fileName.includes('node_modules'),
        );
      }
      return true;
    },
  });
}

function extractProps(parser, sourcePath) {
  if (!fs.existsSync(sourcePath)) return [];
  try {
    const docs = parser.parse(sourcePath);
    const withProps = docs.filter((d) => Object.keys(d.props ?? {}).length > 0);
    const chosen = withProps[0] ?? docs[0];
    if (!chosen?.props) return [];
    return Object.values(chosen.props).map((prop) => ({
      name: prop.name,
      required: Boolean(prop.required),
      type: formatPropType(prop),
      defaultValue: prop.defaultValue?.value
        ? String(prop.defaultValue.value)
        : undefined,
      description: (prop.description ?? '').trim(),
    }));
  } catch {
    return [];
  }
}

function docsUrl(lang, name) {
  const base = `${DOCS_ORIGIN}${DOCS_BASE}`.replace(/\/+$/, '');
  return `${base}/${lang}/components/${name.toLowerCase()}`;
}

function buildRegistry(catalog, parser) {
  const items = [];
  for (const [category, names] of Object.entries(catalog.categories)) {
    for (const name of names) {
      const mdx = readMdx(name);
      const sourcePath = resolveComponentSource(name);
      const description =
        extractDescription(mdx ?? '') ||
        `${name} component from @koi-ui/core`;
      const examples = mdx ? extractExamples(mdx) : [];
      const props = extractProps(parser, sourcePath);
      items.push({
        name,
        zhName: catalog.zh[name] ?? name,
        category,
        categoryLabel: catalog.categoryLabels[category] ?? {
          en: category,
          zh: category,
        },
        import: `import { ${name} } from '@koi-ui/core';`,
        description,
        docs: {
          en: docsUrl('en', name),
          zh: docsUrl('zh', name),
        },
        props,
        examples,
      });
    }
  }
  return items;
}

function renderLlmsTxt(catalog, registry) {
  const lines = [
    '# Koi UI',
    '',
    '> Adaptive React component library for desktop and mobile (`@koi-ui/core`).',
    '',
    `> Docs: ${DOCS_ORIGIN}${DOCS_BASE}`,
    '> npm: `@koi-ui/core` (also ships `llms.txt`, `llms-full.txt`, `registry.json`)',
    '',
    '## How AI assistants should use this',
    '',
    '- Prefer `@koi-ui/core` imports. Wrap the app in `KoiProvider`.',
    '- Import styles: `@import "@koi-ui/core/styles.css";`',
    '- Semantic error color is `error` (not `danger` / `destructive`).',
    '- Button / Tag / Alert / Badge use `color` × `variant`.',
    '- Many overlays adapt on mobile (`Modal` → sheet). Use `responsive={false}` to lock desktop.',
    '- Read `llms-full.txt` for per-component API + examples, or `registry.json` for machine-readable data.',
    '',
    '## Install',
    '',
    '```bash',
    'pnpm add @koi-ui/core',
    '```',
    '',
    '## Companion files',
    '',
    `- Full docs for LLMs: ${DOCS_ORIGIN}${DOCS_BASE}llms-full.txt`,
    `- Registry JSON: ${DOCS_ORIGIN}${DOCS_BASE}registry.json`,
    '- In the npm package: `node_modules/@koi-ui/core/llms-full.txt` and `registry.json`',
    '',
    '## Components',
    '',
  ];

  for (const [category, names] of Object.entries(catalog.categories)) {
    const label = catalog.categoryLabels[category]?.en ?? category;
    lines.push(`### ${label}`);
    lines.push('');
    for (const name of names) {
      const item = registry.find((r) => r.name === name);
      const zh = catalog.zh[name] ? ` (${catalog.zh[name]})` : '';
      const summary = item?.description
        ? item.description.replace(/\s+/g, ' ').slice(0, 120)
        : '';
      lines.push(
        `- [${name}](${docsUrl('en', name)})${zh}${summary ? `: ${summary}` : ''}`,
      );
    }
    lines.push('');
  }

  lines.push('## Optional packages');
  lines.push('');
  lines.push('- `@koi-ui/hooks` — breakpoint helpers');
  lines.push('- `@koi-ui/tokens` — CSS theme tokens');
  lines.push('- `@koi-ui/icons` — icon set');
  lines.push('');

  return `${lines.join('\n').trim()}\n`;
}

function renderLlmsFull(registry) {
  const parts = [
    '# Koi UI — full LLM reference',
    '',
    'Generated from component docs + TypeScript props. Prefer this file when implementing UI with `@koi-ui/core`.',
    '',
    '## Global conventions',
    '',
    '1. `import { X } from \'@koi-ui/core\'`',
    '2. Root: `<KoiProvider>…</KoiProvider>`',
    '3. Styles: `@import "@koi-ui/core/styles.css";`',
    '4. Use semantic `color="error"` (never `danger` / `destructive`)',
    '5. Surface components: `color` × `variant` (`solid` | `soft` | `outline` | `dash` | `ghost` | `link` where applicable)',
    '6. Choosing similar components:',
    '   - `InputNumber` = editable number field; `Stepper` = tap/hold quantity control',
    '   - `Spin` = inline loading; `Loading` = fullscreen/blocking overlay',
    '   - `Steps` = wizard progress; `Stepper` = numeric ±',
    '',
  ];

  for (const item of registry) {
    parts.push(`## ${item.name}`);
    if (item.zhName && item.zhName !== item.name) {
      parts.push('');
      parts.push(`Chinese name: ${item.zhName}`);
    }
    parts.push('');
    parts.push(item.description);
    parts.push('');
    parts.push(`Category: ${item.categoryLabel.en} / ${item.categoryLabel.zh}`);
    parts.push('');
    parts.push('```ts');
    parts.push(item.import);
    parts.push('```');
    parts.push('');
    parts.push(`Docs: ${item.docs.en} | ${item.docs.zh}`);
    parts.push('');

    if (item.props.length > 0) {
      parts.push('### Props');
      parts.push('');
      for (const prop of item.props) {
        const req = prop.required ? 'required' : 'optional';
        const def =
          prop.defaultValue !== undefined
            ? `, default: \`${prop.defaultValue}\``
            : '';
        const desc = prop.description ? ` — ${prop.description}` : '';
        parts.push(
          `- \`${prop.name}\` (${req}): \`${prop.type}\`${def}${desc}`,
        );
      }
      parts.push('');
    }

    if (item.examples.length > 0) {
      parts.push('### Examples');
      parts.push('');
      for (const example of item.examples) {
        parts.push('```tsx');
        parts.push(example);
        parts.push('```');
        parts.push('');
      }
    }
  }

  return `${parts.join('\n').trim()}\n`;
}

function writeOutputs(llmsTxt, llmsFull, registry) {
  const registryJson = `${JSON.stringify(
    {
      name: '@koi-ui/core',
      version: readCoreVersion(),
      docsOrigin: DOCS_ORIGIN,
      docsBase: DOCS_BASE,
      components: registry,
    },
    null,
    2,
  )}\n`;

  for (const dir of OUT_DIRS) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'llms.txt'), llmsTxt);
    fs.writeFileSync(path.join(dir, 'llms-full.txt'), llmsFull);
    fs.writeFileSync(path.join(dir, 'registry.json'), registryJson);
  }
}

function readCoreVersion() {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'packages/core/package.json'), 'utf8'),
  );
  return pkg.version;
}

const catalog = loadCatalog();
const parser = createPropParser();
console.log('Extracting component registry…');
const registry = buildRegistry(catalog, parser);
const llmsTxt = renderLlmsTxt(catalog, registry);
const llmsFull = renderLlmsFull(registry);
writeOutputs(llmsTxt, llmsFull, registry);

console.log(
  `Generated LLM docs for ${registry.length} components → docs/public + packages/core`,
);
