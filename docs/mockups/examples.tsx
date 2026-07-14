/**
 * daisyUI Mockup 组件（本地副本，结构对齐官方文档）
 * @see https://daisyui.com/components/mockup-browser/
 * @see https://daisyui.com/components/mockup-phone/
 * @see https://daisyui.com/components/mockup-window/
 * @see https://daisyui.com/components/mockup-code/
 */

import type { ReactNode } from 'react';

/** ① Browser mockup */
export function MockupBrowser({
  url = 'https://daisyui.com',
  children,
  className = 'border w-full',
}: {
  url?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={['mockup-browser', className].filter(Boolean).join(' ')}>
      <div className="mockup-browser-toolbar">
        <div className="input">{url}</div>
      </div>
      {children}
    </div>
  );
}

/** ② Phone mockup */
export function MockupPhone({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={['mockup-phone', className].filter(Boolean).join(' ')}>
      <div className="mockup-phone-camera" />
      <div className="mockup-phone-display">{children}</div>
    </div>
  );
}

/** ③ Window mockup */
export function MockupWindow({
  children,
  className = 'border w-full',
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={['mockup-window', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

/** ④ Code / terminal mockup */
export function MockupCode({
  lines,
  className = 'w-full',
}: {
  lines: Array<{ prefix?: string; text: string; className?: string }>;
  className?: string;
}) {
  return (
    <div className={['mockup-code', className].filter(Boolean).join(' ')}>
      {lines.map((line, i) => (
        <pre key={i} data-prefix={line.prefix} className={line.className}>
          <code>{line.text}</code>
        </pre>
      ))}
    </div>
  );
}
