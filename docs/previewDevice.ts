import { useCallback, useSyncExternalStore } from 'react';

export type DocsPreviewDevice = 'desktop' | 'mobile';

const STORAGE_KEY = 'koi-docs-preview-device';
const CHANGE_EVENT = 'koi-docs-preview-device';

function isPreviewDevice(value: string | null): value is DocsPreviewDevice {
  return value === 'desktop' || value === 'mobile';
}

/** Read persisted device; SSR / private mode → desktop. */
export function readPreviewDevice(): DocsPreviewDevice {
  if (typeof window === 'undefined') return 'desktop';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isPreviewDevice(stored)) return stored;
  } catch {
    /* ignore quota / privacy errors */
  }
  return 'desktop';
}

/** Persist + notify same-tab listeners (and other frames via `storage`). */
export function writePreviewDevice(device: DocsPreviewDevice): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, device);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(
    new CustomEvent<DocsPreviewDevice>(CHANGE_EVENT, { detail: device }),
  );
}

function subscribePreviewDevice(onStoreChange: () => void): () => void {
  const onCustom = () => onStoreChange();
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onStoreChange();
  };
  window.addEventListener(CHANGE_EVENT, onCustom);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onCustom);
    window.removeEventListener('storage', onStorage);
  };
}

/** Global docs preview device (nav + every DevicePreviewShell). */
export function usePreviewDevice(): [
  DocsPreviewDevice,
  (device: DocsPreviewDevice) => void,
] {
  const device = useSyncExternalStore(
    subscribePreviewDevice,
    readPreviewDevice,
    () => 'desktop' as const,
  );
  const setDevice = useCallback((next: DocsPreviewDevice) => {
    writePreviewDevice(next);
  }, []);
  return [device, setDevice];
}
