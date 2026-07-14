import type { ReactNode } from 'react';
import type { Breakpoint } from '@koi-ui/hooks';
import { KoiContext, type KoiTheme, type PreviewDevice } from './context';

export interface KoiProviderProps {
  children: ReactNode;
  breakpoint?: Breakpoint;
  ssrMode?: 'mobile' | 'desktop';
  previewDevice?: PreviewDevice;
  portalContainer?: HTMLElement | null;
  theme?: Partial<KoiTheme>;
}

export function KoiProvider({
  children,
  breakpoint = 'lg',
  ssrMode = 'desktop',
  previewDevice,
  portalContainer,
  theme = {},
}: KoiProviderProps) {
  return (
    <KoiContext.Provider
      value={{ breakpoint, ssrMode, previewDevice, portalContainer, theme }}
    >
      {children}
    </KoiContext.Provider>
  );
}
