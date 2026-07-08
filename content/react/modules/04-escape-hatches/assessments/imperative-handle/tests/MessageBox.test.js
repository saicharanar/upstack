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

function typeInto(container, value) {
  const el = container.querySelector('textarea');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
  act(() => {
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function click(node) {
  act(() => node.dispatchEvent(new MouseEvent('click', { bubbles: true })));
}

describe('Message box with an imperative handle', () => {
  test('shows what you type', () => {
    const container = setup();
    typeInto(container, 'Hello there');
    expect(container.querySelector('textarea').value).toBe('Hello there');
  });

  test('clears the message box through the ref handle', () => {
    const container = setup();
    typeInto(container, 'Hello there');
    click(container.querySelector('button'));
    expect(container.querySelector('textarea').value).toBe('');
  });
});
