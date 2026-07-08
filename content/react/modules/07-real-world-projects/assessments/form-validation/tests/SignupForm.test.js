import { act } from 'react';
import { createRoot } from 'react-dom/client';
import SignupForm from './App';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setup() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<SignupForm />));
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

function submit(container) {
  const form = container.querySelector('form');
  act(() => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
}

describe('Sign-up form validation', () => {
  test('shows validation errors for invalid input', () => {
    const container = setup();
    typeInto(container, 'Email', 'not-an-email');
    typeInto(container, 'Password', 'short');
    submit(container);
    expect(container.textContent).toContain('Enter a valid email');
    expect(container.textContent).toContain('Password must be at least 8 characters');
    expect(container.textContent).not.toContain('Account created');
  });

  test('rejects a short password', () => {
    const container = setup();
    typeInto(container, 'Email', 'ada@example.com');
    typeInto(container, 'Password', 'short');
    submit(container);
    expect(container.textContent).toContain('Password must be at least 8 characters');
    expect(container.textContent).not.toContain('Account created');
  });

  test('creates the account when the input is valid', () => {
    const container = setup();
    typeInto(container, 'Email', 'ada@example.com');
    typeInto(container, 'Password', 'supersecret');
    submit(container);
    expect(container.textContent).toContain('Account created');
  });
});
