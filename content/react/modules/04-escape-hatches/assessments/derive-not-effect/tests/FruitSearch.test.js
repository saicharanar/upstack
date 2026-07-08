import { act } from 'react';
import { createRoot } from 'react-dom/client';
import FruitSearch from './App';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setup() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<FruitSearch />));
  return container;
}

function typeQuery(container, value) {
  const el = container.querySelector('input[aria-label="Search"]');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  act(() => {
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

describe('Filter during render', () => {
  test('shows all items at first', () => {
    const container = setup();
    expect(container.querySelectorAll('li').length).toBe(5);
  });

  test('filters the list as you type', () => {
    const container = setup();
    typeQuery(container, 'an');
    const items = container.querySelectorAll('li');
    expect(items.length).toBe(1);
    expect(container.textContent).toContain('banana');
  });
});
