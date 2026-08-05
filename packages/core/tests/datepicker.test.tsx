import { expect, test } from '@rstest/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { DatePicker } from '../src/components/DatePicker';
import {
  formatWeek,
  getDateOfISOWeek,
  getISOWeekParts,
} from '../src/components/DatePicker/dateUtils';
import { TimePicker } from '../src/components/TimePicker';
import { KoiProvider } from '../src/provider';
import { BREAKPOINTS } from '@koi-ui/hooks';
import { mockWidth } from './setup';

test('date utils format ISO weeks', () => {
  const monday = getDateOfISOWeek(2026, 1);
  const parts = getISOWeekParts(monday);
  expect(parts.year).toBe(2026);
  expect(parts.week).toBe(1);
  expect(formatWeek(monday)).toBe('2026-W01');
});

test('DatePicker year mode selects YYYY', async () => {
  mockWidth(BREAKPOINTS.xl);
  let selected = '';

  function Harness() {
    const [value, setValue] = useState('');
    return (
      <KoiProvider>
        <DatePicker
          picker="year"
          value={value}
          onChange={(next) => {
            selected = typeof next === 'string' ? next : '';
            setValue(typeof next === 'string' ? next : '');
          }}
          placeholder="年"
        />
      </KoiProvider>
    );
  }

  render(<Harness />);
  fireEvent.click(screen.getByRole('button', { name: /年/ }));
  fireEvent.click(screen.getByRole('button', { name: '2026' }));

  await waitFor(() => {
    expect(selected).toBe('2026');
  });
});

test('DatePicker month mode selects YYYY-MM', async () => {
  mockWidth(BREAKPOINTS.xl);
  let selected = '';

  function Harness() {
    const [value, setValue] = useState('2026-01');
    return (
      <KoiProvider>
        <DatePicker
          picker="month"
          value={value}
          onChange={(next) => {
            selected = typeof next === 'string' ? next : '';
            setValue(typeof next === 'string' ? next : '');
          }}
          placeholder="月"
        />
      </KoiProvider>
    );
  }

  render(<Harness />);
  fireEvent.click(screen.getByRole('button', { name: /月|2026-01/ }));
  fireEvent.click(screen.getByRole('button', { name: '7月' }));

  await waitFor(() => {
    expect(selected).toBe('2026-07');
  });
});

test('DatePicker range selects start and end', async () => {
  mockWidth(BREAKPOINTS.xl);
  let selected: [string, string] = ['', ''];

  function Harness() {
    const [value, setValue] = useState<[string, string]>(['', '']);
    return (
      <KoiProvider>
        <DatePicker
          range
          value={value}
          onChange={(next) => {
            if (Array.isArray(next)) {
              selected = next;
              setValue(next);
            }
          }}
          placeholder="范围"
        />
      </KoiProvider>
    );
  }

  render(<Harness />);
  fireEvent.click(screen.getByRole('button', { name: /范围/ }));

  const days = screen
    .getAllByRole('button')
    .filter((btn) => btn.textContent === '10' || btn.textContent === '15');
  expect(days.length).toBeGreaterThanOrEqual(2);
  fireEvent.click(days[0]!);
  fireEvent.click(days.find((btn) => btn.textContent === '15') ?? days[1]!);

  await waitFor(() => {
    expect(selected[0]).toBeTruthy();
    expect(selected[1]).toBeTruthy();
    expect(selected[0] <= selected[1]).toBe(true);
  });
});

test('DatePicker disabledDate grays out and blocks selection', async () => {
  mockWidth(BREAKPOINTS.xl);
  let selected = '';

  function Harness() {
    const [value, setValue] = useState('');
    return (
      <KoiProvider>
        <DatePicker
          value={value}
          onChange={(next) => {
            selected = typeof next === 'string' ? next : '';
            setValue(typeof next === 'string' ? next : '');
          }}
          disabledDate={(date) => date.getDay() !== 2}
          placeholder="开奖日"
        />
      </KoiProvider>
    );
  }

  render(<Harness />);
  fireEvent.click(screen.getByRole('button', { name: /开奖日/ }));

  const wednesday = screen
    .getAllByRole('button')
    .find((btn) => {
      const label = btn.getAttribute('aria-label') ?? '';
      if (!label) return false;
      const date = new Date(label);
      return !Number.isNaN(date.getTime()) && date.getDay() === 3;
    });
  expect(wednesday).toBeTruthy();
  expect(wednesday).toBeDisabled();
  fireEvent.click(wednesday!);
  expect(selected).toBe('');

  const tuesday = screen
    .getAllByRole('button')
    .find((btn) => {
      const label = btn.getAttribute('aria-label') ?? '';
      if (!label) return false;
      const date = new Date(label);
      return !Number.isNaN(date.getTime()) && date.getDay() === 2;
    });
  expect(tuesday).toBeTruthy();
  fireEvent.click(tuesday!);
  await waitFor(() => {
    expect(selected).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

test('TimePicker range selects start and end on desktop', async () => {
  mockWidth(BREAKPOINTS.xl);
  let selected: [string, string] = ['', ''];

  function Harness() {
    const [value, setValue] = useState<[string, string]>(['', '']);
    return (
      <KoiProvider>
        <TimePicker
          range
          value={value}
          onChange={(next) => {
            if (Array.isArray(next)) {
              selected = next;
              setValue(next);
            }
          }}
          placeholder="时间范围"
        />
      </KoiProvider>
    );
  }

  render(<Harness />);
  fireEvent.click(screen.getByRole('button', { name: /时间范围/ }));
  fireEvent.click(screen.getByRole('button', { name: '下一步' }));
  fireEvent.click(screen.getByRole('button', { name: '确定' }));

  await waitFor(() => {
    expect(selected[0]).toMatch(/^\d{2}:\d{2}$/);
    expect(selected[1]).toMatch(/^\d{2}:\d{2}$/);
  });
});
