import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const GENERATED_TARGETS = [
  'packages/core/tests/components',
  'packages/icons/src',
];

function run(command, args) {
  execFileSync(command, args, {
    cwd: ROOT,
    stdio: 'inherit',
  });
}

function listTrackedFiles() {
  return execFileSync('git', ['ls-files', '--', ...GENERATED_TARGETS], {
    cwd: ROOT,
    encoding: 'utf8',
  })
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function buildSignature(files) {
  return new Map(
    files.map((file) => {
      const absolutePath = path.join(ROOT, file);
      const hash = fs.existsSync(absolutePath)
        ? createHash('sha1').update(fs.readFileSync(absolutePath)).digest('hex')
        : 'missing';
      return [file, hash];
    }),
  );
}

function getChangedFiles(before, after) {
  return [...new Set([...before.keys(), ...after.keys()])].filter(
    (file) => before.get(file) !== after.get(file),
  );
}

const files = listTrackedFiles();
const before = buildSignature(files);

run('pnpm', ['icons:generate']);
run('pnpm', ['tests:generate']);

const after = buildSignature(files);
const changedFiles = getChangedFiles(before, after);

if (changedFiles.length > 0) {
  console.error('Generated files changed after regeneration:');
  for (const file of changedFiles) {
    console.error(`- ${file}`);
  }
  console.error(
    'Commit regenerated outputs from `pnpm icons:generate` or `pnpm tests:generate`.',
  );
  process.exit(1);
}

console.log('Generated files are up to date.');
