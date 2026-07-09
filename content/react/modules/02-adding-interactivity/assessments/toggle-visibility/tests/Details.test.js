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
  test('toggles the light on and off', () => {
    const container = setup();
    const button = container.querySelector('button');
    click(button);
    expect(container.textContent).toContain('The light is on');
    click(button);
    expect(container.textContent).not.toContain('The light is on');
  });

  test('updates the button label as it toggles', () => {
    const container = setup();
    const button = container.querySelector('button');
    expect(button.textContent).toBe('Turn on');
    click(button);
    expect(button.textContent).toBe('Turn off');
  });
});
