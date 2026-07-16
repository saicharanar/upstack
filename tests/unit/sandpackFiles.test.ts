import { describe, expect, it } from 'vitest';
import { mergeValidatedDraft } from '@/assessment/sandpackFiles';

describe('validated Sandpack files', () => {
  it('replaces only draft code and preserves hidden test metadata', () => {
    const current = {
      '/App.js': { code: 'starter', active: true, hidden: false, readOnly: false },
      '/App.test.js': { code: 'hidden tests', active: false, hidden: true, readOnly: true },
    };

    const result = mergeValidatedDraft(current, {
      '/App.js': 'validated solution',
      '/missing.js': 'ignored',
    });

    expect(result).toEqual({
      '/App.js': { code: 'validated solution', active: true, hidden: false, readOnly: false },
      '/App.test.js': { code: 'hidden tests', active: false, hidden: true, readOnly: true },
    });
    expect(result).not.toBe(current);
    expect(result['/App.test.js']).toBe(current['/App.test.js']);
  });
});
