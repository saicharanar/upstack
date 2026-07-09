import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Profile from './App';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setup() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<Profile />);
  });
  return container;
}

function click(node) {
  act(() => {
    node.click();
  });
}

describe('Edit profile', () => {
  test('starts as a member', () => {
    const container = setup();
    expect(container.textContent).toContain('member');
  });

  test('promotes to admin when clicked', () => {
    const container = setup();
    click(container.querySelector('button'));
    expect(container.textContent).toContain('admin');
  });
});
