import { useEffect, useState } from 'react';
import { useKoiContext } from '../../provider/context';
import { Portal } from '../../utils/portal';
import type { FieldSize } from '../../utils/interaction';
import { FieldTrigger } from '../shared/FieldTrigger';
import { MotionPanel } from '../shared/MotionPanel';
import { Overlay } from '../shared/Overlay';
import { PickerWheels } from '../shared/PickerWheels';
import { SheetChrome } from '../shared/SheetChrome';
import { useScrollLock } from '../../hooks/useScrollLock';
import { getDaysInMonth, pad2, parseDate } from './dateUtils';

export interface BottomPickerViewProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
  clearable?: boolean;
  size?: FieldSize;
}

function buildYears(min?: string, max?: string) {
  const current = new Date().getFullYear();
  const start = min ? Number(min.slice(0, 4)) : current - 50;
  const end = max ? Number(max.slice(0, 4)) : current + 50;
  const years: number[] = [];
  for (let y = start; y <= end; y++) years.push(y);
  return years;
}

export function BottomPickerView({
  value,
  onChange,
  placeholder = '选择日期',
  disabled = false,
  min,
  max,
  clearable = false,
  size = 'md',
}: BottomPickerViewProps) {
  const { messages } = useKoiContext();
  const [open, setOpen] = useState(false);
  const parsed = parseDate(value) ?? new Date();
  const [year, setYear] = useState(parsed.getFullYear());
  const [month, setMonth] = useState(parsed.getMonth() + 1);
  const [day, setDay] = useState(parsed.getDate());

  const years = buildYears(min, max);
  const days = Array.from({ length: getDaysInMonth(year, month) }, (_, i) =>
    pad2(i + 1),
  );
  const hasValue = Boolean(value);

  useScrollLock(open);

  useEffect(() => {
    if (day > days.length) setDay(days.length);
  }, [day, days.length]);

  useEffect(() => {
    if (!open) return;
    const next = parseDate(value) ?? new Date();
    setYear(next.getFullYear());
    setMonth(next.getMonth() + 1);
    setDay(next.getDate());
  }, [open, value]);

  const confirm = () => {
    const next = `${year}-${pad2(month)}-${pad2(day)}`;
    if (min && next < min) return;
    if (max && next > max) return;
    onChange?.(next);
    setOpen(false);
  };

  const months = Array.from({ length: 12 }, (_, i) => pad2(i + 1));

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
              className="w-full rounded-t-box border border-border/80 bg-surface pb-safe shadow-overlay"
              onClick={(e) => e.stopPropagation()}
            >
              <SheetChrome
                title={placeholder}
                onCancel={() => setOpen(false)}
                onConfirm={confirm}
                cancelText={messages.cancelActionText}
              >
                <div className="px-2 pb-5 pt-1">
                  <PickerWheels
                    mode="drum"
                    maxVisibleRows={5}
                    columns={[
                      {
                        key: 'year',
                        options: years.map((y) => ({
                          value: String(y),
                          label: String(y),
                        })),
                        value: String(year),
                        onChange: (v) => setYear(Number(v)),
                      },
                      {
                        key: 'month',
                        options: months.map((m) => ({ value: m, label: m })),
                        value: pad2(month),
                        onChange: (v) => setMonth(Number(v)),
                      },
                      {
                        key: 'day',
                        options: days.map((d) => ({ value: d, label: d })),
                        value: pad2(day),
                        onChange: (v) => setDay(Number(v)),
                      },
                    ]}
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
