import { mapRange } from './App';

describe('mapRange', () => {
  test('maps the endpoints of the range', () => {
    expect(mapRange(0, 0, 1, 0, 100)).toBe(0);
    expect(mapRange(1, 0, 1, 0, 100)).toBe(100);
  });

  test('interpolates between arbitrary ranges', () => {
    expect(mapRange(0.5, 0, 1, 0, 100)).toBe(50);
    expect(mapRange(50, 0, 100, 0, 1)).toBe(0.5);
    expect(mapRange(0.5, 0, 1, -50, 50)).toBe(0);
  });
});
