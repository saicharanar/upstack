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
  act(() => node.dispatchEvent(new MouseEvent('click', { bubbles: true })));
}

describe('Event handlers', () => {
  test('does not call the handler while rendering', () => {
    const picked = [];
    render((id) => picked.push(id));
    // Handlers must be passed, not called during render.
    expect(picked).toEqual([]);
  });

  test('calls the handler with the clicked item id', () => {
    const picked = [];
    const container = render((id) => picked.push(id));
    const buttons = container.querySelectorAll('button');
    click(buttons[1]); // "Banana" → id 2
    expect(picked).toEqual([2]);
  });
});
