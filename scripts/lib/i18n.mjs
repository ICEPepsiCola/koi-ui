/** Shared i18n helpers for docs generation. */

import fs from 'node:fs';
import path from 'node:path';

export const LANGS = ['en', 'zh'];

/**
 * @param {unknown} value
 * @param {string} prefix
 * @param {Record<string, Record<string, string>>} out
 */
export function flattenI18n(value, prefix, out = {}) {
  if (value == null) return out;

  const isLeaf =
    typeof value === 'object' &&
    !Array.isArray(value) &&
    ('en' in value || 'zh' in value) &&
    Object.keys(value).every((k) => k === 'en' || k === 'zh' || k === 'label');

  if (isLeaf) {
    out[prefix] = {
      en: value.en ?? value.zh ?? '',
      zh: value.zh ?? value.en ?? '',
    };
    return out;
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      const next = prefix ? `${prefix}.${key}` : key;
      flattenI18n(child, next, out);
    }
  }

  return out;
}

/**
 * @param {string} rootDir
 */
export function loadI18nTree(rootDir) {
  /** @type {Record<string, Record<string, string>>} */
  const flat = {};

  const commonPath = path.join(rootDir, 'common.json');
  if (fs.existsSync(commonPath)) {
    flattenI18n(JSON.parse(fs.readFileSync(commonPath, 'utf8')), 'common', flat);
  }

  const pagesDir = path.join(rootDir, 'pages');
  if (fs.existsSync(pagesDir)) {
    for (const file of fs.readdirSync(pagesDir)) {
      if (!file.endsWith('.json')) continue;
      const pageId = file.replace(/\.json$/, '');
      const data = JSON.parse(fs.readFileSync(path.join(pagesDir, file), 'utf8'));
      flattenI18n(data, `pages.${pageId}`, flat);
    }
  }

  return flat;
}

/**
 * @param {Record<string, Record<string, string>>} flat
 * @param {string} key
 * @param {'en' | 'zh'} lang
 * @param {string} [fallback]
 */
export function t(flat, key, lang, fallback = key) {
  const entry = flat[key];
  if (!entry) return fallback;
  return entry[lang] || entry.en || entry.zh || fallback;
}

/**
 * @param {string} dir
 */
export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/**
 * @param {string} filePath
 * @param {string} content
 */
export function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
}
