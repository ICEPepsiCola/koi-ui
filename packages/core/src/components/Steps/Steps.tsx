import type { HTMLAttributes, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { Icon } from '../Icon/Icon';

const stepsVariants = tv({
  base: 'flex w-full',
  variants: {
    direction: {
      horizontal: 'flex-row items-start',
      vertical: 'flex-col',
    },
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    direction: 'horizontal',
    size: 'md',
  },
});

export type StepStatus = 'wait' | 'process' | 'finish' | 'error';

export interface StepItem {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  status?: StepStatus;
}

export interface StepsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof stepsVariants> {
  items: StepItem[];
  current?: number;
  onChange?: (current: number) => void;
}

function resolveStatus(
  index: number,
  current: number,
  itemStatus?: StepStatus,
): StepStatus {
  if (itemStatus) return itemStatus;
  if (index < current) return 'finish';
  if (index === current) return 'process';
  return 'wait';
}

const statusClasses: Record<StepStatus, string> = {
  wait: 'border-border bg-surface text-muted-foreground',
  process: 'border-primary bg-primary text-primary-foreground',
  finish: 'border-primary bg-surface text-primary',
  error: 'border-destructive bg-surface text-destructive',
};

function StepIcon({
  status,
  index,
  icon,
}: {
  status: StepStatus;
  index: number;
  icon?: ReactNode;
}) {
  if (icon) return icon;
  if (status === 'finish') return <Icon name="check" size="sm" />;
  if (status === 'error') return <Icon name="close" size="sm" />;
  return <span className="font-medium">{index + 1}</span>;
}

export function Steps({
  items,
  current = 0,
  direction = 'horizontal',
  size,
  onChange,
  className,
  ...props
}: StepsProps) {
  const isVertical = direction === 'vertical';

  return (
    <div
      className={cn(stepsVariants({ direction, size }), className)}
      role="list"
      {...props}
    >
      {items.map((item, index) => {
        const status = resolveStatus(index, current, item.status);
        const isLast = index === items.length - 1;
        const lineDone = index < current;

        return (
          <div
            key={index}
            role="listitem"
            className={cn(
              'relative flex flex-1',
              isVertical
                ? 'flex-row gap-3'
                : 'min-w-0 flex-col items-center text-center',
            )}
          >
            {/* 节点区：横向时图标居中，连接线绝对定位到下一节点中心 */}
            <div
              className={cn(
                'relative flex shrink-0',
                isVertical
                  ? 'flex-col items-center self-stretch'
                  : 'h-8 w-full items-center justify-center',
              )}
            >
              <button
                type="button"
                className={cn(
                  'relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  statusClasses[status],
                  onChange && status === 'wait' && 'hover:border-primary',
                  !onChange && 'cursor-default',
                )}
                onClick={() => onChange?.(index)}
                disabled={!onChange}
                aria-current={status === 'process' ? 'step' : undefined}
              >
                <StepIcon status={status} index={index} icon={item.icon} />
              </button>
              {!isLast ? (
                <div
                  className={cn(
                    'pointer-events-none absolute z-0',
                    isVertical
                      ? 'top-8 bottom-0 left-1/2 w-0.5 -translate-x-1/2'
                      : 'top-1/2 left-[calc(50%+1rem)] right-[calc(-50%+1rem)] h-0.5 -translate-y-1/2',
                    lineDone ? 'bg-primary' : 'bg-border',
                  )}
                  aria-hidden
                />
              ) : null}
            </div>

            <div
              className={cn(
                isVertical ? 'min-w-0 flex-1 pb-6' : 'mt-2 w-full px-1',
                isLast && isVertical && 'pb-0',
              )}
            >
              <div
                className={cn(
                  'font-medium',
                  status === 'process'
                    ? 'text-primary'
                    : status === 'error'
                      ? 'text-destructive'
                      : 'text-surface-foreground',
                )}
              >
                {item.title}
              </div>
              {item.description ? (
                <div className="mt-1 text-muted-foreground">
                  {item.description}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
