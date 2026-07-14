import { useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/cn';
import { Portal } from '../../utils/portal';
import { Overlay } from '../shared/Overlay';
import { useScrollLock } from '../../hooks/useScrollLock';
import { pad2 } from '../DatePicker/dateUtils';

export interface TimeWheelViewProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  format?: 'HH:mm' | 'HH:mm:ss';
}

function parseTime(value?: string) {
  const parts = (value ?? '').split(':').map(Number);
  return {
    hour: parts[0] || 0,
    minute: parts[1] || 0,
    second: parts[2] || 0,
  };
}

function formatTime(
  hour: number,
  minute: number,
  second: number,
  withSeconds: boolean,
) {
  return withSeconds
    ? `${pad2(hour)}:${pad2(minute)}:${pad2(second)}`
    : `${pad2(hour)}:${pad2(minute)}`;
}

export function TimeWheelView({
  value,
  onChange,
  placeholder = '选择时间',
  disabled = false,
  format = 'HH:mm',
}: TimeWheelViewProps) {
  const withSeconds = format === 'HH:mm:ss';
  const parsed = parseTime(value);
  const [open, setOpen] = useState(false);
  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);
  const [second, setSecond] = useState(parsed.second);

  const hours = Array.from({ length: 24 }, (_, i) => pad2(i));
  const minutes = Array.from({ length: 60 }, (_, i) => pad2(i));

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const next = parseTime(value);
    setHour(next.hour);
    setMinute(next.minute);
    setSecond(next.second);
  }, [open, value]);

  const confirm = () => {
    onChange?.(formatTime(hour, minute, second, withSeconds));
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-border bg-surface px-3 text-sm',
          disabled && 'cursor-not-allowed opacity-50',
        )}
        onClick={() => !disabled && setOpen(true)}
      >
        <span className={value ? '' : 'text-muted-foreground'}>
          {value ?? placeholder}
        </span>
        <span className="text-muted-foreground">🕒</span>
      </button>
      {open ? (
        <Portal>
          <Overlay
            open
            onClick={() => setOpen(false)}
            className="flex items-end"
          >
            <div
              className="w-full rounded-t-2xl bg-surface pb-safe shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-border" />
              <div className="flex items-center justify-between px-4 py-3">
                <button
                  type="button"
                  className="text-sm text-muted-foreground"
                  onClick={() => setOpen(false)}
                >
                  取消
                </button>
                <span className="text-sm font-medium">{placeholder}</span>
                <button
                  type="button"
                  className="text-sm font-medium text-primary"
                  onClick={confirm}
                >
                  确定
                </button>
              </div>
              <div
                className={cn(
                  'relative grid px-3 pb-5 pt-1',
                  withSeconds ? 'grid-cols-3' : 'grid-cols-2',
                )}
              >
                <div className="pointer-events-none absolute inset-x-3 top-1/2 z-[1] h-10 -translate-y-1/2 rounded-lg bg-muted/70" />
                <WheelColumn
                  options={hours}
                  value={pad2(hour)}
                  onChange={(v) => setHour(Number(v))}
                />
                <WheelColumn
                  options={minutes}
                  value={pad2(minute)}
                  onChange={(v) => setMinute(Number(v))}
                />
                {withSeconds ? (
                  <WheelColumn
                    options={minutes}
                    value={pad2(second)}
                    onChange={(v) => setSecond(Number(v))}
                  />
                ) : null}
              </div>
            </div>
          </Overlay>
        </Portal>
      ) : null}
    </>
  );
}

function WheelColumn({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const active = root.querySelector<HTMLElement>('[data-active="true"]');
    active?.scrollIntoView({ block: 'center' });
  }, [value, options]);

  return (
    <div
      ref={scrollerRef}
      className="relative z-[2] h-48 snap-y snap-mandatory overflow-y-auto overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{
        maskImage:
          'linear-gradient(to bottom, transparent, #000 18%, #000 82%, transparent)',
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent, #000 18%, #000 82%, transparent)',
      }}
    >
      <div className="h-[calc(50%-1.25rem)] shrink-0" />
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            data-active={active}
            className={cn(
              'flex h-10 w-full snap-center items-center justify-center text-base transition-colors',
              active
                ? 'font-semibold text-surface-foreground'
                : 'text-muted-foreground',
            )}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        );
      })}
      <div className="h-[calc(50%-1.25rem)] shrink-0" />
    </div>
  );
}
