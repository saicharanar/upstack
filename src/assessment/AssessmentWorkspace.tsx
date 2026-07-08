'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import type { AssessmentBundle } from '@/content-layer/loader';

const AssessmentRunner = dynamic(() => import('./AssessmentRunner'), {
  ssr: false,
  loading: () => <p className="assessment-gate__loading">Loading the interactive editor…</p>,
});

// The three-pane workspace (editor | preview | tests) needs room to be usable.
// Below this width (phones) we show a notice instead of a cramped, unusable editor.
const MIN_WIDTH_QUERY = '(min-width: 48rem)';

export interface AssessmentWorkspaceProps {
  readonly bundle: AssessmentBundle;
  readonly chapterId: string;
  readonly backHref: string;
  readonly nextHref: string | null;
}

export function AssessmentWorkspace({
  bundle,
  chapterId,
  backHref,
  nextHref,
}: AssessmentWorkspaceProps): ReactNode {
  const [wideEnough, setWideEnough] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(MIN_WIDTH_QUERY);
    const sync = (): void => setWideEnough(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  if (wideEnough === null) {
    return <p className="assessment-gate__loading">Loading the interactive editor…</p>;
  }

  if (!wideEnough) {
    return (
      <div className="assessment-gate__small" role="note">
        <p className="assessment-gate__small-icon" aria-hidden="true">
          🖥️
        </p>
        <h2 className="assessment-gate__small-title">This exercise needs a bigger screen</h2>
        <p className="assessment-gate__small-body">
          The code editor, live preview, and tests need room to work side by side, so the
          hands-on exercise is available on a tablet or computer. You can still read the whole
          chapter and mark it complete on your phone.
        </p>
        <Link className="button button--primary" href={backHref}>
          Back to the chapter
        </Link>
      </div>
    );
  }

  // Runner seam: today only the Sandpack runner is implemented. Other runtimes
  // (e.g. a WebContainer runner for server frameworks) plug in here by bundle.runner.
  if (bundle.runner !== 'sandpack') {
    return (
      <div className="assessment-gate__small" role="note">
        <h2 className="assessment-gate__small-title">This exercise runs elsewhere</h2>
        <p className="assessment-gate__small-body">
          It uses a runtime that isn&apos;t available in this in-browser workspace yet. Follow the
          chapter to run it locally.
        </p>
        <Link className="button button--primary" href={backHref}>
          Back to the chapter
        </Link>
      </div>
    );
  }

  return <AssessmentRunner bundle={bundle} chapterId={chapterId} nextHref={nextHref} />;
}
