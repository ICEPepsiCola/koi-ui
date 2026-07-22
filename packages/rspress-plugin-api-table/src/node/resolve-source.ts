import fs from 'node:fs';
import path from 'node:path';

const PRIMITIVE_COMPONENTS = new Set(['Box', 'Stack']);

export function resolveComponentSource(
  workspaceRoot: string,
  componentName: string,
): string {
  if (PRIMITIVE_COMPONENTS.has(componentName)) {
    return path.join(
      workspaceRoot,
      `packages/core/src/primitives/${componentName}.tsx`,
    );
  }
  return path.join(
    workspaceRoot,
    `packages/core/src/components/${componentName}/${componentName}.tsx`,
  );
}

export function collectComponentSourceFiles(
  workspaceRoot: string,
  componentNames: string[],
): string[] {
  return componentNames
    .map((name) => resolveComponentSource(workspaceRoot, name))
    .filter((file) => fs.existsSync(file));
}
