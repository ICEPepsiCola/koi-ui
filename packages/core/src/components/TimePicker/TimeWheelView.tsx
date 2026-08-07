import { useEffect, useState } from 'react';
import { useKoiContext } from '../../provider/context';
import type { FieldSize } from '../../utils/interaction';
import { pad2 } from '../DatePicker/dateUtils';
import { FieldTrigger } from '../shared/FieldTrigger';
import { MotionPanel } from '../shared/MotionPanel';
import { Overlay } from '../shared/Overlay';
import { PickerWheels } from '../shared/PickerWheels';
import { Portal } from '../../utils/portal';
import { SheetChrome } from '../shared/SheetChrome';
import { useScrollLock } from '../../hooks/useScrollLock';
import type { TimePickerValue } from './TimePicker';
import {
  asSingleTime,
  displayTimeValue,
  emptyTimeValue,
  formatTime,
  parseTime,
} from './timeUtils';

export interface TimeWheelViewProps {
  value?: TimePickerValue;
  onChange?: (value: TimePickerValue) => void;
  placeholder?: string;
  disabled?: boolean;
  format?: 'HH:mm' | 'HH:mm:ss';
  clearable?: boolean;
  size?: FieldSize;
  range?: boolean;
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
  range = false,
}: TimeWheelViewProps) {
  const { messages, locale } = useKoiContext();
  const withSeconds = format === 'HH:mm:ss';
  const seed = asSingleTime(value);
  const parsed = parseTime(seed);
  const [open, setOpen] = useState(false);
  const [rangeStep, setRangeStep] = useState<'start' | 'end'>('start');
  const [rangeStart, setRangeStart] = useState('');
  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);
  const [second, setSecond] = useState(parsed.second);

  const hours = Array.from({ length: 24 }, (_, i) => pad2(i));
  const minutes = Array.from({ length: 60 }, (_, i) => pad2(i));
  const display = displayTimeValue(value, range);
  const hasValue = Boolean(display);

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const source =
      range && rangeStep === 'end' && rangeStart
        ? rangeStart
        : asSingleTime(value);
    const next = parseTime(source);
    setHour(next.hour);
    setMinute(next.minute);
    setSecond(next.second);
  }, [open, value, range, rangeStep, rangeStart]);

  useEffect(() => {
    if (!open) {
      setRangeStep('start');
      setRangeStart('');
    }
  }, [open]);

  const confirm = () => {
    const next = formatTime(hour, minute, second, withSeconds);
    if (range) {
      if (rangeStep === 'start') {
        setRangeStart(next);
        setRangeStep('end');
        return;
      }
      const ordered = rangeStart <= next ? [rangeStart, next] : [next, rangeStart];
      onChange?.(ordered as [string, string]);
      setOpen(false);
      return;
    }
    onChange?.(next);
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

  const title = range
    ? rangeStep === 'start'
      ? locale === 'en-US'
        ? 'Start time'
        : '开始时间'
      : locale === 'en-US'
        ? 'End time'
        : '结束时间'
    : placeholder;

  return (
    <>
      <FieldTrigger
        size={size}
        open={open}
        disabled={disabled}
        hasValue={hasValue}
        display={<span className="tabular-nums">{display}</span>}
        placeholder={placeholder}
        clearable={clearable}
        clearLabel={messages.clearActionText}
        onClear={() => {
          onChange?.(emptyTimeValue(range));
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
        <Overlay
          open={open}
          onClick={() => setOpen(false)}
          className="grid place-items-end"
        >
          <MotionPanel
            variant="bottom"
            onClick={(e) => e.stopPropagation()}
          >
              <SheetChrome
                title={title}
                onCancel={() => setOpen(false)}
                onConfirm={confirm}
                cancelText={messages.cancelActionText}
                confirmText={
                  range && rangeStep === 'start'
                    ? locale === 'en-US'
                      ? 'Next'
                      : '下一步'
                    : locale === 'en-US'
                      ? 'Done'
                      : '完成'
                }
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
        </Overlay>
      </Portal>
    </>
  );
}
