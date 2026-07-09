import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Form from './App';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setup() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<Form />));
  return container;
}

function click(node) {
  act(() => node.click());
}

describe('Forwarded ref input', () => {
  test('focuses the forwarded input when the button is clicked', () => {
    const container = setup();
    const input = container.querySelector('input');
    click(container.querySelector('button'));
    expect(document.activeElement).toBe(input);
  });
});
