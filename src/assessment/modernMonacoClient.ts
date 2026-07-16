import type { InitOptions, TextmateTheme, Workspace } from 'modern-monaco';
import type * as ModernMonaco from 'modern-monaco/editor-core';
import type { DraftFiles } from './executionGate';
import {
  AssessmentMemoryFileSystem,
  isAssessmentFileNotFoundError,
} from './assessmentMemoryFileSystem';
import { ASSESSMENT_REACT_TYPES } from './monacoReactTypes';

const INITIALIZATION_TIMEOUT_MS = 15_000;
const ASSESSMENT_ROOT = '/assessment';
const REACT_TYPES_PATH = '/node_modules/@types/react/index.d.ts';
const TSCONFIG_PATH = '/tsconfig.json';
const LOCAL_TYPE_ASSETS = {
  '/node_modules/@types/react/package.json': '/vendor/types/react/package.json',
  '/node_modules/@types/react/global.d.ts': '/vendor/types/react/global.d.ts',
  '/node_modules/@types/react/index.d.ts': '/vendor/types/react/index.d.ts',
  '/node_modules/@types/react/jsx-runtime.d.ts': '/vendor/types/react/jsx-runtime.d.ts',
  '/node_modules/@types/react/jsx-dev-runtime.d.ts': '/vendor/types/react/jsx-dev-runtime.d.ts',
  '/node_modules/csstype/package.json': '/vendor/types/csstype/package.json',
  '/node_modules/csstype/index.d.ts': '/vendor/types/csstype/index.d.ts',
} as const;

const LIGHT_TOKEN_COLORS = [
  { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#2f7d32' } },
  { scope: ['keyword', 'storage.type', 'storage.modifier'], settings: { foreground: '#0033b3' } },
  { scope: ['string', 'string.quoted'], settings: { foreground: '#a31515' } },
  { scope: ['constant.numeric', 'constant.language'], settings: { foreground: '#1750eb' } },
  { scope: ['entity.name.function', 'support.function'], settings: { foreground: '#00627a' } },
  { scope: ['entity.name.tag'], settings: { foreground: '#116329' } },
  { scope: ['entity.other.attribute-name'], settings: { foreground: '#7a3e9d' } },
  { scope: ['variable.other.readwrite', 'variable.parameter'], settings: { foreground: '#1d1d1f' } },
];

const DARK_TOKEN_COLORS = [
  { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#7ea86d' } },
  { scope: ['keyword', 'storage.type', 'storage.modifier'], settings: { foreground: '#82aaff' } },
  { scope: ['string', 'string.quoted'], settings: { foreground: '#c3e88d' } },
  { scope: ['constant.numeric', 'constant.language'], settings: { foreground: '#f78c6c' } },
  { scope: ['entity.name.function', 'support.function'], settings: { foreground: '#89ddff' } },
  { scope: ['entity.name.tag'], settings: { foreground: '#c792ea' } },
  { scope: ['entity.other.attribute-name'], settings: { foreground: '#ffcb6b' } },
  { scope: ['variable.other.readwrite', 'variable.parameter'], settings: { foreground: '#f5f5f7' } },
];

const LIGHT_THEME: TextmateTheme = {
  name: 'upstack-light',
  type: 'light',
  colors: {
    'editor.background': '#ffffff',
    'editor.foreground': '#1d1d1f',
    'editor.selectionBackground': '#dbeafe',
    'editor.lineHighlightBackground': '#f7f7f8',
  },
  tokenColors: LIGHT_TOKEN_COLORS,
};

const DARK_THEME: TextmateTheme = {
  name: 'upstack-dark',
  type: 'dark',
  colors: {
    'editor.background': '#151515',
    'editor.foreground': '#f5f5f7',
    'editor.selectionBackground': '#334155',
    'editor.lineHighlightBackground': '#1f1f1f',
  },
  tokenColors: DARK_TOKEN_COLORS,
};

const fileSystem = new AssessmentMemoryFileSystem();
let workspace: Workspace | undefined;
let packagePromise: Promise<typeof import('modern-monaco')> | undefined;
let monacoPromise: Promise<typeof ModernMonaco> | undefined;

interface ModernMonacoRuntime {
  MonacoEnvironment?: object;
}

export function configureModernMonacoEnvironment(runtime: ModernMonacoRuntime): void {
  runtime.MonacoEnvironment = {
    ...runtime.MonacoEnvironment,
    useBuiltinLSP: true,
  };
}

function loadModernMonacoPackage(): Promise<typeof import('modern-monaco')> {
  packagePromise ??= import('modern-monaco');
  return packagePromise;
}

function getWorkspace(WorkspaceConstructor: typeof import('modern-monaco').Workspace): Workspace {
  workspace ??= new WorkspaceConstructor({
    name: 'upstack-assessment',
    customFS: fileSystem,
  });
  return workspace;
}

export function withTimeout<Value>(promise: Promise<Value>, timeoutMs: number): Promise<Value> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error('Modern Monaco initialization timed out')),
      timeoutMs,
    );

    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

export function modernModelPath(filePath: string): string {
  const normalizedPath = filePath.replace(/^\/+/, '');
  const jsxPath = normalizedPath.endsWith('.js')
    ? `${normalizedPath.slice(0, -3)}.jsx`
    : normalizedPath;

  return `${ASSESSMENT_ROOT}/${jsxPath}`;
}

export function modernWorkspaceFiles(files: DraftFiles): Record<string, string> {
  const assessmentFiles = Object.entries(files).map(([path, code]) => [
    modernModelPath(path),
    code,
  ]);

  return {
    ...Object.fromEntries(assessmentFiles),
    [REACT_TYPES_PATH]: ASSESSMENT_REACT_TYPES,
    [TSCONFIG_PATH]: JSON.stringify({
      compilerOptions: {
        allowJs: true,
        checkJs: true,
        jsx: 'react-jsx',
        module: 'esnext',
        moduleResolution: 'bundler',
        target: 'es2022',
        types: [REACT_TYPES_PATH],
      },
    }),
  };
}

interface AssetResponse {
  ok: boolean;
  status: number;
  text(): Promise<string>;
}

type AssetFetcher = (url: string) => Promise<AssetResponse>;

export async function loadModernReactTypeFiles(
  basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '',
  fetchAsset: AssetFetcher = (url) => fetch(url),
): Promise<Record<string, string>> {
  const entries = await Promise.all(
    Object.entries(LOCAL_TYPE_ASSETS).map(async ([workspacePath, assetPath]) => {
      const response = await fetchAsset(`${basePath}${assetPath}`);
      if (!response.ok) {
        throw new Error(`Could not load local editor types (${response.status} ${assetPath})`);
      }
      return [workspacePath, await response.text()] as const;
    }),
  );

  return Object.fromEntries(entries);
}

export function modernMonacoInitOptions(): InitOptions {
  return {
    cdn: '',
    defaultTheme: LIGHT_THEME,
    themes: [LIGHT_THEME, DARK_THEME],
    lsp: { formatting: { tabSize: 2, insertSpaces: true } },
  };
}

async function deleteDirectoryIfPresent(path: string): Promise<void> {
  try {
    await fileSystem.delete(path, { recursive: true });
  } catch (error) {
    if (!isAssessmentFileNotFoundError(error)) throw error;
  }
}

async function writeWorkspaceFile(path: string, content: string): Promise<void> {
  const directory = path.slice(0, path.lastIndexOf('/'));
  if (directory) await fileSystem.createDirectory(directory);
  await fileSystem.writeFile(path, content);
}

export async function prepareModernAssessmentFiles(files: DraftFiles): Promise<void> {
  await deleteDirectoryIfPresent(ASSESSMENT_ROOT);
  const typeFiles = await loadModernReactTypeFiles();
  const entries = Object.entries({ ...modernWorkspaceFiles(files), ...typeFiles });
  await Promise.all(entries.map(([path, content]) => writeWorkspaceFile(path, content)));
}

export function initializeModernMonaco(): Promise<typeof ModernMonaco> {
  configureModernMonacoEnvironment(globalThis);
  monacoPromise ??= withTimeout(
    loadModernMonacoPackage().then(({ init, Workspace: WorkspaceConstructor }) =>
      init({
        ...modernMonacoInitOptions(),
        workspace: getWorkspace(WorkspaceConstructor),
      }),
    ),
    INITIALIZATION_TIMEOUT_MS,
  );
  return monacoPromise;
}
