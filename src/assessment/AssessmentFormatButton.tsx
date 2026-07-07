'use client';

import { useState, type ReactNode } from 'react';
import { useActiveCode } from '@codesandbox/sandpack-react';
import { format } from 'prettier/standalone';
import * as babelPlugin from 'prettier/plugins/babel';
import * as estreePlugin from 'prettier/plugins/estree';

type FormatStatus = 'idle' | 'formatting' | 'error';

async function formatJavaScript(code: string): Promise<string> {
  return format(code, {
    parser: 'babel',
    plugins: [babelPlugin, estreePlugin],
    singleQuote: true,
    trailingComma: 'all',
  });
}

export function AssessmentFormatButton(): ReactNode {
  const { code, readOnly, updateCode } = useActiveCode();
  const [status, setStatus] = useState<FormatStatus>('idle');

  const formatActiveFile = async (): Promise<void> => {
    if (readOnly || status === 'formatting') return;

    setStatus('formatting');
    try {
      const formatted = await formatJavaScript(code);
      updateCode(formatted, true);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="assessment-editor-toolbar">
      <button
        type="button"
        className="button button--ghost assessment-editor-toolbar__button"
        disabled={readOnly || status === 'formatting'}
        onClick={() => void formatActiveFile()}
      >
        {status === 'formatting' ? 'Formatting...' : 'Format'}
      </button>
      {status === 'error' ? (
        <span className="assessment-editor-toolbar__error" role="status">
          Fix syntax, then format again.
        </span>
      ) : null}
    </div>
  );
}
