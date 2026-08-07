import { useLang } from '@rspress/core/runtime';
import { usePreviewDevice, type DocsPreviewDevice } from './previewDevice';

const COPY = {
  en: {
    label: 'Preview device',
    desktop: 'Desktop',
    mobile: 'Mobile',
  },
  zh: {
    label: '预览设备',
    desktop: '桌面端',
    mobile: '移动端',
  },
} as const;

const DEVICES: DocsPreviewDevice[] = ['desktop', 'mobile'];

/** Site-wide Desktop / Mobile control for all component demos. */
export function PreviewDeviceSwitch() {
  const [device, setDevice] = usePreviewDevice();
  const lang = useLang() === 'zh' ? 'zh' : 'en';
  const copy = COPY[lang];

  return (
    <div
      className="koi-docs-device"
      role="group"
      aria-label={copy.label}
    >
      {DEVICES.map((id) => (
        <button
          key={id}
          type="button"
          className="koi-docs-device__btn"
          data-active={device === id}
          aria-pressed={device === id}
          onClick={() => setDevice(id)}
        >
          {copy[id]}
        </button>
      ))}
    </div>
  );
}
