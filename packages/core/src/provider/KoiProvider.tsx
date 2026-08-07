import { useEffect, type CSSProperties, type ReactNode } from 'react';
import type { Breakpoint } from '@koi-ui/hooks';
import { setToastHostParent } from '../components/Toast/Toast';
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

function themeToStyle(theme: KoiTheme): CSSProperties | undefined {
  const style: Record<string, string> = {};
  if (theme.primaryColor) style['--color-primary'] = theme.primaryColor;
  if (theme.radiusMd) {
    style['--radius-md'] = theme.radiusMd;
    style['--radius-field'] = theme.radiusMd;
  }
  return Object.keys(style).length > 0 ? (style as CSSProperties) : undefined;
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
  const resolvedTheme: KoiTheme = {
    name: theme.name,
    primaryColor: theme.primaryColor,
    radiusMd: theme.radiusMd,
  };

  useEffect(() => {
    // Docs device preview: keep imperative toasts inside the mockup portal.
    setToastHostParent(
      previewDevice != null ? (portalContainer ?? null) : null,
    );
    return () => setToastHostParent(null);
  }, [previewDevice, portalContainer]);

  return (
    <KoiContext.Provider
      value={{
        breakpoint,
        ssrMode,
        locale,
        messages: resolveKoiMessages(locale, messages),
        previewDevice,
        portalContainer,
        theme: resolvedTheme,
      }}
    >
      <div
        className="koi-theme-root"
        data-theme={resolvedTheme.name}
        style={{ display: 'contents', ...themeToStyle(resolvedTheme) }}
      >
        {children}
      </div>
    </KoiContext.Provider>
  );
}
