import { init, Workspace, type InitOptions, type TextmateTheme } from 'modern-monaco';
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

const LIGHT_THEME: TextmateTheme = {
  name: 'upstack-light',
  type: 'light',
  colors: {
    'editor.background': '#ffffff',
    'editor.foreground': '#1d1d1f',
    'editor.selectionBackground': '#dbeafe',
    'editor.lineHighlightBackground': '#f7f7f8',
  },
  tokenColors: [],
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
  tokenColors: [],
};

const fileSystem = new AssessmentMemoryFileSystem();
let workspace: Workspace | undefined;
let monacoPromise: Promise<typeof ModernMonaco> | undefined;

function getWorkspace(): Workspace {
  workspace ??= new Workspace({ name: 'upstack-assessment', customFS: fileSystem });
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
  const entries = Object.entries(modernWorkspaceFiles(files));
  await Promise.all(entries.map(([path, content]) => writeWorkspaceFile(path, content)));
}

export function initializeModernMonaco(): Promise<typeof ModernMonaco> {
  monacoPromise ??= withTimeout(
    init({ ...modernMonacoInitOptions(), workspace: getWorkspace() }),
    INITIALIZATION_TIMEOUT_MS,
  );
  return monacoPromise;
}
