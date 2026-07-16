'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type * as ModernMonaco from 'modern-monaco/editor-core';
import type { AssessmentEditorSurfaceProps } from './editorSurface';
import {
  initializeModernMonaco,
  modernModelPath,
  prepareModernAssessmentFiles,
} from './modernMonacoClient';

type ModernMonacoApi = typeof ModernMonaco;

function editorTheme(theme: AssessmentEditorSurfaceProps['theme']): string {
  return theme === 'dark' ? 'upstack-dark' : 'upstack-light';
}

function toModelUri(monaco: ModernMonacoApi, filePath: string): ModernMonaco.Uri {
  return monaco.Uri.parse(`file://${modernModelPath(filePath)}`);
}

export function ModernMonacoSurface(props: AssessmentEditorSurfaceProps): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);
  const monacoRef = useRef<ModernMonacoApi | undefined>(undefined);
  const editorRef = useRef<ModernMonaco.editor.IStandaloneCodeEditor | undefined>(undefined);
  const modelsRef = useRef(new Map<string, ModernMonaco.editor.ITextModel>());
  const viewStatesRef = useRef(
    new Map<string, ModernMonaco.editor.ICodeEditorViewState | null>(),
  );
  const activePathRef = useRef(props.activePath);
  const isApplyingDraftRef = useRef(false);
  const [readyRevision, setReadyRevision] = useState(0);
  propsRef.current = props;

  useEffect(() => {
    let isDisposed = false;
    const disposables: ModernMonaco.IDisposable[] = [];

    void prepareModernAssessmentFiles(props.files)
      .then(() => initializeModernMonaco())
      .then((monaco) => {
        if (isDisposed || !containerRef.current) return;

        monacoRef.current = monaco;
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
          theme: editorTheme(props.theme),
          wordWrap: 'off',
        });
        editorRef.current = editor;

        for (const [path, code] of Object.entries(props.files)) {
          const uri = toModelUri(monaco, path);
          monaco.editor.getModel(uri)?.dispose();
          const model = monaco.editor.createModel(code, 'jsx', uri);
          modelsRef.current.set(path, model);
        }

        editor.setModel(modelsRef.current.get(props.activePath) ?? null);
        disposables.push(
          editor.onDidChangeModelContent(() => {
            if (isApplyingDraftRef.current) return;
            const model = editor.getModel();
            if (model) propsRef.current.onChange(activePathRef.current, model.getValue());
          }),
        );
        editor.focus();
        setReadyRevision((revision) => revision + 1);
      })
      .catch((cause: unknown) => {
        propsRef.current.onFailure?.(
          cause instanceof Error ? cause : new Error('Modern Monaco failed to initialize'),
        );
      });

    return () => {
      isDisposed = true;
      disposables.forEach((disposable) => disposable.dispose());
      editorRef.current?.dispose();
      editorRef.current = undefined;
      monacoRef.current = undefined;
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
    editorRef.current?.updateOptions({ readOnly: props.readOnly });
  }, [props.readOnly, readyRevision]);

  useEffect(() => {
    monacoRef.current?.editor.setTheme(editorTheme(props.theme));
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
