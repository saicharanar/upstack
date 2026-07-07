'use client';

import {
  SandpackCodeEditor,
  SandpackPreview,
  SandpackProvider,
  SandpackTests,
  type SandpackPredefinedTemplate,
  type SandpackPredefinedTheme,
} from '@codesandbox/sandpack-react';
import { useMemo, useState, type ReactNode } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import type { AssessmentBundle } from '@/content-layer/loader';
import type { GradeResult } from './grade';
import { ResultPanel } from './ResultPanel';
import { toSandpackFiles } from './sandpackFiles';
import { useAssessmentResult, type SandpackSpecs } from './useAssessmentResult';

/**
 * Read the active theme ONCE at mount. We deliberately do not subscribe to live
 * theme changes: handing SandpackProvider a changing `theme` prop re-inits the
 * bundler iframe, which can leave the sandbox stuck on its loading cube. A stable
 * value keeps the provider (and its bundler) mounted for the workspace's life.
 */
function initialTheme(): SandpackPredefinedTheme {
  if (typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark') {
    return 'dark';
  }
  return 'light';
}

function toAssessmentSpecs(specs: Record<string, unknown>): SandpackSpecs {
  return specs as unknown as SandpackSpecs;
}

export interface AssessmentRunnerProps {
  readonly bundle: AssessmentBundle;
  readonly chapterId: string;
  readonly nextHref: string | null;
}

interface LabProps {
  readonly nextHref: string | null;
  readonly onComplete: (specs: SandpackSpecs) => void;
  readonly result: GradeResult | null;
}

function Lab({ nextHref, onComplete, result }: LabProps): ReactNode {
  return (
    <PanelGroup direction="horizontal" className="lab" autoSaveId="upstack-lab-columns">
      <Panel defaultSize={56} minSize={28} className="lab__editor">
        <SandpackCodeEditor showTabs showLineNumbers />
      </Panel>

      <PanelResizeHandle className="lab__handle lab__handle--vertical" />

      <Panel defaultSize={44} minSize={26} className="lab__side">
        <PanelGroup direction="vertical" className="lab__rows" autoSaveId="upstack-lab-rows">
          <Panel defaultSize={48} minSize={16} className="lab__preview">
            <div className="lab__preview-bar">
              <span className="lab__preview-label">Live preview</span>
            </div>
            <div className="lab__preview-stage">
              <SandpackPreview showOpenInCodeSandbox={false} />
            </div>
          </Panel>

          <PanelResizeHandle className="lab__handle lab__handle--horizontal" />

          <Panel defaultSize={52} minSize={20} className="lab__tests">
            {/* Status summary pinned at the top; the real test output scrolls below it. */}
            <ResultPanel result={result} nextHref={nextHref} />
            <div className="lab__tests-output">
              <SandpackTests onComplete={(specs) => onComplete(toAssessmentSpecs(specs))} verbose />
            </div>
          </Panel>
        </PanelGroup>
      </Panel>
    </PanelGroup>
  );
}

export default function AssessmentRunner({ bundle, chapterId, nextHref }: AssessmentRunnerProps): ReactNode {
  const { result, onComplete } = useAssessmentResult(bundle.meta, chapterId);
  const files = useMemo(() => toSandpackFiles(bundle.files), [bundle.files]);
  const options = useMemo(
    () => ({ visibleFiles: [...bundle.visibleFiles], activeFile: bundle.activeFile }),
    [bundle.visibleFiles, bundle.activeFile],
  );
  const [theme] = useState<SandpackPredefinedTheme>(initialTheme);

  return (
    <div className="assessment">
      <SandpackProvider
        template={bundle.template as SandpackPredefinedTemplate}
        theme={theme}
        files={files}
        options={options}
      >
        <Lab nextHref={nextHref} onComplete={onComplete} result={result} />
      </SandpackProvider>
    </div>
  );
}
