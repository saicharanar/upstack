import { transitionFor } from './App';

describe('transitionFor', () => {
  test('uses a normal duration by default', () => {
    expect(transitionFor(false).duration).toBe(0.5);
  });

  test('makes motion instant when reduced motion is preferred', () => {
    expect(transitionFor(true).duration).toBe(0);
  });
});
