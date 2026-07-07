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
    expect(container.textContent).toContain('0');
  });

  test('adds three in a single click', () => {
    // Only passes if all three updates stack — i.e. updater functions were used.
    const container = setup();
    click(container.querySelector('button'));
    expect(container.textContent).toContain('3');
  });
});
