import { useEffect, useState } from 'react';
import { useKoiContext } from '../../provider/context';
import type { FieldSize } from '../../utils/interaction';
import { FieldTrigger } from '../shared/FieldTrigger';
import { MotionPanel } from '../shared/MotionPanel';
import { PickerWheels } from '../shared/PickerWheels';
import { Portal } from '../../utils/portal';
import { Overlay } from '../shared/Overlay';
import { SheetChrome } from '../shared/SheetChrome';
import { useScrollLock } from '../../hooks/useScrollLock';
import { pad2 } from '../DatePicker/dateUtils';

export interface TimeWheelViewProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  format?: 'HH:mm' | 'HH:mm:ss';
  clearable?: boolean;
  size?: FieldSize;
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

/**
 * Mobile TimePicker — classic iOS wheel sheet.
 */
export function TimeWheelView({
  value,
  onChange,
  placeholder = '选择时间',
  disabled = false,
  format = 'HH:mm',
  clearable = false,
  size = 'md',
}: TimeWheelViewProps) {
  const { messages } = useKoiContext();
  const withSeconds = format === 'HH:mm:ss';
  const parsed = parseTime(value);
  const [open, setOpen] = useState(false);
  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);
  const [second, setSecond] = useState(parsed.second);

  const hours = Array.from({ length: 24 }, (_, i) => pad2(i));
  const minutes = Array.from({ length: 60 }, (_, i) => pad2(i));
  const hasValue = Boolean(value);

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

  const wheelColumns = [
    {
      key: 'hour',
      options: hours.map((v) => ({ value: v, label: v })),
      value: pad2(hour),
      onChange: (v: string) => setHour(Number(v)),
    },
    {
      key: 'minute',
      options: minutes.map((v) => ({ value: v, label: v })),
      value: pad2(minute),
      onChange: (v: string) => setMinute(Number(v)),
    },
    ...(withSeconds
      ? [
          {
            key: 'second',
            options: minutes.map((v) => ({ value: v, label: v })),
            value: pad2(second),
            onChange: (v: string) => setSecond(Number(v)),
          },
        ]
      : []),
  ];

  return (
    <>
      <FieldTrigger
        size={size}
        open={open}
        disabled={disabled}
        hasValue={hasValue}
        display={<span className="tabular-nums">{value}</span>}
        placeholder={placeholder}
        clearable={clearable}
        clearLabel={messages.clearActionText}
        onClear={() => {
          onChange?.('');
          setOpen(false);
        }}
        onClick={() => !disabled && setOpen(true)}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setOpen(true);
          }
        }}
      />
      <Portal>
        <Overlay open={open} onClick={() => setOpen(false)}>
          <div className="flex h-full items-end">
            <MotionPanel
              variant="bottom"
              className="w-full rounded-t-[14px] bg-surface pb-safe shadow-overlay"
              onClick={(e) => e.stopPropagation()}
            >
              <SheetChrome
                title={placeholder}
                onCancel={() => setOpen(false)}
                onConfirm={confirm}
                cancelText={messages.cancelActionText}
                confirmText="完成"
              >
                <div className="px-3 pb-6 pt-1">
                  <PickerWheels
                    mode="drum"
                    maxVisibleRows={5}
                    columns={wheelColumns}
                  />
                </div>
              </SheetChrome>
            </MotionPanel>
          </div>
        </Overlay>
      </Portal>
    </>
  );
}
