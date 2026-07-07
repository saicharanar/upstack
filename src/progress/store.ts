export const PROGRESS_VERSION = 1;
export const PROGRESS_STORAGE_KEY = 'upstack:react:progress';
export const STACK_ID = 'react';

export type ChapterStatus = 'not-started' | 'in-progress' | 'completed';

export interface AssessmentProgress {
  readonly passed: boolean;
  readonly attempts: number;
  readonly lastRunAt: string;
  readonly passedConcepts: readonly string[];
  readonly passedTests: readonly string[];
}

export type ChapterOverride = 'done' | 'not-done';

export interface ChapterProgress {
  readonly status: ChapterStatus;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly assessment?: AssessmentProgress;
  /** Manual completion override; takes precedence over the assessment result. */
  readonly override?: ChapterOverride;
}

/**
 * Effective completion for a chapter. A manual override wins; otherwise a passed
 * assessment completes it; otherwise fall back to a legacy `completed` status.
 * This is the single source of truth used by selectors, nav, and the UI.
 */
export function isChapterComplete(chapter: ChapterProgress | undefined): boolean {
  if (!chapter) return false;
  if (chapter.override === 'done') return true;
  if (chapter.override === 'not-done') return false;
  if (chapter.assessment) return chapter.assessment.passed;
  return chapter.status === 'completed';
}

export interface ProgressState {
  readonly version: number;
  readonly stack: string;
  readonly updatedAt: string;
  readonly lastVisited?: string;
  readonly chapters: Readonly<Record<string, ChapterProgress>>;
}

export interface AssessmentOutcome {
  readonly passed: boolean;
  readonly passedConcepts: readonly string[];
  readonly passedTests: readonly string[];
}

export interface PersistenceAdapter {
  load(): ProgressState | null;
  save(state: ProgressState): void;
  subscribe(listener: (state: ProgressState) => void): () => void;
}

export interface ProgressStore {
  getState(): ProgressState;
  subscribe(listener: () => void): () => void;
  markVisited(chapterId: string): void;
  markStarted(chapterId: string): void;
  setChapterOverride(chapterId: string, override: ChapterOverride | null): void;
  recordAssessment(chapterId: string, outcome: AssessmentOutcome): void;
}

export function createInitialState(now: string): ProgressState {
  return { version: PROGRESS_VERSION, stack: STACK_ID, updatedAt: now, chapters: {} };
}

export function migrate(raw: unknown): ProgressState {
  const now = new Date().toISOString();
  if (!raw || typeof raw !== 'object') return createInitialState(now);

  const candidate = raw as Partial<ProgressState>;
  const chapters =
    candidate.chapters && typeof candidate.chapters === 'object' ? candidate.chapters : {};

  return {
    version: PROGRESS_VERSION,
    stack: typeof candidate.stack === 'string' ? candidate.stack : STACK_ID,
    updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : now,
    ...(typeof candidate.lastVisited === 'string' ? { lastVisited: candidate.lastVisited } : {}),
    chapters: chapters as Record<string, ChapterProgress>,
  };
}

function upsertChapter(
  state: ProgressState,
  chapterId: string,
  update: (current: ChapterProgress) => ChapterProgress,
): ProgressState {
  const current = state.chapters[chapterId] ?? { status: 'not-started' };
  return {
    ...state,
    updatedAt: new Date().toISOString(),
    chapters: { ...state.chapters, [chapterId]: update(current) },
  };
}

function withStarted(current: ChapterProgress, now: string): ChapterProgress {
  return current.status === 'not-started' ? { ...current, status: 'in-progress', startedAt: current.startedAt ?? now } : current;
}

export function createProgressStore(adapter: PersistenceAdapter): ProgressStore {
  let state = adapter.load() ?? createInitialState(new Date().toISOString());
  const listeners = new Set<() => void>();

  const notify = (): void => listeners.forEach((listener) => listener());

  const commit = (next: ProgressState): void => {
    state = next;
    adapter.save(state);
    notify();
  };

  adapter.subscribe((external) => {
    state = external;
    notify();
  });

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    markVisited(chapterId) {
      commit({ ...state, lastVisited: chapterId, updatedAt: new Date().toISOString() });
    },
    markStarted(chapterId) {
      commit(upsertChapter(state, chapterId, (current) => withStarted(current, new Date().toISOString())));
    },
    setChapterOverride(chapterId, override) {
      const now = new Date().toISOString();
      commit(
        upsertChapter(state, chapterId, (current) => {
          const started = withStarted(current, now);
          if (override === null) {
            const { override: _cleared, ...rest } = started;
            return rest;
          }
          return {
            ...started,
            override,
            ...(override === 'done' ? { completedAt: started.completedAt ?? now } : {}),
          };
        }),
      );
    },
    recordAssessment(chapterId, outcome) {
      const now = new Date().toISOString();
      commit(
        upsertChapter(state, chapterId, (current) => {
          const attempts = (current.assessment?.attempts ?? 0) + 1;
          const assessment: AssessmentProgress = {
            passed: outcome.passed,
            attempts,
            lastRunAt: now,
            passedConcepts: [...outcome.passedConcepts],
            passedTests: [...outcome.passedTests],
          };
          return {
            ...withStarted(current, now),
            assessment,
            ...(outcome.passed ? { completedAt: current.completedAt ?? now } : {}),
          };
        }),
      );
    },
  };
}
