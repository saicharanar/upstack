import { act } from 'react';
import { createRoot } from 'react-dom/client';
import NameForm from './App';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setup() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<NameForm />));
  return container;
}

function typeInto(container, label, value) {
  const el = container.querySelector(`input[aria-label="${label}"]`);
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  act(() => {
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

describe('Derived full name', () => {
  test('shows the full name', () => {
    const container = setup();
    expect(container.textContent).toContain('Ada Lovelace');
  });

  test('updates the full name when a field changes', () => {
    const container = setup();
    typeInto(container, 'First', 'Grace');
    expect(container.textContent).toContain('Grace Lovelace');
  });
});
