import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Stepper from './App';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setup() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<Stepper />);
  });
  return container;
}

function click(node) {
  act(() => {
    node.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

describe('Batched stepper', () => {
  test('starts at zero', () => {
    const container = setup();
    expect(container.textContent).toContain('Count: 0');
  });

  test('adds three in a single click', () => {
    // A single click must move the count from 0 to 3. This only works when the
    // three updates stack instead of all reading the same starting value — so a
    // naive "add one, three times" leaves the count at 1 and fails here.
    const container = setup();
    click(container.querySelector('button'));
    expect(container.textContent).toContain('Count: 3');
  });
});
