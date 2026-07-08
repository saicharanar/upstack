'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { assessmentHref } from '@/content-layer/nav';
import { useProgressState } from '@/progress/ProgressProvider';

export interface LaunchAssessmentCardProps {
  readonly assessmentId: string;
  readonly chapterId: string;
  readonly moduleId: string;
  readonly stack: string;
}

export function LaunchAssessmentCard({
  chapterId,
  moduleId,
  stack,
}: LaunchAssessmentCardProps): ReactNode {
  const progress = useProgressState();
  const passed = progress.chapters[chapterId]?.assessment?.passed === true;

  return (
    <Link className="launch-card" data-passed={passed} href={assessmentHref(stack, moduleId, chapterId)}>
      <span className="launch-card__eyebrow">Graded exercise</span>
      <span className="launch-card__title">Build it yourself</span>
      <p className="launch-card__body">
        Open the full-screen workspace — write your solution in the editor, watch the live preview,
        and let the tests grade each concept. Pass to complete the chapter and unlock the next one.
      </p>
      {passed ? (
        <span className="launch-card__status">✓ Passed — reopen the workspace</span>
      ) : (
        <span className="launch-card__cta">Launch assessment →</span>
      )}
    </Link>
  );
}
