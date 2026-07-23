import { useSyncExternalStore, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'motion/react';
import { tv } from 'tailwind-variants';
import {
  MOTION_DURATION_S,
  motionTransition,
  toastPresenceVariants,
} from '../../motion/presets';
import { cn } from '../../utils/cn';

const toastVariants = tv({
  base: 'pointer-events-auto mx-4 my-1 flex max-w-sm items-center justify-center rounded-box px-4 py-3 text-sm shadow-float',
  variants: {
    type: {
      default: 'bg-surface-foreground text-surface',
      info: 'border border-border/80 bg-surface text-surface-foreground',
      success: 'bg-success text-success-foreground',
      warning: 'bg-warning text-warning-foreground',
      error: 'bg-destructive text-destructive-foreground',
    },
  },
  defaultVariants: {
    type: 'default',
  },
});

export type ToastType = 'default' | 'info' | 'success' | 'warning' | 'error';

export type ToastPosition = 'top' | 'center' | 'bottom';

const viewportClass: Record<ToastPosition, string> = {
  top: 'pointer-events-none fixed inset-x-0 top-0 z-60 flex flex-col items-center pt-safe',
  center:
    'pointer-events-none fixed inset-0 z-60 flex flex-col items-center justify-center',
  bottom:
    'pointer-events-none fixed inset-x-0 bottom-0 z-60 flex flex-col items-center pb-safe',
};

export interface ToastOptions {
  content: ReactNode;
  /**
   * @default 'default'
   */
  type?: ToastType;
  /**
   * 展示时长（ms），0 表示不自动关闭
   * @default 2000
   */
  duration?: number;
  /**
   * @default 'center'
   */
  position?: ToastPosition;
}

interface ToastRecord
  extends Required<Pick<ToastOptions, 'content' | 'type' | 'position'>> {
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

function ToastItem({
  item,
  position,
}: {
  item: ToastRecord;
  position: ToastPosition;
}) {
  const reduce = useReducedMotion();
  const duration = reduce ? 0 : MOTION_DURATION_S;
  const transition = { ...motionTransition, duration };
  const variants = toastPresenceVariants[position];

  return (
    <motion.div
      className={cn(toastVariants({ type: item.type }))}
      role="status"
      initial="closed"
      animate="open"
      exit="closed"
      variants={{
        open: {
          ...variants.open,
          transition,
        },
        closed: {
          ...variants.closed,
          transition: {
            ...transition,
            // Exit a touch snappier than enter.
            duration: reduce ? 0 : Math.min(duration, 0.16),
          },
        },
      }}
    >
      {item.content}
    </motion.div>
  );
}

function ToastList({
  items,
  position,
}: {
  items: ToastRecord[];
  position: ToastPosition;
}) {
  return (
    <AnimatePresence initial={false}>
      {items.map((item) => (
        <ToastItem key={item.id} item={item} position={position} />
      ))}
    </AnimatePresence>
  );
}

function ToastViewport() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const groups: Record<ToastPosition, ToastRecord[]> = {
    top: [],
    center: [],
    bottom: [],
  };
  for (const item of items) {
    groups[item.position].push(item);
  }

  return (
    <>
      {(Object.keys(groups) as ToastPosition[]).map((position) => (
        <div
          key={position}
          className={viewportClass[position]}
          data-koi-toast-viewport={position}
        >
          <ToastList items={groups[position]} position={position} />
        </div>
      ))}
    </>
  );
}

function ensureHost() {
  if (typeof document === 'undefined') return;
  if (hostEl && root && document.body.contains(hostEl)) return;

  // Test runners remount document.body between cases; drop stale host.
  if (hostEl && root && !document.body.contains(hostEl)) {
    try {
      root.unmount();
    } catch {
      /* ignore */
    }
    hostEl = null;
    root = null;
  }

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
    position: options.position ?? 'center',
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
  return (
    content: ReactNode,
    durationOrOptions?: number | Omit<ToastOptions, 'content' | 'type'>,
  ) => {
    if (typeof durationOrOptions === 'number') {
      return show({ content, type, duration: durationOrOptions });
    }
    return show({ content, type, ...durationOrOptions });
  };
}

/**
 * 命令式轻提示：`toast('内容')` / `toast.success('成功')`。
 * 也可写作 `Toast.show({ content })`。默认居中展示。
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
