/**
 * Docs compiler — regenerates committed `docs/en` / `docs/zh` (+ theme locales).
 *
 * Stock data lives elsewhere:
 * - `scripts/docs-catalog.mjs` — component categories / order
 * - `scripts/docs-demos.mjs` — demo snippets
 * - `i18n/` — copy
 * - `packages/core/src/index.tsx` — maintained manually (not generated here)
 *
 * Run via `pnpm docs:generate` after i18n / demo / API changes.
 * Not wired into `pnpm doc` / `doc:build`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { CATEGORIES, allComponentNames } from './docs-catalog.mjs';
import { DEMOS } from './docs-demos.mjs';
import { hasCjk, localizeDemoCode, toEnglishDemoText } from './demo-locale.mjs';
import { LANGS, loadI18nTree, t, writeFile, ensureDir } from './lib/i18n.mjs';

const require = createRequire(import.meta.url);
const { withCustomConfig } = require('react-docgen-typescript');

const ROOT = path.resolve(import.meta.dirname, '..');
const I18N_DIR = path.join(ROOT, 'i18n');
const DOCS_DIR = path.join(ROOT, 'docs');
const CORE_TSCONFIG = path.join(ROOT, 'packages/core/tsconfig.json');
const API_DISK_CACHE_DIR = path.join(ROOT, 'node_modules/.cache/koi-docs-api');
const forceApiRefresh = process.argv.includes('--force');
const DEFAULT_LANG = 'en';
const PRIMITIVE_COMPONENTS = new Set(['Box', 'Stack']);
const GUIDE_SLUGS = ['getting-started', 'theming', 'responsive'];

const flat = loadI18nTree(I18N_DIR);

function resolveSourcePath(name) {
  if (PRIMITIVE_COMPONENTS.has(name)) {
    return `./packages/core/src/primitives/${name}.tsx`;
  }
  return `./packages/core/src/components/${name}/${name}.tsx`;
}

let parser;
function getParser() {
  if (!parser) {
    parser = withCustomConfig(CORE_TSCONFIG, {
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
  return parser;
}

function escapeCell(value) {
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ');
}

function softBreakType(typeName) {
  return escapeCell(String(typeName ?? '').replace(/([|&,])/g, '$1\u200B'));
}

function hashFile(filePath) {
  return createHash('sha1').update(fs.readFileSync(filePath)).digest('hex');
}

/** @type {Map<string, object[] | null>} */
const apiMemoryCache = new Map();
let apiCacheHits = 0;
let apiCacheMisses = 0;

function parseComponentDocs(componentName) {
  if (apiMemoryCache.has(componentName)) return apiMemoryCache.get(componentName);

  const sourcePath = path.join(
    ROOT,
    resolveSourcePath(componentName).replace(/^\.\//, ''),
  );
  if (!fs.existsSync(sourcePath)) {
    apiMemoryCache.set(componentName, null);
    return null;
  }

  const sourceHash = hashFile(sourcePath);
  const diskCachePath = path.join(
    API_DISK_CACHE_DIR,
    `${componentName}.${sourceHash}.json`,
  );

  if (!forceApiRefresh && fs.existsSync(diskCachePath)) {
    try {
      const cached = JSON.parse(fs.readFileSync(diskCachePath, 'utf8'));
      apiMemoryCache.set(componentName, cached);
      apiCacheHits += 1;
      return cached;
    } catch {
      // fall through
    }
  }

  try {
    const docs = getParser().parse(sourcePath);
    apiMemoryCache.set(componentName, docs);
    apiCacheMisses += 1;
    ensureDir(API_DISK_CACHE_DIR);
    for (const file of fs.readdirSync(API_DISK_CACHE_DIR)) {
      if (
        file.startsWith(`${componentName}.`) &&
        file.endsWith('.json') &&
        file !== path.basename(diskCachePath)
      ) {
        fs.rmSync(path.join(API_DISK_CACHE_DIR, file), { force: true });
      }
    }
    fs.writeFileSync(diskCachePath, `${JSON.stringify(docs)}\n`);
    return docs;
  } catch {
    apiMemoryCache.set(componentName, null);
    apiCacheMisses += 1;
    return null;
  }
}

function generateApiMarkdown(componentName, lang) {
  const docs = parseComponentDocs(componentName);
  if (!docs?.length) return `${t(flat, 'common.api.empty', lang)}\n`;

  return docs
    .map((doc) => {
      const props = doc.props ?? {};
      const rows = Object.keys(props)
        .sort((a, b) => {
          const aRequired = props[a]?.required ? 0 : 1;
          const bRequired = props[b]?.required ? 0 : 1;
          if (aRequired !== bRequired) return aRequired - bRequired;
          return a.localeCompare(b);
        })
        .map((propName) => {
          const { defaultValue, description, name, required, type } =
            props[propName];
          const requiredLabel = t(flat, 'common.api.required', lang);
          const typeText = `\`${softBreakType(type.name)}\`${required ? ` **(${requiredLabel})**` : ''}`;
          const rawDefault = defaultValue?.value ?? '-';
          const localizedDefault =
            lang === 'en' ? toEnglishDemoText(rawDefault) : rawDefault;
          const defaultText = `\`${localizedDefault}\``;
          const i18nDesc = t(flat, `common.prop.${name}`, lang, '');
          const rawDesc = description ?? '';
          const desc =
            i18nDesc ||
            (lang === 'en' && hasCjk(rawDesc)
              ? toEnglishDemoText(rawDesc)
              : rawDesc) ||
            '-';
          const safeDesc =
            lang === 'en' && hasCjk(desc) && !i18nDesc ? '-' : desc;
          return `| ${escapeCell(name)} | ${escapeCell(safeDesc)} | ${typeText} | ${defaultText} |`;
        });

      if (!rows.length) return '';

      const header = `| ${t(flat, 'common.api.property', lang)} | ${t(flat, 'common.api.description', lang)} | ${t(flat, 'common.api.type', lang)} | ${t(flat, 'common.api.defaultValue', lang)} |
| :---: | :---: | :---: | :---: |`;

      const title = doc.displayName ? `### ${doc.displayName}\n\n` : '';
      let intro = '';
      if (doc.description) {
        const localizedIntro =
          lang === 'en' ? toEnglishDemoText(doc.description) : doc.description;
        if (!(lang === 'en' && hasCjk(localizedIntro))) {
          intro = `${localizedIntro}\n\n`;
        }
      }
      return `${title}${intro}${header}\n${rows.join('\n')}`;
    })
    .filter(Boolean)
    .join('\n\n');
}

function componentPageId(name) {
  return `components.${name.toLowerCase()}`;
}

function localePath(lang, pathname) {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (lang === DEFAULT_LANG) return normalized;
  return `/${lang}${normalized}`;
}

function yamlScalar(value) {
  return JSON.stringify(String(value ?? ''));
}

function sidebarLabel(name, lang) {
  const zhTitle = t(flat, `pages.${componentPageId(name)}.title`, 'zh', name);
  return lang === 'en' ? name : `${name} ${zhTitle}`;
}

function buildComponentSidebar(lang) {
  return Object.entries(CATEGORIES).map(([catKey, names]) => ({
    text: t(flat, `common.category.${catKey}`, lang),
    items: names.map((name) => ({
      text: sidebarLabel(name, lang),
      link: localePath(lang, `/components/${name.toLowerCase()}`),
    })),
  }));
}

function resolveDemos(name) {
  const demos = DEMOS[name];
  if (!demos?.length) {
    throw new Error(`Missing demos for component: ${name}`);
  }
  return demos;
}

function renderDemoSections(pageId, demos, lang) {
  return demos
    .map(({ key, code }) => {
      const title = t(
        flat,
        `pages.${pageId}.demos.${key}`,
        lang,
        t(flat, `common.demo.${key}`, lang, key),
      );
      return `## ${title}\n\n\`\`\`tsx preview\n${localizeDemoCode(code, lang)}\n\`\`\``;
    })
    .join('\n\n');
}

function clearGeneratedLocale(lang) {
  const localeRoot = path.join(DOCS_DIR, lang);
  for (const rel of ['components', 'guide', 'index.md', '_nav.json', '_meta.json']) {
    const target = path.join(localeRoot, rel);
    if (!fs.existsSync(target)) continue;
    fs.rmSync(target, { recursive: true, force: true });
  }
}

function generateLocaleDocs(lang) {
  clearGeneratedLocale(lang);
  const localeRoot = path.join(DOCS_DIR, lang);
  ensureDir(localeRoot);

  writeFile(
    path.join(localeRoot, 'index.md'),
    `---
pageType: home

hero:
  name: ${yamlScalar(t(flat, 'pages.home.hero.name', lang))}
  text: ${yamlScalar(t(flat, 'pages.home.hero.text', lang))}
  tagline: ${yamlScalar(t(flat, 'pages.home.hero.tagline', lang))}
  actions:
    - theme: brand
      text: ${yamlScalar(t(flat, 'pages.home.hero.actionStart', lang))}
      link: ${localePath(lang, '/guide/getting-started')}
    - theme: alt
      text: ${yamlScalar(t(flat, 'pages.home.hero.actionComponents', lang))}
      link: ${localePath(lang, '/components/button')}

features:
  - title: ${yamlScalar(t(flat, 'pages.home.features.adaptive.title', lang))}
    details: ${yamlScalar(t(flat, 'pages.home.features.adaptive.details', lang))}
  - title: ${yamlScalar(t(flat, 'pages.home.features.tokens.title', lang))}
    details: ${yamlScalar(t(flat, 'pages.home.features.tokens.details', lang))}
  - title: ${yamlScalar(t(flat, 'pages.home.features.react.title', lang))}
    details: ${yamlScalar(t(flat, 'pages.home.features.react.details', lang))}
  - title: ${yamlScalar(t(flat, 'pages.home.features.docs.title', lang))}
    details: ${yamlScalar(t(flat, 'pages.home.features.docs.details', lang))}
---
`,
  );

  writeFile(
    path.join(localeRoot, '_nav.json'),
    `${JSON.stringify(
      [
        {
          text: 'nav.guide',
          link: localePath(lang, '/guide/getting-started'),
          activeMatch: localePath(lang, '/guide/'),
        },
        {
          text: 'nav.components',
          link: localePath(lang, '/components/button'),
          activeMatch: localePath(lang, '/components/'),
        },
      ],
      null,
      2,
    )}\n`,
  );

  writeFile(
    path.join(localeRoot, '_meta.json'),
    `${JSON.stringify(
      [
        { type: 'file', name: 'index', label: 'home' },
        {
          type: 'dir',
          name: 'guide',
          label: 'nav.guide',
          collapsible: true,
          collapsed: false,
        },
        {
          type: 'dir',
          name: 'components',
          label: 'nav.components',
          collapsible: true,
          collapsed: false,
        },
      ],
      null,
      2,
    )}\n`,
  );

  const guideDir = path.join(localeRoot, 'guide');
  ensureDir(guideDir);
  writeFile(
    path.join(guideDir, '_meta.json'),
    `${JSON.stringify(
      [
        { type: 'file', name: 'getting-started', label: 'sidebar.gettingStarted' },
        { type: 'file', name: 'theming', label: 'sidebar.theming' },
        { type: 'file', name: 'responsive', label: 'sidebar.responsive' },
      ],
      null,
      2,
    )}\n`,
  );

  for (const slug of GUIDE_SLUGS) {
    const pageId = `guide.${slug}`;
    const title = t(flat, `pages.${pageId}.title`, lang);
    const body = t(flat, `pages.${pageId}.body`, lang, '');
    writeFile(path.join(guideDir, `${slug}.mdx`), `# ${title}\n\n${body.trim()}\n`);
  }

  const componentsDir = path.join(localeRoot, 'components');
  ensureDir(componentsDir);
  const meta = {};

  for (const names of Object.values(CATEGORIES)) {
    for (const name of names) {
      const slug = name.toLowerCase();
      const pageId = componentPageId(name);
      meta[slug] = name;
      const zhTitle = t(flat, `pages.${pageId}.title`, 'zh', name);
      const heading = lang === 'en' ? `# ${name}` : `# ${name} ${zhTitle}`;
      const mdx = `${heading}

${renderDemoSections(pageId, resolveDemos(name), lang)}

## ${t(flat, 'common.api.heading', lang)}

${generateApiMarkdown(name, lang)}
`;
      writeFile(path.join(componentsDir, `${slug}.mdx`), mdx);
    }
  }

  writeFile(
    path.join(componentsDir, '_meta.json'),
    `${JSON.stringify(meta, null, 2)}\n`,
  );
}

const rspressI18n = {
  'nav.guide': flat['common.nav.guide'],
  'nav.components': flat['common.nav.components'],
  'sidebar.gettingStarted': flat['common.sidebar.gettingStarted'],
  'sidebar.theming': flat['common.sidebar.theming'],
  'sidebar.responsive': flat['common.sidebar.responsive'],
  home: {
    en: t(flat, 'pages.home.hero.name', 'en'),
    zh: t(flat, 'pages.home.hero.name', 'zh'),
  },
};

writeFile(path.join(ROOT, 'i18n.json'), `${JSON.stringify(rspressI18n, null, 2)}\n`);

const themeLocales = LANGS.map((lang) => ({
  lang,
  label: lang === 'en' ? 'English' : '简体中文',
  title: 'Koi UI',
  description: t(flat, 'pages.home.hero.text', lang),
  nav: [
    {
      text: t(flat, 'common.nav.guide', lang),
      link: localePath(lang, '/guide/getting-started'),
      activeMatch: localePath(lang, '/guide/'),
    },
    {
      text: t(flat, 'common.nav.components', lang),
      link: localePath(lang, '/components/button'),
      activeMatch: localePath(lang, '/components/'),
    },
  ],
  sidebar: {
    [localePath(lang, '/guide/')]: [
      {
        text: t(flat, 'common.sidebar.gettingStarted', lang),
        link: localePath(lang, '/guide/getting-started'),
      },
      {
        text: t(flat, 'common.sidebar.theming', lang),
        link: localePath(lang, '/guide/theming'),
      },
      {
        text: t(flat, 'common.sidebar.responsive', lang),
        link: localePath(lang, '/guide/responsive'),
      },
    ],
    [localePath(lang, '/components/')]: buildComponentSidebar(lang),
  },
}));

writeFile(
  path.join(DOCS_DIR, '.generated/theme-locales.json'),
  `${JSON.stringify(themeLocales, null, 2)}\n`,
);

for (const lang of LANGS) {
  generateLocaleDocs(lang);
}

const componentCount = allComponentNames().length;
console.log(
  `Generated docs for [${LANGS.join(', ')}]: ${componentCount} components × ${LANGS.length} locales` +
    ` (api cache hit ${apiCacheHits} / miss ${apiCacheMisses}` +
    (forceApiRefresh ? ', --force' : '') +
    ')',
);
