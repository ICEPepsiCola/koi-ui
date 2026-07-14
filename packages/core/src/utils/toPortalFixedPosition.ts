/**
 * Convert viewport-space coordinates into the coordinate space used by
 * `position: fixed` when content is portaled into a transformed preview root.
 *
 * Docs device preview mounts floats into `.koi-demo__portal` (sibling of the
 * scrollable `.koi-demo__viewport`), which carries `transform` so fixed
 * descendants stay pinned to the mockup frame instead of the window.
 */
export function getPortalFixedRoot(
  portalContainer: HTMLElement | null | undefined,
): HTMLElement | null {
  if (!portalContainer || portalContainer === document.body) return null;
  if (portalContainer.classList.contains('koi-demo__portal')) {
    return portalContainer;
  }
  return (
    (portalContainer.closest('.koi-demo__portal') as HTMLElement | null) ??
    (portalContainer.closest('.koi-demo__viewport') as HTMLElement | null) ??
    (portalContainer.closest('.koi-device-viewport') as HTMLElement | null) ??
    portalContainer
  );
}

/** 文档预览里监听滚动的容器（portal 的兄弟 viewport） */
export function getPreviewScrollRoot(
  portalContainer: HTMLElement | null | undefined,
): HTMLElement | null {
  if (!portalContainer) return null;
  const frame = portalContainer.closest('.koi-demo__frame');
  if (frame) {
    const viewport = frame.querySelector(':scope > .koi-demo__viewport');
    if (viewport instanceof HTMLElement) return viewport;
  }
  return (
    (portalContainer.closest('.koi-demo__viewport') as HTMLElement | null) ??
    (portalContainer.closest('.koi-device-viewport') as HTMLElement | null)
  );
}

export function toPortalFixedPosition(
  viewportTop: number,
  viewportLeft: number,
  portalContainer: HTMLElement | null | undefined,
): { top: number; left: number } {
  const root = getPortalFixedRoot(portalContainer);
  if (!root) {
    return { top: viewportTop, left: viewportLeft };
  }

  const rootRect = root.getBoundingClientRect();
  return {
    top: viewportTop - rootRect.top,
    left: viewportLeft - rootRect.left,
  };
}

export type PortalFixedAnchor =
  | 'top-center'
  | 'bottom-center'
  | 'left-center'
  | 'right-center'
  | 'center';

/**
 * Keep a fixed floating panel inside the portal root after layout.
 * `pos` is the anchor point used with the matching CSS translate.
 */
export function clampPortalFixedPosition(
  pos: { top: number; left: number },
  floating: HTMLElement,
  portalContainer: HTMLElement | null | undefined,
  anchor: PortalFixedAnchor = 'top-center',
  padding = 8,
): { top: number; left: number } {
  const root = getPortalFixedRoot(portalContainer);
  if (!root) return pos;

  const width = floating.offsetWidth;
  const height = floating.offsetHeight;
  if (width === 0 || height === 0) return pos;

  const maxLeft = root.clientWidth - padding;
  const maxTop = root.clientHeight - padding;
  let { top, left } = pos;

  switch (anchor) {
    case 'top-center':
    case 'bottom-center':
    case 'center':
      left = Math.min(
        maxLeft - width / 2,
        Math.max(padding + width / 2, left),
      );
      break;
    case 'left-center':
      left = Math.min(maxLeft, Math.max(padding + width, left));
      break;
    case 'right-center':
      left = Math.min(maxLeft - width, Math.max(padding, left));
      break;
    default:
      break;
  }

  switch (anchor) {
    case 'bottom-center':
      top = Math.min(maxTop, Math.max(padding + height, top));
      break;
    case 'top-center':
      top = Math.min(maxTop - height, Math.max(padding, top));
      break;
    case 'left-center':
    case 'right-center':
    case 'center':
      top = Math.min(
        maxTop - height / 2,
        Math.max(padding + height / 2, top),
      );
      break;
    default:
      break;
  }

  return { top, left };
}
