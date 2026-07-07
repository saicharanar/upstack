import { act } from 'react';
import { createRoot } from 'react-dom/client';
import LightSwitch from './App';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setup() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<LightSwitch />);
  });
  return container;
}

function click(node) {
  act(() => {
    node.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

describe('Light switch', () => {
  test('starts with the light off', () => {
    const container = setup();
    expect(container.textContent).not.toContain('The light is on');
  });

  test('turns the light on when flipped', () => {
    const container = setup();
    click(container.querySelector('button'));
    expect(container.textContent).toContain('The light is on');
  });
});
