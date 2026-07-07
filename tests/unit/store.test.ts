import { describe, expect, it } from 'vitest';
import {
  PROGRESS_VERSION,
  createProgressStore,
  isChapterComplete,
  migrate,
  type PersistenceAdapter,
  type ProgressState,
} from '@/progress/store';

function memoryAdapter(seed: ProgressState | null = null): { adapter: PersistenceAdapter; saved: () => ProgressState | null } {
  let stored = seed;
  return {
    adapter: {
      load: () => stored,
      save: (state) => {
        stored = state;
      },
      subscribe: () => () => undefined,
    },
    saved: () => stored,
  };
}

describe('progress migration', () => {
  it('produces a fresh state from unknown input', () => {
    const state = migrate(undefined);
    expect(state.version).toBe(PROGRESS_VERSION);
    expect(state.chapters).toEqual({});
  });

  it('preserves existing chapter progress while stamping the current version', () => {
    const state = migrate({ version: 0, chapters: { jsx: { status: 'completed' } } });
    expect(state.version).toBe(PROGRESS_VERSION);
    expect(state.chapters.jsx?.status).toBe('completed');
  });
});

describe('completing a chapter through its assessment', () => {
  it('should mark the chapter complete once the assessment passes', () => {
    const { adapter, saved } = memoryAdapter();
    const store = createProgressStore(adapter);

    store.recordAssessment('jsx', { passed: true, passedConcepts: ['a', 'b'], passedTests: ['a1', 'b1'] });

    const chapter = store.getState().chapters.jsx;
    expect(isChapterComplete(chapter)).toBe(true);
    expect(chapter?.assessment?.passed).toBe(true);
    expect(chapter?.assessment?.passedConcepts).toEqual(['a', 'b']);
    expect(isChapterComplete(saved()?.chapters.jsx)).toBe(true);
  });

  it('should keep the chapter unfinished while the assessment is failing', () => {
    const store = createProgressStore(memoryAdapter().adapter);

    store.recordAssessment('jsx', { passed: false, passedConcepts: [], passedTests: [] });
    store.recordAssessment('jsx', { passed: false, passedConcepts: ['a'], passedTests: ['a1'] });

    const chapter = store.getState().chapters.jsx;
    expect(isChapterComplete(chapter)).toBe(false);
    expect(chapter?.assessment?.attempts).toBe(2);
  });
});

describe('marking a chapter done by hand', () => {
  it('should let a learner mark a chapter complete without an assessment', () => {
    const store = createProgressStore(memoryAdapter().adapter);

    store.setChapterOverride('intro', 'done');

    expect(isChapterComplete(store.getState().chapters.intro)).toBe(true);
  });

  it('should let a learner reopen a chapter they had marked done', () => {
    const store = createProgressStore(memoryAdapter().adapter);

    store.setChapterOverride('intro', 'done');
    store.setChapterOverride('intro', null);

    expect(isChapterComplete(store.getState().chapters.intro)).toBe(false);
  });

  it('should honor a hand-marked "not done" even after the assessment passes', () => {
    const store = createProgressStore(memoryAdapter().adapter);

    store.recordAssessment('jsx', { passed: true, passedConcepts: ['a'], passedTests: ['a1'] });
    store.setChapterOverride('jsx', 'not-done');

    expect(isChapterComplete(store.getState().chapters.jsx)).toBe(false);
  });
});
