import { useMemo, useState, type ComponentType, type SVGProps } from 'react';
import * as OutlineIcons from '@koi-ui/icons';
import * as Solid24Icons from '@koi-ui/icons/24/solid';
import * as Solid20Icons from '@koi-ui/icons/20/solid';
import * as Solid16Icons from '@koi-ui/icons/16/solid';
import { iconNameZh } from './icon-name-zh';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;
type IconVariantKey = 'outline' | 'solid' | 'mini' | 'micro';
type Locale = 'en' | 'zh';
type IconModule = Record<string, unknown>;

type GalleryEntry = {
  exportName: string;
  slug: string;
  label: string;
  Component: IconComponent;
};

/** Icons are forwardRef objects; exclude namespace re-exports (Heroicons*). */
function isIconExport(name: string, value: unknown): value is IconComponent {
  return name.endsWith('Icon') && value != null && typeof value !== 'string';
}

const VARIANTS: Record<
  IconVariantKey,
  {
    label: Record<Locale, string>;
    meta: Record<Locale, string>;
    importPath: string;
    icons: IconModule;
  }
> = {
  outline: {
    label: { en: 'Outline', zh: '线框' },
    meta: { en: '24x24, 1.5px stroke', zh: '24x24，1.5px 描边' },
    importPath: '@koi-ui/icons',
    icons: OutlineIcons as IconModule,
  },
  solid: {
    label: { en: 'Solid', zh: '实心' },
    meta: { en: '24x24, solid', zh: '24x24，实心' },
    importPath: '@koi-ui/icons/24/solid',
    icons: Solid24Icons as IconModule,
  },
  mini: {
    label: { en: 'Mini', zh: '迷你' },
    meta: { en: '20x20, solid', zh: '20x20，实心' },
    importPath: '@koi-ui/icons/20/solid',
    icons: Solid20Icons as IconModule,
  },
  micro: {
    label: { en: 'Micro', zh: '微型' },
    meta: { en: '16x16, solid', zh: '16x16，实心' },
    importPath: '@koi-ui/icons/16/solid',
    icons: Solid16Icons as IconModule,
  },
};

function toKebabCase(name: string) {
  return name
    .replace(/Icon$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function copyImportText(importPath: string, iconName: string) {
  const text = `import { ${iconName} } from '${importPath}';`;
  return navigator.clipboard?.writeText(text);
}

export function IconGallery({ locale = 'en' }: { locale?: Locale }) {
  const [variant, setVariant] = useState<IconVariantKey>('outline');
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const current = VARIANTS[variant];
  const entries = useMemo((): GalleryEntry[] => {
    const normalized = query.trim().toLowerCase();
    return Object.entries(current.icons)
      .filter((entry): entry is [string, IconComponent] => {
        const [name, value] = entry;
        return isIconExport(name, value);
      })
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, Component]): GalleryEntry => {
        const slug = toKebabCase(name);
        return {
          exportName: name,
          slug,
          label: locale === 'zh' ? iconNameZh(slug) : slug,
          Component,
        };
      })
      .filter((item) => {
        if (!normalized) return true;
        return (
          item.slug.includes(normalized) ||
          item.exportName.toLowerCase().includes(normalized) ||
          item.label.toLowerCase().includes(normalized)
        );
      });
  }, [current.icons, locale, query]);
  return (
    <div className="koi-icons-page">
      <div className="koi-icons-toolbar">
        <label className="koi-icons-search">
          <svg viewBox="0 0 24 24" aria-hidden className="koi-icons-search__icon">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="1.75" />
            <path d="M20 20l-3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={locale === 'zh' ? '搜索图标...' : 'Search all icons...'}
          />
        </label>
      </div>

      <div className="koi-icons-header">
        <div className="koi-icons-tabs" role="tablist" aria-label="Icon variants">
          {Object.entries(VARIANTS).map(([key, item]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={variant === key}
              className="koi-icons-tab"
              data-active={variant === key}
              onClick={() => setVariant(key as IconVariantKey)}
            >
              {item.label[locale]}
            </button>
          ))}
        </div>
        <div className="koi-icons-meta">
          <strong>{current.label[locale]}</strong>
          <span>{current.meta[locale]}</span>
        </div>
      </div>

      <div className="koi-icons-grid">
        {entries.map(({ exportName, slug, label, Component }) => (
          <button
            key={exportName}
            type="button"
            className="koi-icons-card"
            onClick={async () => {
              try {
                await copyImportText(current.importPath, exportName);
                setCopied(exportName);
                window.setTimeout(() => setCopied((prev) => (prev === exportName ? null : prev)), 1200);
              } catch {
                setCopied(null);
              }
            }}
          >
            <span className="koi-icons-card__preview">
              <Component className="koi-icons-card__icon" />
            </span>
            <span className="koi-icons-card__name  text-center" title={slug}>{label}</span>
            <span className="koi-icons-card__hint text-center">
              {copied === exportName
                ? locale === 'zh'
                  ? '已复制'
                  : 'Copied'
                : exportName}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
