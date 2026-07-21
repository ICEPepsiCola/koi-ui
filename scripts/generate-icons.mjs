import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const ICONS_DIR = path.join(ROOT, 'packages/icons');
const VENDOR_DIR = path.join(ICONS_DIR, 'vendor/heroicons');
const SRC_DIR = path.join(ICONS_DIR, 'src');
const GROUPS = [
  ['16', 'solid'],
  ['20', 'solid'],
  ['24', 'outline'],
  ['24', 'solid'],
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  ensureDir(dir);
}

function toPascalCase(name) {
  return name
    .replace(/\.svg$/, '')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') + 'Icon';
}

function attrsToJsx(attrs) {
  return attrs
    .replace(/\s([a-z][a-z0-9-]*)=/g, (_, name) => {
      const map = {
        'aria-hidden': 'aria-hidden',
        'data-slot': 'data-slot',
        'fill-rule': 'fillRule',
        'clip-rule': 'clipRule',
        'stroke-width': 'strokeWidth',
        'stroke-linecap': 'strokeLinecap',
        'stroke-linejoin': 'strokeLinejoin',
        'xmlns': 'xmlns',
        'fill': 'fill',
        'viewBox': 'viewBox',
        'stroke': 'stroke',
        'd': 'd',
        'clipPath': 'clipPath',
      };
      return ` ${map[name] ?? name}=`;
    })
    .replace(/strokeWidth="([0-9.]+)"/g, 'strokeWidth={$1}')
    .replace(/aria-hidden="true"/g, 'aria-hidden={title ? undefined : true}');
}

function svgToBody(svg) {
  const svgMatch = svg.match(/<svg([^>]*)>([\s\S]*)<\/svg>/);
  if (!svgMatch) throw new Error('Invalid SVG');
  const rawAttrs = attrsToJsx(svgMatch[1] ?? '');
  const children = attrsToJsx((svgMatch[2] ?? '').trim())
    .replace(/\/>/g, ' />')
    .replace(/><\/path>/g, ' />')
    .replace(/><\/rect>/g, ' />')
    .replace(/><\/circle>/g, ' />')
    .replace(/><\/ellipse>/g, ' />')
    .replace(/><\/line>/g, ' />')
    .replace(/><\/polyline>/g, ' />')
    .replace(/><\/polygon>/g, ' />');

  return `<svg${rawAttrs} ref={ref} aria-labelledby={titleId} {...props}>\n      {title ? <title id={titleId}>{title}</title> : null}\n      ${children}\n    </svg>`;
}

function writeIcon(svgPath, outPath, componentName) {
  const svg = fs.readFileSync(svgPath, 'utf8');
  const body = svgToBody(svg);
  fs.writeFileSync(
    outPath,
    `import * as React from 'react';\n\nexport interface ${componentName}Props extends React.SVGProps<SVGSVGElement> {\n  title?: string;\n  titleId?: string;\n}\n\nexport const ${componentName} = React.forwardRef<SVGSVGElement, ${componentName}Props>(\n  ({ title, titleId, ...props }, ref) => (\n    ${body}\n  ),\n);\n\n${componentName}.displayName = '${componentName}';\n`,
  );
}

cleanDir(SRC_DIR);
const rootExports = [];
const defaultRootExports = [];

for (const [size, style] of GROUPS) {
  const vendorGroup = path.join(VENDOR_DIR, size, style);
  const outGroup = path.join(SRC_DIR, size, style);
  ensureDir(outGroup);

  const files = fs.readdirSync(vendorGroup)
    .filter((file) => file.endsWith('.svg'))
    .sort((a, b) => a.localeCompare(b));

  const groupExports = [];
  for (const file of files) {
    const componentName = toPascalCase(file);
    const outFile = `${componentName}.tsx`;
    writeIcon(path.join(vendorGroup, file), path.join(outGroup, outFile), componentName);
    const exportStatement = `export { ${componentName}, type ${componentName}Props } from './${componentName}';`;
    groupExports.push(exportStatement);
    if (size === '24' && style === 'outline') {
      defaultRootExports.push(`export { ${componentName}, type ${componentName}Props } from './24/outline/${componentName}';`);
    }
  }

  fs.writeFileSync(path.join(outGroup, 'index.ts'), `${groupExports.join('\n')}\n`);
  rootExports.push(`export * as Heroicons${size}${style.charAt(0).toUpperCase()}${style.slice(1)} from './${size}/${style}';`);
}

fs.writeFileSync(path.join(SRC_DIR, 'index.ts'), `${defaultRootExports.join('\n')}\n${rootExports.join('\n')}\n`);
console.log(`Generated Heroicons: ${GROUPS.map(([size, style]) => `${size}/${style}`).join(', ')}`);
