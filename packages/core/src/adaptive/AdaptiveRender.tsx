import type { ComponentType } from 'react';
import { useKoiBreakpoint } from '../hooks/useKoiBreakpoint';
import { useKoiContext } from '../provider/context';

export interface AdaptiveRenderProps<T extends Record<string, unknown>> {
  desktop: ComponentType<T>;
  mobile: ComponentType<T>;
  props: T;
  responsive?: boolean;
}

export function AdaptiveRender<T extends Record<string, unknown>>({
  desktop: Desktop,
  mobile: Mobile,
  props,
  responsive = true,
}: AdaptiveRenderProps<T>) {
  const { breakpoint } = useKoiContext();
  const { isMobile } = useKoiBreakpoint(breakpoint);

  const showMobile = responsive && isMobile;

  const Component = showMobile ? Mobile : Desktop;

  return (
    <div suppressHydrationWarning>
      <Component {...props} />
    </div>
  );
}
