'use client';

import { createContext, useContext, useMemo, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { createLocalStorageAdapter } from './localStorageAdapter';
import {
  PROGRESS_VERSION,
  STACK_ID,
  createProgressStore,
  type ProgressState,
  type ProgressStore,
} from './store';

const SERVER_SNAPSHOT: ProgressState = {
  version: PROGRESS_VERSION,
  stack: STACK_ID,
  updatedAt: '',
  chapters: {},
};

const ProgressStoreContext = createContext<ProgressStore | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }): ReactNode {
  const storeRef = useRef<ProgressStore | null>(null);
  if (!storeRef.current) storeRef.current = createProgressStore(createLocalStorageAdapter());

  return (
    <ProgressStoreContext.Provider value={storeRef.current}>{children}</ProgressStoreContext.Provider>
  );
}

function useProgressStore(): ProgressStore {
  const store = useContext(ProgressStoreContext);
  if (!store) throw new Error('useProgressStore must be used within a ProgressProvider');
  return store;
}

export function useProgressState(): ProgressState {
  const store = useProgressStore();
  return useSyncExternalStore(store.subscribe, store.getState, () => SERVER_SNAPSHOT);
}

export interface ProgressActions {
  markVisited: ProgressStore['markVisited'];
  markStarted: ProgressStore['markStarted'];
  setChapterOverride: ProgressStore['setChapterOverride'];
  recordAssessment: ProgressStore['recordAssessment'];
}

export function useProgressActions(): ProgressActions {
  const store = useProgressStore();
  return useMemo(
    () => ({
      markVisited: (chapterId) => store.markVisited(chapterId),
      markStarted: (chapterId) => store.markStarted(chapterId),
      setChapterOverride: (chapterId, override) => store.setChapterOverride(chapterId, override),
      recordAssessment: (chapterId, outcome) => store.recordAssessment(chapterId, outcome),
    }),
    [store],
  );
}
