'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AssessmentFile } from '@/content-layer/loader';
import { editorThemeFromDocument } from './editorSurface';
import { formatJavaScript } from './formatJavaScript';
import {
  AssessmentExecutionGate,
  type DraftFiles,
  type ExecutionStatus,
  type ValidatedRevision,
} from './executionGate';
import { hasValidJavaScriptSyntax } from './javascriptSyntax';
import { LegacyMonacoSurface } from './LegacyMonacoSurface';

const STATUS_LABELS: Record<ExecutionStatus, string> = {
  ready: 'Preview updated',
  editing: 'Editing…',
  checking: 'Checking syntax…',
  blocked: 'Fix syntax errors to update preview',
  running: 'Running…',
};

type FormatStatus = 'idle' | 'formatting' | 'error';

function initialDraftFiles(
  files: Readonly<Record<string, AssessmentFile>>,
  visibleFiles: readonly string[],
): DraftFiles {
  return Object.fromEntries(
    visibleFiles.flatMap((filePath) => {
      const file = files[filePath];
      return file ? [[filePath, file.code]] : [];
    }),
  );
}

function fileName(filePath: string): string {
  return filePath.split('/').filter(Boolean).at(-1) ?? filePath;
}

export interface AssessmentEditorProps {
  readonly files: Readonly<Record<string, AssessmentFile>>;
  readonly visibleFiles: readonly string[];
  readonly activeFile: string;
  readonly status: ExecutionStatus;
  readonly onStatusChange: (status: ExecutionStatus) => void;
  readonly onValidated: (revision: ValidatedRevision) => void;
}

export function AssessmentEditor({
  files,
  visibleFiles,
  activeFile,
  status,
  onStatusChange,
  onValidated,
}: AssessmentEditorProps): ReactNode {
  const [draftFiles, setDraftFiles] = useState<DraftFiles>(() =>
    initialDraftFiles(files, visibleFiles),
  );
  const [activePath, setActivePath] = useState(activeFile);
  const [formatStatus, setFormatStatus] = useState<FormatStatus>('idle');
  const draftFilesRef = useRef(draftFiles);

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

  useEffect(() => () => executionGate.dispose(), [executionGate]);

  const updateDraft = (filePath: string, code: string): void => {
    const next = { ...draftFilesRef.current, [filePath]: code };
    draftFilesRef.current = next;
    setDraftFiles(next);
    executionGate.schedule(next);
  };

  const formatActiveFile = async (): Promise<void> => {
    const file = files[activePath];
    if (file?.readOnly || formatStatus === 'formatting') return;

    setFormatStatus('formatting');
    try {
      const formatted = await formatJavaScript(draftFiles[activePath] ?? '');
      updateDraft(activePath, formatted);
      setFormatStatus('idle');
    } catch {
      setFormatStatus('error');
    }
  };

  const isReadOnly = files[activePath]?.readOnly ?? false;

  return (
    <section className="assessment-editor" aria-label="Assessment code editor">
      <div className="assessment-editor__tabs" role="tablist" aria-label="Exercise files">
        {visibleFiles.map((filePath) => (
          <button
            key={filePath}
            type="button"
            role="tab"
            aria-selected={activePath === filePath}
            className="assessment-editor__tab"
            data-active={activePath === filePath}
            onClick={() => setActivePath(filePath)}
          >
            {fileName(filePath)}
          </button>
        ))}
      </div>

      <div className="assessment-editor__toolbar">
        <span className="assessment-editor__status" data-status={status} role="status">
          {STATUS_LABELS[status]}
        </span>
        <button
          type="button"
          className="button button--ghost assessment-editor__format"
          disabled={isReadOnly || formatStatus === 'formatting'}
          onClick={() => void formatActiveFile()}
        >
          {formatStatus === 'formatting' ? 'Formatting…' : 'Format'}
        </button>
      </div>

      {formatStatus === 'error' ? (
        <p className="assessment-editor__format-error" role="status">
          Fix syntax, then format again.
        </p>
      ) : null}

      <div className="assessment-editor__surface">
        <LegacyMonacoSurface
          files={draftFiles}
          activePath={activePath}
          readOnly={isReadOnly}
          theme={editorThemeFromDocument(
            typeof document === 'undefined' ? undefined : document,
          )}
          onChange={updateDraft}
        />
      </div>
    </section>
  );
}
