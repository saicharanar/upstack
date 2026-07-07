'use client';

import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  type SandpackPredefinedTemplate,
} from '@codesandbox/sandpack-react';
import { useEffect, useState, type ReactNode } from 'react';

const DEFAULT_ENTRY = '/App.js';

export interface LiveExampleRunnerProps {
  readonly code: string;
  readonly template: SandpackPredefinedTemplate;
  readonly entry: string;
}

export default function LiveExampleRunner({ code, template, entry }: LiveExampleRunnerProps): ReactNode {
  const [fullscreen, setFullscreen] = useState(false);

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
    <div className="live-example" data-fullscreen={fullscreen}>
      <div className="live-example__bar">
        <span className="live-example__label">Runnable example — edit the code, watch it update</span>
        <button
          type="button"
          className="live-example__expand"
          onClick={() => setFullscreen((value) => !value)}
          aria-pressed={fullscreen}
        >
          {fullscreen ? 'Exit full screen (Esc)' : '⤢ Full screen'}
        </button>
      </div>
      <SandpackProvider template={template} files={{ [entry]: code }} options={{ activeFile: entry }}>
        <SandpackLayout>
          <SandpackCodeEditor showLineNumbers showTabs={false} />
          <SandpackPreview showOpenInCodeSandbox={false} />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}

export { DEFAULT_ENTRY };
