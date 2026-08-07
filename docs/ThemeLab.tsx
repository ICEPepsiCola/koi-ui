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
};

/** Preset primary overrides — ThemeLab only exposes Light/Dark + primary. */
const PRIMARY_PRESETS = [
  {
    id: 'system',
    value: undefined as string | undefined,
    en: 'System',
    zh: '系统蓝',
    swatch: 'hsl(211 100% 50%)',
  },
  {
    id: 'indigo',
    value: 'hsl(239 84% 55%)',
    en: 'Indigo',
    zh: '靛蓝',
    swatch: 'hsl(239 84% 55%)',
  },
  {
    id: 'teal',
    value: 'hsl(173 80% 36%)',
    en: 'Teal',
    zh: '青绿',
    swatch: 'hsl(173 80% 36%)',
  },
  {
    id: 'orange',
    value: 'hsl(24 95% 48%)',
    en: 'Orange',
    zh: '橙色',
    swatch: 'hsl(24 95% 48%)',
  },
] as const;

const COPY = {
  en: {
    title: 'Appearance',
    hint: 'Light or dark, plus an optional primary override — the controls below update together.',
    primary: 'Primary',
  },
  zh: {
    title: '外观',
    hint: '浅色或深色，并可覆盖主色；下方控件会一起更新。',
    primary: '主色',
  },
} as const;

export function ThemeLab() {
  const lang = useLang() === 'zh' ? 'zh' : 'en';
  const copy = COPY[lang];
  const [themeName, setThemeName] = useState<KoiThemeName>('light');
  const [primaryId, setPrimaryId] =
    useState<(typeof PRIMARY_PRESETS)[number]['id']>('system');
  const primaryPreset =
    PRIMARY_PRESETS.find((p) => p.id === primaryId) ?? PRIMARY_PRESETS[0];

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
        <div className="koi-theme-lab__primary">
          <div className="koi-theme-lab__primary-label">{copy.primary}</div>
          <div className="koi-theme-lab__swatches" role="list">
            {PRIMARY_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                role="listitem"
                className="koi-theme-lab__swatch"
                data-active={primaryId === preset.id}
                onClick={() => setPrimaryId(preset.id)}
                aria-pressed={primaryId === preset.id}
              >
                <span
                  className="koi-theme-lab__swatch-dot"
                  style={{ background: preset.swatch }}
                  aria-hidden
                />
                {lang === 'zh' ? preset.zh : preset.en}
              </button>
            ))}
          </div>
        </div>
      </div>

      <KoiProvider
        theme={{
          name: themeName,
          primaryColor: primaryPreset.value,
        }}
      >
        <div className="koi-theme-lab__stage" data-theme={themeName}>
          <Space wrap className="w-full">
            <Button color="primary">
              {lang === 'zh' ? '主按钮' : 'Primary'}
            </Button>
            <Button color="primary" variant="soft">
              {lang === 'zh' ? '轻量' : 'Soft'}
            </Button>
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
                ? `正在使用 ${LABELS[themeName].zh}（data-theme="${themeName}"）${
                    primaryPreset.value
                      ? `，主色 ${primaryPreset.zh}`
                      : ''
                  }`
                : `Using ${LABELS[themeName].en} (data-theme="${themeName}")${
                    primaryPreset.value
                      ? `, primary ${primaryPreset.en}`
                      : ''
                  }`
            }
          />
        </div>
      </KoiProvider>
    </div>
  );
}
