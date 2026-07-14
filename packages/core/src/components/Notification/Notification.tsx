import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { Portal } from '../../utils/portal';

const notificationVariants = tv({
  base: 'pointer-events-auto w-80 rounded-lg border border-border bg-surface p-4 shadow-md',
  variants: {
    type: {
      info: '',
      success: 'border-emerald-200',
      warning: 'border-amber-200',
      error: 'border-destructive/30',
    },
  },
  defaultVariants: {
    type: 'info',
  },
});

export interface NotificationOptions {
  title?: ReactNode;
  description?: ReactNode;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  placement?: 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft';
}

export interface NotificationItem extends NotificationOptions {
  id: string;
}

interface NotificationContextValue {
  notify: (options: NotificationOptions) => void;
  close: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const placementClasses = {
  topRight: 'top-4 right-4 items-end',
  topLeft: 'top-4 left-4 items-start',
  bottomRight: 'bottom-4 right-4 items-end',
  bottomLeft: 'bottom-4 left-4 items-start',
} as const;

let notificationId = 0;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<NotificationItem[]>([]);

  const close = useCallback((id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback(
    (options: NotificationOptions) => {
      const id = String(++notificationId);
      const item: NotificationItem = { id, ...options };
      setItems((prev) => [...prev, item]);
      const duration = options.duration ?? 4500;
      if (duration > 0) {
        setTimeout(() => close(id), duration);
      }
    },
    [close],
  );

  const grouped = items.reduce(
    (acc, item) => {
      const p = item.placement ?? 'topRight';
      acc[p].push(item);
      return acc;
    },
    {
      topRight: [] as NotificationItem[],
      topLeft: [] as NotificationItem[],
      bottomRight: [] as NotificationItem[],
      bottomLeft: [] as NotificationItem[],
    },
  );

  return (
    <NotificationContext.Provider value={{ notify, close }}>
      {children}
      <Portal>
        {(Object.keys(grouped) as Array<keyof typeof grouped>).map(
          (placement) =>
            grouped[placement].length > 0 ? (
              <div
                key={placement}
                className={cn(
                  'pointer-events-none fixed z-[60] flex flex-col gap-2',
                  placementClasses[placement],
                )}
              >
                {grouped[placement].map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      notificationVariants({ type: item.type }),
                      'pointer-events-auto',
                    )}
                    role="alert"
                  >
                    {item.title ? (
                      <div className="mb-1 text-sm font-medium">
                        {item.title}
                      </div>
                    ) : null}
                    {item.description ? (
                      <div className="text-sm text-muted-foreground">
                        {item.description}
                      </div>
                    ) : null}
                    <button
                      type="button"
                      className="absolute right-2 top-2 text-muted-foreground"
                      onClick={() => close(item.id)}
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : null,
        )}
      </Portal>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return ctx;
}

export interface NotificationProps extends VariantProps<typeof notificationVariants> {
  title?: ReactNode;
  description?: ReactNode;
  open?: boolean;
  onClose?: () => void;
  placement?: 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft';
}

export function Notification({
  title,
  description,
  type,
  open = true,
  onClose,
  placement = 'topRight',
}: NotificationProps) {
  if (!open) return null;

  return (
    <Portal>
      <div
        className={cn(
          'pointer-events-none fixed z-[60]',
          placementClasses[placement],
        )}
      >
        <div
          className={cn(
            notificationVariants({ type }),
            'pointer-events-auto relative',
          )}
          role="alert"
        >
          {title ? (
            <div className="mb-1 text-sm font-medium">{title}</div>
          ) : null}
          {description ? (
            <div className="text-sm text-muted-foreground">{description}</div>
          ) : null}
          {onClose ? (
            <button
              type="button"
              className="absolute right-2 top-2 text-muted-foreground"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          ) : null}
        </div>
      </div>
    </Portal>
  );
}
