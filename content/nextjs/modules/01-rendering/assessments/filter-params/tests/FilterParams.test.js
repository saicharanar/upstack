import { parseListParams } from './App';

describe('parseListParams', () => {
  test('trims the search text', () => {
    expect(parseListParams({ q: '  react ' }).q).toBe('react');
    expect(parseListParams({}).q).toBe('');
  });

  test('defaults sort to new', () => {
    expect(parseListParams({}).sort).toBe('new');
    expect(parseListParams({ sort: 'top' }).sort).toBe('top');
  });

  test('coerces page to a number at least 1', () => {
    expect(parseListParams({ page: '3' }).page).toBe(3);
    expect(parseListParams({}).page).toBe(1);
    expect(parseListParams({ page: '0' }).page).toBe(1);
    expect(parseListParams({ page: 'abc' }).page).toBe(1);
  });
});
