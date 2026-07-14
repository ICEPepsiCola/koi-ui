import { useSyncExternalStore, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { tv } from 'tailwind-variants';
import { cn } from '../../utils/cn';

const toastVariants = tv({
  base: 'pointer-events-auto mx-4 mb-2 flex max-w-sm items-center justify-center rounded-lg px-4 py-3 text-sm shadow-lg',
  variants: {
    type: {
      default: 'bg-surface-foreground text-surface',
      info: 'border border-border bg-surface text-surface-foreground',
      success: 'bg-emerald-600 text-white',
      warning: 'bg-amber-500 text-white',
      error: 'bg-destructive text-destructive-foreground',
    },
  },
  defaultVariants: {
    type: 'default',
  },
});

export type ToastType = 'default' | 'info' | 'success' | 'warning' | 'error';

export interface ToastOptions {
  content: ReactNode;
  type?: ToastType;
  /** 展示时长（ms），0 表示不自动关闭 */
  duration?: number;
}

interface ToastRecord extends Required<Pick<ToastOptions, 'content' | 'type'>> {
  id: string;
  duration: number;
}

let records: ToastRecord[] = [];
const listeners = new Set<() => void>();
let seq = 0;
let hostEl: HTMLDivElement | null = null;
let root: Root | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return records;
}

function emit() {
  for (const listener of listeners) listener();
}

function ToastViewport() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return (
    <div
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-[60] flex flex-col items-center pb-safe"
      data-koi-toast-viewport
    >
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(toastVariants({ type: item.type }))}
          role="status"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}

function ensureHost() {
  if (typeof document === 'undefined') return;
  if (hostEl && root) return;

  hostEl = document.createElement('div');
  hostEl.setAttribute('data-koi-toast-host', '');
  document.body.appendChild(hostEl);
  root = createRoot(hostEl);
  root.render(<ToastViewport />);
}

function hide(id: string) {
  records = records.filter((item) => item.id !== id);
  emit();
}

function clear() {
  records = [];
  emit();
}

function show(options: ToastOptions): string {
  ensureHost();
  const id = String(++seq);
  const item: ToastRecord = {
    id,
    content: options.content,
    type: options.type ?? 'default',
    duration: options.duration ?? 2000,
  };
  records = [...records, item];
  emit();
  if (item.duration > 0) {
    window.setTimeout(() => hide(id), item.duration);
  }
  return id;
}

function open(
  content: ReactNode,
  options?: Omit<ToastOptions, 'content'>,
): string {
  return show({ content, ...options });
}

function withType(type: ToastType) {
  return (content: ReactNode, duration?: number) =>
    show({
      content,
      type,
      ...(duration !== undefined ? { duration } : {}),
    });
}

/**
 * 命令式轻提示：`toast('内容')` / `toast.success('成功')`。
 * 也可写作 `Toast.show({ content })`。
 */
export const toast = Object.assign(open, {
  show,
  info: withType('info'),
  success: withType('success'),
  warning: withType('warning'),
  error: withType('error'),
  hide,
  clear,
});

/** 与 `toast` 同一实例，支持 `Toast.success()` 调用风格 */
export const Toast = toast;
