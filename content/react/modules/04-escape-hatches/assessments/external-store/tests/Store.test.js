import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Counter, { store } from './App';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// The store lives outside React and persists across tests, so reset it each time.
afterEach(() => {
  store.count = 0;
});

function setup() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<Counter />));
  return container;
}

function click(node) {
  act(() => node.dispatchEvent(new MouseEvent('click', { bubbles: true })));
}

describe('External store counter', () => {
  test('shows the store value', () => {
    const container = setup();
    expect(container.textContent).toContain('Count: 0');
  });

  test('updates when the store changes', () => {
    const container = setup();
    const button = container.querySelector('button');
    click(button);
    expect(container.textContent).toContain('Count: 1');
    click(button);
    expect(container.textContent).toContain('Count: 2');
  });
});
