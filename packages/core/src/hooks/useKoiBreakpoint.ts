import { useBreakpoint, type Breakpoint, type BreakpointState } from '@koi-ui/hooks';
import { useKoiContext } from '../provider/context';

export function useKoiBreakpoint(mobileBreakpoint?: Breakpoint): BreakpointState {
  const { breakpoint: ctxBreakpoint, ssrMode, previewDevice } = useKoiContext();
  const bp = mobileBreakpoint ?? ctxBreakpoint;
  const state = useBreakpoint(bp);

  let isMobile = state.isMobile;
  if (previewDevice === 'mobile') {
    isMobile = true;
  } else if (previewDevice === 'desktop') {
    isMobile = false;
  } else if (typeof window === 'undefined') {
    isMobile = ssrMode === 'mobile';
  }

  return { ...state, isMobile };
}
