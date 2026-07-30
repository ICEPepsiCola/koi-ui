/**
 * Build-time parser: react-docgen-typescript over koi-ui component sources.
 * Falls back to exported `{Name}Options` / `{Name}Props` for imperative APIs.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import type { ApiDataMap, ComponentDoc, PluginApiTableOptions, PropDoc } from '../types';
import {
  collectComponentSourceFiles,
  resolveComponentSource,
} from './resolve-source';

const require = createRequire(import.meta.url);

function resolvePath(workspaceRoot: string, relOrAbs: string): string {
  return path.isAbsolute(relOrAbs)
    ? relOrAbs
    : path.resolve(workspaceRoot, relOrAbs);
}

function readTsConfig(tsconfigAbs: string): import('typescript').ParsedCommandLine {
  const ts = require('typescript') as typeof import('typescript');
  const configFile = ts.readConfigFile(tsconfigAbs, ts.sys.readFile);
  if (configFile.error) {
    throw new Error(
      ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n'),
    );
  }
  return ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(tsconfigAbs),
  );
}

function createParser(tsconfigAbs: string) {
  const { withCustomConfig } = require('react-docgen-typescript') as typeof import('react-docgen-typescript');
  return withCustomConfig(tsconfigAbs, {
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    shouldIncludePropTagMap: true,
    propFilter: (prop) => {
      if (prop.declarations?.length) {
        return prop.declarations.some(
          (declaration) => !declaration.fileName.includes('node_modules'),
        );
      }
      return true;
    },
  });
}

function tagValue(
  tags: Record<string, unknown> | undefined,
  name: string,
): string | undefined {
  const value = tags?.[name];
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    const first = value.find(
      (entry): entry is string => typeof entry === 'string' && Boolean(entry.trim()),
    );
    return first?.trim();
  }
  return undefined;
}

/**
 * react-docgen-typescript returns literal unions as
 * `{ name: "enum", raw: '"a" | "b"', value: [...] }`.
 * Prefer `raw` so API tables show the actual union, not the word "enum".
 */
function formatPropTypeName(prop: {
  type?: {
    name?: string;
    raw?: string;
    value?: Array<{ value?: string }>;
  };
}): string {
  const type = prop.type;
  if (!type) return 'unknown';

  if (type.name === 'enum') {
    if (type.raw && type.raw !== 'enum') return type.raw;
    if (Array.isArray(type.value) && type.value.length > 0) {
      return type.value
        .map((entry) => entry.value)
        .filter((value): value is string => Boolean(value))
        .join(' | ');
    }
  }

  // Intersection / complex aliases sometimes land in `raw` with a useless `name`.
  if (type.raw && (type.name === 'unknown' || !type.name)) {
    return type.raw;
  }

  return type.name ?? type.raw ?? 'unknown';
}

function toComponentDocs(
  docs: ReturnType<ReturnType<typeof createParser>['parse']>,
): ComponentDoc[] {
  return docs.map((doc) => ({
    displayName: doc.displayName,
    description: doc.description ?? '',
    since: tagValue(doc.tags, 'since'),
    props: Object.fromEntries(
      Object.entries(doc.props ?? {}).map(([propName, prop]) => [
        propName,
        {
          name: prop.name,
          required: Boolean(prop.required),
          description: prop.description ?? '',
          since: tagValue(prop.tags, 'since'),
          type: { name: formatPropTypeName(prop) },
          defaultValue: prop.defaultValue?.value
            ? { value: String(prop.defaultValue.value) }
            : undefined,
        },
      ]),
    ),
  }));
}

function docsHaveProps(docs: ComponentDoc[]): boolean {
  return docs.some((doc) => Object.keys(doc.props ?? {}).length > 0);
}

function preferDocsWithProps(docs: ComponentDoc[]): ComponentDoc[] {
  const withProps = docs.filter((doc) => Object.keys(doc.props ?? {}).length > 0);
  return withProps.length > 0 ? withProps : docs;
}

function stripUndefined(typeName: string): string {
  return typeName
    .replace(/\s*\|\s*undefined/g, '')
    .replace(/undefined\s*\|\s*/g, '')
    .trim();
}

function formatCheckerType(
  type: import('typescript').Type,
  checker: import('typescript').TypeChecker,
  ts: typeof import('typescript'),
  node?: import('typescript').Node,
): string {
  if (type.aliasSymbol) {
    const declared = checker.getDeclaredTypeOfSymbol(type.aliasSymbol);
    if (declared.isUnion?.()) {
      const parts = declared.types.filter(
        (part) => (part.flags & ts.TypeFlags.Undefined) === 0,
      );
      const allLiterals = parts.every(
        (part) =>
          Boolean(part.isStringLiteral?.()) ||
          Boolean(part.isNumberLiteral?.()) ||
          (part.flags & ts.TypeFlags.BooleanLiteral) !== 0,
      );
      if (allLiterals && parts.length > 0) {
        return parts
          .map((part) => {
            if (part.isStringLiteral?.()) return JSON.stringify(part.value);
            if (part.isNumberLiteral?.()) return String(part.value);
            if (part.flags & ts.TypeFlags.BooleanLiteral) {
              return checker.typeToString(part);
            }
            return checker.typeToString(part);
          })
          .join(' | ');
      }
    }
    // Keep named aliases like ReactNode / CSSProperties readable in tables.
    return type.aliasSymbol.getName();
  }

  if (type.isUnion?.()) {
    const parts = type.types
      .filter((part) => (part.flags & ts.TypeFlags.Undefined) === 0)
      .map((part) => formatCheckerType(part, checker, ts, node));
    if (parts.length) return parts.join(' | ');
  }

  if (type.isStringLiteral?.()) return JSON.stringify(type.value);
  if (type.isNumberLiteral?.()) return String(type.value);

  return stripUndefined(
    checker.typeToString(type, node, ts.TypeFormatFlags.NoTruncation),
  );
}

function jsDocDefault(node: import('typescript').Node, ts: typeof import('typescript')): string | undefined {
  const tags = ts.getJSDocTags(node);
  const defaultTag = tags.find((tag) => tag.tagName.text === 'default');
  if (!defaultTag?.comment) return undefined;
  if (typeof defaultTag.comment === 'string') {
    return defaultTag.comment.trim().replace(/^['"]|['"]$/g, '');
  }
  return ts.getTextOfJSDocComment(defaultTag.comment)?.trim().replace(/^['"]|['"]$/g, '');
}

function jsDocSince(
  node: import('typescript').Node,
  ts: typeof import('typescript'),
): string | undefined {
  const tag = ts
    .getJSDocTags(node)
    .find((entry) => entry.tagName.text === 'since');
  if (!tag?.comment) return undefined;
  if (typeof tag.comment === 'string') return tag.comment.trim();
  return ts.getTextOfJSDocComment(tag.comment)?.trim();
}

function jsDocDescription(node: import('typescript').Node, ts: typeof import('typescript')): string {
  const comments = ts.getJSDocCommentsAndTags(node);
  for (const entry of comments) {
    if (ts.isJSDoc(entry) && entry.comment) {
      const text =
        typeof entry.comment === 'string'
          ? entry.comment
          : ts.getTextOfJSDocComment(entry.comment);
      if (text?.trim()) return text.trim();
    }
  }
  return '';
}

/**
 * Imperative APIs (toast / loading) export Options interfaces but no React props.
 * Fall back to `{Name}Options` then `{Name}Props`.
 */
function extractOptionsInterfaceDoc(
  program: import('typescript').Program,
  sourcePath: string,
  componentName: string,
): ComponentDoc | null {
  const ts = require('typescript') as typeof import('typescript');
  const sourceFile = program.getSourceFile(sourcePath);
  if (!sourceFile) return null;

  const checker = program.getTypeChecker();
  const candidates = [`${componentName}Options`, `${componentName}Props`];

  for (const candidate of candidates) {
    for (const statement of sourceFile.statements) {
      if (!ts.isInterfaceDeclaration(statement)) continue;
      if (statement.name.text !== candidate) continue;
      if (
        !statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
      ) {
        continue;
      }

      const props: Record<string, PropDoc> = {};
      for (const member of statement.members) {
        if (!ts.isPropertySignature(member) || !member.name) continue;
        if (!ts.isIdentifier(member.name)) continue;

        const name = member.name.text;
        const optional = Boolean(member.questionToken);
        const type = member.type
          ? checker.getTypeFromTypeNode(member.type)
          : checker.getTypeAtLocation(member);
        const typeName = formatCheckerType(type, checker, ts, member);
        const defaultValue = jsDocDefault(member, ts);
        const since = jsDocSince(member, ts);

        props[name] = {
          name,
          required: !optional,
          description: jsDocDescription(member, ts),
          since,
          type: { name: typeName || 'unknown' },
          defaultValue: defaultValue ? { value: defaultValue } : undefined,
        };
      }

      if (!Object.keys(props).length) continue;

      return {
        displayName: componentName,
        description: jsDocDescription(statement, ts),
        since: jsDocSince(statement, ts),
        props,
      };
    }
  }

  return null;
}

function createTsProgram(tsconfigAbs: string): import('typescript').Program {
  const ts = require('typescript') as typeof import('typescript');
  const parsed = readTsConfig(tsconfigAbs);
  return ts.createProgram({
    rootNames: parsed.fileNames,
    options: parsed.options,
  });
}

export function collectSourceDependencyFiles(
  workspaceRoot: string,
  sourcePath: string,
  tsconfigAbs: string,
): string[] {
  const ts = require('typescript') as typeof import('typescript');
  const parsed = readTsConfig(tsconfigAbs);
  const workspaceAbs = path.resolve(workspaceRoot);
  const moduleResolutionCache = ts.createModuleResolutionCache(
    path.dirname(tsconfigAbs),
    (fileName) => fileName,
    parsed.options,
  );
  const dependencies = new Set<string>();
  const visited = new Set<string>();

  const isWorkspaceFile = (fileName: string) => {
    const normalized = path.resolve(fileName);
    return (
      normalized === workspaceAbs ||
      normalized.startsWith(`${workspaceAbs}${path.sep}`)
    ) && !normalized.includes(`${path.sep}node_modules${path.sep}`);
  };

  const resolveModule = (specifier: string, containingFile: string) => {
    const resolved = ts.resolveModuleName(
      specifier,
      containingFile,
      parsed.options,
      ts.sys,
      moduleResolutionCache,
    ).resolvedModule?.resolvedFileName;

    if (!resolved || !isWorkspaceFile(resolved)) return null;
    return path.resolve(resolved);
  };

  const visitFile = (fileName: string) => {
    const abs = path.resolve(fileName);
    if (visited.has(abs)) return;
    visited.add(abs);
    if (!fs.existsSync(abs)) return;

    dependencies.add(abs);
    const sourceFile = ts.createSourceFile(
      abs,
      fs.readFileSync(abs, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );

    const visitNode = (node: import('typescript').Node) => {
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        const resolved = resolveModule(node.moduleSpecifier.text, abs);
        if (resolved) visitFile(resolved);
      }

      if (
        ts.isImportTypeNode(node) &&
        ts.isLiteralTypeNode(node.argument) &&
        ts.isStringLiteral(node.argument.literal)
      ) {
        const resolved = resolveModule(node.argument.literal.text, abs);
        if (resolved) visitFile(resolved);
      }

      if (
        ts.isImportEqualsDeclaration(node) &&
        ts.isExternalModuleReference(node.moduleReference) &&
        ts.isStringLiteral(node.moduleReference.expression)
      ) {
        const resolved = resolveModule(node.moduleReference.expression.text, abs);
        if (resolved) visitFile(resolved);
      }

      ts.forEachChild(node, visitNode);
    };

    visitNode(sourceFile);
  };

  visitFile(sourcePath);
  return [...dependencies].sort();
}

export function computeFilesMtimeSignature(files: string[]): string | null {
  try {
    const mtimes: Record<string, number> = {};
    for (const abs of files) {
      mtimes[abs] = fs.statSync(abs).mtimeMs;
    }
    const sorted = Object.keys(mtimes).sort();
    const sigObj = sorted.map((k) => [k, mtimes[k]] as const);
    return crypto.createHash('sha1').update(JSON.stringify(sigObj)).digest('hex');
  } catch {
    return null;
  }
}

export function parseAll(
  options: PluginApiTableOptions,
  workspaceRoot: string,
  previous?: ApiDataMap,
): ApiDataMap {
  const tsconfigAbs = resolvePath(workspaceRoot, options.coreTsconfig);
  const componentNames = options.getComponentNames();
  const parser = createParser(tsconfigAbs);
  const result: ApiDataMap = {};
  let program: import('typescript').Program | null = null;

  const getProgram = () => {
    program ??= createTsProgram(tsconfigAbs);
    return program;
  };

  for (const componentName of componentNames) {
    const sourcePath = resolveComponentSource(workspaceRoot, componentName);
    const prev = previous?.[componentName];
    const sourceDependencies = fs.existsSync(sourcePath)
      ? collectSourceDependencyFiles(workspaceRoot, sourcePath, tsconfigAbs)
      : [sourcePath];
    const sourceSignature =
      computeFilesMtimeSignature([tsconfigAbs, ...sourceDependencies]) ?? '';

    if (!fs.existsSync(sourcePath)) {
      result[componentName] = {
        componentName,
        sourcePath,
        sourceSignature,
        docs: null,
      };
      continue;
    }

    if (
      prev &&
      prev.sourcePath === sourcePath &&
      prev.sourceSignature &&
      sourceSignature &&
      prev.sourceSignature === sourceSignature
    ) {
      result[componentName] = prev;
      continue;
    }

    try {
      let docs = preferDocsWithProps(toComponentDocs(parser.parse(sourcePath)));

      if (!docsHaveProps(docs)) {
        const ifaceDoc = extractOptionsInterfaceDoc(
          getProgram(),
          sourcePath,
          componentName,
        );
        if (ifaceDoc) docs = [ifaceDoc];
      }

      result[componentName] = {
        componentName,
        sourcePath,
        sourceSignature,
        docs,
      };
      if (options.debug) {
        console.log(
          `[plugin-api-table] parsed ${componentName}: ${docs.length} export(s)`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[plugin-api-table] parse failed for ${componentName}: ${message}`);
      result[componentName] = {
        componentName,
        sourcePath,
        sourceSignature,
        docs: null,
      };
    }
  }

  return result;
}

export function collectDependencyFiles(
  workspaceRoot: string,
  options: PluginApiTableOptions,
): string[] {
  const componentNames = options.getComponentNames();
  const tsconfigAbs = resolvePath(workspaceRoot, options.coreTsconfig);
  const files = new Set<string>([
    tsconfigAbs,
    ...collectComponentSourceFiles(workspaceRoot, componentNames).flatMap(
      (sourcePath) =>
        collectSourceDependencyFiles(workspaceRoot, sourcePath, tsconfigAbs),
    ),
    ...(options.watchFiles ?? []).map((file) =>
      resolvePath(workspaceRoot, file),
    ),
  ]);
  return [...files].sort();
}
