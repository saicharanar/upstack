import { act } from 'react';
import { createRoot } from 'react-dom/client';
import LikeButton from './App';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setup() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<LikeButton />);
  });
  return container;
}

function click(node) {
  act(() => {
    node.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

describe('Like button', () => {
  test('starts with zero likes', () => {
    const container = setup();
    expect(container.textContent).toContain('0');
  });

  test('adds a like each time the heart is tapped', () => {
    const container = setup();
    const button = container.querySelector('button');
    expect(button).not.toBeNull();
    click(button);
    expect(container.textContent).toContain('1');
    click(button);
    expect(container.textContent).toContain('2');
  });
});
