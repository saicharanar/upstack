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

const buttonByText = (container, text) =>
  [...container.querySelectorAll('button')].find((b) => b.textContent === text);

describe('Message box with an imperative handle', () => {
  test('clears the message box through the ref handle', () => {
    const container = setup();
    typeInto(container, 'Hello there');
    click(buttonByText(container, 'Clear'));
    expect(container.querySelector('textarea').value).toBe('');
  });

  test('focuses the box through the ref handle', () => {
    const container = setup();
    click(buttonByText(container, 'Focus'));
    expect(document.activeElement).toBe(container.querySelector('textarea'));
  });
});
