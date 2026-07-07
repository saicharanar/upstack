'use client';

import { useMemo, type ReactNode } from 'react';
import { useActiveCode } from '@codesandbox/sandpack-react';
import Editor, { type Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

const MONACO_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  automaticLayout: true,
  bracketPairColorization: { enabled: true },
  cursorBlinking: 'smooth',
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  fontSize: 14,
  formatOnPaste: false,
  formatOnType: false,
  minimap: { enabled: false },
  padding: { top: 16, bottom: 16 },
  scrollBeyondLastLine: false,
  tabSize: 2,
  wordWrap: 'off',
};

function configureMonaco(monaco: Monaco): void {
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    allowJs: true,
    allowNonTsExtensions: true,
    checkJs: false,
    jsx: monaco.languages.typescript.JsxEmit.React,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    target: monaco.languages.typescript.ScriptTarget.ES2020,
  });

  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false,
  });
}

export function AssessmentMonacoEditor(): ReactNode {
  const { code, readOnly, updateCode } = useActiveCode();
  const options = useMemo(
    () => ({
      ...MONACO_OPTIONS,
      readOnly,
    }),
    [readOnly],
  );

  return (
    <Editor
      className="assessment-monaco"
      defaultLanguage="javascript"
      height="100%"
      loading={<p className="assessment-monaco__loading">Loading editor...</p>}
      onChange={(value) => updateCode(value ?? '', true)}
      beforeMount={configureMonaco}
      options={options}
      path="/App.jsx"
      theme="vs-light"
      value={code}
    />
  );
}
