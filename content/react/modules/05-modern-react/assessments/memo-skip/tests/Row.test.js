import { act } from 'react';
import { createRoot } from 'react-dom/client';
import App, { stats } from './App';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  stats.childRenders = 0;
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

describe('Skipping re-renders with memo', () => {
  test('renders the child', () => {
    const container = setup();
    expect(container.textContent).toContain('Fixed item');
    expect(stats.childRenders).toBeGreaterThan(0);
  });

  test('does not re-render the child on an unrelated parent update', () => {
    const container = setup();
    const rendersAfterMount = stats.childRenders;
    click(container.querySelector('button')); // parent re-renders; child's prop is unchanged
    expect(stats.childRenders).toBe(rendersAfterMount);
  });
});
