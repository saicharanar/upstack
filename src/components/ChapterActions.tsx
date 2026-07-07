'use client';

import { useEffect, type ReactNode } from 'react';
import { useProgressActions, useProgressState } from '@/progress/ProgressProvider';
import { isChapterComplete } from '@/progress/store';

export function ChapterActions({ chapterId }: { chapterId: string }): ReactNode {
  const { markStarted, markVisited, setChapterOverride } = useProgressActions();
  const progress = useProgressState();
  const complete = isChapterComplete(progress.chapters[chapterId]);

  useEffect(() => {
    markVisited(chapterId);
    markStarted(chapterId);
  }, [chapterId, markStarted, markVisited]);

  if (complete) {
    return (
      <div className="chapter-actions__row">
        <p className="chapter-actions__done">Chapter complete ✓</p>
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
      onClick={() => setChapterOverride(chapterId, 'done')}
    >
      Mark chapter as complete
    </button>
  );
}
