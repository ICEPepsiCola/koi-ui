import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@rstest/core';
import { render } from '@testing-library/react';
import { Title, Text, Paragraph } from '../src/components/Typography';

const themeCss = readFileSync(
  resolve(import.meta.dirname, '../../tokens/src/theme.css'),
  'utf8',
);

const trackingVars = [
  '--text-display-tracking',
  '--text-title-tracking',
  '--text-body-tracking',
  '--text-caption-tracking',
] as const;

const labelVars = [
  '--color-label',
  '--color-label-secondary',
  '--color-separator',
  '--color-fill',
  '--color-fill-secondary',
] as const;

test('theme.css defines typography tracking and label hierarchy tokens', () => {
  for (const v of [...trackingVars, ...labelVars]) {
    expect(themeCss).toContain(v);
  }
});

test('Title level 1 uses display tracking and leading tokens', () => {
  const { container } = render(<Title level={1}>Display</Title>);
  const el = container.querySelector('h1');
  expect(el?.className).toContain('--text-display-tracking');
  expect(el?.className).toContain('--text-display-leading');
});

test('Text xs uses caption tracking token', () => {
  const { container } = render(<Text size="xs">Caption</Text>);
  const el = container.querySelector('span');
  expect(el?.className).toContain('--text-caption-tracking');
});

test('Paragraph uses body tracking and leading tokens', () => {
  const { container } = render(<Paragraph>Body copy</Paragraph>);
  const el = container.querySelector('p');
  expect(el?.className).toContain('--text-body-tracking');
  expect(el?.className).toContain('--text-body-leading');
});
