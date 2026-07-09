import { act } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// A portal escapes the app's container, so these tests look at the whole
// document — reset it between tests so one modal can't leak into the next.
afterEach(() => {
  document.body.innerHTML = '';
});

function setup() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<App />));
  return container;
}

function click(node) {
  act(() => node.dispatchEvent(new MouseEvent('click', { bubbles: true })));
}

const buttonByText = (root, text) =>
  [...root.querySelectorAll('button')].find((b) => b.textContent === text);

describe('Modal via portal', () => {
  test('renders the modal into document.body, outside the app, when opened', () => {
    const container = setup();
    click(buttonByText(container, 'Open'));
    const modal = document.querySelector('.modal');
    expect(modal).not.toBeNull();
    // The whole point of a portal: the modal is NOT inside the app's container.
    expect(container.contains(modal)).toBe(false);
  });

  test('shows the modal content when opened', () => {
    const container = setup();
    click(buttonByText(container, 'Open'));
    expect(document.body.textContent).toContain('Settings saved!');
  });

  test('closes the modal when close is clicked', () => {
    const container = setup();
    click(buttonByText(container, 'Open'));
    click(buttonByText(document.body, 'Close'));
    expect(document.querySelector('.modal')).toBeNull();
  });
});
