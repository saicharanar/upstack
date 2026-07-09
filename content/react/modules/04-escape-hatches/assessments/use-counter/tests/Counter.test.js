import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Counter from './App';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setup() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<Counter />);
  });
  return container;
}

function click(node) {
  act(() => {
    node.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

describe('useCounter custom hook', () => {
  test('increments through the custom hook', () => {
    const container = setup();
    click(container.querySelector('button'));
    expect(container.textContent).toContain('Count: 1');
  });

  test('keeps counting up across clicks', () => {
    const container = setup();
    const button = container.querySelector('button');
    click(button);
    click(button);
    click(button);
    expect(container.textContent).toContain('Count: 3');
  });
});
