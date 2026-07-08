import { act } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setup() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<App />));
  return container;
}

function typeNote(container, value) {
  const el = container.querySelector('input[aria-label="Note"]');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  act(() => {
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function switchUser(container) {
  const button = [...container.querySelectorAll('button')].find((b) =>
    b.textContent.startsWith('Switch user'),
  );
  act(() => button.dispatchEvent(new MouseEvent('click', { bubbles: true })));
}

describe('Reset state with a key', () => {
  test('lets you type a note', () => {
    const container = setup();
    typeNote(container, 'Buy milk');
    expect(container.querySelector('input[aria-label="Note"]').value).toBe('Buy milk');
  });

  test('resets the note when you switch users', () => {
    const container = setup();
    typeNote(container, 'Buy milk');
    switchUser(container);
    expect(container.querySelector('input[aria-label="Note"]').value).toBe('');
  });
});
