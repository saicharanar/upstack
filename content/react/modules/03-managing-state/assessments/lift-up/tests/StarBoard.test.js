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
    node.click();
  });
}

describe('Lifted star count', () => {
  test('adds a star from the button to the shared count', () => {
    const container = setup();
    click(container.querySelector('button'));
    expect(container.textContent).toContain('Stars: 1');
  });

  test('keeps counting up across clicks', () => {
    const container = setup();
    const button = container.querySelector('button');
    click(button);
    click(button);
    click(button);
    expect(container.textContent).toContain('Stars: 3');
  });
});
