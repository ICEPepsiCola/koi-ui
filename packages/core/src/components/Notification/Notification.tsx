import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'motion/react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import {
  MOTION_DURATION_S,
  motionTransition,
} from '../../motion/presets';
import { Portal } from '../../utils/portal';
import { StatusIcon } from '../../utils/semanticSurface';
import { Button } from '../Button';

const notificationVariants = tv({
  base: cn(
    'pointer-events-auto relative flex w-80 gap-3 rounded-box p-4 pr-10 shadow-float',
    'border border-border/80 bg-surface text-surface-foreground',
  ),
  variants: {
    color: {
      info: 'border-info/20 bg-info/10 text-info',
      success: 'border-success/20 bg-success/10 text-success',
      warning: 'border-warning/20 bg-warning/10 text-warning',
      error: 'border-error/20 bg-error/10 text-error',
    },
  },
  defaultVariants: {
    color: 'info',
  },
});

export type NotificationColor = 'info' | 'success' | 'warning' | 'error';
export type NotificationPlacement =
  | 'topRight'
  | 'topLeft'
  | 'bottomRight'
  | 'bottomLeft';

export interface NotificationOptions {
  title?: ReactNode;
  description?: ReactNode;
  color?: NotificationColor;
  /** @default 4500 */
  duration?: number;
  /** @default 'topRight' */
  placement?: NotificationPlacement;
}

export interface NotificationItem extends NotificationOptions {
  id: string;
}

interface NotificationContextValue {
  notify: (options: NotificationOptions) => void;
  close: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(
  null,
);

const placementClasses: Record<NotificationPlacement, string> = {
  topRight: 'top-4 right-4 items-end',
  topLeft: 'top-4 left-4 items-start',
  bottomRight: 'bottom-4 right-4 items-end',
  bottomLeft: 'bottom-4 left-4 items-start',
};

const enterOffset: Record<NotificationPlacement, { x?: number; y?: number }> = {
  topRight: { x: 24, y: -8 },
  topLeft: { x: -24, y: -8 },
  bottomRight: { x: 24, y: 8 },
  bottomLeft: { x: -24, y: 8 },
};

let notificationId = 0;

function NotificationCard({
  item,
  onClose,
  placement,
}: {
  item: NotificationItem;
  onClose: () => void;
  placement: NotificationPlacement;
}) {
  const reduce = useReducedMotion();
  const duration = reduce ? 0 : MOTION_DURATION_S;
  const offset = enterOffset[placement];
  const color = item.color ?? 'info';

  return (
    <motion.div
      layout
      role="alert"
      className={cn(notificationVariants({ color }))}
      initial={{ opacity: 0, ...offset }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{
        opacity: 0,
        ...offset,
        transition: { ...motionTransition, duration: Math.min(duration, 0.16) },
      }}
      transition={{ ...motionTransition, duration }}
    >
      <StatusIcon color={color} className="mt-0.5" />
      <div className="min-w-0 flex-1 text-surface-foreground">
        {item.title ? (
          <div className="mb-1 text-sm font-semibold">{item.title}</div>
        ) : null}
        {item.description ? (
          <div className="text-sm opacity-80">{item.description}</div>
        ) : null}
      </div>
      <Button
        type="button"
        size="sm"
        shape="circle"
        variant="ghost"
        color="neutral"
        className="absolute right-1.5 top-1.5"
        aria-label="Close"
        onClick={onClose}
      >
        ×
      </Button>
    </motion.div>
  );
}

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
        window.setTimeout(() => close(id), duration);
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
        {(Object.keys(grouped) as NotificationPlacement[]).map((placement) => (
          <div
            key={placement}
            className={cn(
              'pointer-events-none fixed z-60 flex flex-col gap-2',
              placementClasses[placement],
            )}
          >
            <AnimatePresence initial={false}>
              {grouped[placement].map((item) => (
                <NotificationCard
                  key={item.id}
                  item={item}
                  placement={placement}
                  onClose={() => close(item.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        ))}
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

export interface NotificationProps
  extends Omit<VariantProps<typeof notificationVariants>, 'color'>,
    Pick<NotificationOptions, 'color'> {
  title?: ReactNode;
  description?: ReactNode;
  open?: boolean;
  onClose?: () => void;
  placement?: NotificationPlacement;
}

export function Notification({
  title,
  description,
  color = 'info',
  open = true,
  onClose,
  placement = 'topRight',
}: NotificationProps) {
  const reduce = useReducedMotion();
  const duration = reduce ? 0 : MOTION_DURATION_S;
  const offset = enterOffset[placement];

  return (
    <Portal>
      <div
        className={cn(
          'pointer-events-none fixed z-60 flex flex-col gap-2',
          placementClasses[placement],
        )}
      >
        <AnimatePresence>
          {open ? (
            <motion.div
              key="koi-notification"
              role="alert"
              className={cn(
                notificationVariants({ color }),
                'pointer-events-auto',
              )}
              initial={{ opacity: 0, ...offset }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{
                opacity: 0,
                ...offset,
                transition: {
                  ...motionTransition,
                  duration: Math.min(duration, 0.16),
                },
              }}
              transition={{ ...motionTransition, duration }}
            >
              <StatusIcon color={color ?? 'info'} className="mt-0.5" />
              <div className="min-w-0 flex-1 text-surface-foreground">
                {title ? (
                  <div className="mb-1 text-sm font-semibold">{title}</div>
                ) : null}
                {description ? (
                  <div className="text-sm opacity-80">{description}</div>
                ) : null}
              </div>
              {onClose ? (
                <Button
                  type="button"
                  size="sm"
                  shape="circle"
                  variant="ghost"
                  color="neutral"
                  className="absolute right-1.5 top-1.5"
                  aria-label="Close"
                  onClick={onClose}
                >
                  ×
                </Button>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </Portal>
  );
}
