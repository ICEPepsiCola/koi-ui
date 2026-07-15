import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

const THRESHOLDS = {
  core: {
    lines: 50,
    statements: 45,
    functions: 40,
    branches: 35,
  },
  hooks: {
    lines: 25,
    statements: 35,
    functions: 10,
    branches: 65,
  },
};

const SUMMARY_FILES = {
  core: path.join(ROOT, 'packages/core/coverage/coverage-summary.json'),
  hooks: path.join(ROOT, 'packages/hooks/coverage/coverage-summary.json'),
};

function loadSummary(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')).total;
}

function checkPackage(name, summary, thresholds) {
  const failures = [];

  for (const [metric, min] of Object.entries(thresholds)) {
    const pct = Number(summary[metric]?.pct ?? 0);
    if (pct < min) {
      failures.push(`${name} ${metric} coverage ${pct}% is below required ${min}%`);
    }
  }

  return failures;
}

const failures = [];

for (const [name, filePath] of Object.entries(SUMMARY_FILES)) {
  const summary = loadSummary(filePath);
  failures.push(...checkPackage(name, summary, THRESHOLDS[name]));
}

if (failures.length > 0) {
  console.error('Coverage thresholds failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Coverage thresholds passed.');
