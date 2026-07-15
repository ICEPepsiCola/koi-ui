import type { ReactNode } from 'react';
import type { Breakpoint } from '@koi-ui/hooks';
import {
  KoiContext,
  type KoiLocale,
  type KoiMessages,
  type KoiTheme,
  type PreviewDevice,
} from './context';
import { resolveKoiMessages } from './messages';

export interface KoiProviderProps {
  children: ReactNode;
  breakpoint?: Breakpoint;
  ssrMode?: 'mobile' | 'desktop';
  locale?: KoiLocale;
  messages?: Partial<KoiMessages>;
  previewDevice?: PreviewDevice;
  portalContainer?: HTMLElement | null;
  theme?: Partial<KoiTheme>;
}

export function KoiProvider({
  children,
  breakpoint = 'lg',
  ssrMode = 'desktop',
  locale = 'zh-CN',
  messages,
  previewDevice,
  portalContainer,
  theme = {},
}: KoiProviderProps) {
  return (
    <KoiContext.Provider
      value={{
        breakpoint,
        ssrMode,
        locale,
        messages: resolveKoiMessages(locale, messages),
        previewDevice,
        portalContainer,
        theme,
      }}
    >
      {children}
    </KoiContext.Provider>
  );
}
