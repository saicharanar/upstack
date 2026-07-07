import { chapterIndex, type ChapterEntry, type Manifest } from '@/content-layer/manifest';
import { isChapterComplete, type ChapterStatus, type ProgressState } from './store';

export function chapterStatus(state: ProgressState, chapterId: string): ChapterStatus {
  return state.chapters[chapterId]?.status ?? 'not-started';
}

export function isCompleted(state: ProgressState, chapterId: string): boolean {
  return isChapterComplete(state.chapters[chapterId]);
}

// Content is never locked, so "next" is simply the first chapter the learner
// has not completed yet (used as a resume fallback when there is no lastVisited).
export function nextChapter(manifest: Manifest, state: ProgressState): ChapterEntry | null {
  return manifest.chaptersInOrder.find((chapter) => !isCompleted(state, chapter.chapterId)) ?? null;
}

export function chapterAfter(manifest: Manifest, chapterId: string): ChapterEntry | null {
  const index = chapterIndex(manifest, chapterId);
  if (index < 0) return null;
  return manifest.chaptersInOrder[index + 1] ?? null;
}
