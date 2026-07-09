import { act } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setup() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<App />));
  return container;
}

function click(node) {
  act(() => node.click());
}

describe('Reducer plus context', () => {
  test('shows the initial count', () => {
    const container = setup();
    expect(container.textContent).toContain('Count: 0');
  });

  test('adds through context from a nested button', () => {
    const container = setup();
    const add = container.querySelector('button');
    click(add);
    click(add);
    expect(container.textContent).toContain('Count: 2');
  });
});
