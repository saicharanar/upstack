'use client';

import {
  SandpackConsole,
  SandpackPreview,
  SandpackProvider,
  SandpackTests,
  type SandpackPredefinedTemplate,
  type SandpackPredefinedTheme,
} from '@codesandbox/sandpack-react';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import type { AssessmentBundle } from '@/content-layer/loader';
import { AssessmentEditor } from './AssessmentEditor';
import { AssessmentTestReport } from './AssessmentTestReport';
import type { ExecutionStatus, ValidatedRevision } from './executionGate';
import type { GradeResult } from './grade';
import { SandpackBoundary } from './SandpackBoundary';
import { mergeValidatedDraft, toSandpackFiles } from './sandpackFiles';
import { useAssessmentResult, type SandpackSpecs } from './useAssessmentResult';

function initialTheme(): SandpackPredefinedTheme {
  if (typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark') {
    return 'dark';
  }
  return 'light';
}

interface RuntimePaneProps {
  readonly result: GradeResult | null;
  readonly nextHref: string | null;
  readonly isRunning: boolean;
  readonly onComplete: (specs: SandpackSpecs) => void;
  readonly onRestart: () => void;
}

function RuntimePane({
  result,
  nextHref,
  isRunning,
  onComplete,
  onRestart,
}: RuntimePaneProps): ReactNode {
  const [view, setView] = useState<'preview' | 'console'>('preview');

  return (
    <PanelGroup direction="vertical" className="lab__rows" autoSaveId="upstack-lab-rows">
      <Panel defaultSize={48} minSize={16} className="lab__preview">
        <div className="lab__preview-bar">
          <span className="lab__preview-label">{view === 'preview' ? 'Live preview' : 'Console'}</span>
          <div className="lab__view-toggle" role="tablist" aria-label="Preview or console">
            <button
              type="button"
              role="tab"
              aria-selected={view === 'preview'}
              data-active={view === 'preview'}
              onClick={() => setView('preview')}
            >
              Preview
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'console'}
              data-active={view === 'console'}
              onClick={() => setView('console')}
            >
              Console
            </button>
          </div>
          <button type="button" className="lab__restart" onClick={onRestart}>
            Restart preview
          </button>
        </div>

        <div className="lab__preview-stage" data-view={view}>
          <div className="lab__view lab__view--preview">
            <SandpackPreview showOpenInCodeSandbox={false} />
          </div>
          <div className="lab__view lab__view--console">
            <SandpackConsole resetOnPreviewRestart showSyntaxError />
          </div>
        </div>
      </Panel>

      <PanelResizeHandle className="lab__handle lab__handle--horizontal" />

      <Panel defaultSize={52} minSize={20} className="lab__tests">
        <div className="assessment-test-engine" aria-hidden="true">
          <SandpackTests
            hideTestsAndSupressLogs
            showVerboseButton={false}
            showWatchButton={false}
            onComplete={(specs) => onComplete(specs as unknown as SandpackSpecs)}
          />
        </div>
        <AssessmentTestReport result={result} isRunning={isRunning} nextHref={nextHref} />
      </Panel>
    </PanelGroup>
  );
}

export interface AssessmentRunnerProps {
  readonly bundle: AssessmentBundle;
  readonly chapterId: string;
  readonly nextHref: string | null;
}

export default function AssessmentRunner({
  bundle,
  chapterId,
  nextHref,
}: AssessmentRunnerProps): ReactNode {
  const { result, onComplete } = useAssessmentResult(bundle.meta, chapterId);
  const initialFiles = useMemo(() => toSandpackFiles(bundle.files), [bundle.files]);
  const [runtimeFiles, setRuntimeFiles] = useState(initialFiles);
  const [runtimeKey, setRuntimeKey] = useState(0);
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>('running');
  const [theme] = useState<SandpackPredefinedTheme>(initialTheme);
  const options = useMemo(
    () => ({ visibleFiles: [...bundle.visibleFiles], activeFile: bundle.activeFile }),
    [bundle.visibleFiles, bundle.activeFile],
  );
  const customSetup = useMemo(() => {
    const dependencies = bundle.dependencies ?? {};
    return Object.keys(dependencies).length > 0 ? { dependencies: { ...dependencies } } : undefined;
  }, [bundle.dependencies]);

  const publishValidatedRevision = useCallback((revision: ValidatedRevision): void => {
    setRuntimeFiles((current) => mergeValidatedDraft(current, revision.files));
    setExecutionStatus('running');
  }, []);

  const completeAssessmentRun = useCallback((specs: SandpackSpecs): void => {
    onComplete(specs);
    queueMicrotask(() => {
      setExecutionStatus((current) => current === 'running' ? 'ready' : current);
    });
  }, [onComplete]);

  const restartRuntime = useCallback((): void => {
    setRuntimeKey((current) => current + 1);
    setExecutionStatus('running');
  }, []);

  return (
    <div className="assessment">
      <PanelGroup direction="horizontal" className="lab" autoSaveId="upstack-lab-columns">
        <Panel defaultSize={56} minSize={28} className="lab__editor">
          <AssessmentEditor
            files={bundle.files}
            visibleFiles={bundle.visibleFiles}
            activeFile={bundle.activeFile}
            status={executionStatus}
            onStatusChange={setExecutionStatus}
            onValidated={publishValidatedRevision}
          />
        </Panel>

        <PanelResizeHandle className="lab__handle lab__handle--vertical" />

        <Panel defaultSize={44} minSize={26} className="lab__side">
          <SandpackBoundary key={runtimeKey} onRetry={restartRuntime} preservesDraft>
            <SandpackProvider
              template={bundle.template as SandpackPredefinedTemplate}
              theme={theme}
              customSetup={customSetup}
              files={runtimeFiles}
              options={options}
            >
              <RuntimePane
                result={result}
                nextHref={nextHref}
                isRunning={executionStatus === 'running'}
                onComplete={completeAssessmentRun}
                onRestart={restartRuntime}
              />
            </SandpackProvider>
          </SandpackBoundary>
        </Panel>
      </PanelGroup>
    </div>
  );
}
