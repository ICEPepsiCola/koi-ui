/**
 * Map a spacing prop to a CSS length.
 * Numbers follow the Tailwind scale (`n` → `calc(var(--spacing) * n)`).
 * Strings are used as-is (e.g. `"12px"`, `"1rem"`).
 */
export function toSpacingValue(
  value: number | string | undefined | null,
): string | undefined {
  if (value == null) return undefined;
  if (typeof value === 'number') {
    return `calc(var(--spacing) * ${value})`;
  }
  return value;
}
