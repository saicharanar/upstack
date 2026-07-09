import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Menu from './App';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function render(onPick) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<Menu onPick={onPick} />));
  return container;
}

function click(node) {
  act(() => node.click());
}

describe('Event handlers', () => {
  test('renders a button for each item', () => {
    const container = render(() => {});
    expect(container.querySelectorAll('button').length).toBe(2);
  });

  test('calls onPick with the clicked id, and only on click', () => {
    const picked = [];
    const container = render((id) => picked.push(id));
    // The handler must be passed, not called during render.
    expect(picked).toEqual([]);
    const buttons = container.querySelectorAll('button');
    click(buttons[1]); // "Banana" → id 2
    expect(picked).toEqual([2]);
  });
});
