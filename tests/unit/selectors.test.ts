import { describe, expect, it } from 'vitest';
import type { ChapterEntry, Manifest } from '@/content-layer/manifest';
import type { ChapterFrontmatter } from '@/content-layer/schema';
import { chapterAfter, nextChapter } from '@/progress/selectors';
import {
  createInitialState,
  type ChapterProgress,
  type ProgressState,
} from '@/progress/store';

function chapter(id: string, order: number, prereqs: string[] = []): ChapterEntry {
  const frontmatter: ChapterFrontmatter = {
    id,
    title: id,
    order,
    module: 'm',
    summary: 's',
    concepts: [],
    estMinutes: 5,
    status: 'published',
    assessment: null,
    prereqs,
    assets: [],
  };
  return { moduleId: 'm', chapterId: id, filePath: `${id}.mdx`, frontmatter };
}

const MANIFEST: Manifest = (() => {
  const chapters = [chapter('one', 1), chapter('two', 2), chapter('three', 3, ['one'])];
  return {
    stack: 'react',
    modules: [{ moduleId: 'm', filePath: '_module.mdx', frontmatter: { id: 'm', title: 'M', order: 1, summary: 's', icon: '🧩' }, chapters }],
    chaptersInOrder: chapters,
  };
})();

function withStatus(chapters: Record<string, ChapterProgress['status']>): ProgressState {
  const base = createInitialState('2026-07-07T00:00:00.000Z');
  const entries = Object.fromEntries(
    Object.entries(chapters).map(([id, status]) => [id, { status } satisfies ChapterProgress]),
  );
  return { ...base, chapters: entries };
}

describe('choosing the next chapter to work on', () => {
  it('points to the first chapter that is not yet completed', () => {
    expect(nextChapter(MANIFEST, withStatus({}))?.chapterId).toBe('one');
    expect(nextChapter(MANIFEST, withStatus({ one: 'completed' }))?.chapterId).toBe('two');
  });

  it('finds the chapter that comes after a given one', () => {
    expect(chapterAfter(MANIFEST, 'one')?.chapterId).toBe('two');
    expect(chapterAfter(MANIFEST, 'three')).toBeNull();
  });
});
