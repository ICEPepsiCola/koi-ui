import type { KoiLocale, KoiMessages } from './context';

const DEFAULT_MESSAGES: Record<KoiLocale, KoiMessages> = {
  'zh-CN': {
    emptyText: '暂无数据',
    loadingText: '加载中...',
    selectPlaceholder: '请选择',
    searchPlaceholder: '搜索',
    searchActionText: '搜索',
    cancelActionText: '取消',
    clearActionText: '清除',
  },
  'en-US': {
    emptyText: 'No data',
    loadingText: 'Loading...',
    selectPlaceholder: 'Please select',
    searchPlaceholder: 'Search',
    searchActionText: 'Search',
    cancelActionText: 'Cancel',
    clearActionText: 'Clear',
  },
};

export function resolveKoiMessages(
  locale: KoiLocale,
  overrides: Partial<KoiMessages> = {},
): KoiMessages {
  return {
    ...DEFAULT_MESSAGES[locale],
    ...overrides,
  };
}
