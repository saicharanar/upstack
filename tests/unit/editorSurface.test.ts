import { describe, expect, it } from 'vitest';
import { activeDraftValue, editorThemeFromDocument } from '@/assessment/editorSurface';

describe('assessment editor surface contract', () => {
  it('reads the active file without inventing a missing value', () => {
    expect(activeDraftValue({ '/App.js': 'const app = 1' }, '/App.js')).toBe('const app = 1');
    expect(activeDraftValue({}, '/Missing.js')).toBe('');
  });

  it('uses the document theme when available and light during SSR', () => {
    const darkDocument = {
      documentElement: { dataset: { theme: 'dark' } },
    } as unknown as Document;
    const defaultDocument = {
      documentElement: { dataset: {} },
    } as unknown as Document;

    expect(editorThemeFromDocument(undefined)).toBe('light');
    expect(editorThemeFromDocument(darkDocument)).toBe('dark');
    expect(editorThemeFromDocument(defaultDocument)).toBe('light');
  });
});
