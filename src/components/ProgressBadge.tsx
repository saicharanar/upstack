import type { ReactNode } from 'react';
import type { NavChapterState } from '@/content-layer/nav';

const BADGES: Record<NavChapterState, { mark: string; label: string }> = {
  completed: { mark: '✓', label: 'Completed' },
  'in-progress': { mark: '●', label: 'In progress' },
  available: { mark: '○', label: 'Not started' },
};

export function ProgressBadge({ state }: { state: NavChapterState }): ReactNode {
  const badge = BADGES[state];
  return (
    <span className="progress-badge" data-state={state} role="img" aria-label={badge.label}>
      {badge.mark}
    </span>
  );
}
