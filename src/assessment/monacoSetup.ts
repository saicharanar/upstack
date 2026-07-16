import type { Monaco } from '@monaco-editor/react';
import { ASSESSMENT_REACT_TYPES } from './monacoReactTypes';

const ASSESSMENT_MODEL_ROOT = 'file:///assessment/';
const REACT_TYPES_URI = 'file:///node_modules/@types/react/index.d.ts';
let isMonacoConfigured = false;

export function modelUriFor(filePath: string): string {
  const normalizedPath = filePath.replace(/^\/+/, '');
  return `${ASSESSMENT_MODEL_ROOT}${normalizedPath}`;
}

export function configureMonaco(monaco: Monaco): void {
  if (isMonacoConfigured) return;
  isMonacoConfigured = true;

  const javascript = monaco.languages.typescript.javascriptDefaults;
  javascript.setEagerModelSync(true);
  javascript.setCompilerOptions({
    allowJs: true,
    allowNonTsExtensions: true,
    checkJs: true,
    jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    target: monaco.languages.typescript.ScriptTarget.ES2022,
  });
  javascript.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });
  javascript.addExtraLib(ASSESSMENT_REACT_TYPES, REACT_TYPES_URI);
}

export function configureMonacoWorkers(): void {
  if (typeof self === 'undefined') return;

  self.MonacoEnvironment = {
    getWorker(_moduleId: string, label: string): Worker {
      if (label === 'typescript' || label === 'javascript') {
        return new Worker(
          new URL('monaco-editor/esm/vs/language/typescript/ts.worker.js', import.meta.url),
          { type: 'module' },
        );
      }

      return new Worker(
        new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url),
        { type: 'module' },
      );
    },
  };
}

export async function hasValidSyntax(monaco: Monaco, filePaths: readonly string[]): Promise<boolean> {
  const getWorker = await monaco.languages.typescript.getJavaScriptWorker();

  for (const filePath of filePaths) {
    const uri = monaco.Uri.parse(modelUriFor(filePath));
    const model = monaco.editor.getModel(uri);
    if (!model) continue;

    const worker = await getWorker(uri);
    const diagnostics = await worker.getSyntacticDiagnostics(uri.toString());
    if (diagnostics.length > 0) return false;
  }

  return true;
}
