import { act } from 'react';
import { createRoot } from 'react-dom/client';
import StarRating from './App';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setup() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<StarRating />));
  return container;
}

function click(node) {
  act(() => node.click());
}

const filledCount = (container) => (container.textContent.match(/★/g) || []).length;

describe('Star rating', () => {
  test('starts with no stars filled', () => {
    const container = setup();
    expect(container.querySelectorAll('button').length).toBe(5);
    expect(filledCount(container)).toBe(0);
  });

  test('fills stars up to the one you click', () => {
    const container = setup();
    const stars = container.querySelectorAll('button');
    click(stars[2]); // the third star
    expect(filledCount(container)).toBe(3);
  });

  test('shows the numeric rating', () => {
    const container = setup();
    click(container.querySelectorAll('button')[2]);
    expect(container.textContent).toContain('3 / 5');
  });
});
