/** Serializable prop doc for runtime rendering. */

export interface PropDoc {
  name: string;
  required?: boolean;
  description?: string;
  /** Version that introduced this API, sourced from `@since`. */
  since?: string;
  type: { name: string };
  defaultValue?: { value?: string };
}

export interface ComponentDoc {
  displayName?: string;
  description?: string;
  /** Version that introduced this API, sourced from `@since`. */
  since?: string;
  props?: Record<string, PropDoc>;
}

export interface ParsedComponent {
  componentName: string;
  sourcePath: string;
  docs: ComponentDoc[] | null;
}

/** Injected into the runtime virtual module. */
export interface ApiDataMap {
  [componentName: string]: ParsedComponent;
}

export interface PluginApiTableOptions {
  /** Returns all component export names, e.g. from `docs/catalog.ts`. */
  getComponentNames: () => string[];

  /** Path to core tsconfig (relative to workspace root or absolute). */
  coreTsconfig: string;

  /** Extra files to watch for HMR (e.g. catalog.ts). */
  watchFiles?: string[];

  debug?: boolean;
}
