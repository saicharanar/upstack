'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import type { SandpackPredefinedTemplate } from '@codesandbox/sandpack-react';

const DEFAULT_TEMPLATE: SandpackPredefinedTemplate = 'react';
const DEFAULT_ENTRY = '/App.js';

const LiveExampleRunner = dynamic(() => import('./LiveExampleRunner'), {
  ssr: false,
  loading: () => <p className="live-example__loading">Loading the runnable example…</p>,
});

export interface LiveExampleProps {
  readonly code: string;
  readonly template?: SandpackPredefinedTemplate;
  readonly entry?: string;
  readonly dependencies?: Readonly<Record<string, string>>;
}

export function LiveExample({ code, template, entry, dependencies }: LiveExampleProps): ReactNode {
  return (
    <LiveExampleRunner
      code={code.trim()}
      template={template ?? DEFAULT_TEMPLATE}
      entry={entry ?? DEFAULT_ENTRY}
      dependencies={dependencies}
    />
  );
}
