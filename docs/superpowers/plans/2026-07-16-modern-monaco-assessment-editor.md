# Modern Monaco Assessment Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the assessment's standalone Monaco surface with a locally served `modern-monaco` integration that auto-closes JSX tags, preserves IDE-style suggestions, and falls back without losing the learner's draft.

**Architecture:** `AssessmentEditor` remains the owner of tabs, drafts, formatting, and validated publication. A small surface contract isolates both Monaco implementations, while a singleton modern client owns the VS Code-compatible services and a resettable assessment workspace. Syntax safety moves to a pinned parser because `modern-monaco` exposes combined syntax and semantic markers rather than a syntax-only API.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 6.0.3, `modern-monaco` 0.4.2, `@babel/parser` 7.29.7, Vitest, Playwright, Sandpack 2.20.0

## Global Constraints

- Work directly on `main`; do not create a worktree or feature branch.
- Do not push any commit until the user explicitly asks.
- Pin `modern-monaco` to exactly `0.4.2`, TypeScript to exactly `6.0.3`, and `@babel/parser` to exactly `7.29.7`.
- Do not fetch editor modules, workers, themes, grammars, or type definitions from a public CDN at runtime.
- Preserve the 600 millisecond execution debounce and publish only syntactically valid snapshots.
- Preserve Sandpack execution, hidden tests, grading, progress, runtime restart, and the assessment test report.
- Keep the current `@monaco-editor/react` editor as a lazy, draft-preserving fallback during adoption.
- Keep the learner draft in `AssessmentEditor`; neither Monaco model store may become authoritative.
- Treat 30,188 KiB from the pre-migration `out/` directory as the static-output size baseline.
- Make each implementation commit local and limited to the task named in this plan.

---

### Task 1: Editor-independent JavaScript and JSX syntax validation

**Files:**
- Create: `src/assessment/javascriptSyntax.ts`
- Create: `tests/unit/javascriptSyntax.test.ts`
- Modify: `src/assessment/AssessmentEditor.tsx:3-102`
- Modify: `src/assessment/monacoSetup.ts:55-68`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: `DraftFiles = Readonly<Record<string, string>>` from `src/assessment/executionGate.ts`.
- Produces: `hasValidJavaScriptSyntax(files: DraftFiles, filePaths: readonly string[]): boolean`.

- [ ] **Step 1: Install the exact parser dependency**

Run:

```bash
npm install --save-exact @babel/parser@7.29.7
```

Expected: `package.json` and `package-lock.json` record `@babel/parser` as `7.29.7`.

- [ ] **Step 2: Write failing parser tests**

Create `tests/unit/javascriptSyntax.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { hasValidJavaScriptSyntax } from '@/assessment/javascriptSyntax';

describe('assessment JavaScript syntax validation', () => {
  it('accepts JavaScript with JSX and modern syntax', () => {
    const files = {
      '/App.js': `export default function App() {
        const title = 'Hello';
        return <section>{title}</section>;
      }`,
    };

    expect(hasValidJavaScriptSyntax(files, ['/App.js'])).toBe(true);
  });

  it('rejects incomplete JSX without treating semantic errors as syntax errors', () => {
    expect(hasValidJavaScriptSyntax({ '/App.js': 'export default () => <div' }, ['/App.js'])).toBe(false);
    expect(hasValidJavaScriptSyntax({ '/App.js': 'missingName()' }, ['/App.js'])).toBe(true);
  });

  it('validates every visible file and ignores missing paths', () => {
    const files = { '/App.js': 'export default 1', '/Card.js': 'export const Card = (' };
    expect(hasValidJavaScriptSyntax(files, ['/App.js', '/Card.js'])).toBe(false);
    expect(hasValidJavaScriptSyntax(files, ['/App.js', '/Missing.js'])).toBe(true);
  });
});
```

- [ ] **Step 3: Run the focused test and confirm the missing-module failure**

Run:

```bash
npm test -- tests/unit/javascriptSyntax.test.ts
```

Expected: FAIL because `@/assessment/javascriptSyntax` does not exist.

- [ ] **Step 4: Implement parser-backed validation**

Create `src/assessment/javascriptSyntax.ts`:

```ts
import { parse, type ParserPlugin } from '@babel/parser';
import type { DraftFiles } from './executionGate';

const PARSER_PLUGINS: ParserPlugin[] = [
  'jsx',
  'classProperties',
  'classPrivateProperties',
  'classPrivateMethods',
  'dynamicImport',
  'importMeta',
  'topLevelAwait',
];

function hasValidFileSyntax(source: string): boolean {
  try {
    parse(source, {
      sourceType: 'unambiguous',
      allowAwaitOutsideFunction: true,
      plugins: [...PARSER_PLUGINS],
    });
    return true;
  } catch {
    return false;
  }
}

export function hasValidJavaScriptSyntax(
  files: DraftFiles,
  filePaths: readonly string[],
): boolean {
  return filePaths.every((filePath) => {
    const source = files[filePath];
    return source === undefined || hasValidFileSyntax(source);
  });
}
```

In `AssessmentEditor`, remove the Monaco ref from the execution gate and use the candidate snapshot:

```ts
import { hasValidJavaScriptSyntax } from './javascriptSyntax';

const executionGate = useMemo(
  () =>
    new AssessmentExecutionGate({
      validate: async (candidateFiles) =>
        hasValidJavaScriptSyntax(candidateFiles, visibleFiles),
      publish: onValidated,
      onStatus: onStatusChange,
    }),
  [onStatusChange, onValidated, visibleFiles],
);
```

Delete `hasValidSyntax` from `monacoSetup.ts`; keep Monaco configuration and URI behavior intact.

- [ ] **Step 5: Run parser, gate, Monaco, and type checks**

Run:

```bash
npm test -- tests/unit/javascriptSyntax.test.ts tests/unit/executionGate.test.ts tests/unit/monacoSetup.test.ts
npm run typecheck
```

Expected: all focused tests pass and TypeScript reports no errors.

- [ ] **Step 6: Commit the syntax boundary**

```bash
git add package.json package-lock.json src/assessment/AssessmentEditor.tsx src/assessment/javascriptSyntax.ts src/assessment/monacoSetup.ts tests/unit/javascriptSyntax.test.ts
git commit -m "Decouple assessment syntax validation from Monaco"
```

---

### Task 2: Pin modern Monaco and serve every editor asset locally

**Files:**
- Create: `scripts/prepare-modern-monaco-assets.mjs`
- Create: `src/assessment/modernMonacoAssets.ts`
- Create: `tests/unit/modernMonacoAssets.test.ts`
- Modify: `app/layout.tsx:1-20`
- Modify: `.gitignore`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: `GITHUB_PAGES=true` and the repository base path `/upstack`.
- Produces: `modernMonacoImportMap(basePath: string): string` and static files below `/vendor/modern-monaco/`.

- [ ] **Step 1: Install exact editor and compiler versions**

Run:

```bash
npm install --save-exact modern-monaco@0.4.2 typescript@6.0.3
```

Expected: npm resolves the `modern-monaco` peer dependency without warnings and records both exact versions.

- [ ] **Step 2: Write failing import-map tests**

Create `tests/unit/modernMonacoAssets.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { modernMonacoImportMap } from '@/assessment/modernMonacoAssets';

describe('modern Monaco local assets', () => {
  it('maps editor core and LSP modules to local root assets', () => {
    const map = JSON.parse(modernMonacoImportMap(''));
    expect(map.imports).toEqual({
      'modern-monaco/editor-core': '/vendor/modern-monaco/editor-core.mjs',
      'modern-monaco/lsp': '/vendor/modern-monaco/lsp/index.mjs',
    });
  });

  it('includes the GitHub Pages base path', () => {
    const map = JSON.parse(modernMonacoImportMap('/upstack'));
    expect(map.imports['modern-monaco/editor-core']).toBe(
      '/upstack/vendor/modern-monaco/editor-core.mjs',
    );
  });
});
```

- [ ] **Step 3: Run the import-map test and confirm the missing-module failure**

Run:

```bash
npm test -- tests/unit/modernMonacoAssets.test.ts
```

Expected: FAIL because `modernMonacoAssets.ts` does not exist.

- [ ] **Step 4: Implement the import map and asset preparation script**

Create `src/assessment/modernMonacoAssets.ts`:

```ts
const VENDOR_PATH = '/vendor/modern-monaco';

export function modernMonacoImportMap(basePath: string): string {
  return JSON.stringify({
    imports: {
      'modern-monaco/editor-core': `${basePath}${VENDOR_PATH}/editor-core.mjs`,
      'modern-monaco/lsp': `${basePath}${VENDOR_PATH}/lsp/index.mjs`,
    },
  });
}
```

Create `scripts/prepare-modern-monaco-assets.mjs`:

```js
import { cp, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const editorCore = fileURLToPath(import.meta.resolve('modern-monaco/editor-core'));
const sourceDirectory = dirname(editorCore);
const targetDirectory = resolve('public/vendor/modern-monaco');

await mkdir(targetDirectory, { recursive: true });
await cp(sourceDirectory, targetDirectory, { recursive: true, force: true });
```

Add `/public/vendor/modern-monaco/` to `.gitignore`. Add these package scripts while retaining the existing commands:

```json
{
  "scripts": {
    "prepare:modern-monaco": "node scripts/prepare-modern-monaco-assets.mjs",
    "predev": "npm run prepare:modern-monaco",
    "prebuild": "npm run prepare:modern-monaco"
  }
}
```

In `app/layout.tsx`, place the import map before application scripts:

```tsx
import { modernMonacoImportMap } from '@/assessment/modernMonacoAssets';

const repositoryBasePath = process.env.GITHUB_PAGES === 'true' ? '/upstack' : '';

<head>
  <script
    type="importmap"
    dangerouslySetInnerHTML={{ __html: modernMonacoImportMap(repositoryBasePath) }}
  />
  <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
</head>
```

- [ ] **Step 5: Verify local assets and the TypeScript upgrade**

Run:

```bash
npm test -- tests/unit/modernMonacoAssets.test.ts
npm run prepare:modern-monaco
test -f public/vendor/modern-monaco/editor-core.mjs
test -f public/vendor/modern-monaco/editor-worker-main.mjs
test -f public/vendor/modern-monaco/lsp/typescript/setup.mjs
test -f public/vendor/modern-monaco/lsp/typescript/worker.mjs
npm run typecheck
```

Expected: both tests pass, every `test -f` exits 0, and TypeScript 6 reports no project errors.

- [ ] **Step 6: Commit the local asset pipeline**

```bash
git add .gitignore app/layout.tsx package.json package-lock.json scripts/prepare-modern-monaco-assets.mjs src/assessment/modernMonacoAssets.ts tests/unit/modernMonacoAssets.test.ts
git commit -m "Serve modern Monaco assets locally"
```

---

### Task 3: Extract the stable editor surface and legacy adapter

**Files:**
- Create: `src/assessment/editorSurface.ts`
- Create: `src/assessment/LegacyMonacoSurface.tsx`
- Create: `tests/unit/editorSurface.test.ts`
- Modify: `src/assessment/AssessmentEditor.tsx:1-186`
- Modify: `src/assessment/monacoSetup.ts:1-55`

**Interfaces:**
- Consumes: `DraftFiles`, stable assessment paths, and the existing Monaco setup helpers.
- Produces: `AssessmentEditorSurfaceProps`, `EditorTheme`, and `LegacyMonacoSurface`.

- [ ] **Step 1: Write failing surface-contract tests**

Create `tests/unit/editorSurface.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { activeDraftValue, editorThemeFromDocument } from '@/assessment/editorSurface';

describe('assessment editor surface contract', () => {
  it('reads the active file without inventing a missing value', () => {
    expect(activeDraftValue({ '/App.js': 'const app = 1' }, '/App.js')).toBe('const app = 1');
    expect(activeDraftValue({}, '/Missing.js')).toBe('');
  });

  it('uses the document theme when available and light during SSR', () => {
    expect(editorThemeFromDocument(undefined)).toBe('light');
    expect(editorThemeFromDocument({ documentElement: { dataset: { theme: 'dark' } } } as Document)).toBe('dark');
    expect(editorThemeFromDocument({ documentElement: { dataset: {} } } as Document)).toBe('light');
    vi.restoreAllMocks();
  });
});
```

- [ ] **Step 2: Run the contract test and confirm the missing-module failure**

Run:

```bash
npm test -- tests/unit/editorSurface.test.ts
```

Expected: FAIL because `editorSurface.ts` does not exist.

- [ ] **Step 3: Define the surface contract and helpers**

Create `src/assessment/editorSurface.ts`:

```ts
import type { DraftFiles } from './executionGate';

export type EditorTheme = 'light' | 'dark';

export interface AssessmentEditorSurfaceProps {
  readonly files: DraftFiles;
  readonly activePath: string;
  readonly readOnly: boolean;
  readonly theme: EditorTheme;
  readonly onChange: (filePath: string, code: string) => void;
  readonly onFailure?: (error: Error) => void;
}

export function activeDraftValue(files: DraftFiles, activePath: string): string {
  return files[activePath] ?? '';
}

export function editorThemeFromDocument(currentDocument: Document | undefined): EditorTheme {
  return currentDocument?.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}
```

- [ ] **Step 4: Move the existing Monaco implementation into the legacy adapter**

Create `LegacyMonacoSurface.tsx` with the existing loader configuration, worker configuration,
`configureMonaco`, editor options, stable model URI, and `saveViewState`:

```tsx
'use client';

import Editor, { loader } from '@monaco-editor/react';
import * as localMonaco from 'monaco-editor';
import type { ReactNode } from 'react';
import { activeDraftValue, type AssessmentEditorSurfaceProps } from './editorSurface';
import { configureMonaco, configureMonacoWorkers, modelUriFor } from './monacoSetup';

loader.config({ monaco: localMonaco });
configureMonacoWorkers();

export function LegacyMonacoSurface({
  files,
  activePath,
  readOnly,
  theme,
  onChange,
}: AssessmentEditorSurfaceProps): ReactNode {
  return (
    <Editor
      path={modelUriFor(activePath)}
      language="javascript"
      value={activeDraftValue(files, activePath)}
      saveViewState
      theme={theme === 'dark' ? 'vs-dark' : 'vs'}
      options={{
        automaticLayout: true,
        fixedOverflowWidgets: true,
        fontFamily: "'JetBrains Mono', 'SFMono-Regular', ui-monospace, Menlo, monospace",
        fontSize: 14,
        lineNumbers: 'on',
        minimap: { enabled: false },
        padding: { top: 14 },
        quickSuggestions: { comments: false, other: true, strings: true },
        readOnly,
        scrollBeyondLastLine: false,
        suggestOnTriggerCharacters: true,
        tabSize: 2,
        wordWrap: 'off',
      }}
      onMount={(editor, monaco) => {
        configureMonaco(monaco);
        editor.focus();
      }}
      onChange={(value) => onChange(activePath, value ?? '')}
    />
  );
}
```

Change `AssessmentEditor.updateDraft` to accept a path:

```ts
const updateDraft = (filePath: string, code: string): void => {
  const next = { ...draftFilesRef.current, [filePath]: code };
  draftFilesRef.current = next;
  setDraftFiles(next);
  executionGate.schedule(next);
};
```

Use `updateDraft(activePath, formatted)` in the formatting handler. Replace the inline `<Editor>`
with the legacy adapter while preserving the existing surface wrapper:

```tsx
<div className="assessment-editor__surface">
  <LegacyMonacoSurface
    files={draftFiles}
    activePath={activePath}
    readOnly={isReadOnly}
    theme={editorThemeFromDocument(typeof document === 'undefined' ? undefined : document)}
    onChange={updateDraft}
  />
</div>
```

Remove the Monaco loader, worker, and mount imports from `AssessmentEditor`; they now belong only
to `LegacyMonacoSurface`. The execution gate continues to validate the authoritative draft from
Task 1.

- [ ] **Step 5: Run the focused tests and type check**

Run:

```bash
npm test -- tests/unit/editorSurface.test.ts tests/unit/javascriptSyntax.test.ts tests/unit/monacoSetup.test.ts
npm run typecheck
```

Expected: focused tests pass and TypeScript reports no errors.

- [ ] **Step 6: Commit the legacy adapter seam**

```bash
git add src/assessment/AssessmentEditor.tsx src/assessment/LegacyMonacoSurface.tsx src/assessment/editorSurface.ts src/assessment/monacoSetup.ts tests/unit/editorSurface.test.ts
git commit -m "Extract assessment editor surface adapter"
```

---

### Task 4: Build the modern Monaco client and React surface

**Files:**
- Create: `src/assessment/modernMonacoClient.ts`
- Create: `src/assessment/ModernMonacoSurface.tsx`
- Create: `tests/unit/modernMonacoClient.test.ts`

**Interfaces:**
- Consumes: `modern-monaco.init`, `modern-monaco.Workspace`, `ASSESSMENT_REACT_TYPES`, and `AssessmentEditorSurfaceProps`.
- Produces: `initializeModernMonaco()`, `prepareModernAssessmentFiles(files)`, `modernModelPath(filePath)`, and `ModernMonacoSurface`.

- [ ] **Step 1: Write failing model-path and initialization-option tests**

Create `tests/unit/modernMonacoClient.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  modernModelPath,
  modernMonacoInitOptions,
  modernWorkspaceFiles,
  withTimeout,
} from '@/assessment/modernMonacoClient';

describe('modern Monaco assessment client', () => {
  afterEach(() => { vi.useRealTimers(); });

  it('uses JSX-aware virtual extensions for JavaScript assessment files', () => {
    expect(modernModelPath('/App.js')).toBe('/assessment/App.jsx');
    expect(modernModelPath('/components/Card.jsx')).toBe('/assessment/components/Card.jsx');
  });

  it('ships React declarations and compiler config in the local workspace', () => {
    const workspaceFiles = modernWorkspaceFiles({ '/App.js': 'export default () => <div />' });
    expect(workspaceFiles['/assessment/App.jsx']).toContain('<div />');
    expect(workspaceFiles['/node_modules/@types/react/index.d.ts']).toContain("declare module 'react'");
    expect(JSON.parse(workspaceFiles['/tsconfig.json'] ?? '{}').compilerOptions.types).toEqual([
      '/node_modules/@types/react/index.d.ts',
    ]);
  });

  it('uses only bundled themes and grammars', () => {
    const options = modernMonacoInitOptions();
    expect(typeof options.defaultTheme).toBe('object');
    expect(options.themes?.every((theme) => typeof theme === 'object')).toBe(true);
    expect(options.cdn).toBe('');
  });

  it('rejects initialization that exceeds the bounded timeout', async () => {
    vi.useFakeTimers();
    const pending = withTimeout(new Promise<never>(() => undefined), 25);
    await vi.advanceTimersByTimeAsync(25);
    await expect(pending).rejects.toThrow('Modern Monaco initialization timed out');
  });
});
```

- [ ] **Step 2: Run the client test and confirm the missing-module failure**

Run:

```bash
npm test -- tests/unit/modernMonacoClient.test.ts
```

Expected: FAIL because `modernMonacoClient.ts` does not exist.

- [ ] **Step 3: Implement the singleton client and resettable local workspace**

In `modernMonacoClient.ts`, define two local `TextmateTheme` objects named `upstack-light` and
`upstack-dark`, create one `Workspace({ name: 'upstack-assessment' })`, and initialize once:

```ts
import { errors, init, Workspace, type InitOptions, type TextmateTheme } from 'modern-monaco';
import type * as ModernMonaco from 'modern-monaco/editor-core';
import { ASSESSMENT_REACT_TYPES } from './monacoReactTypes';
import type { DraftFiles } from './executionGate';

const LIGHT_THEME: TextmateTheme = {
  name: 'upstack-light',
  type: 'light',
  colors: { 'editor.background': '#ffffff', 'editor.foreground': '#1d1d1f' },
  tokenColors: [],
};
const DARK_THEME: TextmateTheme = {
  name: 'upstack-dark',
  type: 'dark',
  colors: { 'editor.background': '#151515', 'editor.foreground': '#f5f5f7' },
  tokenColors: [],
};
const workspace = new Workspace({ name: 'upstack-assessment' });
let monacoPromise: Promise<typeof ModernMonaco> | undefined;
const INITIALIZATION_TIMEOUT_MS = 15_000;

export function withTimeout<Value>(promise: Promise<Value>, timeoutMs: number): Promise<Value> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error('Modern Monaco initialization timed out')),
      timeoutMs,
    );
    promise.then(
      (value) => { clearTimeout(timeout); resolve(value); },
      (error: unknown) => { clearTimeout(timeout); reject(error); },
    );
  });
}

export function modernModelPath(filePath: string): string {
  const normalized = filePath.replace(/^\/+/, '');
  const jsxPath = normalized.endsWith('.js') ? `${normalized.slice(0, -3)}.jsx` : normalized;
  return `/assessment/${jsxPath}`;
}

export function modernWorkspaceFiles(files: DraftFiles): Record<string, string> {
  return {
    ...Object.fromEntries(Object.entries(files).map(([path, code]) => [modernModelPath(path), code])),
    '/node_modules/@types/react/index.d.ts': ASSESSMENT_REACT_TYPES,
    '/tsconfig.json': JSON.stringify({
      compilerOptions: {
        allowJs: true,
        checkJs: true,
        jsx: 'react-jsx',
        module: 'esnext',
        moduleResolution: 'bundler',
        target: 'es2022',
        types: ['/node_modules/@types/react/index.d.ts'],
      },
    }),
  };
}

export function modernMonacoInitOptions(): InitOptions {
  return {
    cdn: '',
    defaultTheme: LIGHT_THEME,
    themes: [LIGHT_THEME, DARK_THEME],
    workspace,
    lsp: { formatting: { tabSize: 2, insertSpaces: true } },
  };
}

export function initializeModernMonaco(): Promise<typeof ModernMonaco> {
  monacoPromise ??= withTimeout(init(modernMonacoInitOptions()), INITIALIZATION_TIMEOUT_MS);
  return monacoPromise;
}
```

Add these helpers after `modernMonacoInitOptions`. They create parent directories, remove the old
assessment directory, and write every local workspace file before models are opened:

```ts
async function deleteDirectoryIfPresent(path: string): Promise<void> {
  try {
    await workspace.fs.delete(path, { recursive: true });
  } catch (error) {
    if (!(error instanceof errors.NotFound)) throw error;
  }
}

async function writeWorkspaceFile(path: string, content: string): Promise<void> {
  const directory = path.slice(0, path.lastIndexOf('/'));
  if (directory) await workspace.fs.createDirectory(directory);
  await workspace.fs.writeFile(path, content);
}

export async function prepareModernAssessmentFiles(files: DraftFiles): Promise<void> {
  await deleteDirectoryIfPresent('/assessment');
  const entries = Object.entries(modernWorkspaceFiles(files));
  await Promise.all(entries.map(([path, content]) => writeWorkspaceFile(path, content)));
}
```

Update the package import to include `errors`. Treat only `modern-monaco.errors.NotFound` as an
absent path; rethrow every other filesystem error.

- [ ] **Step 4: Implement `ModernMonacoSurface` with model and view-state lifecycle**

Implement the complete component with explicit editor, model, view-state, and external-draft refs:

```tsx
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type * as ModernMonaco from 'modern-monaco/editor-core';
import type { AssessmentEditorSurfaceProps } from './editorSurface';
import {
  initializeModernMonaco,
  modernModelPath,
  prepareModernAssessmentFiles,
} from './modernMonacoClient';

export function ModernMonacoSurface(props: AssessmentEditorSurfaceProps): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);
  const editorRef = useRef<ModernMonaco.editor.IStandaloneCodeEditor>();
  const modelsRef = useRef(new Map<string, ModernMonaco.editor.ITextModel>());
  const viewStatesRef = useRef(new Map<string, ModernMonaco.editor.ICodeEditorViewState | null>());
  const activePathRef = useRef(props.activePath);
  const isApplyingDraftRef = useRef(false);
  const [readyRevision, setReadyRevision] = useState(0);
  propsRef.current = props;

  useEffect(() => {
    let disposed = false;
    const disposables: ModernMonaco.IDisposable[] = [];

    void prepareModernAssessmentFiles(props.files)
      .then(() => initializeModernMonaco())
      .then((monaco) => {
        if (disposed || !containerRef.current) return;
        const editor = monaco.editor.create(containerRef.current, {
          automaticLayout: true,
          fixedOverflowWidgets: true,
          fontFamily: "'JetBrains Mono', 'SFMono-Regular', ui-monospace, Menlo, monospace",
          fontSize: 14,
          lineNumbers: 'on',
          minimap: { enabled: false },
          padding: { top: 14 },
          quickSuggestions: { comments: false, other: true, strings: true },
          readOnly: props.readOnly,
          scrollBeyondLastLine: false,
          suggestOnTriggerCharacters: true,
          tabSize: 2,
          theme: props.theme === 'dark' ? 'upstack-dark' : 'upstack-light',
          wordWrap: 'off',
        });
        editorRef.current = editor;

        for (const [path, code] of Object.entries(props.files)) {
          const uri = monaco.Uri.parse(`file://${modernModelPath(path)}`);
          monaco.editor.getModel(uri)?.dispose();
          const model = monaco.editor.createModel(code, 'jsx', uri);
          modelsRef.current.set(path, model);
        }
        editor.setModel(modelsRef.current.get(props.activePath) ?? null);
        disposables.push(editor.onDidChangeModelContent(() => {
          if (isApplyingDraftRef.current) return;
          const model = editor.getModel();
          if (model) propsRef.current.onChange(activePathRef.current, model.getValue());
        }));
        editor.focus();
        setReadyRevision((revision) => revision + 1);
      })
      .catch((cause: unknown) => {
        propsRef.current.onFailure?.(
          cause instanceof Error ? cause : new Error('Modern Monaco failed to initialize'),
        );
      });

    return () => {
      disposed = true;
      disposables.forEach((disposable) => disposable.dispose());
      editorRef.current?.dispose();
      editorRef.current = undefined;
      modelsRef.current.forEach((model) => model.dispose());
      modelsRef.current.clear();
      viewStatesRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const previousPath = activePathRef.current;
    viewStatesRef.current.set(previousPath, editor.saveViewState());
    activePathRef.current = props.activePath;
    editor.setModel(modelsRef.current.get(props.activePath) ?? null);
    const nextViewState = viewStatesRef.current.get(props.activePath);
    if (nextViewState) editor.restoreViewState(nextViewState);
    editor.updateOptions({ readOnly: props.readOnly });
    editor.focus();
  }, [props.activePath, props.readOnly, readyRevision]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.updateOptions({ readOnly: props.readOnly });
  }, [props.readOnly, readyRevision]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.updateOptions({ theme: props.theme === 'dark' ? 'upstack-dark' : 'upstack-light' });
  }, [props.theme, readyRevision]);

  useEffect(() => {
    isApplyingDraftRef.current = true;
    try {
      for (const [path, code] of Object.entries(props.files)) {
        const model = modelsRef.current.get(path);
        if (model && model.getValue() !== code) model.setValue(code);
      }
    } finally {
      isApplyingDraftRef.current = false;
    }
  }, [props.files, readyRevision]);

  return <div ref={containerRef} className="assessment-editor__modern-surface" />;
}
```

- [ ] **Step 5: Run client tests, type checks, and a production compilation**

Run:

```bash
npm test -- tests/unit/modernMonacoClient.test.ts tests/unit/editorSurface.test.ts
npm run typecheck
npm run build
```

Expected: tests and type checking pass; the static build completes and copies local editor assets.

- [ ] **Step 6: Commit the modern editor surface**

```bash
git add src/assessment/modernMonacoClient.ts src/assessment/ModernMonacoSurface.tsx tests/unit/modernMonacoClient.test.ts
git commit -m "Add modern Monaco assessment surface"
```

---

### Task 5: Add draft-preserving modern-to-legacy fallback

**Files:**
- Create: `src/assessment/EditorSurfaceBoundary.tsx`
- Create: `src/assessment/AssessmentEditorSurface.tsx`
- Create: `tests/unit/editorSurfaceBoundary.test.ts`
- Modify: `src/assessment/AssessmentEditor.tsx:1-186`

**Interfaces:**
- Consumes: `ModernMonacoSurface`, lazy `LegacyMonacoSurface`, and `AssessmentEditorSurfaceProps`.
- Produces: `AssessmentEditorSurface`, which defaults to modern and changes to legacy once after any modern failure.

- [ ] **Step 1: Write a failing boundary test**

Create `tests/unit/editorSurfaceBoundary.test.ts`:

```ts
// @vitest-environment jsdom
import { act, createElement, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EditorSurfaceBoundary } from '@/assessment/EditorSurfaceBoundary';

function BrokenSurface(): ReactNode {
  throw new Error('surface failed');
}

describe('editor surface failure boundary', () => {
  afterEach(() => { document.body.replaceChildren(); });

  it('reports a render failure and displays the recovery content', async () => {
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    const onFailure = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await act(async () => {
      root.render(createElement(
        EditorSurfaceBoundary,
        { fallback: createElement('p', null, 'Loading backup editor…'), onFailure },
        createElement(BrokenSurface),
      ));
    });

    expect(onFailure).toHaveBeenCalledWith(expect.objectContaining({ message: 'surface failed' }));
    expect(container.textContent).toContain('Loading backup editor…');
    consoleError.mockRestore();
    root.unmount();
  });
});
```

- [ ] **Step 2: Run the boundary test and confirm the missing-module failure**

Run:

```bash
npm test -- tests/unit/editorSurfaceBoundary.test.ts
```

Expected: FAIL because `EditorSurfaceBoundary.tsx` does not exist.

- [ ] **Step 3: Implement the scoped error boundary**

Create `EditorSurfaceBoundary.tsx`:

```tsx
'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  readonly children: ReactNode;
  readonly fallback: ReactNode;
  readonly onFailure: (error: Error) => void;
}

interface State { readonly failed: boolean; }

export class EditorSurfaceBoundary extends Component<Props, State> {
  override state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  override componentDidCatch(error: Error, _info: ErrorInfo): void {
    this.props.onFailure(error);
  }

  override render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
```

- [ ] **Step 4: Compose modern default and lazy legacy recovery**

Create `AssessmentEditorSurface.tsx`:

```tsx
'use client';

import { lazy, Suspense, useCallback, useState, type ReactNode } from 'react';
import type { AssessmentEditorSurfaceProps } from './editorSurface';
import { EditorSurfaceBoundary } from './EditorSurfaceBoundary';
import { ModernMonacoSurface } from './ModernMonacoSurface';

const LegacyMonacoSurface = lazy(async () => {
  const module = await import('./LegacyMonacoSurface');
  return { default: module.LegacyMonacoSurface };
});

export function AssessmentEditorSurface(props: AssessmentEditorSurfaceProps): ReactNode {
  const [useLegacy, setUseLegacy] = useState(false);
  const fallBack = useCallback(() => setUseLegacy(true), []);
  const loading = <p className="assessment-editor__loading">Loading editor…</p>;

  if (useLegacy) {
    return <Suspense fallback={loading}><LegacyMonacoSurface {...props} /></Suspense>;
  }

  return (
    <EditorSurfaceBoundary fallback={loading} onFailure={fallBack}>
      <ModernMonacoSurface {...props} onFailure={fallBack} />
    </EditorSurfaceBoundary>
  );
}
```

Replace the temporary legacy adapter in `AssessmentEditor` with `AssessmentEditorSurface`:

```tsx
import { AssessmentEditorSurface } from './AssessmentEditorSurface';
import { editorThemeFromDocument } from './editorSurface';

<div className="assessment-editor__surface">
  <AssessmentEditorSurface
    files={draftFiles}
    activePath={activePath}
    readOnly={isReadOnly}
    theme={editorThemeFromDocument(typeof document === 'undefined' ? undefined : document)}
    onChange={updateDraft}
  />
</div>
```

Remove the direct `LegacyMonacoSurface` import. Because the parent owns `draftFilesRef`, switching
surfaces reopens the latest code.

- [ ] **Step 5: Run boundary, editor, gate, and type checks**

Run:

```bash
npm test -- tests/unit/editorSurfaceBoundary.test.ts tests/unit/editorSurface.test.ts tests/unit/javascriptSyntax.test.ts tests/unit/executionGate.test.ts
npm run typecheck
```

Expected: all focused tests pass and TypeScript reports no errors.

- [ ] **Step 6: Commit fallback containment**

```bash
git add src/assessment/AssessmentEditor.tsx src/assessment/AssessmentEditorSurface.tsx src/assessment/EditorSurfaceBoundary.tsx tests/unit/editorSurfaceBoundary.test.ts
git commit -m "Add assessment editor fallback containment"
```

---

### Task 6: Prove tag closing, suggestions, offline assets, and runtime isolation in the browser

**Files:**
- Modify: `drive.e2e.mjs:1-158`
- Modify: `docs/superpowers/specs/2026-07-16-modern-monaco-assessment-editor-design.md`

**Interfaces:**
- Consumes: the built assessment route and the browser-visible Monaco editor.
- Produces: an end-to-end adoption gate that fails on public editor CDN access, missing JSX tag closing, missing suggestions, runtime crashes, draft loss, or regressions in grading.

- [ ] **Step 1: Extend the route guard to reject editor CDN requests**

Before the general proxy logic in `drive.e2e.mjs`, add:

```js
const EDITOR_CDN_HOSTS = new Set(['esm.sh', 'unpkg.com', 'cdn.jsdelivr.net']);
const blockedEditorRequests = [];

// Inside context.route, before proxying external requests:
const host = new URL(url).hostname;
if (EDITOR_CDN_HOSTS.has(host)) {
  blockedEditorRequests.push(url);
  await route.abort();
  return;
}
```

At the final assertions, fail if `blockedEditorRequests.length > 0`. This proves the editor did
not silently succeed by using a public package CDN.

- [ ] **Step 2: Add keystroke-driven JSX closing-tag checks**

Add a helper that uses Monaco's textarea and real keyboard input:

```js
async function assertClosingTag(opening, closing) {
  await replaceEditorContents('export default function UserCard() { return (');
  const input = page.locator('.assessment .monaco-editor textarea.inputarea').first();
  await input.pressSequentially(opening);
  await page.keyboard.press('>');
  await page.locator('.assessment .view-lines', { hasText: closing }).waitFor({ timeout: 10_000 });
}
```

Call it for native tags, component tags, and fragments, then check the self-closing case with real keys:

```js
await assertClosingTag('<section', '</section>');
await assertClosingTag('<UserCard', '</UserCard>');
await assertClosingTag('<', '</>');

await replaceEditorContents('export default function UserCard() { return (');
const editorInput = page.locator('.assessment .monaco-editor textarea.inputarea').first();
await editorInput.pressSequentially('<section></section>');
const editorText = await page.locator('.assessment .view-lines').innerText();
const closingTagCount = editorText.match(/<\/section>/g)?.length ?? 0;
closingTagCount === 1
  ? log('   -> Typing an existing close tag did not duplicate it')
  : fail(`expected one </section> tag, found ${closingTagCount}`);

await replaceEditorContents('export default function UserCard() { return (');
await editorInput.pressSequentially('<img /');
await page.keyboard.press('>');
const duplicateImageClose = await page.locator('.assessment .view-lines', { hasText: '</img>' }).count();
duplicateImageClose === 0
  ? log('   -> Self-closing JSX tag was not duplicated')
  : fail('modern Monaco inserted an invalid </img> closing tag');
```

- [ ] **Step 3: Add the suggestion-dropdown check**

Make the partial identifier the final text so paste leaves the caret in the correct position, then
open and inspect Monaco's dropdown:

```js
const SUGGESTION_SOURCE = `export default function UserCard() {
  const existingTitle = 'Ada';
  return exis`;

await replaceEditorContents(SUGGESTION_SOURCE);
await page.keyboard.press('ControlOrMeta+Space');
const suggestWidget = page.locator('.assessment .suggest-widget.visible');
await suggestWidget.waitFor({ state: 'visible', timeout: 10_000 });
await suggestWidget.getByText('existingTitle', { exact: true }).first().waitFor({ timeout: 10_000 });
await page.keyboard.press('Escape');
log('   -> Existing local symbol appears in the suggestion dropdown');
```

- [ ] **Step 4: Retain and run the runtime regression flow**

Before the main flow, prove initialization recovery in a fresh browser context:

```js
const fallbackContext = await browser.newContext({ viewport: { width: 1536, height: 960 } });
await fallbackContext.route('**/vendor/modern-monaco/editor-core.mjs', (route) => route.abort());
const fallbackPage = await fallbackContext.newPage();
await fallbackPage.goto(`${BASE}/learn/react/describing-ui/jsx/assessment`, {
  waitUntil: 'domcontentloaded',
});
await fallbackPage.locator('.assessment .monaco-editor').first().waitFor({
  state: 'visible',
  timeout: 30_000,
});
await fallbackContext.close();
log('   -> A forced modern-editor initialization failure loaded the legacy editor');
```

Keep the existing main-flow assertions in this order:

1. Starter report has individual failing checks.
2. Incomplete JSX reaches `blocked` without `.sandbox-error`.
3. A valid solution reaches `4 of 4 checks passed`.
4. `Restart preview` preserves `Ada Lovelace` in the editor.
5. Chapter progress persists after reload.
6. Browser console and page errors remain empty.

Run the app and browser harness:

```bash
npm run dev -- --port 3013
BASE_URL=http://localhost:3013 npm run e2e
```

Expected: `RESULT: ALL EXIT CRITERIA MET`, tag-closing and suggestion messages pass, and no editor
CDN request is recorded. Stop the dev server after the harness finishes.

- [ ] **Step 5: Run the complete repository verification**

Run:

```bash
npm test
npm run typecheck
npm run ci:content
npm run verify:smoke
npm run build
du -sk out
git diff --check
```

Expected: all unit tests pass, every solution/concept check passes, smoke validation passes, the
static production build completes, the new `out/` size is reported against the 30,188 KiB baseline,
and Git reports no whitespace errors.

- [ ] **Step 6: Record adoption and commit the browser gate**

After every gate passes, change the design document status to `Implemented and verified` and add
a verification note containing the exact successful commands from Step 5.

```bash
git add drive.e2e.mjs docs/superpowers/specs/2026-07-16-modern-monaco-assessment-editor-design.md
git commit -m "Verify modern Monaco assessment editor"
```

Do not push. Finish with `git status --short --branch` and report the local commits plus any measured
production-output size change.
