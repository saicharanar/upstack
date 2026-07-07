import {
  PROGRESS_STORAGE_KEY,
  migrate,
  type PersistenceAdapter,
  type ProgressState,
} from './store';

function hasWindow(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function safeParse(raw: string | null): ProgressState | null {
  if (!raw) return null;
  try {
    return migrate(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function createLocalStorageAdapter(): PersistenceAdapter {
  return {
    load() {
      if (!hasWindow()) return null;
      return safeParse(window.localStorage.getItem(PROGRESS_STORAGE_KEY));
    },
    save(state) {
      if (!hasWindow()) return;
      window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(state));
    },
    subscribe(listener) {
      if (!hasWindow()) return () => undefined;

      const onStorage = (event: StorageEvent): void => {
        if (event.key !== PROGRESS_STORAGE_KEY) return;
        const next = safeParse(event.newValue);
        if (next) listener(next);
      };

      window.addEventListener('storage', onStorage);
      return () => window.removeEventListener('storage', onStorage);
    },
  };
}
