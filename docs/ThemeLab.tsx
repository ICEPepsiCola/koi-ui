import { useState } from 'react';
import { useLang } from '@rspress/core/runtime';
import {
  Alert,
  Button,
  Input,
  KOI_THEME_NAMES,
  KoiProvider,
  Space,
  Tag,
  type KoiThemeName,
} from '@koi-ui/core';

const LABELS: Record<KoiThemeName, { en: string; zh: string }> = {
  light: { en: 'Light', zh: '浅色' },
  dark: { en: 'Dark', zh: '深色' },
  ocean: { en: 'Ocean', zh: '海洋' },
  forest: { en: 'Forest', zh: '森林' },
  sunset: { en: 'Sunset', zh: '日落' },
  violet: { en: 'Violet', zh: '紫藤' },
};

const COPY = {
  en: {
    title: 'Theme lab',
    hint: 'Pick a skin — controls below update together.',
  },
  zh: {
    title: '主题实验室',
    hint: '点选皮肤，下方控件会一起变色。',
  },
} as const;

export function ThemeLab() {
  const lang = useLang() === 'zh' ? 'zh' : 'en';
  const copy = COPY[lang];
  const [themeName, setThemeName] = useState<KoiThemeName>('ocean');

  return (
    <div className="koi-theme-lab">
      <div className="koi-theme-lab__header">
        <div>
          <div className="koi-theme-lab__title">{copy.title}</div>
          <p className="koi-theme-lab__hint">{copy.hint}</p>
        </div>
        <div className="koi-theme-lab__swatches" role="list">
          {KOI_THEME_NAMES.map((name) => (
            <button
              key={name}
              type="button"
              role="listitem"
              className="koi-theme-lab__swatch"
              data-active={themeName === name}
              data-theme={name}
              onClick={() => setThemeName(name)}
              aria-pressed={themeName === name}
            >
              <span className="koi-theme-lab__swatch-dot" aria-hidden />
              {LABELS[name][lang]}
            </button>
          ))}
        </div>
      </div>

      <KoiProvider theme={{ name: themeName }}>
        <div className="koi-theme-lab__stage" data-theme={themeName}>
          <Space wrap className="w-full">
            <Button color="primary">
              {lang === 'zh' ? '主按钮' : 'Primary'}
            </Button>
            <Button color="primary" variant="soft">{lang === 'zh' ? '轻量' : 'Soft'}</Button>
            <Button color="primary" variant="outline">
              {lang === 'zh' ? '描边' : 'Outline'}
            </Button>
            <Button variant="ghost">{lang === 'zh' ? '幽灵' : 'Ghost'}</Button>
            <Tag color="success">{lang === 'zh' ? '成功' : 'Success'}</Tag>
            <Tag color="warning">{lang === 'zh' ? '警告' : 'Warning'}</Tag>
          </Space>
          <div className="koi-theme-lab__field">
            <Input
              placeholder={lang === 'zh' ? '搜索项目…' : 'Search projects…'}
            />
          </div>
          <Alert
            color="info"
            title={lang === 'zh' ? '当前主题' : 'Active theme'}
            description={
              lang === 'zh'
                ? `正在使用 ${LABELS[themeName].zh}（data-theme="${themeName}"）`
                : `Using ${LABELS[themeName].en} (data-theme="${themeName}")`
            }
          />
        </div>
      </KoiProvider>
    </div>
  );
}
