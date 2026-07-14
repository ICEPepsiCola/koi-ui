import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useLang } from '@rspress/core/runtime';
import { KoiProvider } from '@koi-ui/core';
import { MockupBrowser, MockupPhone } from './mockups/examples';

type PreviewDevice = 'desktop' | 'mobile';
type DemoTab = 'preview' | 'jsx';

const PREVIEW_COPY = {
  en: {
    preview: 'Preview',
    desktop: 'Desktop',
    mobile: 'Mobile',
    noCode: '// No source',
  },
  zh: {
    preview: '预览',
    desktop: '桌面端',
    mobile: '移动端',
    noCode: '// 无源码',
  },
} as const;

export function DevicePreviewShell({
  children,
  code = '',
}: {
  children: ReactNode;
  /** Fallback source when Rspress Shiki block is unavailable */
  code?: string;
}) {
  const tabName = useId();
  const codeSlotRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<DemoTab>('preview');
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [portalContainer, setPortalContainer] =
    useState<HTMLDivElement | null>(null);
  const [hasRspressCode, setHasRspressCode] = useState(false);
  const isMobile = device === 'mobile';
  const lang = useLang() === 'zh' ? 'zh' : 'en';
  const copy = PREVIEW_COPY[lang];

  // Move Rspress Preview's highlighted code-wrapper into the JSX tab
  useLayoutEffect(() => {
    const slot = codeSlotRef.current;
    if (!slot) return;

    const preview = slot.closest('.rp-preview--internal');
    const codeWrapper = preview?.querySelector<HTMLElement>(
      ':scope > .rp-preview--internal__code-wrapper',
    );
    if (!codeWrapper) return;

    const placeholder = document.createComment('rp-preview-code');
    codeWrapper.parentNode?.insertBefore(placeholder, codeWrapper);
    slot.appendChild(codeWrapper);
    codeWrapper.classList.add('rp-preview--internal__code-wrapper--visible');
    setHasRspressCode(true);

    return () => {
      setHasRspressCode(false);
      placeholder.parentNode?.insertBefore(codeWrapper, placeholder);
      placeholder.remove();
      codeWrapper.classList.remove(
        'rp-preview--internal__code-wrapper--visible',
      );
    };
  }, []);

  const demo = (
    <div className="koi-demo__frame">
      <div className="koi-demo__viewport">
        <div className="koi-demo__content">{children}</div>
      </div>
      <div ref={setPortalContainer} className="koi-demo__portal" />
    </div>
  );

  return (
    <div className="koi-demo">
      <div className="koi-demo__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          className="koi-demo__tab"
          data-active={tab === 'preview'}
          aria-selected={tab === 'preview'}
          aria-controls={`${tabName}-preview`}
          onClick={() => setTab('preview')}
        >
          {copy.preview}
        </button>
        <button
          type="button"
          role="tab"
          className="koi-demo__tab"
          data-active={tab === 'jsx'}
          aria-selected={tab === 'jsx'}
          aria-controls={`${tabName}-jsx`}
          onClick={() => setTab('jsx')}
        >
          JSX
        </button>
      </div>

      <div
        id={`${tabName}-preview`}
        role="tabpanel"
        className="koi-demo__panel koi-demo__panel--preview"
        data-active={tab === 'preview'}
        hidden={tab !== 'preview'}
      >
        <div className="koi-demo__preview-body">
          <div className="koi-demo__device-switch">
            <button
              type="button"
              className="koi-demo__device-btn"
              data-active={device === 'desktop'}
              onClick={() => setDevice('desktop')}
            >
              {copy.desktop}
            </button>
            <button
              type="button"
              className="koi-demo__device-btn"
              data-active={device === 'mobile'}
              onClick={() => setDevice('mobile')}
            >
              {copy.mobile}
            </button>
          </div>

          <KoiProvider previewDevice={device} portalContainer={portalContainer}>
            {isMobile ? (
              <div className="koi-demo__phone-wrap">
                <MockupPhone>{demo}</MockupPhone>
              </div>
            ) : (
              <MockupBrowser url="koi-ui / preview">{demo}</MockupBrowser>
            )}
          </KoiProvider>
        </div>
      </div>

      <div
        id={`${tabName}-jsx`}
        role="tabpanel"
        className="koi-demo__panel koi-demo__panel--code"
        data-active={tab === 'jsx'}
        hidden={tab !== 'jsx'}
      >
        <div ref={codeSlotRef} className="koi-demo__code-slot" />
        {!hasRspressCode ? (
          <pre className="koi-demo__code">
            <code>{code.trim() || copy.noCode}</code>
          </pre>
        ) : null}
      </div>
    </div>
  );
}
