import type { ReactNode } from 'react';
import { KoiProvider } from '@koi-ui/core';

export function Demo({ children }: { children: ReactNode }) {
  return <KoiProvider>{children}</KoiProvider>;
}
