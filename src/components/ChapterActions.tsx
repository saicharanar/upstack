'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useProgressActions, useProgressState } from '@/progress/ProgressProvider';
import { isChapterComplete } from '@/progress/store';

export function ChapterActions({
  chapterId,
  nextHref,
}: {
  chapterId: string;
  nextHref: string | null;
}): ReactNode {
  const router = useRouter();
  const { markStarted, markVisited, setChapterOverride } = useProgressActions();
  const progress = useProgressState();
  const complete = isChapterComplete(progress.chapters[chapterId]);

  useEffect(() => {
    markVisited(chapterId);
    markStarted(chapterId);
  }, [chapterId, markStarted, markVisited]);

  const completeChapter = (): void => {
    setChapterOverride(chapterId, 'done');
    if (nextHref) router.push(nextHref);
  };

  if (complete) {
    return (
      <div className="chapter-actions__row">
        <p className="chapter-actions__done">Chapter complete ✓</p>
        {nextHref ? (
          <button type="button" className="button button--primary" onClick={() => router.push(nextHref)}>
            Continue to next chapter
          </button>
        ) : null}
        <button
          type="button"
          className="button button--ghost"
          onClick={() => setChapterOverride(chapterId, 'not-done')}
        >
          Mark as not done
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="button button--primary"
      onClick={completeChapter}
    >
      Mark chapter as complete
    </button>
  );
}
