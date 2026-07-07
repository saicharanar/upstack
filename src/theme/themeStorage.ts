export type ThemeMode = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'upstack:theme';
export const DEFAULT_THEME: ThemeMode = 'light';

function hasWindow(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalize(value: string | null): ThemeMode {
  return value === 'dark' ? 'dark' : 'light';
}

export function readStoredTheme(): ThemeMode | null {
  if (!hasWindow()) return null;
  const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
  return raw === null ? null : normalize(raw);
}

export function storeTheme(mode: ThemeMode): void {
  if (!hasWindow()) return;
  window.localStorage.setItem(THEME_STORAGE_KEY, mode);
}

export function applyTheme(mode: ThemeMode): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = mode;
}

/**
 * Runs before first paint (injected inline in the document head) so the stored
 * theme is applied without a flash. Defaults to light when nothing is stored.
 */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var m=localStorage.getItem('${THEME_STORAGE_KEY}');document.documentElement.dataset.theme=(m==='dark'?'dark':'${DEFAULT_THEME}');}catch(e){document.documentElement.dataset.theme='${DEFAULT_THEME}';}})();`;
