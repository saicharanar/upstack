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
