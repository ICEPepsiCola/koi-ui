import { createContext, useContext } from 'react';
import type { Breakpoint } from '@koi-ui/hooks';

export interface KoiTheme {
  primaryColor?: string;
  radiusMd?: string;
}

export type PreviewDevice = 'desktop' | 'mobile';

export interface KoiContextValue {
  breakpoint: Breakpoint;
  ssrMode: 'mobile' | 'desktop';
  previewDevice?: PreviewDevice;
  /** 文档预览模式下，移动端弹层挂载的容器 */
  portalContainer?: HTMLElement | null;
  theme: KoiTheme;
}

const defaultValue: KoiContextValue = {
  breakpoint: 'lg',
  ssrMode: 'desktop',
  previewDevice: undefined,
  portalContainer: undefined,
  theme: {},
};

export const KoiContext = createContext<KoiContextValue>(defaultValue);

export function useKoiContext(): KoiContextValue {
  return useContext(KoiContext);
}
