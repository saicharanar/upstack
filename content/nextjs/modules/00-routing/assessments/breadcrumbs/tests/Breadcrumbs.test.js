import { toBreadcrumbs } from './App';

describe('toBreadcrumbs', () => {
  test('builds one crumb per path segment', () => {
    expect(toBreadcrumbs('/blog/react/hooks')).toHaveLength(3);
    expect(toBreadcrumbs('/blog').map((c) => c.label)).toEqual(['blog']);
  });

  test('builds the cumulative href for each crumb', () => {
    expect(toBreadcrumbs('/blog/react/hooks').map((c) => c.href)).toEqual([
      '/blog',
      '/blog/react',
      '/blog/react/hooks',
    ]);
  });

  test('returns no crumbs for the root path', () => {
    expect(toBreadcrumbs('/')).toEqual([]);
  });
});
