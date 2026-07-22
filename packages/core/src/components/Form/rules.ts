import type { RuleObject, StoreValue } from './types';

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const URL_RE = /^(https?:)?\/\/[^\s/$.?#].[^\s]*$/i;

function isEmpty(value: StoreValue, whitespace?: boolean): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') {
    return whitespace ? value.trim() === '' : value === '';
  }
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function valueLength(value: StoreValue): number | undefined {
  if (typeof value === 'string' || Array.isArray(value)) return value.length;
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  return undefined;
}

function defaultMessage(rule: RuleObject): string {
  if (rule.required) return 'This field is required';
  if (rule.type === 'email') return 'Please enter a valid email';
  if (rule.type === 'url') return 'Please enter a valid URL';
  if (rule.pattern) return 'Value does not match the pattern';
  if (rule.len !== undefined) return `Length must be ${rule.len}`;
  if (rule.min !== undefined && rule.max !== undefined) {
    return `Must be between ${rule.min} and ${rule.max}`;
  }
  if (rule.min !== undefined) return `Must be at least ${rule.min}`;
  if (rule.max !== undefined) return `Must be at most ${rule.max}`;
  return 'Validation failed';
}

async function runRule(rule: RuleObject, value: StoreValue): Promise<string | null> {
  if (rule.required && isEmpty(value, rule.whitespace)) {
    return rule.message ?? defaultMessage(rule);
  }

  // Skip other rules when empty (unless required already failed)
  if (isEmpty(value, rule.whitespace) && !rule.validator) {
    return null;
  }

  if (rule.type === 'email' && typeof value === 'string' && !EMAIL_RE.test(value)) {
    return rule.message ?? defaultMessage(rule);
  }

  if (rule.type === 'url' && typeof value === 'string' && !URL_RE.test(value)) {
    return rule.message ?? defaultMessage(rule);
  }

  if (rule.type === 'number' && value !== undefined && value !== null) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return rule.message ?? 'Please enter a number';
    }
  }

  if (rule.type === 'boolean' && typeof value !== 'boolean') {
    return rule.message ?? 'Please choose a boolean value';
  }

  if (rule.type === 'array' && !Array.isArray(value)) {
    return rule.message ?? 'Please select at least one item';
  }

  if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
    return rule.message ?? defaultMessage(rule);
  }

  const length = valueLength(value);
  if (length !== undefined) {
    if (rule.len !== undefined && length !== rule.len) {
      return rule.message ?? defaultMessage(rule);
    }
    if (rule.min !== undefined && length < rule.min) {
      return rule.message ?? defaultMessage(rule);
    }
    if (rule.max !== undefined && length > rule.max) {
      return rule.message ?? defaultMessage(rule);
    }
  }

  if (rule.validator) {
    try {
      await rule.validator(rule, value);
    } catch (err) {
      if (err instanceof Error && err.message) return err.message;
      if (typeof err === 'string') return err;
      return rule.message ?? defaultMessage(rule);
    }
  }

  return null;
}

export async function validateRules(
  rules: RuleObject[] | undefined,
  value: StoreValue,
): Promise<string[]> {
  if (!rules?.length) return [];
  const errors: string[] = [];
  for (const rule of rules) {
    const message = await runRule(rule, value);
    if (message) {
      errors.push(message);
      break; // first failure wins — clearer UX than stacking
    }
  }
  return errors;
}
