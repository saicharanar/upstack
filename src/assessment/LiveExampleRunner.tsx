'use client';

import {
  SandpackCodeEditor,
  SandpackConsole,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  type SandpackPredefinedTemplate,
} from '@codesandbox/sandpack-react';
import { useEffect, useState, type ReactNode } from 'react';
import { SandpackBoundary } from './SandpackBoundary';

const DEFAULT_ENTRY = '/App.js';

export interface LiveExampleRunnerProps {
  readonly code: string;
  readonly template: SandpackPredefinedTemplate;
  readonly entry: string;
  readonly dependencies?: Readonly<Record<string, string>>;
}

export default function LiveExampleRunner({
  code,
  template,
  entry,
  dependencies,
}: LiveExampleRunnerProps): ReactNode {
  const [fullscreen, setFullscreen] = useState(false);
  const [view, setView] = useState<'preview' | 'console'>('preview');
  const customSetup =
    dependencies && Object.keys(dependencies).length > 0 ? { dependencies } : undefined;

  // While full screen, lock body scroll and let Escape close it.
  useEffect(() => {
    if (!fullscreen) return undefined;
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [fullscreen]);

  return (
    <SandpackBoundary>
    <div className="live-example" data-fullscreen={fullscreen}>
      <div className="live-example__bar">
        <span className="live-example__label">Runnable example — edit the code, watch it update</span>
        <div className="live-example__view-toggle" role="tablist" aria-label="Preview or console">
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
        <button
          type="button"
          className="live-example__expand"
          onClick={() => setFullscreen((value) => !value)}
          aria-pressed={fullscreen}
        >
          {fullscreen ? 'Exit full screen (Esc)' : '⤢ Full screen'}
        </button>
      </div>
      <SandpackProvider
        template={template}
        customSetup={customSetup}
        files={{ [entry]: code }}
        options={{ activeFile: entry }}
      >
        <SandpackLayout>
          <SandpackCodeEditor showLineNumbers showTabs={false} />
          {/* Preview and console are both mounted; we toggle visibility so
              console.log output survives switching back and forth. */}
          <div className="live-example__output" data-view={view}>
            <div className="live-example__view live-example__view--preview">
              <SandpackPreview showOpenInCodeSandbox={false} />
            </div>
            <div className="live-example__view live-example__view--console">
              <SandpackConsole resetOnPreviewRestart showSyntaxError />
            </div>
          </div>
        </SandpackLayout>
      </SandpackProvider>
    </div>
    </SandpackBoundary>
  );
}

export { DEFAULT_ENTRY };
