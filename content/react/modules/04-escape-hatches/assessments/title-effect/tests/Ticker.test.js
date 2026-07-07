import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Ticker from './App';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setup() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<Ticker />);
  });
  return container;
}

function click(node) {
  act(() => {
    node.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

describe('Title effect', () => {
  test('sets the document title on mount', () => {
    setup();
    expect(document.title).toBe('Count: 0');
  });

  test('keeps the title in sync when the count changes', () => {
    const container = setup();
    click(container.querySelector('button'));
    expect(document.title).toBe('Count: 1');
  });
});
