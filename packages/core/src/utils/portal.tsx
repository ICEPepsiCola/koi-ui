import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useKoiContext } from '../provider/context';

function resolvePortalContainer(
  previewDevice: 'desktop' | 'mobile' | undefined,
  portalContainer: HTMLElement | null | undefined,
): HTMLElement | null {
  // 文档预览（桌面/移动）都挂到演示容器，避免 fixed 组件脱出或直接不渲染
  if (previewDevice != null) {
    return portalContainer ?? null;
  }
  return typeof document !== 'undefined' ? document.body : null;
}

export function Portal({ children }: { children: ReactNode }) {
  const { previewDevice, portalContainer } = useKoiContext();
  const [container, setContainer] = useState<HTMLElement | null>(() =>
    resolvePortalContainer(previewDevice, portalContainer),
  );

  useEffect(() => {
    setContainer(resolvePortalContainer(previewDevice, portalContainer));
  }, [previewDevice, portalContainer]);

  if (!container) return null;
  return createPortal(children, container);
}
