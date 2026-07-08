import { act } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Each test mounts into document.body; reset it so a selector can't pick up
// boxes left over from a previous test.
afterEach(() => {
  document.body.innerHTML = '';
});

function setup() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<App />));
  return container;
}

describe('Laying boxes out with a function-based gsap.set', () => {
  test('renders the four boxes', () => {
    const container = setup();
    expect(container.querySelectorAll('.box').length).toBe(4);
  });

  test('places each box further right than the last', () => {
    const container = setup();
    const boxes = [...container.querySelectorAll('.box')];
    // box i should be translated to i * 80 px (skip box 0, which is at 0).
    expect(boxes[1].style.transform).toContain('80');
    expect(boxes[2].style.transform).toContain('160');
    expect(boxes[3].style.transform).toContain('240');
  });
});
