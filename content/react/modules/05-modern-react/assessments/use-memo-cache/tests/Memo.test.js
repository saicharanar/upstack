import { act } from 'react';
import { createRoot } from 'react-dom/client';
import App, { stats } from './App';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  stats.runs = 0;
});

function setup() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<App />));
  return container;
}

function click(node) {
  act(() => node.dispatchEvent(new MouseEvent('click', { bubbles: true })));
}

const buttonByText = (container, text) =>
  [...container.querySelectorAll('button')].find((b) => b.textContent.includes(text));

describe('Cached calculation', () => {
  test('recomputes only when its input changes', () => {
    const container = setup();
    const afterMount = stats.runs;
    // An unrelated re-render must NOT recompute (the cache holds)...
    click(buttonByText(container, 'unrelated'));
    expect(stats.runs).toBe(afterMount);
    // ...but changing the input must recompute.
    click(buttonByText(container, 'n + 1'));
    expect(stats.runs).toBeGreaterThan(afterMount);
    expect(container.textContent).toContain('Doubled: 6');
  });
});
