import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
/** Icons + smoke tests must stay committed. LLM docs are CI/`doc:build` only. */
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

function listGeneratedFiles() {
  const tracked = execFileSync('git', ['ls-files', '--', ...GENERATED_TARGETS], {
    cwd: ROOT,
    encoding: 'utf8',
  })
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const explicit = GENERATED_TARGETS.flatMap((target) => {
    const absolutePath = path.join(ROOT, target);
    if (!fs.existsSync(absolutePath)) return [];
    if (fs.statSync(absolutePath).isFile()) return [target];
    return listFilesRecursive(absolutePath).map((file) =>
      path.relative(ROOT, file).replaceAll(path.sep, '/'),
    );
  });

  return [...new Set([...tracked, ...explicit])];
}

function listFilesRecursive(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFilesRecursive(absolutePath);
    return entry.isFile() ? [absolutePath] : [];
  });
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

const before = buildSignature(listGeneratedFiles());

run('pnpm', ['icons:generate']);
run('pnpm', ['tests:generate']);

const after = buildSignature(listGeneratedFiles());
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
