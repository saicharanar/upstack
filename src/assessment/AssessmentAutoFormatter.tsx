'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useActiveCode } from '@codesandbox/sandpack-react';
import { format } from 'prettier/standalone';
import * as babelPlugin from 'prettier/plugins/babel';
import * as estreePlugin from 'prettier/plugins/estree';

const FORMAT_IDLE_MS = 1200;

async function formatJavaScript(code: string): Promise<string> {
  return format(code, {
    parser: 'babel',
    plugins: [babelPlugin, estreePlugin],
    singleQuote: true,
    trailingComma: 'all',
  });
}

export function AssessmentAutoFormatter(): ReactNode {
  const { code, readOnly, updateCode } = useActiveCode();
  const lastFormattedCodeRef = useRef<string>('');

  useEffect(() => {
    if (readOnly || code === lastFormattedCodeRef.current) return undefined;

    const timeoutId = window.setTimeout(() => {
      void formatJavaScript(code)
        .then((formatted) => {
          if (formatted === code) {
            lastFormattedCodeRef.current = code;
            return;
          }

          lastFormattedCodeRef.current = formatted;
          updateCode(formatted, true);
        })
        .catch(() => {
          // While the learner is midway through typing invalid JSX, keep their code untouched.
        });
    }, FORMAT_IDLE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [code, readOnly, updateCode]);

  return null;
}
