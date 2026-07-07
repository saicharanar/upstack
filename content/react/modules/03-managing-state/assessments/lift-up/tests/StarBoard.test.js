import { act } from 'react';
import { createRoot } from 'react-dom/client';
import StarBoard from './App';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setup() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<StarBoard />);
  });
  return container;
}

function click(node) {
  act(() => {
    node.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

describe('Lifted star count', () => {
  test('starts with zero stars', () => {
    const container = setup();
    expect(container.textContent).toContain('Stars: 0');
  });

  test('adds a star from the button to the shared count', () => {
    const container = setup();
    click(container.querySelector('button'));
    expect(container.textContent).toContain('Stars: 1');
  });
});
