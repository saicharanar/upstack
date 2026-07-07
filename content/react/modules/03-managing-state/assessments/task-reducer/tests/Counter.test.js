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

function clickButton(container, label) {
  const button = [...container.querySelectorAll('button')].find((b) => b.textContent === label);
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

describe('Reducer counter', () => {
  test('starts at zero', () => {
    const container = setup();
    expect(container.textContent).toContain('Count: 0');
  });

  test('increments on the increment action', () => {
    const container = setup();
    clickButton(container, '+1');
    clickButton(container, '+1');
    expect(container.textContent).toContain('Count: 2');
  });

  test('resets to zero on the reset action', () => {
    const container = setup();
    clickButton(container, '+1');
    clickButton(container, 'Reset');
    expect(container.textContent).toContain('Count: 0');
  });
});
