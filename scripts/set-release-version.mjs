import fs from 'node:fs';
import path from 'node:path';

const version = process.argv[2];
if (!version) {
  console.error('Usage: node scripts/set-release-version.mjs <version>');
  process.exit(1);
}

const roots = ['packages/core', 'packages/hooks', 'packages/tokens'];

for (const dir of roots) {
  const pkgPath = path.join(dir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.version = version;
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log(`set ${pkg.name}@${version}`);
}
