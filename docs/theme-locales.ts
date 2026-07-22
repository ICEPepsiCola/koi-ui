import {
  CATEGORIES,
  CATEGORY_LABELS,
  COMPONENT_ZH,
} from './catalog';

type Lang = 'en' | 'zh';

function localePath(lang: Lang, pathname: string) {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return lang === 'en' ? normalized : `/${lang}${normalized}`;
}

function sidebarLabel(name: string, lang: Lang) {
  if (lang === 'en') return name;
  const zh = COMPONENT_ZH[name];
  return zh ? `${name} ${zh}` : name;
}

function buildComponentSidebar(lang: Lang) {
  return (
    Object.entries(CATEGORIES) as Array<
      [keyof typeof CATEGORIES, readonly string[]]
    >
  ).map(([catKey, names]) => ({
    text: CATEGORY_LABELS[catKey][lang],
    items: names.map((name) => ({
      text: sidebarLabel(name, lang),
      link: localePath(lang, `/components/${name.toLowerCase()}`),
    })),
  }));
}

function buildLocale(lang: Lang) {
  const isZh = lang === 'zh';
  return {
    lang,
    label: isZh ? '简体中文' : 'English',
    title: 'Koi UI',
    description: isZh
      ? '可感知主题的自适应 React 组件库'
      : 'Adaptive React components with themes you can feel',
    nav: [
      {
        text: isZh ? '指南' : 'Guide',
        link: localePath(lang, '/guide/getting-started'),
        activeMatch: localePath(lang, '/guide/'),
      },
      {
        text: isZh ? '组件' : 'Components',
        link: localePath(lang, '/components/button'),
        activeMatch: localePath(lang, '/components/'),
      },
    ],
    sidebar: {
      [localePath(lang, '/guide/')]: [
        {
          text: isZh ? '快速开始' : 'Getting started',
          link: localePath(lang, '/guide/getting-started'),
        },
        {
          text: isZh ? '主题定制' : 'Theming',
          link: localePath(lang, '/guide/theming'),
        },
        {
          text: isZh ? '响应式原理' : 'Responsive',
          link: localePath(lang, '/guide/responsive'),
        },
        {
          text: isZh ? '场景示例' : 'Recipes',
          link: localePath(lang, '/guide/recipes'),
        },
      ],
      [localePath(lang, '/components/')]: buildComponentSidebar(lang),
    },
  };
}

/** Hand-maintained Rspress locale config (nav + sidebar). */
export const themeLocales = [buildLocale('en'), buildLocale('zh')];
