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
  act(() => node.click());
}

describe('External store counter', () => {
  test('updates when the store changes', () => {
    const container = setup();
    const button = container.querySelector('button');
    click(button);
    expect(container.textContent).toContain('Count: 1');
    click(button);
    expect(container.textContent).toContain('Count: 2');
  });

  test('keeps every subscribed component in sync', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() =>
      root.render(
        <>
          <Counter />
          <Counter />
        </>,
      ),
    );
    // Clicking one component's button changes the shared store — both should update.
    click(container.querySelectorAll('button')[0]);
    const counts = [...container.querySelectorAll('p')].map((p) => p.textContent);
    expect(counts).toEqual(['Count: 1', 'Count: 1']);
  });
});
