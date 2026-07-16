import { describe, expect, it } from 'vitest';
import { hasValidJavaScriptSyntax } from '@/assessment/javascriptSyntax';

describe('assessment JavaScript syntax validation', () => {
  it('accepts JavaScript with JSX and modern syntax', () => {
    const files = {
      '/App.js': `export default function App() {
        const title = 'Hello';
        return <section>{title}</section>;
      }`,
    };

    expect(hasValidJavaScriptSyntax(files, ['/App.js'])).toBe(true);
  });

  it('rejects incomplete JSX without treating semantic errors as syntax errors', () => {
    expect(
      hasValidJavaScriptSyntax({ '/App.js': 'export default () => <div' }, ['/App.js']),
    ).toBe(false);
    expect(hasValidJavaScriptSyntax({ '/App.js': 'missingName()' }, ['/App.js'])).toBe(true);
  });

  it('validates every visible file and ignores missing paths', () => {
    const files = { '/App.js': 'export default 1', '/Card.js': 'export const Card = (' };

    expect(hasValidJavaScriptSyntax(files, ['/App.js', '/Card.js'])).toBe(false);
    expect(hasValidJavaScriptSyntax(files, ['/App.js', '/Missing.js'])).toBe(true);
  });
});
