import { createContext, useContext } from 'react';
import type { Breakpoint } from '@koi-ui/hooks';

/** Built-in skins applied via `data-theme`. */
export const KOI_THEME_NAMES = [
  'light',
  'dark',
  'ocean',
  'forest',
  'sunset',
  'violet',
] as const;

export type KoiThemeName = (typeof KOI_THEME_NAMES)[number];

export interface KoiTheme {
  /** Named skin (`data-theme`). */
  name?: KoiThemeName;
  /** Override `--color-primary` (any CSS color). */
  primaryColor?: string;
  /** Override `--radius-md`. */
  radiusMd?: string;
}

export interface KoiMessages {
  emptyText: string;
  loadingText: string;
  selectPlaceholder: string;
  searchPlaceholder: string;
  searchActionText: string;
  cancelActionText: string;
  clearActionText: string;
}

export type KoiLocale = 'zh-CN' | 'en-US';
export type PreviewDevice = 'desktop' | 'mobile';

export interface KoiContextValue {
  breakpoint: Breakpoint;
  ssrMode: 'mobile' | 'desktop';
  locale: KoiLocale;
  messages: KoiMessages;
  previewDevice?: PreviewDevice;
  /** 文档预览模式下，移动端弹层挂载的容器 */
  portalContainer?: HTMLElement | null;
  theme: KoiTheme;
}

const defaultValue: KoiContextValue = {
  breakpoint: 'lg',
  ssrMode: 'desktop',
  locale: 'zh-CN',
  messages: {
    emptyText: '暂无数据',
    loadingText: '加载中...',
    selectPlaceholder: '请选择',
    searchPlaceholder: '搜索',
    searchActionText: '搜索',
    cancelActionText: '取消',
    clearActionText: '清除',
  },
  previewDevice: undefined,
  portalContainer: undefined,
  theme: {},
};

export const KoiContext = createContext<KoiContextValue>(defaultValue);

export function useKoiContext(): KoiContextValue {
  return useContext(KoiContext);
}
