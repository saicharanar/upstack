import { fullName, topScores } from './App';

describe('JavaScript warm-up', () => {
  test('builds a full name from first and last', () => {
    expect(fullName({ first: 'Ada', last: 'Lovelace' })).toBe('Ada Lovelace');
    expect(fullName({ first: 'Grace', last: 'Hopper' })).toBe('Grace Hopper');
  });

  test('keeps only scores above 50, highest first', () => {
    expect(topScores([42, 88, 51, 30, 95])).toEqual([95, 88, 51]);
    expect(topScores([10, 20, 30])).toEqual([]);
  });
});
